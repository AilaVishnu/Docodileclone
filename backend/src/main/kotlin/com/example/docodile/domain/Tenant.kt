package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "tenant")
class Tenant(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    var name: String = "",

    @Column(name = "max_clinics", nullable = false)
    var maxClinics: Int = 5,

    @Column(name = "max_staff_per_clinic", nullable = false)
    var maxStaffPerClinic: Int = 10,

    @Column(name = "created_at")
    var createdAt: Instant? = null
)
