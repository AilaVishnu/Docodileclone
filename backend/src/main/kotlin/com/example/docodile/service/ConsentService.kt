package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.PatientConsent
import com.example.docodile.repo.PatientConsentRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import java.time.Instant
import java.util.UUID

@Service
class ConsentService(
    private val consentRepository: PatientConsentRepository,
    private val patientRepository: PatientRepository,
    private val currentUser: CurrentUser,
    private val auditService: AuditService,
    @Value("\${consent.enforcement.enabled:false}") private val enforcementEnabled: Boolean,
) {
    private val log = LoggerFactory.getLogger(ConsentService::class.java)

    /**
     * Returns true if the patient has at least one active (non-withdrawn) consent
     * for the given purpose in the current clinic.
     *
     * Fails CLOSED: if the clinic context cannot be resolved from the token
     * (e.g. an ADMIN token issued without a clinic_id claim), this returns false
     * — a request with no clinic context has no confirmed consent.
     */
    fun hasActiveConsent(patientId: UUID, purpose: String): Boolean {
        val clinicId = runCatching { currentUser.clinicId() }.getOrNull()
        if (clinicId == null) {
            log.warn("CONSENT_CHECK: no clinic context in token for patient={} — failing closed", patientId)
            return false
        }
        return consentRepository
            .findAllByPatientIdAndClinicId(patientId, clinicId)
            .any { it.purpose == purpose && it.withdrawnAt == null }
    }

    /**
     * Consent gate for patient data access.
     *
     * When consent.enforcement.enabled=false (default): logs a warning if consent
     * is missing but allows access — use this until the frontend consent capture
     * flow is built and all existing patients have been back-consented.
     *
     * When consent.enforcement.enabled=true: throws IllegalStateException (HTTP 400)
     * if no active consent is found — enables hard enforcement in production.
     */
    fun checkConsent(patientId: UUID, purpose: String = "treatment") {
        if (hasActiveConsent(patientId, purpose)) return
        if (enforcementEnabled) {
            auditService.log(
                action     = AuditAction.PATIENT_ACCESS,
                entityType = "Patient",
                entityId   = patientId,
                outcome    = "CONSENT_MISSING",
                metadata   = mapOf("purpose" to purpose),
            )
            throw ConsentRequiredException(
                "Access denied: no active consent found for patient $patientId (purpose=$purpose)"
            )
        }
        log.warn(
            "CONSENT_MISSING: patient={} purpose={} — access allowed (enforcement disabled). " +
            "Set consent.enforcement.enabled=true to block.",
            patientId, purpose
        )
    }

    fun listConsents(patientId: UUID): List<PatientConsent> {
        val clinicId = currentUser.clinicId()
        patientRepository.findByIdAndClinicId(patientId, clinicId)
            ?: throw IllegalArgumentException("Patient not found")
        return consentRepository.findAllByPatientIdAndClinicId(patientId, clinicId)
    }

    @Transactional
    fun grantConsent(patientId: UUID, purpose: String, version: String): PatientConsent {
        val clinicId = currentUser.clinicId()
        patientRepository.findByIdAndClinicId(patientId, clinicId)
            ?: throw IllegalArgumentException("Patient not found")

        val ipAddress = (RequestContextHolder.getRequestAttributes() as? ServletRequestAttributes)
            ?.request?.remoteAddr

        val consent = PatientConsent(
            patientId = patientId,
            clinicId  = clinicId,
            purpose   = purpose,
            version   = version,
            grantedBy = runCatching { currentUser.userId() }.getOrNull(),
            ipAddress = ipAddress,
        )
        val saved = consentRepository.save(consent)
        auditService.log(
            action     = AuditAction.CONSENT_GRANTED,
            entityType = "Patient",
            entityId   = patientId,
            metadata   = mapOf("purpose" to purpose, "version" to version),
        )
        return saved
    }

    @Transactional
    fun withdrawConsent(patientId: UUID, consentId: UUID) {
        val clinicId = currentUser.clinicId()
        val consent = consentRepository.findById(consentId)
            .filter { it.patientId == patientId && it.clinicId == clinicId }
            .orElseThrow { IllegalArgumentException("Consent record not found") }

        if (consent.withdrawnAt != null) {
            throw IllegalArgumentException("Consent already withdrawn")
        }

        consent.withdrawnAt = Instant.now()
        consent.withdrawnBy = runCatching { currentUser.userId() }.getOrNull()
        consentRepository.save(consent)

        auditService.log(
            action     = AuditAction.CONSENT_WITHDRAWN,
            entityType = "Patient",
            entityId   = patientId,
            metadata   = mapOf("consentId" to consentId, "purpose" to consent.purpose),
        )
    }
}
