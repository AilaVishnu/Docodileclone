package com.example.docodile.repo

import com.example.docodile.domain.Patient
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface PatientRepository : JpaRepository<Patient, UUID> {
    fun findAllByClinicId(clinicId: UUID): List<Patient>

    @Query("SELECT p FROM Patient p WHERE p.id = :id AND p.clinic.id = :clinicId")
    fun findByIdAndClinicId(@Param("id") id: UUID, @Param("clinicId") clinicId: UUID): Patient?

    fun findByClinicIdAndPhone(clinicId: UUID, phone: String): Patient?
    fun findAllByClinicIdAndPhone(clinicId: UUID, phone: String): List<Patient>
}
