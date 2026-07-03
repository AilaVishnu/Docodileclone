package com.example.docodile.web

import com.example.docodile.service.SuggestionService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import tools.jackson.databind.ObjectMapper
import java.util.UUID

@WebMvcTest(SuggestionController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class SuggestionControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.UserSessionRepository

    @MockitoBean
    private lateinit var suggestionService: SuggestionService

    private val mapper = ObjectMapper()

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `list returns 200 with suggestions`() {
        whenever(suggestionService.list(eq("complaints"), any(), any()))
            .thenReturn(listOf(SuggestionDTO(id = UUID.randomUUID(), field = "complaints", value = "Fever", useCount = 3)))

        mockMvc.perform(get("/api/suggestions").param("field", "complaints").param("q", "fe"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].value").value("Fever"))
            .andExpect(jsonPath("$[0].useCount").value(3))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `list returns 200 with empty array`() {
        whenever(suggestionService.list(eq("diagnosis"), any(), any())).thenReturn(emptyList())

        mockMvc.perform(get("/api/suggestions").param("field", "diagnosis"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `record returns 200 on success`() {
        whenever(suggestionService.record("complaints", "Cough"))
            .thenReturn(listOf(SuggestionDTO(id = UUID.randomUUID(), field = "complaints", value = "Cough", useCount = 1)))

        val req = RecordSuggestionRequest(field = "complaints", value = "Cough")
        mockMvc.perform(post("/api/suggestions")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].value").value("Cough"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `record returns 400 on invalid request`() {
        whenever(suggestionService.record(any(), any()))
            .thenThrow(IllegalArgumentException("Unknown field"))

        val req = RecordSuggestionRequest(field = "bad", value = "x")
        mockMvc.perform(post("/api/suggestions")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Unknown field"))
    }
}
