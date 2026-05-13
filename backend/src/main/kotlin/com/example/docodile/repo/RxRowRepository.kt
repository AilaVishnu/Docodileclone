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

    // Used by VisitService.update() to wipe existing rows before writing the
    // new list. JPQL @Modifying needed because the derived deleteByVisitId
    // would round-trip each row through a SELECT first.
    @Modifying
    @Query("DELETE FROM RxRow r WHERE r.visit.id = :visitId")
    fun deleteByVisitId(@Param("visitId") visitId: UUID): Int

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
}
