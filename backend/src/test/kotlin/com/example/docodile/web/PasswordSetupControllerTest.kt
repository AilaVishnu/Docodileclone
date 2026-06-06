package com.example.docodile.web

import com.example.docodile.domain.AppUser
import com.example.docodile.domain.PasswordResetToken
import com.example.docodile.domain.Role
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.ClinicStaffRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.service.EmailService
import com.example.docodile.service.PasswordTokenService
import com.example.docodile.service.TokenInvalidException
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import tools.jackson.databind.ObjectMapper
import java.time.Instant
import java.util.Optional
import java.util.UUID

@WebMvcTest(PasswordSetupController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class PasswordSetupControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.RevokedTokenRepository

    @MockitoBean
    private lateinit var passwordTokenService: PasswordTokenService

    @MockitoBean
    private lateinit var appUserRepository: AppUserRepository

    @MockitoBean
    private lateinit var clinicEntityRepository: ClinicEntityRepository

    @MockitoBean
    private lateinit var clinicStaffRepository: ClinicStaffRepository

    @MockitoBean
    private lateinit var passwordEncoder: PasswordEncoder

    @MockitoBean
    private lateinit var emailService: EmailService

    @MockitoBean
    private lateinit var currentUser: CurrentUser

    private val mapper = ObjectMapper()

    private fun resetToken(userId: UUID) = PasswordResetToken(
        userId = userId,
        tokenHash = "hash",
        expiresAt = Instant.now().plusSeconds(3600),
    )

    private fun user(role: Role = Role.ADMIN, active: Boolean = true) = AppUser(
        id = UUID.randomUUID(),
        name = "Jane",
        email = "jane@example.com",
        role = role,
        active = active,
    )

    // --- setup-password (public) ---

    @Test
    fun `setupPassword returns 200 for valid token and matching password`() {
        val u = user()
        whenever(passwordTokenService.validateToken("tok")).thenReturn(resetToken(u.id))
        whenever(appUserRepository.findById(u.id)).thenReturn(Optional.of(u))
        whenever(passwordEncoder.encode(any())).thenReturn("encoded")
        whenever(appUserRepository.save(any<AppUser>())).thenAnswer { it.arguments[0] as AppUser }

        val req = SetupPasswordRequest(token = "tok", password = "password1", confirmPassword = "password1")
        mockMvc.perform(post("/auth/setup-password")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
    }

    @Test
    fun `setupPassword returns 400 when password too short`() {
        val req = SetupPasswordRequest(token = "tok", password = "short", confirmPassword = "short")
        mockMvc.perform(post("/auth/setup-password")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Password must be at least 8 characters"))
    }

    @Test
    fun `setupPassword returns 400 when passwords do not match`() {
        val req = SetupPasswordRequest(token = "tok", password = "password1", confirmPassword = "password2")
        mockMvc.perform(post("/auth/setup-password")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Passwords do not match"))
    }

    @Test
    fun `setupPassword returns 400 for invalid or expired token`() {
        whenever(passwordTokenService.validateToken("bad"))
            .thenThrow(TokenInvalidException("This link has expired"))

        val req = SetupPasswordRequest(token = "bad", password = "password1", confirmPassword = "password1")
        mockMvc.perform(post("/auth/setup-password")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("This link has expired"))
    }

    // --- forgot-password (public) ---

    @Test
    fun `forgotPassword returns 200 for admin flow`() {
        val u = user(role = Role.ADMIN)
        whenever(appUserRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(u))
        whenever(passwordTokenService.generateToken(u.id)).thenReturn("raw")
        whenever(passwordTokenService.buildSetupLink("raw")).thenReturn("http://link")

        val req = ForgotPasswordRequest(email = "jane@example.com", domain = null)
        mockMvc.perform(post("/auth/forgot-password")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
    }

    @Test
    fun `forgotPassword returns 404 when email does not exist`() {
        whenever(appUserRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty())

        val req = ForgotPasswordRequest(email = "nobody@example.com", domain = null)
        mockMvc.perform(post("/auth/forgot-password")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error").value("Email ID does not exist"))
    }

    @Test
    fun `forgotPassword returns 404 in admin flow when user is not admin`() {
        val u = user(role = Role.DOCTOR)
        whenever(appUserRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(u))

        val req = ForgotPasswordRequest(email = "jane@example.com", domain = null)
        mockMvc.perform(post("/auth/forgot-password")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error").value("Email ID does not exist"))
    }

    // --- validate-token (public) ---

    @Test
    fun `validateToken returns valid true for good token`() {
        val u = user(role = Role.DOCTOR)
        whenever(passwordTokenService.validateToken("tok")).thenReturn(resetToken(u.id))
        whenever(appUserRepository.findById(u.id)).thenReturn(Optional.of(u))

        mockMvc.perform(get("/auth/validate-token").param("token", "tok"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.valid").value(true))
            .andExpect(jsonPath("$.name").value("Jane"))
    }

    @Test
    fun `validateToken returns valid false for bad token`() {
        whenever(passwordTokenService.validateToken("bad"))
            .thenThrow(TokenInvalidException("Invalid or expired link"))

        mockMvc.perform(get("/auth/validate-token").param("token", "bad"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.valid").value(false))
    }
}
