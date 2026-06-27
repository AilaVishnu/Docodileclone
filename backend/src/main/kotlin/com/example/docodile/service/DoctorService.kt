package com.example.docodile.service

import com.example.docodile.domain.Role
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.web.DoctorDTO
import org.springframework.stereotype.Service

@Service
class DoctorService(
    private val appUserRepository: AppUserRepository,
) {
    /**
     * Active doctors in the caller's clinic (schema already scopes to the
     * clinic — no clinicId predicate needed).
     */
    fun listDoctorsForClinic(): List<DoctorDTO> =
        appUserRepository.findAll()
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
