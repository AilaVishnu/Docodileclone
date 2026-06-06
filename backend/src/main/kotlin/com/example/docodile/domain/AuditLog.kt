package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "audit_log")
class AuditLog(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(name = "actor_id")
    var actorId: UUID? = null,

    @Column(name = "tenant_id")
    var tenantId: UUID? = null,

    @Column(name = "clinic_id")
    var clinicId: UUID? = null,

    @Column(nullable = false)
    var action: String = "",

    @Column(name = "entity_type")
    var entityType: String? = null,

    @Column(name = "entity_id")
    var entityId: UUID? = null,

    @Column(name = "ip_address")
    var ipAddress: String? = null,

    @Column(name = "user_agent")
    var userAgent: String? = null,

    @Column(nullable = false)
    var outcome: String = "SUCCESS",

    @Column(columnDefinition = "text")
    var metadata: String? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now()
)
