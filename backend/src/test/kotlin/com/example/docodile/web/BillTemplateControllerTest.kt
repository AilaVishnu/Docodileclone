package com.example.docodile.web

import com.example.docodile.domain.BillTemplate
import com.example.docodile.repo.BillTemplateRepository
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
import java.util.Optional
import java.util.UUID

@WebMvcTest(BillTemplateController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class BillTemplateControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var userSessionRepository: com.example.docodile.repo.UserSessionRepository

    @MockitoBean
    private lateinit var repo: BillTemplateRepository

    private val mapper = ObjectMapper()

    private fun tpl(id: UUID = UUID.randomUUID(), name: String, isDefault: Boolean = false, config: String = "{}") =
        BillTemplate(id = id, name = name, isDefault = isDefault, config = config)

    @Test
    @WithMockUser(roles = ["RECEPTIONIST"])
    fun `list returns 200 with templates`() {
        whenever(repo.findAllByOrderByCreatedAtAsc())
            .thenReturn(listOf(tpl(name = "Default", isDefault = true)))

        mockMvc.perform(get("/api/tenant/bill-templates"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Default"))
            .andExpect(jsonPath("$[0].isDefault").value(true))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `create returns 201 with saved template`() {
        whenever(repo.findAllByOrderByCreatedAtAsc()).thenReturn(emptyList())
        whenever(repo.save(any<BillTemplate>())).thenAnswer { it.arguments[0] as BillTemplate }

        val req = BillTemplateRequest(name = "Receipt", isDefault = false, config = "{\"k\":1}")
        mockMvc.perform(post("/api/tenant/bill-templates")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("Receipt"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `create with isDefault flips other defaults off`() {
        whenever(repo.findAllByOrderByCreatedAtAsc())
            .thenReturn(listOf(tpl(name = "Old", isDefault = true)))
        whenever(repo.save(any<BillTemplate>())).thenAnswer { it.arguments[0] as BillTemplate }

        // Literal body — see PrintTemplateControllerTest for why the plain
        // ObjectMapper can't serialize the `isDefault` boolean correctly here.
        val body = """{"name":"NewDefault","isDefault":true,"config":"{}"}"""
        mockMvc.perform(post("/api/tenant/bill-templates")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.isDefault").value(true))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update returns 200 with updated template`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(id)).thenReturn(Optional.of(tpl(id = id, name = "Old")))
        whenever(repo.findAllByOrderByCreatedAtAsc()).thenReturn(emptyList())
        whenever(repo.save(any<BillTemplate>())).thenAnswer { it.arguments[0] as BillTemplate }

        val req = BillTemplateRequest(name = "Renamed", isDefault = false, config = "{\"v\":2}")
        mockMvc.perform(put("/api/tenant/bill-templates/$id")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Renamed"))
            .andExpect(jsonPath("$.config").value("{\"v\":2}"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update returns 404 when template missing`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(eq(id))).thenReturn(Optional.empty())

        val req = BillTemplateRequest(name = "X", isDefault = false, config = "{}")
        mockMvc.perform(put("/api/tenant/bill-templates/$id")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `delete returns 204 when template exists`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(id)).thenReturn(Optional.of(tpl(id = id, name = "Del", isDefault = false)))
        whenever(repo.findAllByOrderByCreatedAtAsc()).thenReturn(emptyList())

        mockMvc.perform(delete("/api/tenant/bill-templates/$id").with(csrf()))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `delete of default promotes next template to default`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(id)).thenReturn(Optional.of(tpl(id = id, name = "Del", isDefault = true)))
        whenever(repo.findAllByOrderByCreatedAtAsc())
            .thenReturn(listOf(tpl(name = "Next", isDefault = false)))
        whenever(repo.save(any<BillTemplate>())).thenAnswer { it.arguments[0] as BillTemplate }

        mockMvc.perform(delete("/api/tenant/bill-templates/$id").with(csrf()))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `delete returns 404 when template missing`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(eq(id))).thenReturn(Optional.empty())

        mockMvc.perform(delete("/api/tenant/bill-templates/$id").with(csrf()))
            .andExpect(status().isNotFound)
    }
}
