package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.CorrectionRequest
import com.example.docodile.domain.CorrectionRequestStatus
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.CorrectionRequestRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class CorrectionRequestService(
    private val correctionRequestRepository: CorrectionRequestRepository,
    private val patientRepository: PatientRepository,
    private val currentUser: CurrentUser,
    private val auditService: AuditService,
    private val appUserRepository: AppUserRepository,
    private val emailService: EmailService,
) {
    private val log = LoggerFactory.getLogger(CorrectionRequestService::class.java)

    fun list(): List<CorrectionRequest> =
        correctionRequestRepository.findAllByClinicId(currentUser.clinicId())

    @Transactional
    fun submit(patientId: UUID, fieldName: String, oldValue: String?, newValue: String): CorrectionRequest {
        val clinicId = currentUser.clinicId()
        val patient  = patientRepository.findByIdAndClinicId(patientId, clinicId)
            ?: throw IllegalArgumentException("Patient not found")

        val req = CorrectionRequest(
            patientId   = patientId,
            clinicId    = clinicId,
            tenantId    = currentUser.tenantId(),
            fieldName   = fieldName,
            oldValue    = oldValue,
            newValue    = newValue,
            requestedBy = currentUser.userId(),
        )
        val saved = correctionRequestRepository.save(req)
        auditService.log(AuditAction.CORRECTION_REQUEST_SUBMITTED, entityType = "Patient", entityId = patientId,
            metadata = mapOf("field" to fieldName, "old" to oldValue, "new" to newValue))
        return saved
    }

    @Transactional
    fun review(requestId: UUID, approve: Boolean, rejectionNote: String? = null): CorrectionRequest {
        val clinicId = currentUser.clinicId()
        val req = correctionRequestRepository.findById(requestId)
            .filter { it.clinicId == clinicId }
            .orElseThrow { IllegalArgumentException("Request not found") }

        if (req.status != CorrectionRequestStatus.SUBMITTED.name) {
            throw IllegalArgumentException("Request is not in SUBMITTED state")
        }

        val now    = Instant.now()
        val userId = currentUser.userId()
        req.reviewedBy  = userId
        req.reviewedAt  = now

        if (approve) {
            req.status = CorrectionRequestStatus.APPLIED.name
            req.appliedAt = now; req.appliedBy = userId
            applyCorrection(req)
            auditService.log(AuditAction.CORRECTION_APPLIED, entityType = "CorrectionRequest", entityId = requestId,
                metadata = mapOf("patientId" to req.patientId, "field" to req.fieldName, "new" to req.newValue))
        } else {
            req.status = CorrectionRequestStatus.REJECTED.name
            req.rejectionNote = rejectionNote
            auditService.log(AuditAction.CORRECTION_REQUEST_REJECTED, entityType = "CorrectionRequest", entityId = requestId)
        }

        val saved = correctionRequestRepository.save(req)

        // Send notification — best effort; do not let email failure roll back the review
        runCatching {
            appUserRepository.findById(req.requestedBy).ifPresent { user ->
                if (!user.email.isNullOrBlank()) {
                    emailService.sendCorrectionComplete(user.email, req.fieldName, req.newValue, approve)
                }
            }
        }.onFailure { log.warn("Could not send correction notification: {}", it.message) }

        return saved
    }

    private fun applyCorrection(req: CorrectionRequest) {
        val patient = patientRepository.findByIdAndClinicId(req.patientId, req.clinicId) ?: return
        when (req.fieldName.lowercase()) {
            "name"   -> patient.name = req.newValue
            "phone"  -> patient.phone = req.newValue
            "email"  -> patient.email = req.newValue
            "gender" -> patient.gender = req.newValue
            "address" -> patient.address = req.newValue
            else -> {} // Unknown field — log but don't throw; the audit trail documents it
        }
        patientRepository.save(patient)
    }
}
