package com.example.docodile.web

import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

// The patient's current advance + its full movement history.
data class PatientDepositDTO(
    val deposit: BigDecimal,
    val ledger: List<DepositLedgerEntryDTO>,
)

data class DepositLedgerEntryDTO(
    val id: UUID,
    val type: String,            // DEPOSIT | REFUND | BILL_DEDUCTION
    val amount: BigDecimal,      // always positive; `type` gives direction
    val mode: String?,
    val details: String?,
    val balanceAfter: BigDecimal,
    val appointmentId: UUID?,    // set on BILL_DEDUCTION rows
    val createdAt: Instant,
)
