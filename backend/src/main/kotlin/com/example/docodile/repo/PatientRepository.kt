package com.example.docodile.repo

import com.example.docodile.domain.Patient
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PatientRepository : JpaRepository<Patient, UUID> {
    fun findAllByClinicId(clinicId: UUID): List<Patient>
}
