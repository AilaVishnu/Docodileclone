package com.example.docodile.repo

import com.example.docodile.domain.Bill
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate
import java.util.UUID

interface BillRepository : JpaRepository<Bill, UUID> {

    // Newest-first bill history for a patient (schema-scoped — no clinic_id).
    @Query(
        "SELECT b FROM Bill b WHERE b.patient.id = :patientId " +
            "ORDER BY b.seq DESC",
    )
    fun findHistory(@Param("patientId") patientId: UUID): List<Bill>

    // Highest seq so far — the next invoice number is this + 1.
    @Query("SELECT COALESCE(MAX(b.seq), 0) FROM Bill b")
    fun maxSeq(): Int

    // Per-patient bill stats for a day: how many bills the patient has + the
    // total still due across them. Drives the queue's "Bill" vs "View Bills"
    // branch AND its Pay badge (billed + nothing due → Paid), without an N+1.
    // Rows: [patientId, count, sumDue].
    @Query(
        "SELECT b.patient.id, COUNT(b), COALESCE(SUM(b.due), 0) FROM Bill b " +
            "WHERE b.billDate = :date GROUP BY b.patient.id",
    )
    fun billStatsByPatientForDate(@Param("date") date: LocalDate): List<Array<Any>>

    // All bills within a date range, newest invoice first — drives the clinic-wide
    // Bills page (schema-scoped — no clinic_id). Both bounds are always bound to
    // real dates (the service substitutes a safe sentinel for an unbounded side):
    // a `:param IS NULL OR …` form leaves the parameter in no typed context, so
    // Postgres can't infer its type ("could not determine data type of parameter").
    @Query(
        "SELECT b FROM Bill b WHERE b.billDate >= :from AND b.billDate <= :to " +
            "ORDER BY b.seq DESC",
    )
    fun findClinicBills(
        @Param("from") from: LocalDate,
        @Param("to") to: LocalDate,
    ): List<Bill>
}
