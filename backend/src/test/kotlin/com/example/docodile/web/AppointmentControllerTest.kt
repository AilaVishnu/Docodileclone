package com.example.docodile.web

import com.example.docodile.service.AppointmentService
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDate
import java.util.*

@WebMvcTest(AppointmentController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class AppointmentControllerTest @Autowired constructor(
    private val mockMvc: MockMvc
) {

    

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.UserSessionRepository

    @MockitoBean
    private lateinit var appointmentService: AppointmentService

    @Test
    @WithMockUser(roles = ["RECEPTIONIST"])
    fun `should return appointment list for valid user`() {
        val date = LocalDate.now()
        val appointments = listOf(
            AppointmentDTO(
                id = UUID.randomUUID(),
                patientName = "Jane Doe",
                doctorId = UUID.randomUUID(),
                scheduledTime = null,
                isWalkin = true,
                status = "BOOKED",
                type = "New",
                payStatus = "Unpaid",
                paymentMethod = "Cash",
                notes = "Sample note",
                patientId = UUID.randomUUID(),
                patientPhone = "1234567890",
                patientEmail = null,
                patientGender = null,
                patientDob = null,
                patientAge = null,
                service = "Consultation",
                fee = null
            )
        )

        `when`(appointmentService.getAppointmentsForClinic(date)).thenReturn(appointments)

        mockMvc.perform(get("/api/appointments").param("date", date.toString()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].patientName").value("Jane Doe"))
    }

    // Note: @PreAuthorize role checks and unauthenticated access tests
    // require full SecurityConfig which is not loaded in @WebMvcTest slice.
    // These are covered by integration tests instead.
}
