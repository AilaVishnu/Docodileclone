package com.example.docodile.web

import com.example.docodile.service.AuthService
import tools.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.util.*

@WebMvcTest(AuthenticationController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class AuthenticationControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
    ) {

    

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService


    @MockitoBean
    private lateinit var authService: AuthService

    @Test
    fun `login should return token for valid credentials`() {
        val request = LoginRequest(email = "test@example.com", password = "password")
        val response = LoginResponse(token = "jwt_token", role = "ADMIN", clinicId = UUID.randomUUID(), clinicName = "Clinic")

        `when`(authService.login(request)).thenReturn(response)

        mockMvc.perform(post("/auth/login")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").value("jwt_token"))
    }

    @Test
    fun `login should return 401 for invalid credentials`() {
        val request = LoginRequest(email = "wrong@example.com", password = "password")

        `when`(authService.login(request)).thenThrow(BadCredentialsException("Invalid credentials"))

        mockMvc.perform(post("/auth/login")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(request)))
            .andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.error").value("Invalid credentials"))
    }

    @Test
    fun `staffLogin should return token for valid credentials`() {
        val request = StaffLoginRequest(domain = "clinic1", email = "staff@example.com", password = "password")
        val response = LoginResponse(token = "staff_token", role = "DOCTOR", clinicId = UUID.randomUUID(), clinicName = "Clinic")

        `when`(authService.loginStaff(request)).thenReturn(response)

        mockMvc.perform(post("/auth/staff/login")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").value("staff_token"))
    }
}
