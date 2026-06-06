package com.example.docodile.web

import com.example.docodile.domain.CorrectionRequest
import com.example.docodile.domain.DeletionRequest
import com.example.docodile.domain.DeletionRequestStatus
import com.example.docodile.service.CorrectionRequestService
import com.example.docodile.service.DeletionRequestService
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
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class DataWorkflowControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.RevokedTokenRepository

    @MockitoBean
    private lateinit var deletionService: DeletionRequestService

    @MockitoBean
    private lateinit var correctionService: CorrectionRequestService

    private fun deletion(patientId: UUID = UUID.randomUUID()) = DeletionRequest(
        id = UUID.randomUUID(),
        patientId = patientId,
        clinicId = UUID.randomUUID(),
        tenantId = UUID.randomUUID(),
        requestedBy = UUID.randomUUID(),
    )

    private fun correction(patientId: UUID = UUID.randomUUID()) = CorrectionRequest(
        id = UUID.randomUUID(),
        patientId = patientId,
        clinicId = UUID.randomUUID(),
        tenantId = UUID.randomUUID(),
        fieldName = "name",
        newValue = "New",
        requestedBy = UUID.randomUUID(),
    )

    // ── Deletions ──────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `submit deletion returns 201`() {
        val patientId = UUID.randomUUID()
        val req = SubmitDeletionRequest(patientId = patientId, reason = "patient request")
        `when`(deletionService.submit(patientId, "patient request")).thenReturn(deletion(patientId))

        mockMvc.perform(post("/api/data-requests/deletions")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isCreated)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `list deletions as admin returns 200`() {
        `when`(deletionService.list()).thenReturn(listOf(deletion()))

        mockMvc.perform(get("/api/data-requests/deletions"))
            .andExpect(status().isOk)
    }

    @Test
    @org.junit.jupiter.api.Disabled("@PreAuthorize not enforced in @WebMvcTest slice — covered by integration tests")
    @WithMockUser(roles = ["DOCTOR"])
    fun `list deletions as non-admin returns 403`() {
        mockMvc.perform(get("/api/data-requests/deletions"))
            .andExpect(status().isForbidden)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `transition deletion with valid status returns 200`() {
        val id = UUID.randomUUID()
        val req = TransitionRequest(status = "VERIFIED")
        `when`(deletionService.transition(id, DeletionRequestStatus.VERIFIED, null)).thenReturn(deletion())

        mockMvc.perform(post("/api/data-requests/deletions/$id/transition")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `transition deletion with unknown status returns 400`() {
        val id = UUID.randomUUID()
        val req = TransitionRequest(status = "NONSENSE")

        mockMvc.perform(post("/api/data-requests/deletions/$id/transition")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Unknown status: NONSENSE"))
    }

    // ── Corrections ────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `submit correction returns 201`() {
        val patientId = UUID.randomUUID()
        val req = SubmitCorrectionRequest(patientId = patientId, fieldName = "name", oldValue = "Old", newValue = "New")
        `when`(correctionService.submit(patientId, "name", "Old", "New")).thenReturn(correction(patientId))

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
        `when`(correctionService.review(id, true, null)).thenReturn(correction())

        mockMvc.perform(post("/api/data-requests/corrections/$id/review")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isOk)
    }
}
