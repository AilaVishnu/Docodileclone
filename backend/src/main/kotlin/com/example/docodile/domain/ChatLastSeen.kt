package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.io.Serializable
import java.time.Instant
import java.util.UUID

@Embeddable
data class ChatLastSeenId(
    @Column(name = "user_id") var userId: UUID = UUID.randomUUID(),
    @Column(name = "conversation_key") var conversationKey: String = "",
) : Serializable

@Entity
@Table(name = "chat_last_seen")
class ChatLastSeen(
    @EmbeddedId
    var id: ChatLastSeenId,

    @Column(name = "seen_at", nullable = false)
    var seenAt: Instant = Instant.now(),
)
