package com.example.docodile.web

import com.example.docodile.domain.RxTemplate
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.RxTemplateRepository
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
import java.util.UUID

@WebMvcTest(RxTemplateController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class RxTemplateControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.RevokedTokenRepository

    @MockitoBean
    private lateinit var repo: RxTemplateRepository

    @MockitoBean
    private lateinit var clinicEntityRepository: ClinicEntityRepository

    @MockitoBean
    private lateinit var currentUser: CurrentUser

    private val mapper = ObjectMapper()
    private val clinicId = UUID.randomUUID()

    private fun template(name: String, kind: String, content: String = "{}") =
        RxTemplate(clinic = null, kind = kind, name = name, content = content)

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `list returns 200 with templates for kind`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(repo.findAllByClinicIdAndKindOrderByNameAsc(clinicId, "rx"))
            .thenReturn(listOf(template("Common Cold", "rx", "{\"a\":1}")))

        mockMvc.perform(get("/api/tenant/rx-templates").param("kind", "rx"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Common Cold"))
            .andExpect(jsonPath("$[0].kind").value("rx"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `list returns 400 when kind is blank`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)

        mockMvc.perform(get("/api/tenant/rx-templates").param("kind", "   "))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("kind is required"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `save returns 201 for new template`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(repo.findByClinicIdAndKindAndName(clinicId, "rx", "New")).thenReturn(null)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(java.util.Optional.of(com.example.docodile.domain.ClinicEntity(id = clinicId, name = "C")))
        whenever(repo.save(any<RxTemplate>())).thenAnswer { it.arguments[0] as RxTemplate }

        val req = RxTemplateRequest(name = "New", content = "{\"x\":1}", kind = "rx")
        mockMvc.perform(post("/api/tenant/rx-templates")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("New"))
            .andExpect(jsonPath("$.kind").value("rx"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `save overwrites existing template by name and kind`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        val existing = template("New", "rx", "old")
        whenever(repo.findByClinicIdAndKindAndName(clinicId, "rx", "New")).thenReturn(existing)
        whenever(repo.save(any<RxTemplate>())).thenAnswer { it.arguments[0] as RxTemplate }

        val req = RxTemplateRequest(name = "New", content = "fresh", kind = "rx")
        mockMvc.perform(post("/api/tenant/rx-templates")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.content").value("fresh"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `save returns 400 when name is blank`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)

        val req = RxTemplateRequest(name = "  ", content = "{}", kind = "rx")
        mockMvc.perform(post("/api/tenant/rx-templates")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Template name is required"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `save returns 400 when content is blank`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)

        val req = RxTemplateRequest(name = "Ok", content = "  ", kind = "rx")
        mockMvc.perform(post("/api/tenant/rx-templates")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Template is empty"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `delete returns 204 when template exists`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(repo.findByClinicIdAndKindAndName(clinicId, "rx", "Gone"))
            .thenReturn(template("Gone", "rx"))

        mockMvc.perform(delete("/api/tenant/rx-templates")
            .with(csrf())
            .param("name", "Gone")
            .param("kind", "rx"))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `delete returns 404 when template missing`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(repo.findByClinicIdAndKindAndName(eq(clinicId), any(), any())).thenReturn(null)

        mockMvc.perform(delete("/api/tenant/rx-templates")
            .with(csrf())
            .param("name", "Missing")
            .param("kind", "rx"))
            .andExpect(status().isNotFound)
    }
}
