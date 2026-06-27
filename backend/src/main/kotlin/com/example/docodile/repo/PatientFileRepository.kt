package com.example.docodile.repo

import com.example.docodile.domain.PatientFile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

interface PatientFileRepository : JpaRepository<PatientFile, UUID> {
    fun findAllByPatientIdOrderByCreatedAtDesc(patientId: UUID): List<PatientFile>

    @Modifying
    @Transactional
    @Query("DELETE FROM PatientFile f WHERE f.id = :id")
    fun deleteById2(@Param("id") id: UUID): Int

    @Query(value = "SELECT id FROM patient_files ORDER BY id", nativeQuery = true)
    fun findAllIds(): List<UUID>

    @Query(value = "SELECT * FROM patient_files WHERE id = :id", nativeQuery = true)
    fun findRawById(@Param("id") id: UUID): PatientFile?
}
