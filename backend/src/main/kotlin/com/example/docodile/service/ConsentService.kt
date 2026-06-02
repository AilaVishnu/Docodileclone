package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.PatientConsent
import com.example.docodile.repo.PatientConsentRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
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
) {
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
