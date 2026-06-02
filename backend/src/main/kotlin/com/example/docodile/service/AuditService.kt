package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.AuditLog
import com.example.docodile.repo.AuditLogRepository
import com.example.docodile.security.CurrentUser
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Service
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import java.util.UUID

@Service
class AuditService(
    private val auditLogRepository: AuditLogRepository,
    private val currentUser: CurrentUser,
    private val objectMapper: ObjectMapper,
) {
    /**
     * Log a security or data event.
     *
     * actorId / tenantId / clinicId default to the current authenticated user
     * when omitted — pass them explicitly for unauthenticated events (e.g. login
     * attempts) where the security context is not yet populated.
     */
    fun log(
        action: AuditAction,
        entityType: String? = null,
        entityId: UUID? = null,
        outcome: String = "SUCCESS",
        actorId: UUID? = null,
        tenantId: UUID? = null,
        clinicId: UUID? = null,
        metadata: Map<String, Any?> = emptyMap(),
    ) {
        val request = currentRequest()
        val entry = AuditLog(
            actorId  = actorId  ?: runCatching { currentUser.userId()   }.getOrNull(),
            tenantId = tenantId ?: runCatching { currentUser.tenantId() }.getOrNull(),
            clinicId = clinicId ?: runCatching { currentUser.clinicIdOrNull() }.getOrNull(),
            action   = action.name,
            entityType = entityType,
            entityId   = entityId,
            ipAddress  = request?.let { resolveIp(it) },
            userAgent  = request?.getHeader("User-Agent"),
            outcome    = outcome,
            metadata   = if (metadata.isEmpty()) null
                         else runCatching { objectMapper.writeValueAsString(metadata) }.getOrNull(),
        )
        auditLogRepository.save(entry)
    }

    private fun currentRequest(): HttpServletRequest? =
        runCatching {
            (RequestContextHolder.getRequestAttributes() as? ServletRequestAttributes)?.request
        }.getOrNull()

    private fun resolveIp(request: HttpServletRequest): String {
        val forwarded = request.getHeader("X-Forwarded-For")
        return if (!forwarded.isNullOrBlank()) forwarded.split(",").first().trim()
        else request.remoteAddr ?: "unknown"
    }
}
