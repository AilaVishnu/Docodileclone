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
        // The patient has 2 bills today (₹60 due, ₹25 refunded across them) → the
        // kebab offers "View/Create Bills" and these per-patient totals feed the
        // Pay-badge fallback for appointments with no bill of their own.
        `when`(billRepository.billStatsByPatientForDate(date)).thenReturn(listOf(arrayOf<Any>(pid, 2L, BigDecimal("60"), BigDecimal("25"))))
        // THIS appointment's own linked bill still owes ₹40 and has ₹15 refunded
        // → the Pay badge is per-appointment, not the patient-wide totals.
        `when`(billRepository.billStatsByAppointment(listOf(aptId))).thenReturn(listOf(arrayOf<Any>(aptId, 1L, BigDecimal("40"), BigDecimal("15"))))

        val result = appointmentService.getAppointmentsForClinic(date)

        assertEquals(2, result[0].todayBillCount)          // per-patient (kebab)
        assertEquals(BigDecimal("60"), result[0].todayDue) // per-patient (badge fallback)
        assertEquals(BigDecimal("25"), result[0].todayRefund)
        assertEquals(1, result[0].apptBillCount)           // per-appointment (badge)
        assertEquals(BigDecimal("40"), result[0].apptDue)
        assertEquals(BigDecimal("15"), result[0].apptRefund)
        // The Bill editor seeds off these — they must survive the entity→DTO map.
        assertEquals(BigDecimal("120"), result[0].pharmacyAmount)
        assertEquals(BigDecimal("30"), result[0].discountAmount)
        assertEquals(BigDecimal("200"), result[0].patientDeposit)
    }

    @Test
    fun `updateAppointment rejects an appointment that's with the doctor (in progress)`() {
        val id = UUID.randomUUID()
        val appointment = Appointment(
            id = id,
            patient = Patient(id = UUID.randomUUID(), name = "Asha"),
            doctor = AppUser(id = UUID.randomUUID(), name = "Dr. Smith"),
            scheduledTime = LocalDateTime.now(),
        ).also { it.status = "IN_PROGRESS" }
        `when`(appointmentRepository.findById(id)).thenReturn(Optional.of(appointment))

        // Once sent to the doctor the booking is locked — a direct API edit is
        // rejected, mirroring the modal's read-only gate.
        val request = BookAppointmentRequest(patientName = "Asha", doctorId = UUID.randomUUID(), scheduledTime = LocalDateTime.now())
        assertThrows(IllegalArgumentException::class.java) { appointmentService.updateAppointment(id, request) }
    }

    @Test
    fun `bookAppointment paid with a service fee mints its invoice`() {
        val doctorId = UUID.randomUUID()
        `when`(appUserRepository.findById(doctorId)).thenReturn(Optional.of(AppUser(id = doctorId, name = "Dr. Smith")))
        `when`(patientRepository.findMaxDisplayNo()).thenReturn(0)
        `when`(patientRepository.save(any())).thenReturn(Patient(id = UUID.randomUUID(), name = "Asha"))
        `when`(appointmentRepository.save(any())).thenAnswer { it.arguments[0] }
        `when`(billRepository.countByAppointment(any())).thenReturn(0L)

        // Paid at booking → every paid service becomes a real, refundable invoice
        // (uses the picked service name, not a hard-coded "Consultation").
        val request = BookAppointmentRequest(
            patientName = "Asha", doctorId = doctorId, scheduledTime = LocalDateTime.now(),
            service = "X-Ray", fee = BigDecimal("500"), payStatus = "Paid", force = true,
        )
        appointmentService.bookAppointment(request)

        verify(billService).createBill(any(), any())
    }

    @Test
    fun `bookAppointment unpaid does not mint an invoice`() {
        val doctorId = UUID.randomUUID()
        `when`(appUserRepository.findById(doctorId)).thenReturn(Optional.of(AppUser(id = doctorId, name = "Dr. Smith")))
        `when`(patientRepository.findMaxDisplayNo()).thenReturn(0)
        `when`(patientRepository.save(any())).thenReturn(Patient(id = UUID.randomUUID(), name = "Asha"))
        `when`(appointmentRepository.save(any())).thenAnswer { it.arguments[0] }

        val request = BookAppointmentRequest(
            patientName = "Asha", doctorId = doctorId, scheduledTime = LocalDateTime.now(),
            service = "X-Ray", fee = BigDecimal("500"), payStatus = "Unpaid", force = true,
        )
        appointmentService.bookAppointment(request)

        verify(billService, never()).createBill(any(), any())
    }

    @Test
    fun `bookAppointment waived mints a WAIVED invoice with nothing collected`() {
        val doctorId = UUID.randomUUID()
        `when`(appUserRepository.findById(doctorId)).thenReturn(Optional.of(AppUser(id = doctorId, name = "Dr. Smith")))
        `when`(patientRepository.findMaxDisplayNo()).thenReturn(0)
        `when`(patientRepository.save(any())).thenReturn(Patient(id = UUID.randomUUID(), name = "Asha"))
        `when`(appointmentRepository.save(any())).thenAnswer { it.arguments[0] }
        `when`(billRepository.countByAppointment(any())).thenReturn(0L)
        val captor = argumentCaptor<CreateBillRequest>()
        `when`(billService.createBill(any(), captor.capture())).thenReturn(mock(BillDTO::class.java))

        // A waive still bills the service amount but collects nothing → a WAIVED
        // invoice (full write-off), not a Paid one.
        val request = BookAppointmentRequest(
            patientName = "Asha", doctorId = doctorId, scheduledTime = LocalDateTime.now(),
            service = "Consultation", fee = BigDecimal("500"), payStatus = "WAIVED", paymentMethod = "Waive", force = true,
        )
        appointmentService.bookAppointment(request)

        assertEquals("WAIVED", captor.firstValue.payStatus)
        assertEquals(0, BigDecimal("500").compareTo(captor.firstValue.billed)) // service amount billed
        assertEquals(0, BigDecimal.ZERO.compareTo(captor.firstValue.paid))     // nothing collected
    }
}
