package com.example.docodile.service

import com.example.docodile.domain.Bill
import com.example.docodile.domain.Patient
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.BillRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.web.CreateBillRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentMatchers.any
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.math.BigDecimal
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class BillServiceTest {

    @Mock private lateinit var billRepository: BillRepository
    @Mock private lateinit var patientRepository: PatientRepository
    @Mock private lateinit var appointmentRepository: AppointmentRepository
    @Mock private lateinit var patientDepositService: PatientDepositService

    @InjectMocks private lateinit var billService: BillService

    private val sentinelLo = LocalDate.of(1900, 1, 1)
    private val sentinelHi = LocalDate.of(2999, 12, 31)

    private fun bill(
        id: UUID = UUID.randomUUID(),
        patient: Patient? = Patient(id = UUID.randomUUID(), name = "Asha"),
        invoiceNo: String = "INV_0001",
        seq: Int = 1,
        billDate: LocalDate = LocalDate.now(),
        billed: BigDecimal = BigDecimal("100"),
        paid: BigDecimal = BigDecimal("100"),
        due: BigDecimal = BigDecimal.ZERO,
        refund: BigDecimal = BigDecimal.ZERO,
        depositApplied: BigDecimal? = null,
        payStatus: String? = "PAID",
    ) = Bill(
        id = id, patient = patient, invoiceNo = invoiceNo, seq = seq, billDate = billDate,
        billed = billed, paid = paid, due = due, refund = refund,
        depositApplied = depositApplied, payStatus = payStatus,
    )

    // ---- refundBill --------------------------------------------------------

    @Test
    fun `refundBill records the full received amount and flips status to REFUNDED`() {
        val b = bill(paid = BigDecimal("250"))
        `when`(billRepository.findById(b.id)).thenReturn(Optional.of(b))
        `when`(billRepository.save(any(Bill::class.java))).thenAnswer { it.arguments[0] }

        val dto = billService.refundBill(b.id)

        assertEquals(BigDecimal("250"), dto.refund)
        assertEquals("REFUNDED", dto.payStatus)
        // Nothing was drawn from standing credit, so credit is left untouched.
        verifyNoInteractions(patientDepositService)
    }

    @Test
    fun `refundBill returns the deposit-funded portion to the patient's standing credit`() {
        val pid = UUID.randomUUID()
        val b = bill(
            patient = Patient(id = pid, name = "Asha"),
            paid = BigDecimal("400"),
            depositApplied = BigDecimal("150"),
        )
        `when`(billRepository.findById(b.id)).thenReturn(Optional.of(b))
        `when`(billRepository.save(any(Bill::class.java))).thenAnswer { it.arguments[0] }

        billService.refundBill(b.id)

        // The advance that auto-covered the bill goes back to credit — not cash.
        // (Raw values, not eq() matchers: Mockito equals-matches them, and eq()
        // returns null which Kotlin rejects for recordMovement's non-null params.)
        verify(patientDepositService).recordMovement(
            pid, "DEPOSIT", BigDecimal("150"), "Refund", "Refund of INV_0001",
        )
    }

    @Test
    fun `refundBill rejects a missing bill`() {
        val id = UUID.randomUUID()
        `when`(billRepository.findById(id)).thenReturn(Optional.empty())

        assertThrows(IllegalArgumentException::class.java) { billService.refundBill(id) }
        verify(billRepository, never()).save(any(Bill::class.java))
    }

    @Test
    fun `refundBill rejects a bill with nothing collected`() {
        val b = bill(paid = BigDecimal.ZERO, payStatus = "DUE")
        `when`(billRepository.findById(b.id)).thenReturn(Optional.of(b))

        assertThrows(IllegalArgumentException::class.java) { billService.refundBill(b.id) }
        verify(billRepository, never()).save(any(Bill::class.java))
    }

    @Test
    fun `refundBill rejects an already-refunded bill`() {
        val b = bill(refund = BigDecimal("100"), payStatus = "REFUNDED")
        `when`(billRepository.findById(b.id)).thenReturn(Optional.of(b))

        assertThrows(IllegalArgumentException::class.java) { billService.refundBill(b.id) }
        verify(billRepository, never()).save(any(Bill::class.java))
    }

    @Test
    fun `refundBill rejects a waived bill — no money ever changed hands`() {
        val b = bill(payStatus = "WAIVED")
        `when`(billRepository.findById(b.id)).thenReturn(Optional.of(b))

        assertThrows(IllegalArgumentException::class.java) { billService.refundBill(b.id) }
        verify(billRepository, never()).save(any(Bill::class.java))
    }

    // ---- payBill -----------------------------------------------------------

    @Test
    fun `payBill records a partial payment and leaves the bill DUE`() {
        val b = bill(billed = BigDecimal("500"), paid = BigDecimal.ZERO, due = BigDecimal("500"), payStatus = "DUE")
        `when`(billRepository.findById(b.id)).thenReturn(Optional.of(b))
        `when`(billRepository.save(any(Bill::class.java))).thenAnswer { it.arguments[0] }

        val dto = billService.payBill(b.id, BigDecimal("200"), "Cash")

        assertEquals(BigDecimal("200"), dto.paid)
        assertEquals(BigDecimal("300"), dto.due)
        assertEquals("DUE", dto.payStatus)
        assertEquals("Cash", dto.paymentMethod)
    }

    @Test
    fun `payBill settling the balance flips the bill to PAID (capped at billed)`() {
        val b = bill(billed = BigDecimal("500"), paid = BigDecimal("300"), due = BigDecimal("200"), payStatus = "DUE")
        `when`(billRepository.findById(b.id)).thenReturn(Optional.of(b))
        `when`(billRepository.save(any(Bill::class.java))).thenAnswer { it.arguments[0] }

        val dto = billService.payBill(b.id, BigDecimal("250"), "UPI") // overpay → capped at 500

        assertEquals(BigDecimal("500"), dto.paid)
        assertEquals(BigDecimal.ZERO, dto.due)
        assertEquals("PAID", dto.payStatus)
    }

    @Test
    fun `payBill rejects a missing bill, a zero amount, and a waived bill`() {
        val missing = UUID.randomUUID()
        `when`(billRepository.findById(missing)).thenReturn(Optional.empty())
        assertThrows(IllegalArgumentException::class.java) { billService.payBill(missing, BigDecimal("100"), "Cash") }

        val waived = bill(payStatus = "WAIVED")
        `when`(billRepository.findById(waived.id)).thenReturn(Optional.of(waived))
        assertThrows(IllegalArgumentException::class.java) { billService.payBill(waived.id, BigDecimal("100"), "Cash") }
        assertThrows(IllegalArgumentException::class.java) { billService.payBill(waived.id, BigDecimal.ZERO, "Cash") }
    }

    @Test
    fun `payBill overwrites the note when supplied and preserves it otherwise`() {
        // A supplied note (desk edited it while collecting on reopen) overwrites.
        val edited = bill(billed = BigDecimal("500"), paid = BigDecimal.ZERO, due = BigDecimal("500"), payStatus = "DUE")
            .also { it.note = "old note" }
        `when`(billRepository.findById(edited.id)).thenReturn(Optional.of(edited))
        `when`(billRepository.save(any(Bill::class.java))).thenAnswer { it.arguments[0] }
        val dto = billService.payBill(edited.id, BigDecimal("200"), "Cash", "new note")
        assertEquals("new note", dto.note)

        // A plain pay (null/blank note) leaves the original note intact.
        val kept = bill(billed = BigDecimal("500"), paid = BigDecimal.ZERO, due = BigDecimal("500"), payStatus = "DUE")
            .also { it.note = "keep me" }
        `when`(billRepository.findById(kept.id)).thenReturn(Optional.of(kept))
        assertEquals("keep me", billService.payBill(kept.id, BigDecimal("200"), "Cash", null).note)
        assertEquals("keep me", billService.payBill(kept.id, BigDecimal("50"), "Cash", "   ").note)
    }

    // ---- settleOtherDues ---------------------------------------------------

    @Test
    fun `settleOtherDues clears every other owing bill and spares the new invoice`() {
        val pid = UUID.randomUUID()
        val newInvoice = bill(id = UUID.randomUUID(), invoiceNo = "INV_0003", seq = 3, due = BigDecimal("50"), payStatus = "DUE")
        val owing = bill(id = UUID.randomUUID(), invoiceNo = "INV_0002", seq = 2, paid = BigDecimal("20"), due = BigDecimal("30"), payStatus = "DUE")
        val alreadyPaid = bill(id = UUID.randomUUID(), invoiceNo = "INV_0001", seq = 1, due = BigDecimal.ZERO, payStatus = "PAID")
        `when`(billRepository.findHistory(pid)).thenReturn(listOf(newInvoice, owing, alreadyPaid))
        `when`(billRepository.save(any(Bill::class.java))).thenAnswer { it.arguments[0] }

        billService.settleOtherDues(pid, exceptBillId = newInvoice.id)

        // The carried bill is zeroed and marked paid…
        assertEquals(BigDecimal.ZERO, owing.due)
        assertEquals("PAID", owing.payStatus)
        // …the new invoice keeps its due (the balance lives there now)…
        assertEquals(BigDecimal("50"), newInvoice.due)
        // …only the one owing bill is re-saved; the exception and zero-due bill are not.
        verify(billRepository).save(owing)
        verify(billRepository, never()).save(newInvoice)
        verify(billRepository, never()).save(alreadyPaid)
    }

    @Test
    fun `settleOtherDues clears a refunded bill's residual due but keeps its REFUNDED status`() {
        val pid = UUID.randomUUID()
        val refunded = bill(due = BigDecimal("40"), payStatus = "REFUNDED")
        `when`(billRepository.findHistory(pid)).thenReturn(listOf(refunded))
        `when`(billRepository.save(any(Bill::class.java))).thenAnswer { it.arguments[0] }

        billService.settleOtherDues(pid, exceptBillId = UUID.randomUUID())

        assertEquals(BigDecimal.ZERO, refunded.due)
        assertEquals("REFUNDED", refunded.payStatus)
    }

    // ---- listClinicBills ---------------------------------------------------

    @Test
    fun `listClinicBills substitutes safe sentinel dates for an unbounded range`() {
        `when`(billRepository.findClinicBills(sentinelLo, sentinelHi)).thenReturn(emptyList())

        billService.listClinicBills(from = null, to = null)

        verify(billRepository).findClinicBills(sentinelLo, sentinelHi)
    }

    @Test
    fun `listClinicBills carries the patient name and flags today's invoices`() {
        val todayBill = bill(invoiceNo = "INV_0002", billDate = LocalDate.now(), patient = Patient(name = "Asha"))
        val oldBill = bill(invoiceNo = "INV_0001", billDate = LocalDate.now().minusDays(5), patient = Patient(name = "Ravi"))
        `when`(billRepository.findClinicBills(sentinelLo, sentinelHi)).thenReturn(listOf(todayBill, oldBill))

        val out = billService.listClinicBills(from = null, to = null)

        assertEquals(2, out.size)
        assertEquals("Asha", out[0].patientName)
        assertTrue(out[0].today)
        assertEquals("Ravi", out[1].patientName)
        assertFalse(out[1].today)
    }

    // ---- createBill / listBills -------------------------------------------

    @Test
    fun `createBill numbers the invoice from the next sequence`() {
        val pid = UUID.randomUUID()
        `when`(patientRepository.findById(pid)).thenReturn(Optional.of(Patient(id = pid, name = "Asha")))
        `when`(billRepository.maxSeq()).thenReturn(41)
        `when`(billRepository.save(any(Bill::class.java))).thenAnswer { it.arguments[0] }

        val dto = billService.createBill(pid, CreateBillRequest(billed = BigDecimal("100"), paid = BigDecimal("100"), note = "Paid at counter"))

        assertEquals("INV_0042", dto.invoiceNo)
        assertEquals("Paid at counter", dto.note) // the "Add Details" note round-trips
    }

    @Test
    fun `createBill rejects an unknown patient`() {
        val pid = UUID.randomUUID()
        `when`(patientRepository.findById(pid)).thenReturn(Optional.empty())

        assertThrows(IllegalArgumentException::class.java) { billService.createBill(pid, CreateBillRequest()) }
        verify(billRepository, never()).save(any(Bill::class.java))
    }

    @Test
    fun `listBills maps the patient's history preserving newest-first order`() {
        val pid = UUID.randomUUID()
        `when`(billRepository.findHistory(pid)).thenReturn(
            listOf(bill(invoiceNo = "INV_0002", seq = 2), bill(invoiceNo = "INV_0001", seq = 1)),
        )

        val out = billService.listBills(pid)

        assertEquals(listOf("INV_0002", "INV_0001"), out.map { it.invoiceNo })
    }
}
