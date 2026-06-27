package com.example.docodile.service

import com.example.docodile.domain.Bill
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.BillRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.web.BillDTO
import com.example.docodile.web.ClinicBillDTO
import com.example.docodile.web.CreateBillRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

// Bills/invoices history. Each Charge & Bill snapshots one bill here; this does
// NOT touch the appointment/finance/deposit (those are written by /payment) —
// it's an additive history record.
@Service
class BillService(
    private val billRepository: BillRepository,
    private val patientRepository: PatientRepository,
    private val appointmentRepository: AppointmentRepository,
    private val patientDepositService: PatientDepositService,
) {
    private val zero: BigDecimal = BigDecimal.ZERO

    @Transactional
    fun createBill(patientId: UUID, req: CreateBillRequest): BillDTO {
        val patient = patientRepository.findById(patientId).orElse(null)
            ?: throw IllegalArgumentException("Patient not found")
        require(req.billed >= zero && req.paid >= zero && req.due >= zero) { "amounts must be >= 0" }
        // Link the bill to its appointment when one is supplied.
        val appointment = req.appointmentId?.let { appointmentRepository.findById(it).orElse(null) }
        val nextSeq = billRepository.maxSeq() + 1
        val bill = Bill(
            patient = patient,
            appointment = appointment,
            invoiceNo = "INV_" + nextSeq.toString().padStart(4, '0'),
            seq = nextSeq,
            billDate = req.billDate ?: LocalDate.now(),
            billed = req.billed,
            paid = req.paid,
            due = req.due,
            refund = req.refund ?: zero,
            depositApplied = req.depositApplied,
            payStatus = req.payStatus,
            paymentMethod = req.paymentMethod,
            items = req.items,
            createdAt = Instant.now(),
        )
        return billRepository.save(bill).toDTO()
    }

    @Transactional(readOnly = true)
    fun listBills(patientId: UUID): List<BillDTO> {
        return billRepository.findHistory(patientId).map { it.toDTO() }
    }

    // Clear the outstanding due on a patient's OTHER bills — used when a past-due
    // balance is rolled into a new invoice, so the carried amount isn't owed in
    // two places. Sets due to 0 and marks each settled bill PAID (refunded /
    // waived bills are left alone).
    @Transactional
    fun settleOtherDues(patientId: UUID, exceptBillId: UUID) {
        billRepository.findHistory(patientId)
            .filter { it.id != exceptBillId && it.due > zero }
            .forEach { b ->
                b.due = zero
                if (b.payStatus != "REFUNDED" && b.payStatus != "WAIVED") b.payStatus = "PAID"
                billRepository.save(b)
            }
    }

    // Clinic-wide bills for the Bills page (optional date range), each carrying
    // the patient name + a today flag so the page renders without re-derivation.
    @Transactional(readOnly = true)
    fun listClinicBills(from: LocalDate?, to: LocalDate?): List<ClinicBillDTO> {
        val today = LocalDate.now()
        // Always bind real dates: an unbounded side becomes a safe sentinel that
        // stays inside Postgres' date range, so the query never relies on a
        // `:param IS NULL` placeholder (which Postgres can't type-infer).
        val lo = from ?: LocalDate.of(1900, 1, 1)
        val hi = to ?: LocalDate.of(2999, 12, 31)
        return billRepository.findClinicBills(lo, hi).map { it.toClinicDTO(today) }
    }

    // Refund a settled bill: the full received amount goes back. Records the
    // refund on the invoice (status → REFUNDED) and returns any advance that
    // auto-covered it to the patient's standing credit (it was drawn from there,
    // not collected in cash). Does NOT restock medicines — money only.
    @Transactional
    fun refundBill(billId: UUID): ClinicBillDTO {
        val bill = billRepository.findById(billId).orElse(null)
            ?: throw IllegalArgumentException("Bill not found")
        require(bill.paid > zero) { "Nothing to refund on this bill" }
        require(bill.refund <= zero) { "This bill was already refunded" }
        require(bill.payStatus?.uppercase() != "WAIVED") { "A waived bill has no payment to refund" }

        bill.refund = bill.paid
        bill.payStatus = "REFUNDED"
        val saved = billRepository.save(bill)

        val applied = bill.depositApplied ?: zero
        val patientId = bill.patient?.id
        if (applied > zero && patientId != null) {
            patientDepositService.recordMovement(patientId, "DEPOSIT", applied, "Refund", "Refund of ${bill.invoiceNo}")
        }
        return saved.toClinicDTO(LocalDate.now())
    }

    // Bill → the clinic-wide DTO (invoice + patient name + a today flag).
    private fun Bill.toClinicDTO(today: LocalDate) = ClinicBillDTO(
        id = this.id,
        invoiceNo = this.invoiceNo,
        billDate = this.billDate,
        billed = this.billed,
        paid = this.paid,
        due = this.due,
        refund = this.refund,
        depositApplied = this.depositApplied,
        payStatus = this.payStatus,
        paymentMethod = this.paymentMethod,
        items = this.items,
        appointmentId = this.appointment?.id,
        createdAt = this.createdAt,
        patientName = this.patient?.name ?: "",
        today = this.billDate == today,
    )

    private fun Bill.toDTO() = BillDTO(
        id = this.id,
        invoiceNo = this.invoiceNo,
        billDate = this.billDate,
        billed = this.billed,
        paid = this.paid,
        due = this.due,
        refund = this.refund,
        depositApplied = this.depositApplied,
        payStatus = this.payStatus,
        paymentMethod = this.paymentMethod,
        items = this.items,
        appointmentId = this.appointment?.id,
        createdAt = this.createdAt,
    )
}
