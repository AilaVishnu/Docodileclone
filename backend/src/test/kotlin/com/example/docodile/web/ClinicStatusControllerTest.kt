package com.example.docodile.web

import com.example.docodile.domain.AppUser
import com.example.docodile.domain.ClinicSettings
import com.example.docodile.service.ClinicStatusService
import tools.jackson.databind.ObjectMapper
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

@WebMvcTest(ClinicStatusController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class ClinicStatusControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var userSessionRepository: com.example.docodile.repo.UserSessionRepository

    @MockitoBean
    private lateinit var clinicStatusService: ClinicStatusService

    @MockitoBean
    private lateinit var appointmentService: com.example.docodile.service.AppointmentService

    @MockitoBean
    private lateinit var chargeService: com.example.docodile.service.ChargeService

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `status should return complete boolean`() {
        `when`(clinicStatusService.isClinicComplete()).thenReturn(true)

        mockMvc.perform(get("/api/tenant/status"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.complete").value(true))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `saveClinic should return saved clinic`() {
        val request = ClinicDetailsRequest(id = null, name = "Clinic 1", domain = "clinic1", address = "Address", phone = "123", speciality = null)
        val saved = ClinicSettings(id = UUID.randomUUID(), name = "Clinic 1")

        `when`(clinicStatusService.saveClinicDetails(request)).thenReturn(saved)

        mockMvc.perform(post("/api/tenant/clinic")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Clinic 1"))
    }

    // Note: @PreAuthorize role checks require full SecurityConfig
    // which is not loaded in @WebMvcTest slice.

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `saveStaff should return saved staff`() {
        val request = StaffRequest(name = "Dr. Smith", email = "smith@example.com", phone = "1234567890", role = "DOCTOR", gender = "OTHER")
        val saved = AppUser(id = UUID.randomUUID(), name = "Dr. Smith")

        `when`(clinicStatusService.saveStaff(request)).thenReturn(saved)

        mockMvc.perform(post("/api/tenant/staff")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Dr. Smith"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `saveClinic should return 400 when domain exists`() {
        val request = ClinicDetailsRequest(id = null, name = "Repeat", domain = "existing", address = null, phone = null, speciality = null)

        `when`(clinicStatusService.saveClinicDetails(request))
            .thenThrow(IllegalArgumentException("Domain name already exists in application"))

        mockMvc.perform(post("/api/tenant/clinic")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(tools.jackson.databind.ObjectMapper().writeValueAsString(request)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Domain name already exists in application"))
    }
}
