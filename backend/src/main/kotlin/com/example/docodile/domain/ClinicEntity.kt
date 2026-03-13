package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "clinic")
class ClinicEntity(
    @Id
    var id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    var tenant: Tenant? = null,

    @Column(nullable = false)
    var name: String = "",

    var address: String? = null,

    var phone: String? = null,

    var domain: String? = null,
    
    var speciality: String? = null,

    @Column(name = "created_at")
    var createdAt: Instant? = null
)
