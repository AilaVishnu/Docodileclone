package com.example.docodile.repo

import com.example.docodile.domain.RxTemplate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface RxTemplateRepository : JpaRepository<RxTemplate, UUID> {
    fun findAllByKindOrderByNameAsc(kind: String): List<RxTemplate>

    @Query("""
        SELECT t FROM RxTemplate t
        WHERE t.kind = :kind
          AND lower(t.name) = lower(:name)
    """)
    fun findByKindAndName(
        @Param("kind") kind: String,
        @Param("name") name: String,
    ): RxTemplate?
}
