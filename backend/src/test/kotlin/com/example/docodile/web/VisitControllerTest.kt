package com.example.docodile.web

import com.example.docodile.service.AuditService
import com.example.docodile.service.ConsentService
import com.example.docodile.service.VisitService
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
import java.time.LocalDate
import java.util.UUID

@WebMvcTest(VisitController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class VisitControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.UserSessionRepository

    @MockitoBean
    private lateinit var visitService: VisitService

    @MockitoBean
    private lateinit var auditService: AuditService

    @MockitoBean
    private lateinit var consentService: ConsentService

    private fun visitDto(id: UUID, patientId: UUID) = VisitDTO(
        id = id,
        patientId = patientId,
        clinicId = UUID.randomUUID(),
        createdByDoctorId = null,
        visitDate = LocalDate.now(),
        bpSystolic = null, bpDiastolic = null, bpUnit = null,
        bmi = null, bmiUnit = null,
        height = null, heightUnit = null,
        weight = null, weightUnit = null,
        temperature = null, temperatureUnit = null,
        pulse = null, pulseUnit = null,
        waist = null, waistUnit = null,
        hip = null, hipUnit = null,
        spo2 = null, spo2Unit = null,
        familyHistory = null, allergies = null,
        personalHistory = null, pastMedicalHistory = null,
        complaints = null, diagnosis = null,
        notesForPatient = null, privateNotes = null, tests = null,
        referDoctorId = null, referDoctorName = null,
        reviewDate = null, reviewDays = null, reviewNotes = null,
        sessionStartedAt = null, sessionEndedAt = null, sessionDurationSec = null,
        appointmentId = null,
        appointmentStatus = null,
        prescriptions = emptyList()
    )

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `listForPatient should return 200`() {
        val patientId = UUID.randomUUID()
        whenever(visitService.listForPatient(eq(patientId)))
            .thenReturn(listOf(visitDto(UUID.randomUUID(), patientId)))

        mockMvc.perform(get("/api/patients/$patientId/visits"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].patientId").value(patientId.toString()))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `get should return 200 with visit`() {
        val visitId = UUID.randomUUID()
        val patientId = UUID.randomUUID()
        whenever(visitService.get(eq(visitId))).thenReturn(visitDto(visitId, patientId))

        mockMvc.perform(get("/api/visits/$visitId"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(visitId.toString()))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `get should return 400 when service throws IllegalArgumentException`() {
        val visitId = UUID.randomUUID()
        whenever(visitService.get(eq(visitId))).thenThrow(IllegalArgumentException("Visit not found"))

        mockMvc.perform(get("/api/visits/$visitId"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Visit not found"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `create should return 200 with valid request`() {
        val patientId = UUID.randomUUID()
        whenever(visitService.create(eq(patientId), any()))
            .thenReturn(visitDto(UUID.randomUUID(), patientId))

        val req = SaveVisitRequest(visitDate = LocalDate.now())

        mockMvc.perform(
            post("/api/patients/$patientId/visits")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.patientId").value(patientId.toString()))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `update should return 200`() {
        val visitId = UUID.randomUUID()
        val patientId = UUID.randomUUID()
        whenever(visitService.get(eq(visitId))).thenReturn(visitDto(visitId, patientId))
        whenever(visitService.update(eq(visitId), any())).thenReturn(visitDto(visitId, patientId))

        val req = SaveVisitRequest(visitDate = LocalDate.now())

        mockMvc.perform(
            put("/api/visits/$visitId")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(visitId.toString()))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `delete should return 204`() {
        val visitId = UUID.randomUUID()
        val patientId = UUID.randomUUID()
        whenever(visitService.get(eq(visitId))).thenReturn(visitDto(visitId, patientId))

        mockMvc.perform(delete("/api/visits/$visitId").with(csrf()))
            .andExpect(status().isNoContent)
    }
}
