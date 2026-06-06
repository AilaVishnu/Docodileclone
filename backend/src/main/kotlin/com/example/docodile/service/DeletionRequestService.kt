package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.DeletionRequest
import com.example.docodile.domain.DeletionRequestStatus
import com.example.docodile.repo.DeletionRequestRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class DeletionRequestService(
    private val deletionRequestRepository: DeletionRequestRepository,
    private val patientRepository: PatientRepository,
    private val currentUser: CurrentUser,
    private val auditService: AuditService,
) {
    fun list(): List<DeletionRequest> =
        deletionRequestRepository.findAllByClinicId(currentUser.clinicId())

    @Transactional
    fun submit(patientId: UUID, reason: String?): DeletionRequest {
        val clinicId  = currentUser.clinicId()
        val tenantId  = currentUser.tenantId()
        patientRepository.findByIdAndClinicId(patientId, clinicId)
            ?: throw IllegalArgumentException("Patient not found")

        val req = DeletionRequest(
            patientId   = patientId,
            clinicId    = clinicId,
            tenantId    = tenantId,
            requestedBy = currentUser.userId(),
            reason      = reason,
        )
        val saved = deletionRequestRepository.save(req)
        auditService.log(AuditAction.DELETION_REQUEST_SUBMITTED, entityType = "Patient", entityId = patientId,
            metadata = mapOf("requestId" to saved.id))
        return saved
    }

    @Transactional
    fun transition(requestId: UUID, newStatus: DeletionRequestStatus, rejectionNote: String? = null): DeletionRequest {
        val clinicId = currentUser.clinicId()
        val req = deletionRequestRepository.findById(requestId)
            .filter { it.clinicId == clinicId }
            .orElseThrow { IllegalArgumentException("Request not found") }

        validateTransition(req.status, newStatus)

        val now    = Instant.now()
        val userId = currentUser.userId()

        when (newStatus) {
            DeletionRequestStatus.VERIFIED -> { req.verifiedBy = userId; req.verifiedAt = now }
            DeletionRequestStatus.LEGAL_HOLD_CHECK -> { req.reviewedBy = userId; req.reviewedAt = now }
            DeletionRequestStatus.APPROVED -> { req.reviewedBy = userId; req.reviewedAt = now }
            DeletionRequestStatus.REJECTED -> {
                req.reviewedBy = userId; req.reviewedAt = now
                req.rejectionNote = rejectionNote
            }
            DeletionRequestStatus.EXECUTED -> {
                req.executedBy = userId; req.executedAt = now
                // Soft-delete the patient record
                patientRepository.findByIdAndClinicId(req.patientId, clinicId)?.let { p ->
                    p.deletedAt = now; p.deletedBy = userId
                    patientRepository.save(p)
                }
            }
            else -> {}
        }
        req.status = newStatus.name
        val saved = deletionRequestRepository.save(req)

        val auditAction = when (newStatus) {
            DeletionRequestStatus.APPROVED  -> AuditAction.DELETION_REQUEST_APPROVED
            DeletionRequestStatus.REJECTED  -> AuditAction.DELETION_REQUEST_REJECTED
            DeletionRequestStatus.EXECUTED  -> AuditAction.DELETION_EXECUTED
            else -> AuditAction.DELETION_REQUEST_SUBMITTED
        }
        auditService.log(auditAction, entityType = "DeletionRequest", entityId = requestId,
            metadata = mapOf("status" to newStatus, "patientId" to req.patientId))
        return saved
    }

    private fun validateTransition(current: String, next: DeletionRequestStatus) {
        val allowed = mapOf(
            DeletionRequestStatus.SUBMITTED.name         to setOf(DeletionRequestStatus.VERIFIED, DeletionRequestStatus.REJECTED),
            DeletionRequestStatus.VERIFIED.name          to setOf(DeletionRequestStatus.LEGAL_HOLD_CHECK, DeletionRequestStatus.REJECTED),
            DeletionRequestStatus.LEGAL_HOLD_CHECK.name  to setOf(DeletionRequestStatus.APPROVED, DeletionRequestStatus.REJECTED),
            DeletionRequestStatus.APPROVED.name          to setOf(DeletionRequestStatus.EXECUTED),
        )
        if (next !in (allowed[current] ?: emptySet())) {
            throw IllegalArgumentException("Cannot transition from $current to $next")
        }
    }
}
