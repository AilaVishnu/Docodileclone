package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "chat_messages")
class ChatMessage(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(name = "sender_id", nullable = false)
    var senderId: UUID,

    @Column(name = "sender_name", nullable = false)
    var senderName: String,

    @Column(name = "sender_role")
    var senderRole: String? = null,

    @Column(name = "recipient_id")
    var recipientId: UUID? = null,

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    var content: String,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),
)
