package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "data_subject_request")
class DataSubjectRequest(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(name = "patient_id", nullable = false)
    var patientId: UUID,

    @Column(nullable = false, length = 20)
    var type: String,    // DELETION | CORRECTION

    @Column(nullable = false)
    var status: String = "SUBMITTED",

    @Column(name = "requested_by", nullable = false)
    var requestedBy: UUID,

    @Column(name = "requested_at", nullable = false)
    var requestedAt: Instant = Instant.now(),

    @Column(name = "reviewed_by")
    var reviewedBy: UUID? = null,

    @Column(name = "reviewed_at")
    var reviewedAt: Instant? = null,

    @Column(name = "rejection_note", columnDefinition = "TEXT")
    var rejectionNote: String? = null,

    @Column(name = "completed_at")
    var completedAt: Instant? = null,

    @Column(name = "completed_by")
    var completedBy: UUID? = null,

    @Column(name = "verified_by")
    var verifiedBy: UUID? = null,

    @Column(name = "verified_at")
    var verifiedAt: Instant? = null,

    @Column(columnDefinition = "TEXT")
    var reason: String? = null,

    @Column(name = "field_name")
    var fieldName: String? = null,

    @Column(name = "old_value", columnDefinition = "TEXT")
    var oldValue: String? = null,

    @Column(name = "new_value", columnDefinition = "TEXT")
    var newValue: String? = null,
)
