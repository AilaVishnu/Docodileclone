package com.example.docodile.service

import com.example.docodile.domain.Appointment
import com.example.docodile.domain.AppUser
import com.example.docodile.domain.Patient
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.BillRepository
import com.example.docodile.web.BillDTO
import com.example.docodile.web.ChargeLine
import com.example.docodile.web.ChargeRequest
import com.example.docodile.web.DeductResult
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class ChargeServiceTest {

    @Mock private lateinit var appointmentRepository: AppointmentRepository
    @Mock private lateinit var patientDepositService: PatientDepositService
    @Mock private lateinit var billService: BillService
    @Mock private lateinit var pharmacyStockService: PharmacyStockService
    @Mock private lateinit var billRepository: BillRepository

    @InjectMocks private lateinit var chargeService: ChargeService

    private fun appointment(apptId: UUID) = Appointment(
        id = apptId,
        patient = Patient(id = UUID.randomUUID(), name = "Asha"),
        doctor = AppUser(id = UUID.randomUUID(), name = "Dr. Smith"),
        scheduledTime = LocalDateTime.now(),
    ).also { it.fee = BigDecimal("500") }

    @Test
    fun `charge drops the already-billed service line and bills only the medicines`() {
        val apptId = UUID.randomUUID()
        val appt = appointment(apptId)
        `when`(appointmentRepository.findById(apptId)).thenReturn(Optional.of(appt))
        `when`(appointmentRepository.save(any())).thenAnswer { it.arguments[0] }
        `when`(billRepository.countByAppointment(apptId)).thenReturn(1L) // service already invoiced at booking
        `when`(patientDepositService.applyToBill(any(), any())).thenReturn(BigDecimal.ZERO)
        `when`(pharmacyStockService.deduct(any())).thenReturn(DeductResult(emptyList(), emptyList()))
        val captor = argumentCaptor<com.example.docodile.web.CreateBillRequest>()
        `when`(billService.createBill(any(), captor.capture())).thenReturn(mock(BillDTO::class.java))

        chargeService.charge(
            apptId,
            ChargeRequest(
                method = "Cash",
                items = listOf(
                    ChargeLine(name = "Consultation", qty = 1, unit = BigDecimal("500"), kind = "service"),
                    ChargeLine(name = "Paracetamol", qty = 2, unit = BigDecimal("10"), kind = "medicine", inStock = true),
                ),
            ),
        )

        // The already-billed service line is dropped → only ₹20 of medicines is
        // billed on this charge; the booking service fee stays on the appointment.
        assertEquals(0, BigDecimal("20").compareTo(captor.firstValue.billed))
        assertEquals(0, BigDecimal("500").compareTo(appt.fee))
    }

    @Test
    fun `charge on an already-billed appointment with no medicines is rejected`() {
        val apptId = UUID.randomUUID()
        `when`(appointmentRepository.findById(apptId)).thenReturn(Optional.of(appointment(apptId)))
        `when`(billRepository.countByAppointment(apptId)).thenReturn(1L)

        // Only the (already-billed) service line → nothing new to bill → rejected
        // rather than writing a ₹0 duplicate invoice.
        assertThrows(IllegalArgumentException::class.java) {
            chargeService.charge(
                apptId,
                ChargeRequest(method = "Cash", items = listOf(ChargeLine(name = "Consultation", qty = 1, unit = BigDecimal("500"), kind = "service"))),
            )
        }
    }
}
