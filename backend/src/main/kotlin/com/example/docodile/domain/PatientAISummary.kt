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
@Table(name = "patient_ai_summary")
class PatientAISummary(
    @Id
    @Column(name = "patient_id")
    var patientId: UUID = UUID.randomUUID(),

    @Column(name = "clinic_id", nullable = false)
    var clinicId: UUID = UUID.randomUUID(),

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "JSONB")
    var content: String = "{}",

    @Column(name = "visits_hash", nullable = false, columnDefinition = "TEXT")
    var visitsHash: String = "",

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
