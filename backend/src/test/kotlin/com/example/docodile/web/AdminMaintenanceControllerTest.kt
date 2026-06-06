package com.example.docodile.web

import com.example.docodile.service.AuditService
import com.example.docodile.service.FileEncryptionBackfillService
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(AdminMaintenanceController::class)
@org.springframework.context.annotation.Import(
    com.example.docodile.security.JwtAuthenticationFilter::class,
    MethodSecurityTestConfig::class,
)
class AdminMaintenanceControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.RevokedTokenRepository

    @MockitoBean
    private lateinit var backfillService: FileEncryptionBackfillService

    @MockitoBean
    private lateinit var auditService: AuditService

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `backfill as admin returns 200 with result`() {
        `when`(backfillService.run())
            .thenReturn(FileEncryptionBackfillService.BackfillResult(total = 3, encrypted = 2, skipped = 1, enabled = true))

        mockMvc.perform(post("/api/admin/encryption/backfill").with(csrf()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.total").value(3))
            .andExpect(jsonPath("$.encrypted").value(2))
            .andExpect(jsonPath("$.enabled").value(true))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `backfill as non-admin is denied by method security`() {
        // @PreAuthorize("hasRole('ADMIN')") denies a DOCTOR. In a @WebMvcTest slice
        // the AuthorizationDeniedException surfaces wrapped in a ServletException
        // (the full SecurityConfig chain that maps it to HTTP 403 isn't loaded here).
        // Assert the denial fires and the action never runs.
        val ex = org.junit.jupiter.api.Assertions.assertThrows(Exception::class.java) {
            mockMvc.perform(post("/api/admin/encryption/backfill").with(csrf()))
        }
        org.junit.jupiter.api.Assertions.assertTrue(
            generateSequence(ex as Throwable?) { it.cause }
                .any { it is org.springframework.security.authorization.AuthorizationDeniedException },
            "expected an AuthorizationDeniedException in the cause chain",
        )
        org.mockito.Mockito.verify(backfillService, org.mockito.Mockito.never()).run()
    }
}
