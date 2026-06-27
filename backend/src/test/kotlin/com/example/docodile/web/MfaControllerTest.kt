package com.example.docodile.web

import com.example.docodile.service.AuthService
import com.example.docodile.service.MfaService
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.util.*

@WebMvcTest(MfaController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class MfaControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var userSessionRepository: com.example.docodile.repo.UserSessionRepository

    @MockitoBean
    private lateinit var mfaService: MfaService

    @MockitoBean
    private lateinit var authService: AuthService

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `enroll returns 200 for authenticated user`() {
        `when`(mfaService.beginEnrollment())
            .thenReturn(MfaService.EnrollmentResponse(secret = "S", qrUri = "otpauth://x", backupCodes = listOf("a", "b")))

        mockMvc.perform(post("/auth/mfa/enroll").with(csrf()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.secret").value("S"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `confirm returns 200 for valid code`() {
        val req = MfaCodeRequest(code = "123456")
        `when`(mfaService.confirmEnrollment("123456")).thenReturn(true)

        mockMvc.perform(post("/auth/mfa/confirm")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.enrolled").value(true))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `confirm returns 400 for invalid code`() {
        val req = MfaCodeRequest(code = "000000")
        `when`(mfaService.confirmEnrollment("000000")).thenReturn(false)

        mockMvc.perform(post("/auth/mfa/confirm")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Invalid TOTP code"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `verify returns 200 for valid code`() {
        val req = MfaCodeRequest(code = "123456")
        `when`(mfaService.verifyCode("123456")).thenReturn(true)

        mockMvc.perform(post("/auth/mfa/verify")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.verified").value(true))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `verify returns 401 for invalid code`() {
        val req = MfaCodeRequest(code = "000000")
        `when`(mfaService.verifyCode("000000")).thenReturn(false)

        mockMvc.perform(post("/auth/mfa/verify")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.error").value("Invalid MFA code"))
    }

    @Test
    fun `complete returns 200 with token for valid code`() {
        val req = MfaCompleteRequest(mfaPendingToken = "pending", code = "123456")
        val userId = UUID.randomUUID()
        val response = LoginResponse(token = "jwt_token", role = "ADMIN", gender = null)

        `when`(mfaService.verifyFromPendingToken("pending", "123456")).thenReturn(userId)
        `when`(authService.completeMfaLogin("pending")).thenReturn(response)

        mockMvc.perform(post("/auth/mfa/complete")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").value("jwt_token"))
    }

    @Test
    fun `complete returns 401 for invalid code`() {
        val req = MfaCompleteRequest(mfaPendingToken = "pending", code = "000000")
        `when`(mfaService.verifyFromPendingToken("pending", "000000")).thenReturn(null)

        mockMvc.perform(post("/auth/mfa/complete")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.error").value("Invalid MFA code"))
    }
}
