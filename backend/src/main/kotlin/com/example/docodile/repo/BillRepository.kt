package com.example.docodile.repo

import com.example.docodile.domain.Bill
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate
import java.util.UUID

interface BillRepository : JpaRepository<Bill, UUID> {

    // Newest-first bill history for a patient (clinic-scoped).
    @Query(
        "SELECT b FROM Bill b WHERE b.patient.id = :patientId AND b.clinic.id = :clinicId " +
            "ORDER BY b.seq DESC",
    )
    fun findHistory(@Param("patientId") patientId: UUID, @Param("clinicId") clinicId: UUID): List<Bill>

    // Highest per-clinic seq so far — the next invoice number is this + 1.
    @Query("SELECT COALESCE(MAX(b.seq), 0) FROM Bill b WHERE b.clinic.id = :clinicId")
    fun maxSeq(@Param("clinicId") clinicId: UUID): Int

    // How many bills each patient has on a given date — drives the queue's
    // "Bill" vs "View Bills" branch without an N+1.
    @Query(
        "SELECT b.patient.id, COUNT(b) FROM Bill b " +
            "WHERE b.clinic.id = :clinicId AND b.billDate = :date GROUP BY b.patient.id",
    )
    fun countByPatientForDate(@Param("clinicId") clinicId: UUID, @Param("date") date: LocalDate): List<Array<Any>>
}
