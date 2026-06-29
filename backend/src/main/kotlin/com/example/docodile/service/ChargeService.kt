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

        val filled = req.items.filter { it.name.isNotBlank() && it.qty > 0 }
        // Separate finance buckets: service/consultation lines -> fee, the rest
        // -> pharmacy. Each is the NET charged amount, so fee + pharmacy = total.
        val serviceTotal = filled.filter { it.kind == "service" }.fold(zero) { a, l -> a + lineNet(l) }
        val pharmacyTotal = filled.filter { it.kind != "service" }.fold(zero) { a, l -> a + lineNet(l) }
        val finalAmt = serviceTotal + pharmacyTotal
        val isWaived = req.method == "Waive"

        // 1) Payment on the appointment (drives the queue pill + finance).
        appointment.payStatus = if (isWaived) "WAIVED" else "PAID"
        appointment.paymentMethod = req.method
        appointment.fee = if (isWaived) zero else serviceTotal
        appointment.pharmacyAmount = if (isWaived) zero else pharmacyTotal
        appointment.discountAmount = (req.discountAmount ?: zero).max(zero)
        val saved = appointmentRepository.save(appointment)

        // 2) Deposit auto-cover (draws the advance down by up to the bill total).
        val billTotal = if (isWaived) zero else finalAmt
        val applied = patientDepositService.applyToBill(saved, billTotal)

        // 3) Invoice snapshot (additive history).
        val itemsJson = runCatching { objectMapper.writeValueAsString(req.items) }.getOrNull()
        val bill = billService.createBill(
            patient.id,
            CreateBillRequest(
                appointmentId = appointmentId,
                billDate = req.billDate ?: LocalDate.now(),
                billed = finalAmt,
                paid = if (isWaived) zero else finalAmt,
                due = zero,
                refund = zero,
                depositApplied = applied,
                payStatus = appointment.payStatus,
                paymentMethod = req.method,
                items = itemsJson,
            ),
        )

        // 4) Deduct dispensary stock for in-stock medicine lines only.
        val toDeduct = filled.filter { it.kind != "service" && it.inStock }
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
