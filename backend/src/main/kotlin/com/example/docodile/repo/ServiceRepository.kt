package com.example.docodile.repo

import com.example.docodile.domain.Service
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface ServiceRepository : JpaRepository<Service, UUID> {
    fun findAllByClinicIdOrderByCreatedAtAsc(clinicId: UUID): List<Service>

    @Query("SELECT s FROM Service s WHERE s.id = :id AND s.clinic.id = :clinicId")
    fun findByIdAndClinicId(@Param("id") id: UUID, @Param("clinicId") clinicId: UUID): Service?
}
