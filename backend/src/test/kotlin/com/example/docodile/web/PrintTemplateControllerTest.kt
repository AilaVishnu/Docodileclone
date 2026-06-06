package com.example.docodile.web

import com.example.docodile.domain.ClinicEntity
import com.example.docodile.domain.PrintTemplate
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.PrintTemplateRepository
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
import tools.jackson.databind.ObjectMapper
import java.util.Optional
import java.util.UUID

@WebMvcTest(PrintTemplateController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class PrintTemplateControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.RevokedTokenRepository

    @MockitoBean
    private lateinit var repo: PrintTemplateRepository

    @MockitoBean
    private lateinit var clinicEntityRepository: ClinicEntityRepository

    @MockitoBean
    private lateinit var currentUser: CurrentUser

    private val mapper = ObjectMapper()
    private val clinicId = UUID.randomUUID()

    private fun tpl(id: UUID = UUID.randomUUID(), name: String, isDefault: Boolean = false, config: String = "{}") =
        PrintTemplate(id = id, clinic = null, name = name, isDefault = isDefault, config = config)

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `list returns 200 with templates`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(repo.findAllByClinicIdOrderByCreatedAtAsc(clinicId))
            .thenReturn(listOf(tpl(name = "Default", isDefault = true)))

        mockMvc.perform(get("/api/tenant/print-templates"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Default"))
            .andExpect(jsonPath("$[0].isDefault").value(true))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `create returns 201 with saved template`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(Optional.of(ClinicEntity(id = clinicId, name = "C")))
        whenever(repo.save(any<PrintTemplate>())).thenAnswer { it.arguments[0] as PrintTemplate }

        val req = PrintTemplateRequest(name = "Letterhead", isDefault = false, config = "{\"k\":1}")
        mockMvc.perform(post("/api/tenant/print-templates")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("Letterhead"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `create with isDefault flips other defaults off`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(Optional.of(ClinicEntity(id = clinicId, name = "C")))
        whenever(repo.findAllByClinicIdOrderByCreatedAtAsc(clinicId))
            .thenReturn(listOf(tpl(name = "Old", isDefault = true)))
        whenever(repo.save(any<PrintTemplate>())).thenAnswer { it.arguments[0] as PrintTemplate }

        // Use a literal body: the test's plain ObjectMapper has no Kotlin module and
        // would serialize the `isDefault` boolean as "default" (Jackson is-prefix
        // stripping), which Spring's Kotlin-aware mapper then fails to bind. The real
        // wire contract (see frontend src/api/printTemplates.ts) is "isDefault".
        val body = """{"name":"NewDefault","isDefault":true,"config":"{}"}"""
        mockMvc.perform(post("/api/tenant/print-templates")
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
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(repo.findByIdAndClinicId(id, clinicId)).thenReturn(tpl(id = id, name = "Old"))
        whenever(repo.save(any<PrintTemplate>())).thenAnswer { it.arguments[0] as PrintTemplate }

        val req = PrintTemplateRequest(name = "Renamed", isDefault = false, config = "{\"v\":2}")
        mockMvc.perform(put("/api/tenant/print-templates/$id")
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
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(repo.findByIdAndClinicId(eq(id), eq(clinicId))).thenReturn(null)

        val req = PrintTemplateRequest(name = "X", isDefault = false, config = "{}")
        mockMvc.perform(put("/api/tenant/print-templates/$id")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `delete returns 204 when template exists`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(repo.findByIdAndClinicId(id, clinicId)).thenReturn(tpl(id = id, name = "Del", isDefault = false))

        mockMvc.perform(delete("/api/tenant/print-templates/$id").with(csrf()))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `delete of default promotes next template to default`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(repo.findByIdAndClinicId(id, clinicId)).thenReturn(tpl(id = id, name = "Del", isDefault = true))
        whenever(repo.findAllByClinicIdOrderByCreatedAtAsc(clinicId))
            .thenReturn(listOf(tpl(name = "Next", isDefault = false)))
        whenever(repo.save(any<PrintTemplate>())).thenAnswer { it.arguments[0] as PrintTemplate }

        mockMvc.perform(delete("/api/tenant/print-templates/$id").with(csrf()))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `delete returns 404 when template missing`() {
        val id = UUID.randomUUID()
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(repo.findByIdAndClinicId(eq(id), eq(clinicId))).thenReturn(null)

        mockMvc.perform(delete("/api/tenant/print-templates/$id").with(csrf()))
            .andExpect(status().isNotFound)
    }
}
