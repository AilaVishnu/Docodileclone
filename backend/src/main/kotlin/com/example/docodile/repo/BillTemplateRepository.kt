package com.example.docodile.repo

import com.example.docodile.domain.BillTemplate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface BillTemplateRepository : JpaRepository<BillTemplate, UUID> {
    fun findAllByOrderByCreatedAtAsc(): List<BillTemplate>

    @Query("SELECT t FROM BillTemplate t WHERE t.isDefault = true")
    fun findDefault(): BillTemplate?
}
