package com.example.docodile.web

import com.example.docodile.domain.Patient
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.service.AuditService
import com.example.docodile.service.PatientService
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
import java.time.Instant
import java.util.UUID

@WebMvcTest(PatientController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class PatientControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.RevokedTokenRepository

    @MockitoBean
    private lateinit var patientService: PatientService

    @MockitoBean
    private lateinit var patientRepository: PatientRepository

    @MockitoBean
    private lateinit var currentUser: CurrentUser

    @MockitoBean
    private lateinit var auditService: AuditService

    @MockitoBean
    private lateinit var visitService: com.example.docodile.service.VisitService

    private val clinicId: UUID = UUID.randomUUID()

    private fun patient(id: UUID, deletedAt: Instant? = null) = Patient(
        id = id,
        name = "Jane Doe",
    ).also { it.deletedAt = deletedAt }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `list should return 200 with patients`() {
        val dto = PatientWithLastVisitDTO(
            id = UUID.randomUUID(),
            name = "Jane Doe",
            phone = "1234567890",
            email = null,
            gender = "female",
            dob = null,
            age = null,
            displayNo = 1,
            lastVisitDate = null,
            treatingDoctorIds = emptyList(),
            treatingDepartments = emptyList()
        )
        whenever(patientService.listPatientsWithLastVisit()).thenReturn(listOf(dto))

        mockMvc.perform(get("/api/patients"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Jane Doe"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `listArchived should return 200`() {
        whenever(patientService.listArchived()).thenReturn(emptyList())

        mockMvc.perform(get("/api/patients/archived"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `archive should return 204 when patient found`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(currentUser.userId()).thenReturn(UUID.randomUUID())
        whenever(patientRepository.findByIdAndClinicId(eq(id), eq(clinicId))).thenReturn(patient(id))
        whenever(patientRepository.save(any())).thenAnswer { it.arguments[0] }

        mockMvc.perform(post("/api/patients/$id/archive").with(csrf()))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `archive should return 404 when patient not found`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(patientRepository.findByIdAndClinicId(eq(id), eq(clinicId))).thenReturn(null)

        mockMvc.perform(post("/api/patients/$id/archive").with(csrf()))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `unarchive should return 204 when patient found`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(patientRepository.findByIdAndClinicId(eq(id), eq(clinicId)))
            .thenReturn(patient(id, deletedAt = Instant.now()))
        whenever(patientRepository.save(any())).thenAnswer { it.arguments[0] }

        mockMvc.perform(post("/api/patients/$id/unarchive").with(csrf()))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update with valid body should return 204`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(patientRepository.findByIdAndClinicId(eq(id), eq(clinicId))).thenReturn(patient(id))
        whenever(patientRepository.save(any())).thenAnswer { it.arguments[0] }

        val req = UpdatePatientRequest(
            name = "Jane Smith",
            phone = "1234567890",
            email = "jane@example.com",
            gender = "female",
            dob = null,
            age = null
        )

        mockMvc.perform(
            patch("/api/patients/$id")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update with invalid name should return 400`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(patientRepository.findByIdAndClinicId(eq(id), eq(clinicId))).thenReturn(patient(id))

        val req = UpdatePatientRequest(
            name = "J",
            phone = null,
            email = null,
            gender = null,
            dob = null,
            age = null
        )

        mockMvc.perform(
            patch("/api/patients/$id")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Name must be at least 2 characters"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update with invalid email should return 400`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(patientRepository.findByIdAndClinicId(eq(id), eq(clinicId))).thenReturn(patient(id))

        val req = UpdatePatientRequest(
            name = "Jane Doe",
            phone = null,
            email = "not-an-email",
            gender = null,
            dob = null,
            age = null
        )

        mockMvc.perform(
            patch("/api/patients/$id")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Invalid email format"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update of soft-deleted patient should return 404`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(patientRepository.findByIdAndClinicId(eq(id), eq(clinicId)))
            .thenReturn(patient(id, deletedAt = Instant.now()))

        val req = UpdatePatientRequest(
            name = "Jane Doe",
            phone = null,
            email = null,
            gender = null,
            dob = null,
            age = null
        )

        mockMvc.perform(
            patch("/api/patients/$id")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isNotFound)
    }
}
