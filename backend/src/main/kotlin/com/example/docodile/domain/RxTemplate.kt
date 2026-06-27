package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

// A reusable per-section template, scoped per clinic + per section kind.
// Saving from a section's 3-dots only appears under that same section's Load
// list. `content` is an opaque JSON blob the frontend owns — see V48 / V49.
@Entity
@Table(name = "rx_template")
class RxTemplate(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    var kind: String = "",

    @Column(nullable = false)
    var name: String = "",

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String = "",

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now()
)
