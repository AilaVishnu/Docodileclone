package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "clinic")
class ClinicEntity(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    var name: String = "",

    var address: String? = null,

    var phone: String? = null,

    var domain: String? = null,

    @Column(name = "created_at")
    var createdAt: Instant? = null
)
