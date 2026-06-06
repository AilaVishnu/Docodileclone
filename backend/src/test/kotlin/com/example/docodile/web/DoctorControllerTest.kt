package com.example.docodile.web

import com.example.docodile.service.DoctorService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.util.UUID

@WebMvcTest(DoctorController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class DoctorControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.RevokedTokenRepository

    @MockitoBean
    private lateinit var doctorService: DoctorService

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `list returns 200 with doctors for clinic`() {
        whenever(doctorService.listDoctorsForClinic()).thenReturn(
            listOf(
                DoctorDTO(
                    id = UUID.randomUUID(),
                    name = "Dr. Smith",
                    department = "Cardiology",
                    specialty = "Heart",
                    registrationNo = "REG1",
                    qualification = "MBBS",
                    medicalCouncil = "MCI",
                    experienceYears = 10,
                )
            )
        )

        mockMvc.perform(get("/api/doctors"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Dr. Smith"))
            .andExpect(jsonPath("$[0].specialty").value("Heart"))
    }

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `list returns 200 with empty array when no doctors`() {
        whenever(doctorService.listDoctorsForClinic()).thenReturn(emptyList())

        mockMvc.perform(get("/api/doctors"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(0))
    }
}
