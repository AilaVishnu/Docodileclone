package com.example.docodile.web

import com.example.docodile.domain.PatientFile
import com.example.docodile.repo.PatientFileRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.service.EncryptionService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.mock.web.MockMultipartFile
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.util.Optional
import java.util.UUID

@WebMvcTest(PatientFileController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class PatientFileControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var userSessionRepository: com.example.docodile.repo.UserSessionRepository

    @MockitoBean
    private lateinit var repo: PatientFileRepository

    @MockitoBean
    private lateinit var currentUser: CurrentUser

    @MockitoBean
    private lateinit var encryptionService: EncryptionService

    private val schema = "clinic_test"

    private fun file(id: UUID, patientId: UUID, bytes: ByteArray = byteArrayOf(1, 2, 3)) = PatientFile(
        id = id,
        patientId = patientId,
        name = "report.pdf",
        mimeType = "application/pdf",
        fileData = bytes,
        fileSize = bytes.size.toLong()
    )

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `list should return 200 with files`() {
        val patientId = UUID.randomUUID()
        whenever(currentUser.schema()).thenReturn(schema)
        whenever(repo.findAllByPatientIdOrderByCreatedAtDesc(eq(patientId)))
            .thenReturn(listOf(file(UUID.randomUUID(), patientId)))

        mockMvc.perform(get("/api/patients/$patientId/files"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("report.pdf"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `upload should return 201`() {
        val patientId = UUID.randomUUID()
        val bytes = byteArrayOf(10, 20, 30)
        whenever(currentUser.schema()).thenReturn(schema)
        whenever(currentUser.userId()).thenReturn(UUID.randomUUID())
        whenever(encryptionService.encrypt(any(), any(), any())).thenReturn(bytes)
        whenever(repo.save(any())).thenAnswer { it.arguments[0] }

        val uploadFile = MockMultipartFile(
            "file", "report.pdf", "application/pdf", bytes
        )

        mockMvc.perform(
            multipart("/api/patients/$patientId/files")
                .file(uploadFile)
                .param("category", "Lab")
                .with(csrf())
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("report.pdf"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `download should return 200 with bytes when found`() {
        val patientId = UUID.randomUUID()
        val fileId = UUID.randomUUID()
        val bytes = byteArrayOf(7, 8, 9)
        whenever(currentUser.schema()).thenReturn(schema)
        val pf = file(fileId, patientId)
        whenever(repo.findById(eq(fileId))).thenReturn(Optional.of(pf))
        whenever(encryptionService.decrypt(any(), eq(pf.id), any())).thenReturn(bytes)

        mockMvc.perform(get("/api/patients/$patientId/files/$fileId/download"))
            .andExpect(status().isOk)
            .andExpect(content().bytes(bytes))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `download should return 404 when not found`() {
        val patientId = UUID.randomUUID()
        val fileId = UUID.randomUUID()
        whenever(currentUser.schema()).thenReturn(schema)
        whenever(repo.findById(eq(fileId))).thenReturn(Optional.empty())

        mockMvc.perform(get("/api/patients/$patientId/files/$fileId/download"))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `delete should return 204 when deleted`() {
        val patientId = UUID.randomUUID()
        val fileId = UUID.randomUUID()
        whenever(currentUser.schema()).thenReturn(schema)
        whenever(repo.existsById(eq(fileId))).thenReturn(true)

        mockMvc.perform(delete("/api/patients/$patientId/files/$fileId").with(csrf()))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `delete should return 404 when nothing deleted`() {
        val patientId = UUID.randomUUID()
        val fileId = UUID.randomUUID()
        whenever(currentUser.schema()).thenReturn(schema)
        whenever(repo.existsById(eq(fileId))).thenReturn(false)

        mockMvc.perform(delete("/api/patients/$patientId/files/$fileId").with(csrf()))
            .andExpect(status().isNotFound)
    }
}
