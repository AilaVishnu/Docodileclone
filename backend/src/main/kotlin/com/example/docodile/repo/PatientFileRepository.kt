package com.example.docodile.repo

import com.example.docodile.domain.PatientFile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

interface PatientFileRepository : JpaRepository<PatientFile, UUID> {
    fun findAllByClinicIdAndPatientIdOrderByCreatedAtDesc(clinicId: UUID, patientId: UUID): List<PatientFile>
    fun findByIdAndClinicId(id: UUID, clinicId: UUID): PatientFile?

    @Modifying
    @Transactional
    @Query("DELETE FROM PatientFile f WHERE f.id = :id AND f.clinicId = :clinicId")
    fun deleteByIdAndClinicId(@Param("id") id: UUID, @Param("clinicId") clinicId: UUID): Int
}
