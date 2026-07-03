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

    @Query("""
        SELECT r FROM RxRow r
        WHERE (
            LOWER(r.medicine) LIKE :q
            OR LOWER(r.medicineNote) LIKE :q
            OR LOWER(r.notes) LIKE :q
          )
    """)
    fun searchContent(@Param("q") q: String): List<RxRow>

    @Modifying
    @Query("DELETE FROM RxRow r WHERE r.visit.id = :visitId")
    fun deleteByVisitId(@Param("visitId") visitId: UUID): Int

    @Modifying
    @Query("DELETE FROM RxRow r WHERE r.visit.id IN :visitIds")
    fun deleteByVisitIdIn(@Param("visitIds") visitIds: Collection<UUID>): Int

    @Query("""
        SELECT r.medicine FROM RxRow r
        WHERE r.medicine IS NOT NULL AND r.medicine <> ''
        GROUP BY r.medicine
        ORDER BY COUNT(r.medicine) DESC
    """)
    fun findFrequentMedicines(pageable: Pageable): List<String>

    @Query("SELECT r.medicine FROM RxRow r WHERE r.visit.id IN :visitIds AND r.medicine IS NOT NULL AND r.medicine <> ''")
    fun findMedicinesByVisitIds(@Param("visitIds") visitIds: List<UUID>): List<String>

    @Query("""
        SELECT r FROM RxRow r
        WHERE lower(r.medicine) = lower(:medicine)
          AND (:excludeVisitId IS NULL OR r.visit.id <> :excludeVisitId)
        ORDER BY r.visit.visitDate DESC, r.createdAt DESC
    """)
    fun findLatestByMedicine(
        @Param("medicine") medicine: String,
        @Param("excludeVisitId") excludeVisitId: UUID?,
        pageable: Pageable,
    ): List<RxRow>
}
