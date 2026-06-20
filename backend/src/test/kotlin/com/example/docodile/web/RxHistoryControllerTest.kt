package com.example.docodile.web

import com.example.docodile.domain.RxRow
import com.example.docodile.repo.RxRowRepository
import com.example.docodile.security.CurrentUser
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.anyOrNull
import org.mockito.kotlin.eq
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.util.UUID

@WebMvcTest(RxHistoryController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class RxHistoryControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.RevokedTokenRepository

    @MockitoBean
    private lateinit var rxRowRepository: RxRowRepository

    @MockitoBean
    private lateinit var currentUser: CurrentUser

    private val clinicId = UUID.randomUUID()

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `latest returns 200 with most recent prescription row`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        val row = RxRow(
            medicine = "Paracetamol",
            medicineNote = "after food",
            dosage = "500mg",
            whenToTake = "after meal",
            frequency = "1-0-1",
            frequencyInterval = "daily",
            duration = "5 days",
            notes = "n",
        )
        whenever(rxRowRepository.findLatestByClinicAndMedicine(eq(clinicId), eq("Paracetamol"), anyOrNull(), any()))
            .thenReturn(listOf(row))

        mockMvc.perform(get("/api/tenant/rx-history/latest").param("medicine", "Paracetamol"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.medicine").value("Paracetamol"))
            .andExpect(jsonPath("$.dosage").value("500mg"))
            .andExpect(jsonPath("$.frequency").value("1-0-1"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `latest returns 204 when no past prescription exists`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(rxRowRepository.findLatestByClinicAndMedicine(eq(clinicId), eq("Unknown"), anyOrNull(), any()))
            .thenReturn(emptyList())

        mockMvc.perform(get("/api/tenant/rx-history/latest").param("medicine", "Unknown"))
            .andExpect(status().isNoContent)
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `latest returns 204 when medicine is blank`() {
        mockMvc.perform(get("/api/tenant/rx-history/latest").param("medicine", "   "))
            .andExpect(status().isNoContent)
    }
}
