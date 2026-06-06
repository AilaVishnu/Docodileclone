package com.example.docodile.web

import com.example.docodile.domain.ClinicEntity
import com.example.docodile.domain.Service as ServiceEntity
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.ServiceRepository
import com.example.docodile.security.CurrentUser
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
import java.math.BigDecimal
import java.util.Optional
import java.util.UUID

@WebMvcTest(ServiceController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class ServiceControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.RevokedTokenRepository

    @MockitoBean
    private lateinit var serviceRepository: ServiceRepository

    @MockitoBean
    private lateinit var clinicEntityRepository: ClinicEntityRepository

    @MockitoBean
    private lateinit var currentUser: CurrentUser

    private val clinicId: UUID = UUID.randomUUID()

    private fun service(id: UUID = UUID.randomUUID(), name: String = "Consultation", code: String = "CONS") =
        ServiceEntity(
            id = id,
            clinic = ClinicEntity(id = clinicId, name = "Clinic"),
            name = name,
            code = code
        )

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `list should return 200`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(serviceRepository.findAllByClinicIdOrderByCreatedAtAsc(eq(clinicId)))
            .thenReturn(listOf(service()))

        mockMvc.perform(get("/api/tenant/services"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Consultation"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `create with valid request should return 201`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(serviceRepository.findAllByClinicIdOrderByCreatedAtAsc(eq(clinicId)))
            .thenReturn(emptyList())
        whenever(clinicEntityRepository.findById(eq(clinicId)))
            .thenReturn(Optional.of(ClinicEntity(id = clinicId, name = "Clinic")))
        whenever(serviceRepository.save(any())).thenAnswer { it.arguments[0] }

        val req = ServiceRequest(name = "Consultation", code = "CONS", price = BigDecimal.TEN)

        mockMvc.perform(
            post("/api/tenant/services")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("Consultation"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `create with blank name should return 400`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)

        val req = ServiceRequest(name = "", code = "CONS")

        mockMvc.perform(
            post("/api/tenant/services")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Service name is required"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `create duplicate should return 400`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(serviceRepository.findAllByClinicIdOrderByCreatedAtAsc(eq(clinicId)))
            .thenReturn(listOf(service(name = "Consultation", code = "CONS")))

        val req = ServiceRequest(name = "Consultation", code = "OTHER")

        mockMvc.perform(
            post("/api/tenant/services")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("A service with this name already exists"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update should return 200 when found`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(serviceRepository.findByIdAndClinicId(eq(id), eq(clinicId))).thenReturn(service(id = id))
        whenever(serviceRepository.findAllByClinicIdOrderByCreatedAtAsc(eq(clinicId)))
            .thenReturn(listOf(service(id = id)))
        whenever(serviceRepository.save(any())).thenAnswer { it.arguments[0] }

        val req = ServiceRequest(name = "Updated", code = "UPD")

        mockMvc.perform(
            put("/api/tenant/services/$id")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Updated"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update should return 404 when not found`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(serviceRepository.findByIdAndClinicId(eq(id), eq(clinicId))).thenReturn(null)

        val req = ServiceRequest(name = "Updated", code = "UPD")

        mockMvc.perform(
            put("/api/tenant/services/$id")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `delete should return 204 when found`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(serviceRepository.findByIdAndClinicId(eq(id), eq(clinicId))).thenReturn(service(id = id))

        mockMvc.perform(delete("/api/tenant/services/$id").with(csrf()))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `delete should return 404 when not found`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(serviceRepository.findByIdAndClinicId(eq(id), eq(clinicId))).thenReturn(null)

        mockMvc.perform(delete("/api/tenant/services/$id").with(csrf()))
            .andExpect(status().isNotFound)
    }
}
