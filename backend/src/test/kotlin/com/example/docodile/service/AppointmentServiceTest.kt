package com.example.docodile.service

import com.example.docodile.domain.Appointment
import com.example.docodile.domain.AppUser
import com.example.docodile.domain.Patient
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
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
    private lateinit var clinicEntityRepository: ClinicEntityRepository

    @Mock
    private lateinit var appUserRepository: AppUserRepository

    @Mock
    private lateinit var patientRepository: PatientRepository

    @Mock
    private lateinit var currentUser: CurrentUser

    @InjectMocks
    private lateinit var appointmentService: AppointmentService

    @Test
    fun `should return appointment DTOs for clinic and date`() {
        val clinicId = UUID.randomUUID()
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

        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(clinicId, startOfDay, endOfDay))
            .thenReturn(listOf(appointment))

        val result = appointmentService.getAppointmentsForClinic(date)

        assertEquals(1, result.size)
        assertEquals(appointment.id, result[0].id)
        assertEquals("John Doe", result[0].patientName)
        assertEquals(doctor.id, result[0].doctorId)
    }
}
