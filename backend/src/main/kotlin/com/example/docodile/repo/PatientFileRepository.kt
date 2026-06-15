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

    // Backfill support: native query returns only the IDs of files in the given
    // clinics, INCLUDING soft-deleted rows (bypasses the @SQLRestriction filter)
    // so plaintext blobs in deleted files also get encrypted. Returns IDs only —
    // not the blobs — so the caller can page and load one entity at a time.
    @Query(
        value = "SELECT id FROM patient_files WHERE clinic_id IN (:clinicIds) ORDER BY id",
        nativeQuery = true,
    )
    fun findAllIdsByClinicIds(@Param("clinicIds") clinicIds: List<UUID>): List<UUID>

    // Load a single row including soft-deleted, bypassing @SQLRestriction, by id.
    @Query(value = "SELECT * FROM patient_files WHERE id = :id", nativeQuery = true)
    fun findRawById(@Param("id") id: UUID): PatientFile?
}
