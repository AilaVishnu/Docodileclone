package com.example.docodile.service

import com.example.docodile.domain.Appointment
import com.example.docodile.domain.AppUser
import com.example.docodile.domain.Patient
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.BillRepository
import com.example.docodile.repo.PatientRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

@ExtendWith(MockitoExtension::class)
class AppointmentServiceTest {

    @Mock
    private lateinit var appointmentRepository: AppointmentRepository

    @Mock
    private lateinit var appUserRepository: AppUserRepository

    @Mock
    private lateinit var patientRepository: PatientRepository

    @Mock
    private lateinit var patientDepositService: com.example.docodile.service.PatientDepositService

    @Mock
    private lateinit var billRepository: BillRepository

    @InjectMocks
    private lateinit var appointmentService: AppointmentService

    @Test
    fun `should return appointment DTOs for date`() {
        val date = LocalDate.of(2023, 10, 10)
        val startOfDay = date.atStartOfDay()
        val endOfDay = date.atTime(23, 59, 59)

        val patient = Patient(id = UUID.randomUUID(), name = "John Doe")
        val doctor = AppUser(id = UUID.randomUUID(), name = "Dr. Smith")
        val appointment = Appointment(
            id = UUID.randomUUID(),
            patient = patient,
            doctor = doctor,
            scheduledTime = LocalDateTime.now()
        )

        `when`(appointmentRepository.findAllByScheduledTimeBetween(startOfDay, endOfDay))
            .thenReturn(listOf(appointment))
        `when`(billRepository.countByPatientForDate(date)).thenReturn(emptyList())

        val result = appointmentService.getAppointmentsForClinic(date)

        assertEquals(1, result.size)
        assertEquals(appointment.id, result[0].id)
        assertEquals("John Doe", result[0].patientName)
        assertEquals(doctor.id, result[0].doctorId)
    }

    @Test
    fun `getAppointmentsForClinic populates todayBillCount from the day's bills`() {
        val date = LocalDate.of(2023, 10, 10)
        val pid = UUID.randomUUID()
        val appointment = Appointment(
            id = UUID.randomUUID(),
            patient = Patient(id = pid, name = "Asha"),
            doctor = AppUser(id = UUID.randomUUID(), name = "Dr. Smith"),
            scheduledTime = LocalDateTime.now(),
        )
        `when`(appointmentRepository.findAllByScheduledTimeBetween(date.atStartOfDay(), date.atTime(23, 59, 59)))
            .thenReturn(listOf(appointment))
        // Two bills for this patient today → the kebab should offer "View/Create Bills".
        `when`(billRepository.countByPatientForDate(date)).thenReturn(listOf(arrayOf<Any>(pid, 2L)))

        val result = appointmentService.getAppointmentsForClinic(date)

        assertEquals(2, result[0].todayBillCount)
    }
}
