package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.DataSubjectRequest
import com.example.docodile.repo.DataSubjectRequestRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class DataSubjectRequestService(
    private val repo: DataSubjectRequestRepository,
    private val patientRepository: PatientRepository,
    private val currentUser: CurrentUser,
    private val auditService: AuditService,
) {
    private val log = LoggerFactory.getLogger(DataSubjectRequestService::class.java)

    // ── Deletion workflow ──────────────────────────────────────────────────────

    fun listDeletions(): List<DataSubjectRequest> = repo.findAllByType("DELETION")

    @Transactional
    fun submitDeletion(patientId: UUID, reason: String?): DataSubjectRequest {
        val req = DataSubjectRequest(
            patientId   = patientId,
            type        = "DELETION",
            status      = "SUBMITTED",
            requestedBy = currentUser.userId(),
            reason      = reason,
        )
        val saved = repo.save(req)
        auditService.log(
            AuditAction.DELETION_REQUEST_SUBMITTED,
            entityType = "Patient",
            entityId   = patientId,
            metadata   = mapOf("requestId" to saved.id),
        )
        return saved
    }

    @Transactional
    fun transitionDeletion(id: UUID, status: String, rejectionNote: String? = null): DataSubjectRequest {
        val req = repo.findById(id).orElseThrow { IllegalArgumentException("Request not found") }

        val now    = Instant.now()
        val userId = currentUser.userId()

        validateDeletionTransition(req.status, status)

        when (status) {
            "VERIFIED"          -> { req.verifiedBy = userId; req.verifiedAt = now }
            "LEGAL_HOLD_CHECK"  -> { req.reviewedBy = userId; req.reviewedAt = now }
            "APPROVED"          -> { req.reviewedBy = userId; req.reviewedAt = now }
            "REJECTED"          -> {
                req.reviewedBy    = userId; req.reviewedAt = now
                req.rejectionNote = rejectionNote
            }
            "EXECUTED"          -> {
                req.completedAt = now; req.completedBy = userId
                patientRepository.findById(req.patientId).ifPresent { p ->
                    p.deletedAt = now
                    patientRepository.save(p)
                }
            }
            else -> throw IllegalArgumentException("Unknown deletion status: $status")
        }
        req.status = status
        val saved = repo.save(req)

        val auditAction = when (status) {
            "APPROVED"  -> AuditAction.DELETION_REQUEST_APPROVED
            "REJECTED"  -> AuditAction.DELETION_REQUEST_REJECTED
            "EXECUTED"  -> AuditAction.DELETION_EXECUTED
            else        -> AuditAction.DELETION_REQUEST_SUBMITTED
        }
        auditService.log(
            auditAction,
            entityType = "DataSubjectRequest",
            entityId   = id,
            metadata   = mapOf("status" to status, "patientId" to req.patientId),
        )
        return saved
    }

    private fun validateDeletionTransition(current: String, next: String) {
        val allowed = mapOf(
            "SUBMITTED"        to setOf("VERIFIED", "REJECTED"),
            "VERIFIED"         to setOf("LEGAL_HOLD_CHECK", "REJECTED"),
            "LEGAL_HOLD_CHECK" to setOf("APPROVED", "REJECTED"),
            "APPROVED"         to setOf("EXECUTED"),
        )
        if (next !in (allowed[current] ?: emptySet())) {
            throw IllegalArgumentException("Cannot transition from $current to $next")
        }
    }

    // ── Correction workflow ────────────────────────────────────────────────────

    fun listCorrections(): List<DataSubjectRequest> = repo.findAllByType("CORRECTION")

    @Transactional
    fun submitCorrection(
        patientId: UUID,
        fieldName: String,
        oldValue: String?,
        newValue: String,
    ): DataSubjectRequest {
        val req = DataSubjectRequest(
            patientId   = patientId,
            type        = "CORRECTION",
            status      = "SUBMITTED",
            requestedBy = currentUser.userId(),
            fieldName   = fieldName,
            oldValue    = oldValue,
            newValue    = newValue,
        )
        val saved = repo.save(req)
        auditService.log(
            AuditAction.CORRECTION_REQUEST_SUBMITTED,
            entityType = "Patient",
            entityId   = patientId,
            metadata   = mapOf("field" to fieldName, "old" to oldValue, "new" to newValue),
        )
        return saved
    }

    @Transactional
    fun reviewCorrection(id: UUID, approve: Boolean, rejectionNote: String? = null): DataSubjectRequest {
        val req = repo.findById(id).orElseThrow { IllegalArgumentException("Request not found") }

        if (req.status != "SUBMITTED") {
            throw IllegalArgumentException("Request is not in SUBMITTED state")
        }

        val now    = Instant.now()
        val userId = currentUser.userId()
        req.reviewedBy = userId
        req.reviewedAt = now

        if (approve) {
            req.status      = "APPLIED"
            req.completedAt = now
            req.completedBy = userId
            applyCorrection(req)
            auditService.log(
                AuditAction.CORRECTION_APPLIED,
                entityType = "DataSubjectRequest",
                entityId   = id,
                metadata   = mapOf("patientId" to req.patientId, "field" to req.fieldName, "new" to req.newValue),
            )
        } else {
            req.status        = "REJECTED"
            req.rejectionNote = rejectionNote
            auditService.log(
                AuditAction.CORRECTION_REQUEST_REJECTED,
                entityType = "DataSubjectRequest",
                entityId   = id,
            )
        }

        return repo.save(req)
    }

    private fun applyCorrection(req: DataSubjectRequest) {
        val patient = patientRepository.findById(req.patientId).orElse(null) ?: return
        when (req.fieldName?.lowercase()) {
            "name"    -> patient.name    = req.newValue ?: return
            "phone"   -> patient.phone   = req.newValue
            "email"   -> patient.email   = req.newValue
            "gender"  -> patient.gender  = req.newValue
            "address" -> patient.address = req.newValue
            else      -> {} // Unknown field — audit trail documents it
        }
        patientRepository.save(patient)
    }
}
