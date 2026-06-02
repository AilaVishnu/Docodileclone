package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

enum class CorrectionRequestStatus {
    SUBMITTED, REVIEWED, APPLIED, REJECTED
}

@Entity
@Table(name = "correction_request")
class CorrectionRequest(
    @Id var id: UUID = UUID.randomUUID(),
    @Column(name = "patient_id",  nullable = false) var patientId:  UUID,
    @Column(name = "clinic_id",   nullable = false) var clinicId:   UUID,
    @Column(name = "tenant_id",   nullable = false) var tenantId:   UUID,
    @Column(nullable = false)                       var status:     String = CorrectionRequestStatus.SUBMITTED.name,
    @Column(name = "field_name",  nullable = false) var fieldName:  String,
    @Column(name = "old_value")                     var oldValue:   String? = null,
    @Column(name = "new_value",   nullable = false) var newValue:   String,
    @Column(name = "requested_by", nullable = false) var requestedBy: UUID,
    @Column(name = "requested_at", nullable = false) var requestedAt: Instant = Instant.now(),
    @Column(name = "reviewed_by")   var reviewedBy:   UUID? = null,
    @Column(name = "reviewed_at")   var reviewedAt:   Instant? = null,
    @Column(name = "rejection_note") var rejectionNote: String? = null,
    @Column(name = "applied_at")    var appliedAt:    Instant? = null,
    @Column(name = "applied_by")    var appliedBy:    UUID? = null,
)
