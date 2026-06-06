package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

enum class DeletionRequestStatus {
    SUBMITTED, VERIFIED, LEGAL_HOLD_CHECK, APPROVED, REJECTED, EXECUTED
}

@Entity
@Table(name = "deletion_request")
class DeletionRequest(
    @Id var id: UUID = UUID.randomUUID(),
    @Column(name = "patient_id",  nullable = false) var patientId:   UUID,
    @Column(name = "clinic_id",   nullable = false) var clinicId:    UUID,
    @Column(name = "tenant_id",   nullable = false) var tenantId:    UUID,
    @Column(nullable = false)                       var status:      String = DeletionRequestStatus.SUBMITTED.name,
    @Column(name = "requested_by", nullable = false) var requestedBy: UUID,
    @Column(name = "requested_at", nullable = false) var requestedAt: Instant = Instant.now(),
    @Column(name = "verified_by")   var verifiedBy:   UUID? = null,
    @Column(name = "verified_at")   var verifiedAt:   Instant? = null,
    @Column(name = "reviewed_by")   var reviewedBy:   UUID? = null,
    @Column(name = "reviewed_at")   var reviewedAt:   Instant? = null,
    @Column                         var reason:       String? = null,
    @Column(name = "rejection_note") var rejectionNote: String? = null,
    @Column(name = "executed_at")   var executedAt:  Instant? = null,
    @Column(name = "executed_by")   var executedBy:  UUID? = null,
)
