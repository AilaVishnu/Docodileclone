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
import java.util.UUID



// One movement in a patient's deposit/advance history. Every DEPOSIT, REFUND
// and the automatic BILL_DEDUCTION (when Charge & Bill consumes the advance)
// writes a row here, so the running net on Patient.deposit is always backed by
// an auditable trail. `amount` is always positive; `type` gives the direction.
@Entity
@Table(name = "patient_deposit_ledger")
class PatientDepositLedger(
    @Id
    var id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    var patient: Patient? = null,

    // Set only on BILL_DEDUCTION rows — the bill that drew the deposit down.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    var appointment: Appointment? = null,

    // DEPOSIT | REFUND | BILL_DEDUCTION
    @Column(nullable = false)
    var type: String = "DEPOSIT",

    @Column(nullable = false)
    var amount: BigDecimal = BigDecimal.ZERO,

    // Payment mode for DEPOSIT / REFUND (Cash, Card, UPI, or a split label).
    @Column(length = 64)
    var mode: String? = null,

    // Free-text note the desk added in the Deposit drawer.
    var details: String? = null,

    // Running net balance immediately after this movement.
    @Column(name = "balance_after", nullable = false)
    var balanceAfter: BigDecimal = BigDecimal.ZERO,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now()
)
