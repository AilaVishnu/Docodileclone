package com.example.docodile.repo

import com.example.docodile.domain.RxRow
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
}
