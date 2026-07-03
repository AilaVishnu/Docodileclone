package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

// One invoice snapshot taken at Charge & Bill. A patient can have many; the
// "Recent Bills" history lists them. This SUPPLEMENTS appointment-level billing
// (which still drives the queue pill / finance / deposit) — it records what was
// billed, not the live revenue figure.
@Entity
@Table(name = "bill")
class Bill(
    @Id
    var id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    var patient: Patient? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    var appointment: Appointment? = null,

    @Column(name = "invoice_no", nullable = false, length = 32)
    var invoiceNo: String = "",

    // Per-clinic running number that formats invoiceNo (INV_0001 …).
    @Column(nullable = false)
    var seq: Int = 0,

    @Column(name = "bill_date", nullable = false)
    var billDate: LocalDate = LocalDate.now(),

    @Column(nullable = false)
    var billed: BigDecimal = BigDecimal.ZERO,

    @Column(nullable = false)
    var paid: BigDecimal = BigDecimal.ZERO,

    @Column(nullable = false)
    var due: BigDecimal = BigDecimal.ZERO,

    @Column(nullable = false)
    var refund: BigDecimal = BigDecimal.ZERO,

    @Column(name = "deposit_applied")
    var depositApplied: BigDecimal? = null,

    @Column(name = "pay_status", length = 32)
    var payStatus: String? = null,

    @Column(name = "payment_method", length = 64)
    var paymentMethod: String? = null,

    // JSON snapshot of the line items, so a bill can be re-opened / printed.
    @Column(columnDefinition = "text")
    var items: String? = null,

    // Free-text note ("Add Details" in the bill editor), shown on reopen.
    @Column(columnDefinition = "text")
    var note: String? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now()
)
