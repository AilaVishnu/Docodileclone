package com.example.docodile.repo

import com.example.docodile.domain.PatientDepositLedger
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.math.BigDecimal
import java.util.UUID

interface PatientDepositLedgerRepository : JpaRepository<PatientDepositLedger, UUID> {

    // Newest-first deposit history for a patient, scoped to the clinic.
    @Query(
        "SELECT l FROM PatientDepositLedger l " +
            "WHERE l.patient.id = :patientId AND l.clinic.id = :clinicId " +
            "ORDER BY l.createdAt DESC",
    )
    fun findHistory(@Param("patientId") patientId: UUID, @Param("clinicId") clinicId: UUID): List<PatientDepositLedger>

    // Total deposit already drawn for a bill — so re-saving a grown bill draws
    // only the *delta*, not zero (existence) and not the full amount again.
    @Query(
        "SELECT COALESCE(SUM(l.amount), 0) FROM PatientDepositLedger l " +
            "WHERE l.appointment.id = :appointmentId AND l.type = 'BILL_DEDUCTION'",
    )
    fun sumBillDeductions(@Param("appointmentId") appointmentId: UUID): BigDecimal
}
