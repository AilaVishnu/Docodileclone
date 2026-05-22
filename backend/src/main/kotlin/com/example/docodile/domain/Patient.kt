package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "patient")
class Patient(
    @Id
    var id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clinic_id", nullable = false)
    var clinic: ClinicEntity? = null,

    @Column(nullable = false)
    var name: String = "",

    var phone: String? = null,

    var email: String? = null,

    var gender: String? = null,

    var dob: LocalDate? = null,

    var age: Int? = null,

    var address: String? = null,

    @Column(name = "created_at")
    var createdAt: Instant? = null,

    @Column(nullable = false)
    var archived: Boolean = false,

    @Column(name = "archived_at")
    var archivedAt: Instant? = null,

    // Source-system id when this patient was bulk-imported (e.g. the
    // HealthPlix "T428"). Null for patients created natively in Docodile.
    // Drives idempotent re-imports — see V41 migration.
    @Column(name = "external_ref")
    var externalRef: String? = null
)
