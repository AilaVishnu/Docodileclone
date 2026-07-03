package com.example.docodile.web

import com.example.docodile.domain.DirectoryEntry
import com.example.docodile.repo.DirectoryEntryRepository
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

@WebMvcTest(DirectoryEntryController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class DirectoryEntryControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var userSessionRepository: com.example.docodile.repo.UserSessionRepository

    @MockitoBean
    private lateinit var repo: DirectoryEntryRepository

    private val mapper = ObjectMapper()

    private fun entry(id: UUID = UUID.randomUUID(), category: String = "Referral doctors", name: String, config: String = "{}") =
        DirectoryEntry(id = id, category = category, name = name, config = config)

    @Test
    @WithMockUser(roles = ["RECEPTIONIST"])
    fun `list by category returns 200`() {
        whenever(repo.findAllByCategoryOrderByCreatedAtAsc("Referral doctors"))
            .thenReturn(listOf(entry(name = "Dr. Anjali Menon")))

        mockMvc.perform(get("/api/tenant/directory").param("category", "Referral doctors"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Dr. Anjali Menon"))
            .andExpect(jsonPath("$[0].category").value("Referral doctors"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `create returns 201 with saved entry`() {
        whenever(repo.save(any<DirectoryEntry>())).thenAnswer { it.arguments[0] as DirectoryEntry }

        val body = """{"category":"Suppliers","name":"MedPlus","config":"{}"}"""
        mockMvc.perform(post("/api/tenant/directory")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("MedPlus"))
            .andExpect(jsonPath("$.category").value("Suppliers"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `create with blank name returns 400`() {
        val body = """{"category":"Labs","name":"   ","config":"{}"}"""
        mockMvc.perform(post("/api/tenant/directory")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Name is required"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update returns 200 with updated entry`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(id)).thenReturn(Optional.of(entry(id = id, name = "Old")))
        whenever(repo.save(any<DirectoryEntry>())).thenAnswer { it.arguments[0] as DirectoryEntry }

        val body = """{"category":"Referral doctors","name":"Renamed","config":"{\"phone\":\"1\"}"}"""
        mockMvc.perform(put("/api/tenant/directory/$id")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Renamed"))
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `update returns 404 when missing`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(eq(id))).thenReturn(Optional.empty())

        val body = """{"category":"Labs","name":"X","config":"{}"}"""
        mockMvc.perform(put("/api/tenant/directory/$id")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `delete returns 204 when entry exists`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(id)).thenReturn(Optional.of(entry(id = id, name = "Del")))

        mockMvc.perform(delete("/api/tenant/directory/$id").with(csrf()))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `delete returns 404 when missing`() {
        val id = UUID.randomUUID()
        whenever(repo.findById(eq(id))).thenReturn(Optional.empty())

        mockMvc.perform(delete("/api/tenant/directory/$id").with(csrf()))
            .andExpect(status().isNotFound)
    }
}
