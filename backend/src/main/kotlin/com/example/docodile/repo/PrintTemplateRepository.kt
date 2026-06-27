package com.example.docodile.repo

import com.example.docodile.domain.PrintTemplate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface PrintTemplateRepository : JpaRepository<PrintTemplate, UUID> {
    fun findAllByOrderByCreatedAtAsc(): List<PrintTemplate>

    @Query("SELECT t FROM PrintTemplate t WHERE t.isDefault = true")
    fun findDefault(): PrintTemplate?
}
