package com.example.docodile.web

import java.time.Instant
import java.time.LocalDateTime
import java.util.UUID

data class AppointmentDTO(
    val id: UUID,
    val patientId: UUID,
    val patientName: String,
    val patientPhone: String,
    val patientEmail: String?,
    val patientGender: String?,
    val patientDob: String?,
    val patientAge: Int?,
    // Sequential per-clinic patient number, shown as the "T###" code on the
    // queue card. Null only for legacy rows predating V46's backfill.
    val patientDisplayNo: Int? = null,
    val doctorId: UUID,
    val scheduledTime: LocalDateTime?,
    val isWalkin: Boolean,
    val status: String?,
    val type: String?,
    val service: String?,
    val payStatus: String?,
    val paymentMethod: String?,
    val notes: String?,
    val fee: java.math.BigDecimal?,
    // The pharmacy (medicines) bucket + any discount, written by the bill. Kept
    // separate from `fee` (consultation) so finance can split the two. Exposed
    // here so a re-fetched appointment round-trips what was billed.
    val pharmacyAmount: java.math.BigDecimal? = null,
    val discountAmount: java.math.BigDecimal? = null,
    // The linked patient's running deposit/advance balance — the bill seeds its
    // Deposit field from this and auto-draws against it on Charge & Bill.
    val patientDeposit: java.math.BigDecimal? = null,
    // Per-PATIENT bill stats for the date — the kebab flips "Bill" → "View
    // Bills" once todayBillCount > 0, and the Pay badge FALLBACK uses these for a
    // bill not tied to any appointment (a standalone New Bill): a clean day
    // (nothing due, nothing refunded) reads Paid instead of a false Due.
    val todayBillCount: Int = 0,
    val todayDue: java.math.BigDecimal = java.math.BigDecimal.ZERO,
    val todayRefund: java.math.BigDecimal = java.math.BigDecimal.ZERO,
    // Bill stats for the bills linked to THIS appointment (not the patient's
    // other visits). Drive the Pay badge per appointment: apptBillCount > 0 and
    // nothing due → Paid, any due → Due, any refund → Refunded. Keeping them
    // per-appointment stops a refund/payment on one visit colouring another.
    val apptBillCount: Int = 0,
    val apptDue: java.math.BigDecimal = java.math.BigDecimal.ZERO,
    val apptRefund: java.math.BigDecimal = java.math.BigDecimal.ZERO,
    // True if the linked patient has been archived. The appointment still
    // appears in the queue (so the receptionist can see who's checked in),
    // but the frontend blocks navigation into the prescription pad and
    // surfaces a "patient is archived" toast instead.
    val patientArchived: Boolean = false,
    // Wall-clock when the row was first inserted. Drives the 24h "edit
    // window" — receptionists can correct mistakes for a day after a
    // booking is made, then it locks to preserve the audit trail.
    val createdAt: Instant? = null
)
