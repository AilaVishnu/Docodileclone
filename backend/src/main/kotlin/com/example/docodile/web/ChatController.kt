package com.example.docodile.web

import com.example.docodile.domain.ChatLastSeen
import com.example.docodile.domain.ChatLastSeenId
import com.example.docodile.domain.ChatMessage
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ChatLastSeenRepository
import com.example.docodile.repo.ChatMessageRepository
import com.example.docodile.security.AppUserPrincipal
import com.example.docodile.security.CurrentUser
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.time.Instant
import java.util.UUID

data class ChatPayload(
    val content: String = "",
    val recipientId: String? = null,
)

data class ChatMessageDTO(
    val id: String,
    val senderId: String,
    val senderName: String,
    val senderRole: String?,
    val recipientId: String?,
    val content: String,
    val createdAt: String,
)

data class StaffSummaryDTO(
    val id: String,
    val name: String,
    val role: String,
)

fun ChatMessage.toDTO() = ChatMessageDTO(
    id = id.toString(),
    senderId = senderId.toString(),
    senderName = senderName,
    senderRole = senderRole,
    recipientId = recipientId?.toString(),
    content = content,
    createdAt = createdAt.toString(),
)

@RestController
@MessageMapping("/chat")
class ChatController(
    private val chatMessageRepository: ChatMessageRepository,
    private val chatLastSeenRepository: ChatLastSeenRepository,
    private val appUserRepository: AppUserRepository,
    private val currentUser: CurrentUser,
    private val messagingTemplate: SimpMessagingTemplate,
) {

    private fun principal(p: Principal): AppUserPrincipal =
        ((p as UsernamePasswordAuthenticationToken).principal as AppUserPrincipal)

    // ── WebSocket: send to group ──────────────────────────────────────────
    // Chat is now per-clinic-schema, so a single group topic per schema (the
    // WS session is already scoped to the connected user's clinic).

    @MessageMapping("/group")
    fun groupMessage(@Payload payload: ChatPayload, principal: Principal) {
        val user = principal(principal)
        val msg = ChatMessage(
            senderId = user.userId,
            senderName = user.username,
            senderRole = user.authorities.firstOrNull()?.authority?.removePrefix("ROLE_"),
            content = payload.content.trim(),
        )
        val saved = chatMessageRepository.save(msg)
        messagingTemplate.convertAndSend("/topic/clinic", saved.toDTO())
    }

    // ── WebSocket: send direct message ───────────────────────────────────

    @MessageMapping("/direct")
    fun directMessage(@Payload payload: ChatPayload, principal: Principal) {
        val user = principal(principal)
        val recipientId = payload.recipientId?.let { runCatching { UUID.fromString(it) }.getOrNull() } ?: return
        val msg = ChatMessage(
            senderId = user.userId,
            senderName = user.username,
            senderRole = user.authorities.firstOrNull()?.authority?.removePrefix("ROLE_"),
            recipientId = recipientId,
            content = payload.content.trim(),
        )
        val saved = chatMessageRepository.save(msg)
        val dto = saved.toDTO()
        // Deliver to recipient and echo back to sender
        messagingTemplate.convertAndSendToUser(recipientId.toString(), "/queue/messages", dto)
        messagingTemplate.convertAndSendToUser(user.userId.toString(), "/queue/messages", dto)
    }

    // ── REST: group history ───────────────────────────────────────────────

    @GetMapping("/api/chat/messages/group")
    @PreAuthorize("isAuthenticated()")
    fun groupHistory(): List<ChatMessageDTO> {
        return chatMessageRepository
            .findTop50ByRecipientIdIsNullOrderByCreatedAtAsc()
            .map { it.toDTO() }
    }

    // ── REST: DM history ─────────────────────────────────────────────────

    @GetMapping("/api/chat/messages/dm/{recipientId}")
    @PreAuthorize("isAuthenticated()")
    fun dmHistory(@PathVariable recipientId: UUID): List<ChatMessageDTO> {
        val me = currentUser.userId()
        return chatMessageRepository.findDmHistory(me, recipientId).map { it.toDTO() }
    }

    // ── REST: staff list for DM picker ───────────────────────────────────

    @GetMapping("/api/chat/staff")
    @PreAuthorize("isAuthenticated()")
    fun staffList(): List<StaffSummaryDTO> {
        val me = currentUser.userId()
        return appUserRepository.findAll()
            .filter { it.id != me && it.active }
            .map { StaffSummaryDTO(it.id.toString(), it.name ?: it.email, it.role.name) }
    }

    // ── REST: mark conversation as seen ──────────────────────────────────

    @PostMapping("/api/chat/seen/{key}")
    @PreAuthorize("isAuthenticated()")
    fun markSeen(@PathVariable key: String) {
        val me = currentUser.userId()
        val id = ChatLastSeenId(userId = me, conversationKey = key)
        val entity = chatLastSeenRepository.findByIdUserIdAndIdConversationKey(me, key)
            ?: ChatLastSeen(id = id)
        entity.seenAt = Instant.now()
        chatLastSeenRepository.save(entity)
    }

    // ── REST: unread counts ───────────────────────────────────────────────

    @GetMapping("/api/chat/unread")
    @PreAuthorize("isAuthenticated()")
    fun unreadCounts(): Map<String, Int> {
        val me = currentUser.userId()
        val seenMap = chatLastSeenRepository.findAllByIdUserId(me)
            .associate { it.id.conversationKey to it.seenAt }

        val epoch = Instant.EPOCH
        val result = mutableMapOf<String, Int>()

        // Group unread
        val groupSince = seenMap["group"] ?: epoch
        result["group"] = chatMessageRepository
            .countByRecipientIdIsNullAndCreatedAtAfter(groupSince)

        // DM unread — count per partner (clinic-local staff)
        appUserRepository.findAll()
            .filter { it.id != me && it.active }
            .forEach { staff ->
                val staffId = staff.id
                val dmKey = dmConversationKey(me, staffId)
                val dmSince = seenMap[dmKey] ?: epoch
                val count = chatMessageRepository.countDmAfter(me, staffId, dmSince)
                if (count > 0) result[dmKey] = count
            }

        return result
    }

    private fun dmConversationKey(a: UUID, b: UUID): String {
        val list = listOf(a, b).map { it.toString() }.sorted()
        return "${list[0]}_${list[1]}"
    }
}
