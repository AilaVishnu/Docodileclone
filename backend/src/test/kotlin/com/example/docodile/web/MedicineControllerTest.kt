package com.example.docodile.web

import com.example.docodile.repo.RxRowRepository
import com.example.docodile.service.DrugInteractionWarning
import com.example.docodile.service.EkaCareClient
import com.example.docodile.service.EkaDrugResult
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(MedicineController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class MedicineControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var userSessionRepository: com.example.docodile.repo.UserSessionRepository

    @MockitoBean
    private lateinit var eka: EkaCareClient

    @MockitoBean
    private lateinit var rxRowRepo: RxRowRepository

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `search returns 200 with drug results`() {
        whenever(eka.searchDrugs(eq("para"), any()))
            .thenReturn(listOf(EkaDrugResult(name = "Paracetamol", id = "1", genericName = "Acetaminophen")))

        mockMvc.perform(get("/api/medicines/search").param("q", "para"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Paracetamol"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `search returns 200 with empty array for blank query`() {
        mockMvc.perform(get("/api/medicines/search").param("q", ""))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `frequent returns 200 with results`() {
        whenever(rxRowRepo.findFrequentMedicines(any())).thenReturn(listOf("Paracetamol"))
        whenever(eka.searchDrugs(eq("Paracetamol"), any()))
            .thenReturn(listOf(EkaDrugResult(name = "Paracetamol", id = "1", genericName = "Acetaminophen")))

        mockMvc.perform(get("/api/medicines/frequent"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Paracetamol"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `frequent returns 200 empty when no frequent medicines`() {
        whenever(rxRowRepo.findFrequentMedicines(any())).thenReturn(emptyList())

        mockMvc.perform(get("/api/medicines/frequent"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `interactions returns 200 with warnings for two or more drugs`() {
        whenever(eka.checkInteractionsByName(any()))
            .thenReturn(listOf(DrugInteractionWarning(drug = "A", interactsWith = "B", comment = "avoid")))

        mockMvc.perform(get("/api/medicines/interactions").param("medicines", "A,B"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].drug").value("A"))
            .andExpect(jsonPath("$[0].interactsWith").value("B"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `interactions returns 200 empty for fewer than two drugs`() {
        mockMvc.perform(get("/api/medicines/interactions").param("medicines", "A"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }
}
