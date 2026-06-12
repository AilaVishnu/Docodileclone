package com.example.docodile.repo

import com.example.docodile.domain.RxRow
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface RxRowRepository : JpaRepository<RxRow, UUID> {
    fun findByVisitIdOrderByPositionAsc(visitId: UUID): List<RxRow>

    // Keyword search across prescription text for the Patient Files
    // "notes / prescriptions" search. `q` is a lower-cased "%term%" pattern.
    @Query("""
        SELECT r FROM RxRow r
        WHERE r.visit.patient.clinic.id = :clinicId
          AND (
            LOWER(r.medicine) LIKE :q
            OR LOWER(r.medicineNote) LIKE :q
            OR LOWER(r.notes) LIKE :q
          )
    """)
    fun searchContent(@Param("clinicId") clinicId: UUID, @Param("q") q: String): List<RxRow>

    // Used by VisitService.update() to wipe existing rows before writing the
    // new list. JPQL @Modifying needed because the derived deleteByVisitId
    // would round-trip each row through a SELECT first.
    @Modifying
    @Query("DELETE FROM RxRow r WHERE r.visit.id = :visitId")
    fun deleteByVisitId(@Param("visitId") visitId: UUID): Int

    // Bulk variant for the data importer — clears rx for many visits in one
    // statement. A query-per-visit would force a persistence-context flush
    // each time, defeating JDBC insert batching on a re-import.
    @Modifying
    @Query("DELETE FROM RxRow r WHERE r.visit.id IN :visitIds")
    fun deleteByVisitIdIn(@Param("visitIds") visitIds: Collection<UUID>): Int

    @Query("""
        SELECT r.medicine FROM RxRow r
        WHERE r.visit.patient.clinic.id = :clinicId
          AND r.medicine IS NOT NULL AND r.medicine <> ''
        GROUP BY r.medicine
        ORDER BY COUNT(r.medicine) DESC
    """)
    fun findFrequentMedicines(@Param("clinicId") clinicId: UUID, pageable: Pageable): List<String>

    @Query("SELECT r.medicine FROM RxRow r WHERE r.visit.id IN :visitIds AND r.medicine IS NOT NULL AND r.medicine <> ''")
    fun findMedicinesByVisitIds(@Param("visitIds") visitIds: List<UUID>): List<String>

    // Latest prescription of a given medicine across the clinic — drives the
    // pad's per-medicine autofill so the doctor's most recent schedule for a
    // drug pre-fills the next time anyone prescribes it. Optionally excludes
    // the visit being edited so the autofill doesn't echo what's already there.
    @Query("""
        SELECT r FROM RxRow r
        WHERE r.visit.clinic.id = :clinicId
          AND lower(r.medicine) = lower(:medicine)
          AND (:excludeVisitId IS NULL OR r.visit.id <> :excludeVisitId)
        ORDER BY r.visit.visitDate DESC, r.createdAt DESC
    """)
    fun findLatestByClinicAndMedicine(
        @Param("clinicId") clinicId: UUID,
        @Param("medicine") medicine: String,
        @Param("excludeVisitId") excludeVisitId: UUID?,
        pageable: Pageable,
    ): List<RxRow>
}
