package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "clinic_settings")
class ClinicSettings(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    var name: String = "",

    var speciality: String? = null,

    @Column(columnDefinition = "TEXT")
    var address: String? = null,

    @Column(name = "logo_url", columnDefinition = "TEXT")
    var logoUrl: String? = null,

    @Column(name = "registration_no")
    var registrationNo: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "working_hours", columnDefinition = "JSONB")
    var workingHours: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    var letterhead: String? = null,

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
