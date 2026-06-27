package com.example.docodile.service

import com.example.docodile.domain.Bill
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.BillRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.web.BillDTO
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
