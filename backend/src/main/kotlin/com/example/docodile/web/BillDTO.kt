package com.example.docodile.web

import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

// A bill/invoice row for the Recent Bills history.
data class BillDTO(
    val id: UUID,
    val invoiceNo: String,
    val billDate: LocalDate,
    val billed: BigDecimal,
    val paid: BigDecimal,
    val due: BigDecimal,
    val refund: BigDecimal,
    val depositApplied: BigDecimal?,
    val payStatus: String?,
    val paymentMethod: String?,
    val items: String?,
    val note: String?,
    val appointmentId: UUID?,
    val createdAt: Instant,
)

// One bill for the clinic-wide Bills page — the invoice plus the patient name
// and a "today" flag, so the page's KPIs + table don't have to re-derive them.
data class ClinicBillDTO(
    val id: UUID,
    val invoiceNo: String,
    val billDate: LocalDate,
    val billed: BigDecimal,
    val paid: BigDecimal,
    val due: BigDecimal,
    val refund: BigDecimal,
    val depositApplied: BigDecimal?,
    val payStatus: String?,
    val paymentMethod: String?,
    val items: String?,
    val note: String?,
    val appointmentId: UUID?,
    val createdAt: Instant,
    val patientName: String,
    val today: Boolean,
)

// Charge & Bill posts this to snapshot one invoice. Totals are computed by the
// bill editor; `items` is the JSON line-item snapshot.
data class CreateBillRequest(
    val appointmentId: UUID? = null,
    val billDate: LocalDate? = null,
    val billed: BigDecimal = BigDecimal.ZERO,
    val paid: BigDecimal = BigDecimal.ZERO,
    val due: BigDecimal = BigDecimal.ZERO,
    val refund: BigDecimal? = null,
    val depositApplied: BigDecimal? = null,
    val payStatus: String? = null,
    val paymentMethod: String? = null,
    val items: String? = null,
    val note: String? = null,
)
