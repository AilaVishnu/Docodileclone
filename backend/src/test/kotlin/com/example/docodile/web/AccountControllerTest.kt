package com.example.docodile.web

import com.example.docodile.domain.UserSession
import com.example.docodile.repo.UserSessionRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.service.AuditService
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.Instant
import java.util.*

@WebMvcTest(AccountController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class AccountControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var userSessionRepository: UserSessionRepository

    @MockitoBean
    private lateinit var currentUser: CurrentUser

    @MockitoBean
    private lateinit var auditService: AuditService

    private fun session(userId: UUID, id: UUID = UUID.randomUUID()) = UserSession(
        id = id,
        userId = userId,
        jti = UUID.randomUUID(),
        ipAddress = "1.2.3.4",
        userAgent = "agent",
        expiresAt = Instant.now().plusSeconds(3600),
    )

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `list sessions returns 200 with session list`() {
        val userId = UUID.randomUUID()
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(userSessionRepository.findAllByUserIdAndRevokedAtIsNull(userId))
            .thenReturn(listOf(session(userId)))

        mockMvc.perform(get("/account/sessions"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].ipAddress").value("1.2.3.4"))
            .andExpect(jsonPath("$[0].active").value(true))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `revoke session owned by user returns 204`() {
        val userId = UUID.randomUUID()
        val sessionId = UUID.randomUUID()
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(userSessionRepository.findById(sessionId))
            .thenReturn(Optional.of(session(userId, sessionId)))

        mockMvc.perform(delete("/account/sessions/$sessionId").with(csrf()))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `revoke session not owned by user returns 400`() {
        val userId = UUID.randomUUID()
        val otherUserId = UUID.randomUUID()
        val sessionId = UUID.randomUUID()
        `when`(currentUser.userId()).thenReturn(userId)
        // Session belongs to a different user; controller filters it out and throws.
        `when`(userSessionRepository.findById(sessionId))
            .thenReturn(Optional.of(session(otherUserId, sessionId)))

        mockMvc.perform(delete("/account/sessions/$sessionId").with(csrf()))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Session not found"))
    }
}
