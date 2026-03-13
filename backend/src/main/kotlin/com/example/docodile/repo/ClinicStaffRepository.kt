package com.example.docodile.repo

import com.example.docodile.domain.ClinicStaff
import com.example.docodile.domain.ClinicStaffId
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ClinicStaffRepository : JpaRepository<ClinicStaff, ClinicStaffId> {
    fun existsByIdClinicIdAndIdStaffId(clinicId: UUID, staffId: UUID): Boolean
    fun countByIdClinicId(clinicId: UUID): Long
    fun findByClinicId(clinicId: UUID): List<ClinicStaff>
}
