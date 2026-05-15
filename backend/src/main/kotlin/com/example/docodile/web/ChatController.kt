package com.example.docodile.web

import com.example.docodile.domain.ChatLastSeen
import com.example.docodile.domain.ChatLastSeenId
import com.example.docodile.domain.ChatMessage
import com.example.docodile.repo.ChatLastSeenRepository
import com.example.docodile.repo.ChatMessageRepository
import com.example.docodile.repo.ClinicStaffRepository
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
    private val clinicStaffRepository: ClinicStaffRepository,
    private val currentUser: CurrentUser,
    private val messagingTemplate: SimpMessagingTemplate,
) {

    private fun principal(p: Principal): AppUserPrincipal =
        ((p as UsernamePasswordAuthenticationToken).principal as AppUserPrincipal)

    // ── WebSocket: send to group ──────────────────────────────────────────

    @MessageMapping("/group")
    fun groupMessage(@Payload payload: ChatPayload, principal: Principal) {
        val user = principal(principal)
        val clinicId = user.clinicId ?: return
        val msg = ChatMessage(
            clinicId = clinicId,
            senderId = user.userId,
            senderName = user.username, // overridden by name lookup below if available
            senderRole = user.authorities.firstOrNull()?.authority?.removePrefix("ROLE_"),
            content = payload.content.trim(),
        )
        val saved = chatMessageRepository.save(msg)
        messagingTemplate.convertAndSend("/topic/clinic/$clinicId", saved.toDTO())
    }

    // ── WebSocket: send direct message ───────────────────────────────────

    @MessageMapping("/direct")
    fun directMessage(@Payload payload: ChatPayload, principal: Principal) {
        val user = principal(principal)
        val clinicId = user.clinicId ?: return
        val recipientId = payload.recipientId?.let { runCatching { UUID.fromString(it) }.getOrNull() } ?: return
        val msg = ChatMessage(
            clinicId = clinicId,
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
        val clinicId = currentUser.clinicId()
        return chatMessageRepository
            .findTop50ByClinicIdAndRecipientIdIsNullOrderByCreatedAtAsc(clinicId)
            .map { it.toDTO() }
    }

    // ── REST: DM history ─────────────────────────────────────────────────

    @GetMapping("/api/chat/messages/dm/{recipientId}")
    @PreAuthorize("isAuthenticated()")
    fun dmHistory(@PathVariable recipientId: UUID): List<ChatMessageDTO> {
        val clinicId = currentUser.clinicId()
        val me = currentUser.userId()
        return chatMessageRepository.findDmHistory(clinicId, me, recipientId).map { it.toDTO() }
    }

    // ── REST: staff list for DM picker ───────────────────────────────────

    @GetMapping("/api/chat/staff")
    @PreAuthorize("isAuthenticated()")
    fun staffList(): List<StaffSummaryDTO> {
        val clinicId = currentUser.clinicId()
        val me = currentUser.userId()
        return clinicStaffRepository.findByClinicId(clinicId)
            .mapNotNull { it.staff }
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
        val clinicId = currentUser.clinicId()
        val me = currentUser.userId()
        val seenMap = chatLastSeenRepository.findAllByIdUserId(me)
            .associate { it.id.conversationKey to it.seenAt }

        val epoch = Instant.EPOCH
        val result = mutableMapOf<String, Int>()

        // Group unread
        val groupSince = seenMap["group"] ?: epoch
        result["group"] = chatMessageRepository
            .countByClinicIdAndRecipientIdIsNullAndCreatedAtAfter(clinicId, groupSince)

        // DM unread — count per partner
        clinicStaffRepository.findByClinicId(clinicId)
            .mapNotNull { it.staff }
            .filter { it.id != me && it.active }
            .forEach { staff ->
                val staffId = staff.id ?: return@forEach
                val dmKey = dmConversationKey(me, staffId)
                val dmSince = seenMap[dmKey] ?: epoch
                val count = chatMessageRepository.countDmAfter(clinicId, me, staffId, dmSince)
                if (count > 0) result[dmKey] = count
            }

        return result
    }

    private fun dmConversationKey(a: UUID, b: UUID): String {
        val list = listOf(a, b).map { it.toString() }.sorted()
        return "${list[0]}_${list[1]}"
    }
}
