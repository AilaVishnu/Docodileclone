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
import java.math.BigDecimal
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
        `when`(billRepository.billStatsByPatientForDate(date)).thenReturn(emptyList())

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
        // Seed the three Bill-editor fields the schema-per-tenant rebase dropped
        // (pharmacy total, bill-level discount, patient advance) so the assertions
        // below guard against them being silently lost again.
        val patient = Patient(id = pid, name = "Asha").also { it.deposit = BigDecimal("200") }
        val appointment = Appointment(
            id = UUID.randomUUID(),
            patient = patient,
            doctor = AppUser(id = UUID.randomUUID(), name = "Dr. Smith"),
            scheduledTime = LocalDateTime.now(),
        ).also {
            it.pharmacyAmount = BigDecimal("120")
            it.discountAmount = BigDecimal("30")
        }
        `when`(appointmentRepository.findAllByScheduledTimeBetween(date.atStartOfDay(), date.atTime(23, 59, 59)))
            .thenReturn(listOf(appointment))
        // Two bills for this patient today, ₹40 still outstanding → the kebab
        // offers "View/Create Bills" and the Pay badge shows Due.
        `when`(billRepository.billStatsByPatientForDate(date)).thenReturn(listOf(arrayOf<Any>(pid, 2L, BigDecimal("40"))))

        val result = appointmentService.getAppointmentsForClinic(date)

        assertEquals(2, result[0].todayBillCount)
        assertEquals(BigDecimal("40"), result[0].todayDue)
        // The Bill editor seeds off these — they must survive the entity→DTO map.
        assertEquals(BigDecimal("120"), result[0].pharmacyAmount)
        assertEquals(BigDecimal("30"), result[0].discountAmount)
        assertEquals(BigDecimal("200"), result[0].patientDeposit)
    }
}
