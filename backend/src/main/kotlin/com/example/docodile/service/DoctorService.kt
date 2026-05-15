package com.example.docodile.service

import com.example.docodile.domain.Role
import com.example.docodile.repo.ClinicStaffRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.web.DoctorDTO
import org.springframework.stereotype.Service

@Service
class DoctorService(
    private val clinicStaffRepository: ClinicStaffRepository,
    private val currentUser: CurrentUser
) {
    /**
     * Active doctors in the caller's clinic. Used by the Prescription
     * "Refer to" dropdown. Mirrors the multi-tenant isolation pattern
     * from PatientService — filters by `currentUser.clinicId()` so a
     * clinic only ever sees its own staff.
     */
    fun listDoctorsForClinic(): List<DoctorDTO> =
        clinicStaffRepository.findByClinicId(currentUser.clinicId())
            .mapNotNull { it.staff }
            .filter { it.role == Role.DOCTOR && it.active }
            .sortedBy { it.name?.lowercase() ?: "" }
            .map { user ->
                DoctorDTO(
                    id = user.id,
                    name = user.name ?: "",
                    department = user.department,
                    specialty = user.specialty,
                    registrationNo = user.registrationNo,
                    qualification = user.qualification,
                    medicalCouncil = user.medicalCouncil,
                    experienceYears = user.experienceYears
                )
            }
}
