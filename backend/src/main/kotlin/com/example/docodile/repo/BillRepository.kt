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

    // How many bills each patient has on a given date — drives the queue's
    // "Bill" vs "View Bills" branch without an N+1.
    @Query(
        "SELECT b.patient.id, COUNT(b) FROM Bill b " +
            "WHERE b.billDate = :date GROUP BY b.patient.id",
    )
    fun countByPatientForDate(@Param("date") date: LocalDate): List<Array<Any>>
}
