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
@Table(name = "clinic_schedule")
class ClinicSchedule(
    @Id
    var id: UUID = UUID.randomUUID(),

    // Frontend owns the JSON shape (default week + date-keyed overrides +
    // configured flag). We don't introspect it server-side — just round-trip.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "JSONB")
    var schedule: String = "{}",

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
