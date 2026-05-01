package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.Instant
import java.util.UUID

// Specialisation-scoped autocomplete catalog. All clinics of the same
// specialty share one catalog (e.g. all Dermatology clinics see the same
// suggestions); a Dental clinic sees a separate Dental catalog. The
// `speciality` value is sourced from clinic.speciality, normalized to
// lowercase + trimmed by SuggestionService — never trusted from the client.
@Entity
@Table(
    name = "suggestion",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uq_suggestion_speciality_field_value",
            columnNames = ["speciality", "field", "value"]
        )
    ]
)
class Suggestion(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(nullable = false, length = 255)
    var speciality: String = "",

    @Column(nullable = false, length = 64)
    var field: String = "",

    @Column(nullable = false, columnDefinition = "TEXT")
    var value: String = "",

    @Column(name = "use_count", nullable = false)
    var useCount: Int = 0,

    @Column(name = "created_at")
    var createdAt: Instant? = null
)
