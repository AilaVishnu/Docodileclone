package com.example.docodile.repo

import com.example.docodile.domain.ChatLastSeen
import com.example.docodile.domain.ChatLastSeenId
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ChatLastSeenRepository : JpaRepository<ChatLastSeen, ChatLastSeenId> {
    fun findByIdUserIdAndIdConversationKey(userId: UUID, conversationKey: String): ChatLastSeen?
    fun findAllByIdUserId(userId: UUID): List<ChatLastSeen>
}
