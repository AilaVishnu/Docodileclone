package com.example.docodile.service

import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.web.ChargeLine
import com.example.docodile.web.ChargeRequest
import com.example.docodile.web.ChargeResult
import com.example.docodile.web.CreateBillRequest
import com.example.docodile.web.DeductItem
import tools.jackson.databind.ObjectMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.util.UUID

// Charge & Bill in ONE transaction. Replaces the three frontend round trips
// (PATCH /payment + POST /bills + /pharmacy-stock/deduct) so payment, the
// invoice snapshot, the deposit auto-cover and the stock deduction can never
// drift apart. CRUCIALLY: the server recomputes the money from the submitted
// line items — it does not trust client-sent totals.
@Service
class ChargeService(
    private val appointmentRepository: AppointmentRepository,
    private val patientDepositService: PatientDepositService,
    private val billService: BillService,
    private val pharmacyStockService: PharmacyStockService,
    private val billRepository: com.example.docodile.repo.BillRepository,
) {
    // Own mapper (the app exposes no ObjectMapper bean) — used only to serialize
    // the line-item snapshot into the bill's `items` JSON. Serialization reads
    // the data-class getters, so the Kotlin module isn't needed here.
    private val objectMapper = ObjectMapper()
    private val zero: BigDecimal = BigDecimal.ZERO
    private val hundred: BigDecimal = BigDecimal(100)

    // Net charged amount for one line = qty*unit − discount + tax (discount as a
    // % of the gross or a flat ₹; tax = gst% of the gross). Clamped at zero.
    private fun lineNet(l: ChargeLine): BigDecimal {
        val gross = l.unit.multiply(BigDecimal(l.qty))
        val discAmt = if (l.discUnit == "%") gross.multiply(l.disc).divide(hundred, 2, RoundingMode.HALF_UP) else l.disc
        val tax = gross.multiply(l.gst).divide(hundred, 2, RoundingMode.HALF_UP)
        return gross.subtract(discAmt).add(tax).max(zero)
    }

    @Transactional
    fun charge(appointmentId: UUID, req: ChargeRequest): ChargeResult {
        val appointment = appointmentRepository.findById(appointmentId).orElse(null)
            ?: throw IllegalArgumentException("Appointment not found")
        val patient = appointment.patient ?: throw IllegalArgumentException("Appointment has no patient")

        // Double-billing guard: if this appointment already has an invoice (e.g. a
        // service was billed at booking when marked Paid), never bill a `service`
        // line again — this charge covers only medicines / past due. The service
        // stays on its own booking invoice; the fee already on the appointment is
        // preserved.
        val alreadyBilled = billRepository.countByAppointment(appointmentId) > 0
        val filled = req.items
            .filter { it.name.isNotBlank() && it.qty > 0 }
            .filter { !(alreadyBilled && it.kind == "service") }
        require(filled.isNotEmpty()) {
            if (alreadyBilled) "This appointment's service is already billed — add items to bill, or refund the existing invoice."
            else "Nothing to bill."
        }
        // Separate finance buckets: service/consultation lines -> fee, medicines
        // -> pharmacy. A `pastdue` roll-in is its own bucket: counted in the
        // total, but kept out of the fee + pharmacy figures (and out of stock).
        val serviceTotal = filled.filter { it.kind == "service" }.fold(zero) { a, l -> a + lineNet(l) }
        val pharmacyTotal = filled.filter { it.kind != "service" && it.kind != "pastdue" }.fold(zero) { a, l -> a + lineNet(l) }
        val pastDueTotal = filled.filter { it.kind == "pastdue" }.fold(zero) { a, l -> a + lineNet(l) }
        val finalAmt = serviceTotal + pharmacyTotal + pastDueTotal
        val isWaived = req.method == "Waive"

        // 1) Payment on the appointment (drives the queue pill + finance).
        appointment.paymentMethod = req.method
        // When the service was already billed at booking, keep that fee — this
        // charge only added medicines, so serviceTotal here is 0.
        appointment.fee = if (isWaived) zero else if (alreadyBilled) (appointment.fee ?: zero) else serviceTotal
        appointment.pharmacyAmount = if (isWaived) zero else pharmacyTotal
        // A waive writes off the whole bill — record it as a 100% discount (the
        // full amount), mirroring how the bill editor shows it.
        appointment.discountAmount = if (isWaived) finalAmt else (req.discountAmount ?: zero).max(zero)
        val saved = appointmentRepository.save(appointment)

        // 2) Deposit auto-cover (draws the advance down by up to the bill total).
        val billTotal = if (isWaived) zero else finalAmt
        val applied = patientDepositService.applyToBill(saved, billTotal)

        // 2b) Cash/card collected now — null means "the full amount" (the prior
        // full-payment behaviour). After the deposit cover + this collection, any
        // shortfall is the bill's DUE, and flips the status from PAID to DUE.
        val collected = if (isWaived) zero else (req.paidAmount ?: finalAmt).max(zero).min(finalAmt)
        val paid = if (isWaived) zero else (collected + applied).min(finalAmt)
        val due = if (isWaived) zero else (finalAmt - paid).max(zero)
        val payStatus = if (isWaived) "WAIVED" else if (due > zero) "DUE" else "PAID"
        if (saved.payStatus != payStatus) {
            saved.payStatus = payStatus
            appointmentRepository.save(saved)
        }

        // 3) Invoice snapshot (additive history) — the actually-billed lines
        // (blank/zero rows and any already-billed service line excluded).
        val itemsJson = runCatching { objectMapper.writeValueAsString(filled) }.getOrNull()
        val bill = billService.createBill(
            patient.id,
            CreateBillRequest(
                appointmentId = appointmentId,
                billDate = req.billDate ?: LocalDate.now(),
                billed = finalAmt,
                paid = paid,
                due = due,
                refund = zero,
                depositApplied = applied,
                payStatus = payStatus,
                paymentMethod = req.method,
                items = itemsJson,
                note = req.note,
            ),
        )

        // 3b) Past due rolled into this invoice → clear the now-superseded dues
        // on the patient's OTHER bills so the balance isn't counted twice.
        if (pastDueTotal > zero) {
            billService.settleOtherDues(patient.id, bill.id)
        }

        // 4) Deduct dispensary stock for in-stock medicine lines only.
        val toDeduct = filled.filter { it.kind != "service" && it.kind != "pastdue" && it.inStock }
            .map { DeductItem(name = it.name, qty = it.qty) }
        val stock = pharmacyStockService.deduct(toDeduct)

        return ChargeResult(
            bill = bill,
            depositApplied = applied,
            patientDeposit = patient.deposit ?: zero,
            stock = stock,
        )
    }
}
