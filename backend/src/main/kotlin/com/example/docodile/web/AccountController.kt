package com.example.docodile.web

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.UserSession
import com.example.docodile.repo.UserSessionRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.service.AuditService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.util.UUID

data class SessionDTO(
    val id: UUID,
    val ipAddress: String?,
    val userAgent: String?,
    val createdAt: Instant,
    val lastSeenAt: Instant,
    val expiresAt: Instant,
    val active: Boolean,
)

@RestController
@RequestMapping("/account/sessions")
class AccountController(
    private val userSessionRepository: UserSessionRepository,
    private val currentUser: CurrentUser,
    private val auditService: AuditService,
) {

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    fun listSessions(): List<SessionDTO> {
        val userId = currentUser.userId()
        return userSessionRepository.findAllByUserIdAndRevokedAtIsNull(userId)
            .filter { it.expiresAt.isAfter(Instant.now()) }
            .map { it.toDTO() }
    }

    @DeleteMapping("/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    fun revokeSession(@PathVariable sessionId: UUID): ResponseEntity<Void> {
        val userId = currentUser.userId()
        val session = userSessionRepository.findById(sessionId)
            .filter { it.userId == userId }
            .orElseThrow { IllegalArgumentException("Session not found") }

        if (session.revokedAt != null) {
            throw IllegalArgumentException("Session already revoked")
        }

        session.revokedAt = Instant.now()
        userSessionRepository.save(session)
        auditService.log(
            action     = AuditAction.SESSION_REVOKED,
            entityType = "UserSession",
            entityId   = sessionId,
        )
        return ResponseEntity.noContent().build()
    }

    private fun UserSession.toDTO() = SessionDTO(
        id          = id,
        ipAddress   = ipAddress,
        userAgent   = userAgent,
        createdAt   = createdAt,
        lastSeenAt  = lastSeenAt,
        expiresAt   = expiresAt,
        active      = revokedAt == null && expiresAt.isAfter(Instant.now()),
    )

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
}
