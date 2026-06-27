package com.example.docodile.web

import com.example.docodile.domain.DataSubjectRequest
import com.example.docodile.service.DataSubjectRequestService
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

@WebMvcTest(DataWorkflowController::class)
@org.springframework.context.annotation.Import(
    com.example.docodile.security.JwtAuthenticationFilter::class,
    MethodSecurityTestConfig::class,
)
class DataWorkflowControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var userSessionRepository: com.example.docodile.repo.UserSessionRepository

    @MockitoBean
    private lateinit var dataSubjectRequestService: DataSubjectRequestService

    private fun dataSubjectRequest(
        patientId: UUID = UUID.randomUUID(),
        type: String = "DELETION",
    ) = DataSubjectRequest(
        id = UUID.randomUUID(),
        patientId = patientId,
        type = type,
        status = "SUBMITTED",
        requestedBy = UUID.randomUUID(),
    )

    // ── Deletions ──────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `submit deletion returns 201`() {
        val patientId = UUID.randomUUID()
        val req = SubmitDeletionRequest(patientId = patientId, reason = "patient request")
        `when`(dataSubjectRequestService.submitDeletion(patientId, "patient request"))
            .thenReturn(dataSubjectRequest(patientId, "DELETION"))

        mockMvc.perform(post("/api/data-requests/deletions")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isCreated)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `list deletions as admin returns 200`() {
        `when`(dataSubjectRequestService.listDeletions()).thenReturn(listOf(dataSubjectRequest()))

        mockMvc.perform(get("/api/data-requests/deletions"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `list deletions as non-admin is denied by method security`() {
        // @PreAuthorize denies a DOCTOR. In a @WebMvcTest slice the
        // AuthorizationDeniedException surfaces wrapped in a ServletException
        // (the full SecurityConfig chain mapping it to HTTP 403 isn't loaded here).
        val ex = org.junit.jupiter.api.Assertions.assertThrows(Exception::class.java) {
            mockMvc.perform(get("/api/data-requests/deletions"))
        }
        org.junit.jupiter.api.Assertions.assertTrue(
            generateSequence(ex as Throwable?) { it.cause }
                .any { it is org.springframework.security.authorization.AuthorizationDeniedException },
            "expected an AuthorizationDeniedException in the cause chain",
        )
        org.mockito.Mockito.verify(dataSubjectRequestService, org.mockito.Mockito.never()).listDeletions()
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `transition deletion with valid status returns 200`() {
        val id = UUID.randomUUID()
        val req = TransitionRequest(status = "VERIFIED")
        `when`(dataSubjectRequestService.transitionDeletion(id, "VERIFIED", null))
            .thenReturn(dataSubjectRequest())

        mockMvc.perform(post("/api/data-requests/deletions/$id/transition")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isOk)
    }

    // ── Corrections ────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `submit correction returns 201`() {
        val patientId = UUID.randomUUID()
        val req = SubmitCorrectionRequest(patientId = patientId, fieldName = "name", oldValue = "Old", newValue = "New")
        `when`(dataSubjectRequestService.submitCorrection(patientId, "name", "Old", "New"))
            .thenReturn(dataSubjectRequest(patientId, "CORRECTION"))

        mockMvc.perform(post("/api/data-requests/corrections")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isCreated)
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `submit correction with blank fieldName returns 400`() {
        val req = SubmitCorrectionRequest(patientId = UUID.randomUUID(), fieldName = "", oldValue = "Old", newValue = "New")

        mockMvc.perform(post("/api/data-requests/corrections")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isBadRequest)
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `submit correction with blank newValue returns 400`() {
        val req = SubmitCorrectionRequest(patientId = UUID.randomUUID(), fieldName = "name", oldValue = "Old", newValue = "")

        mockMvc.perform(post("/api/data-requests/corrections")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isBadRequest)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `review correction returns 200`() {
        val id = UUID.randomUUID()
        val req = ReviewCorrectionRequest(approve = true)
        `when`(dataSubjectRequestService.reviewCorrection(id, true, null))
            .thenReturn(dataSubjectRequest(type = "CORRECTION"))

        mockMvc.perform(post("/api/data-requests/corrections/$id/review")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isOk)
    }
}
