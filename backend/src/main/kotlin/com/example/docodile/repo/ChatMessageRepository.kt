package com.example.docodile.repo

import com.example.docodile.domain.ChatMessage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface ChatMessageRepository : JpaRepository<ChatMessage, UUID> {

    fun findTop50ByRecipientIdIsNullOrderByCreatedAtAsc(): List<ChatMessage>

    @Query("""
        SELECT m FROM ChatMessage m
        WHERE ((m.senderId = :a AND m.recipientId = :b) OR (m.senderId = :b AND m.recipientId = :a))
        ORDER BY m.createdAt ASC
        LIMIT 50
    """)
    fun findDmHistory(
        @Param("a") a: UUID,
        @Param("b") b: UUID,
    ): List<ChatMessage>

    fun countByRecipientIdIsNullAndCreatedAtAfter(after: Instant): Int

    @Query("""
        SELECT COUNT(m) FROM ChatMessage m
        WHERE ((m.senderId = :a AND m.recipientId = :b) OR (m.senderId = :b AND m.recipientId = :a))
          AND m.createdAt > :after
    """)
    fun countDmAfter(
        @Param("a") a: UUID,
        @Param("b") b: UUID,
        @Param("after") after: Instant,
    ): Int
}
