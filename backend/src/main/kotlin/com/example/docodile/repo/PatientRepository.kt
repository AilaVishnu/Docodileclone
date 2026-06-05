package com.example.docodile.repo

import com.example.docodile.domain.Patient
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface PatientRepository : JpaRepository<Patient, UUID> {
    fun findAllByClinicId(clinicId: UUID): List<Patient>

    // Active patients only — excludes soft-deleted rows.
    fun findAllByClinicIdAndDeletedAtIsNull(clinicId: UUID): List<Patient>

    // Soft-deleted patients — for the archived/deleted patient list.
    fun findAllByClinicIdAndDeletedAtIsNotNull(clinicId: UUID): List<Patient>

    @Query("SELECT p FROM Patient p WHERE p.id = :id AND p.clinic.id = :clinicId")
    fun findByIdAndClinicId(@Param("id") id: UUID, @Param("clinicId") clinicId: UUID): Patient?

    fun findByClinicIdAndPhone(clinicId: UUID, phone: String): Patient?
    fun findAllByClinicIdAndPhone(clinicId: UUID, phone: String): List<Patient>

    // All previously-imported patients in a clinic — used by the data
    // migration importer to upsert by external_ref instead of duplicating.
    fun findAllByClinicIdAndExternalRefIsNotNull(clinicId: UUID): List<Patient>

    // Highest display_no currently assigned in a clinic (0 if none). New
    // patients continue the sequence from here. See V46.
    @Query("SELECT COALESCE(MAX(p.displayNo), 0) FROM Patient p WHERE p.clinic.id = :clinicId")
    fun findMaxDisplayNoByClinicId(@Param("clinicId") clinicId: UUID): Int

    // Every display_no already taken in a clinic — the importer skips these
    // when numbering new patients.
    @Query("SELECT p.displayNo FROM Patient p WHERE p.clinic.id = :clinicId AND p.displayNo IS NOT NULL")
    fun findDisplayNosByClinicId(@Param("clinicId") clinicId: UUID): List<Int>

    // Patients soft-deleted before the given cutoff — used by PurgeJob to
    // identify records eligible for hard purge after the retention period.
    @Query("SELECT p FROM Patient p WHERE p.deletedAt IS NOT NULL AND p.deletedAt < :cutoff")
    fun findSoftDeletedBefore(@Param("cutoff") cutoff: Instant): List<Patient>
}
