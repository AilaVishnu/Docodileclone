package com.example.docodile.web

import com.example.docodile.domain.PharmacyStock
import com.example.docodile.repo.PharmacyStockRepository
import com.example.docodile.service.AuditService
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
import java.util.Optional
import java.util.UUID

@WebMvcTest(PharmacyStockController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class PharmacyStockControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var userSessionRepository: com.example.docodile.repo.UserSessionRepository

    @MockitoBean
    private lateinit var repo: PharmacyStockRepository

    @MockitoBean
    private lateinit var currentUser: com.example.docodile.security.CurrentUser

    @MockitoBean
    private lateinit var auditService: AuditService

    private fun stock(id: UUID = UUID.randomUUID(), name: String = "Paracetamol") = PharmacyStock(
        id = id,
        name = name,
        expiry = "2030-01"
    )

    @Test
    @WithMockUser(roles = ["PHARMACY"])
    fun `list should return 200 with stock`() {
        whenever(repo.findAllByOrderByNameAsc())
            .thenReturn(listOf(stock(name = "Paracetamol")))

        mockMvc.perform(get("/api/tenant/pharmacy-stock"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Paracetamol"))
    }

    @Test
    @WithMockUser(roles = ["PHARMACY"])
    fun `create with valid request should return 201`() {
        whenever(repo.save(any())).thenAnswer { it.arguments[0] }

        val req = PharmacyStockRequest(name = "Paracetamol", expiry = "2030-01")

        mockMvc.perform(
            post("/api/tenant/pharmacy-stock")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("Paracetamol"))
    }

    @Test
    @WithMockUser(roles = ["PHARMACY"])
    fun `create with blank name should return 400`() {
        val req = PharmacyStockRequest(name = "", expiry = "2030-01")

        mockMvc.perform(
            post("/api/tenant/pharmacy-stock")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Medicine name is required"))
    }

    @Test
    @WithMockUser(roles = ["PHARMACY"])
    fun `update should return 200 when found`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(eq(id))).thenReturn(Optional.of(stock(id = id)))
        whenever(repo.save(any())).thenAnswer { it.arguments[0] }

        val req = PharmacyStockRequest(name = "Updated", expiry = "2031-01")

        mockMvc.perform(
            put("/api/tenant/pharmacy-stock/$id")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Updated"))
    }

    @Test
    @WithMockUser(roles = ["PHARMACY"])
    fun `update should return 404 when not found`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(eq(id))).thenReturn(Optional.empty())

        val req = PharmacyStockRequest(name = "Updated", expiry = "2031-01")

        mockMvc.perform(
            put("/api/tenant/pharmacy-stock/$id")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(req))
        )
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(roles = ["PHARMACY"])
    fun `delete should return 204 when found`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(eq(id))).thenReturn(Optional.of(stock(id = id)))

        mockMvc.perform(delete("/api/tenant/pharmacy-stock/$id").with(csrf()))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["PHARMACY"])
    fun `delete should return 404 when not found`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(eq(id))).thenReturn(Optional.empty())

        mockMvc.perform(delete("/api/tenant/pharmacy-stock/$id").with(csrf()))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(roles = ["PHARMACY"])
    fun `deduct should return 200 with result`() {
        whenever(repo.findAllByOrderByNameAsc()).thenReturn(emptyList())

        val items = listOf(DeductItem(name = "Paracetamol", qty = 2))

        mockMvc.perform(
            post("/api/tenant/pharmacy-stock/deduct")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(tools.jackson.databind.ObjectMapper().writeValueAsString(items))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.missing").isArray)
    }
}
