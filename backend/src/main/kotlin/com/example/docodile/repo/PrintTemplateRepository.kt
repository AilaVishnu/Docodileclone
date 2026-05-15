package com.example.docodile.repo

import com.example.docodile.domain.PrintTemplate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface PrintTemplateRepository : JpaRepository<PrintTemplate, UUID> {
    fun findAllByClinicIdOrderByCreatedAtAsc(clinicId: UUID): List<PrintTemplate>

    @Query("SELECT t FROM PrintTemplate t WHERE t.id = :id AND t.clinic.id = :clinicId")
    fun findByIdAndClinicId(@Param("id") id: UUID, @Param("clinicId") clinicId: UUID): PrintTemplate?

    @Query("SELECT t FROM PrintTemplate t WHERE t.clinic.id = :clinicId AND t.isDefault = true")
    fun findDefaultByClinicId(@Param("clinicId") clinicId: UUID): PrintTemplate?
}
