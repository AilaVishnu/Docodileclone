package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

// A Catalog directory entry — a party the clinic connects to (referral doctor,
// lab, supplier or general contact). `category` picks the tab; `name` is the
// searchable identity; everything else (subtitle, phone, whatsapp, email,
// address, tags) rides in the opaque `config` JSON blob, so the shape can grow
// without a migration (mirrors PrintTemplate/BillTemplate).
@Entity
@Table(name = "directory_entry")
class DirectoryEntry(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(nullable = false, columnDefinition = "TEXT")
    var category: String = "",

    @Column(nullable = false, columnDefinition = "TEXT")
    var name: String = "",

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "JSONB")
    var config: String = "{}",

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
