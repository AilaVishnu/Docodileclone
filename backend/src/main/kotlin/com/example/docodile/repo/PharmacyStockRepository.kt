package com.example.docodile.repo

import com.example.docodile.domain.PharmacyStock
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface PharmacyStockRepository : JpaRepository<PharmacyStock, UUID> {
    fun findAllByClinicIdOrderByNameAsc(clinicId: UUID): List<PharmacyStock>

    @Query("SELECT s FROM PharmacyStock s WHERE s.id = :id AND s.clinic.id = :clinicId")
    fun findByIdAndClinicId(@Param("id") id: UUID, @Param("clinicId") clinicId: UUID): PharmacyStock?
}
