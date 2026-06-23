package com.example.docodile.service

import com.example.docodile.domain.Appointment
import com.example.docodile.domain.PatientDepositLedger
import com.example.docodile.repo.PatientDepositLedgerRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.web.DepositLedgerEntryDTO
import com.example.docodile.web.PatientDepositDTO
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

// Owns the patient advance/deposit: the running net on Patient.deposit plus the
// auditable ledger. All mutations clamp the net at zero — the clinic can never
// "owe" a deposit. Clinic-scoped via findByIdAndClinicId.
@Service
class PatientDepositService(
    private val patientRepository: PatientRepository,
    private val ledgerRepository: PatientDepositLedgerRepository,
    private val currentUser: CurrentUser,
) {
    private val zero: BigDecimal = BigDecimal.ZERO

    // Add to (DEPOSIT) or draw from (REFUND) the patient's advance, recording a
    // ledger row. A REFUND can only draw down to zero — never negative; the row
    // records the amount that actually moved.
    @Transactional
    fun recordMovement(patientId: UUID, type: String, amount: BigDecimal, mode: String?, details: String?): PatientDepositDTO {
        require(amount >= zero) { "amount must be >= 0" }
        val t = type.uppercase()
        require(t == "DEPOSIT" || t == "REFUND") { "type must be DEPOSIT or REFUND" }
        val clinicId = currentUser.clinicId()
        val patient = patientRepository.findByIdAndClinicId(patientId, clinicId)
            ?: throw IllegalArgumentException("Patient not found")
        val current = patient.deposit ?: zero
        val next = if (t == "DEPOSIT") current + amount else (current - amount).max(zero)
        val moved = if (t == "DEPOSIT") amount else current - next
        patient.deposit = next
        patientRepository.save(patient)
        ledgerRepository.save(
            PatientDepositLedger(
                patient = patient, clinic = patient.clinic, appointment = null,
                type = t, amount = moved, mode = mode?.take(64), details = details,
                balanceAfter = next, createdAt = Instant.now(),
            ),
        )
        return buildDTO(patientId, clinicId, next)
    }

    // Auto-cover on Charge & Bill: draw the advance down to cover this bill,
    // recording a BILL_DEDUCTION. Idempotent on AMOUNT, not row existence — a
    // re-saved bill that grew draws only the still-uncovered DELTA (and an
    // unchanged or shrunk bill draws nothing), so the ledger can't diverge from
    // the displayed coverage. Returns the amount applied this round (0 if none).
    @Transactional
    fun applyToBill(appointment: Appointment, billTotal: BigDecimal): BigDecimal {
        val patient = appointment.patient ?: return zero
        if (billTotal <= zero) return zero
        val alreadyApplied = ledgerRepository.sumBillDeductions(appointment.id)
        val remaining = (billTotal - alreadyApplied).max(zero)
        if (remaining <= zero) return zero
        val current = patient.deposit ?: zero
        val applied = current.min(remaining)
        if (applied <= zero) return zero
        val next = current - applied
        patient.deposit = next
        patientRepository.save(patient)
        ledgerRepository.save(
            PatientDepositLedger(
                patient = patient, clinic = patient.clinic, appointment = appointment,
                type = "BILL_DEDUCTION", amount = applied, mode = null, details = null,
                balanceAfter = next, createdAt = Instant.now(),
            ),
        )
        return applied
    }

    @Transactional(readOnly = true)
    fun getDeposit(patientId: UUID): PatientDepositDTO {
        val clinicId = currentUser.clinicId()
        val patient = patientRepository.findByIdAndClinicId(patientId, clinicId)
            ?: throw IllegalArgumentException("Patient not found")
        return buildDTO(patientId, clinicId, patient.deposit ?: zero)
    }

    private fun buildDTO(patientId: UUID, clinicId: UUID, net: BigDecimal): PatientDepositDTO {
        val ledger = ledgerRepository.findHistory(patientId, clinicId).map {
            DepositLedgerEntryDTO(
                id = it.id, type = it.type, amount = it.amount, mode = it.mode,
                details = it.details, balanceAfter = it.balanceAfter,
                appointmentId = it.appointment?.id, createdAt = it.createdAt,
            )
        }
        return PatientDepositDTO(deposit = net, ledger = ledger)
    }
}
