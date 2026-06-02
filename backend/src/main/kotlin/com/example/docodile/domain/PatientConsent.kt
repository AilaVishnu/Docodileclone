package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "patient_consent")
class PatientConsent(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(name = "patient_id", nullable = false)
    var patientId: UUID,

    @Column(name = "clinic_id", nullable = false)
    var clinicId: UUID,

    @Column(nullable = false)
    var purpose: String,

    @Column(nullable = false)
    var version: String,

    @Column(name = "granted_at", nullable = false)
    var grantedAt: Instant = Instant.now(),

    @Column(name = "granted_by")
    var grantedBy: UUID? = null,

    @Column(name = "ip_address")
    var ipAddress: String? = null,

    @Column(name = "withdrawn_at")
    var withdrawnAt: Instant? = null,

    @Column(name = "withdrawn_by")
    var withdrawnBy: UUID? = null,
)
