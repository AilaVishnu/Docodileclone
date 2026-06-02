package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "revoked_token")
class RevokedToken(
    @Id
    var jti: UUID,

    @Column(name = "user_id", nullable = false)
    var userId: UUID,

    @Column(name = "revoked_at", nullable = false)
    var revokedAt: Instant = Instant.now(),

    @Column(name = "expires_at", nullable = false)
    var expiresAt: Instant,
)
