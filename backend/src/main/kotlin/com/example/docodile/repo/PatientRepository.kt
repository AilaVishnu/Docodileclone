package com.example.docodile.repo

import com.example.docodile.domain.Patient
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface PatientRepository : JpaRepository<Patient, UUID> {
    fun findAllByDeletedAtIsNull(): List<Patient>
    fun findAllByDeletedAtIsNotNull(): List<Patient>
    fun findByPhone(phone: String): Patient?
    fun findAllByPhone(phone: String): List<Patient>
    fun findAllByExternalRefIsNotNull(): List<Patient>

    @Query("SELECT COALESCE(MAX(p.displayNo), 0) FROM Patient p")
    fun findMaxDisplayNo(): Int

    @Query("SELECT p.displayNo FROM Patient p WHERE p.displayNo IS NOT NULL")
    fun findAllDisplayNos(): List<Int>

    @Query("SELECT p FROM Patient p WHERE p.deletedAt IS NOT NULL AND p.deletedAt < :cutoff")
    fun findSoftDeletedBefore(@Param("cutoff") cutoff: Instant): List<Patient>
}
