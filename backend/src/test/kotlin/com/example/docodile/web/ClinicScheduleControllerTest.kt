package com.example.docodile.web

import com.example.docodile.domain.ClinicSchedule
import com.example.docodile.repo.ClinicScheduleRepository
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
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

@WebMvcTest(ClinicScheduleController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class ClinicScheduleControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var userSessionRepository: com.example.docodile.repo.UserSessionRepository

    @MockitoBean
    private lateinit var repo: ClinicScheduleRepository

    private val mapper = ObjectMapper()

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `get returns 200 with stored schedule`() {
        whenever(repo.findAll())
            .thenReturn(listOf(ClinicSchedule(schedule = "{\"configured\":true}")))

        mockMvc.perform(get("/api/tenant/clinic-schedule"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.schedule").value("{\"configured\":true}"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `get returns empty object default when no row exists`() {
        whenever(repo.findAll()).thenReturn(emptyList())

        mockMvc.perform(get("/api/tenant/clinic-schedule"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.schedule").value("{}"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update returns 200 with saved schedule for existing row`() {
        whenever(repo.findAll())
            .thenReturn(listOf(ClinicSchedule(schedule = "{}")))
        whenever(repo.save(any<ClinicSchedule>())).thenAnswer { it.arguments[0] as ClinicSchedule }

        val body = ClinicScheduleDTO(schedule = "{\"mon\":\"9-5\"}")
        mockMvc.perform(put("/api/tenant/clinic-schedule")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(body)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.schedule").value("{\"mon\":\"9-5\"}"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update creates new row when none exists`() {
        whenever(repo.findAll()).thenReturn(emptyList())
        whenever(repo.save(any<ClinicSchedule>())).thenAnswer { it.arguments[0] as ClinicSchedule }

        val body = ClinicScheduleDTO(schedule = "{\"tue\":\"10-6\"}")
        mockMvc.perform(put("/api/tenant/clinic-schedule")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(body)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.schedule").value("{\"tue\":\"10-6\"}"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update falls back to empty object for blank schedule`() {
        whenever(repo.findAll()).thenReturn(emptyList())
        whenever(repo.save(any<ClinicSchedule>())).thenAnswer { it.arguments[0] as ClinicSchedule }

        val body = ClinicScheduleDTO(schedule = "")
        mockMvc.perform(put("/api/tenant/clinic-schedule")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(body)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.schedule").value("{}"))
    }
}
