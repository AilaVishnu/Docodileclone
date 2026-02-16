package com.example.docodile.service

import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import org.springframework.stereotype.Service

@Service
class PatientService(
    private val patientRepository: PatientRepository,
    private val currentUser: CurrentUser
) {
    fun listPatients() = patientRepository.findAllByClinicId(currentUser.clinicId())
}
