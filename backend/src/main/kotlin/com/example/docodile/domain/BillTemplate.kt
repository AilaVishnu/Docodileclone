package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

// Clinic-configurable layout for the "Bill cum Receipt" printout — the billing
// counterpart to PrintTemplate. The full template shape lives client-side; we
// store it as an opaque JSON blob so the server never needs to know its fields.
@Entity
@Table(name = "bill_template")
class BillTemplate(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(nullable = false, columnDefinition = "TEXT")
    var name: String = "",

    @Column(name = "is_default", nullable = false)
    var isDefault: Boolean = false,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "JSONB")
    var config: String = "{}",

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
