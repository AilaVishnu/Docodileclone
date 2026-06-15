package com.example.docodile.web

import com.example.docodile.domain.PatientConsent
import com.example.docodile.service.ConsentService
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.util.*

@WebMvcTest(ConsentController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class ConsentControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.RevokedTokenRepository

    @MockitoBean
    private lateinit var consentService: ConsentService

    private fun consent(patientId: UUID) = PatientConsent(
        id = UUID.randomUUID(),
        patientId = patientId,
        clinicId = UUID.randomUUID(),
        purpose = "TREATMENT",
        version = "v1",
    )

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `list returns 200 with consent list`() {
        val patientId = UUID.randomUUID()
        `when`(consentService.listConsents(patientId)).thenReturn(listOf(consent(patientId)))

        mockMvc.perform(get("/api/patients/$patientId/consent"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].purpose").value("TREATMENT"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `grant returns 201 for valid body`() {
        val patientId = UUID.randomUUID()
        val request = GrantConsentRequest(purpose = "TREATMENT", version = "v1")
        `when`(consentService.grantConsent(patientId, "TREATMENT", "v1")).thenReturn(consent(patientId))

        mockMvc.perform(post("/api/patients/$patientId/consent")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(request)))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.purpose").value("TREATMENT"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `grant returns 400 for blank purpose`() {
        val patientId = UUID.randomUUID()
        val request = GrantConsentRequest(purpose = "", version = "v1")

        mockMvc.perform(post("/api/patients/$patientId/consent")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(request)))
            .andExpect(status().isBadRequest)
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `withdraw returns 204`() {
        val patientId = UUID.randomUUID()
        val consentId = UUID.randomUUID()

        mockMvc.perform(delete("/api/patients/$patientId/consent/$consentId").with(csrf()))
            .andExpect(status().isNoContent)
    }
}
