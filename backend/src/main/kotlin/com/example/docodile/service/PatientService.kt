package com.example.docodile.service

import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.VisitRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.web.PatientWithLastVisitDTO
import org.springframework.stereotype.Service

@Service
class PatientService(
    private val patientRepository: PatientRepository,
    private val visitRepository: VisitRepository,
    private val currentUser: CurrentUser
) {
    fun listPatients() = patientRepository.findAllByClinicId(currentUser.clinicId())

    /**
     * List patients in the caller's clinic with their most recent
     * visit_date attached, sorted by last-visit desc (nulls last). Used by
     * the Prescription-page patient picker.
     *
     * Two queries (no N+1): one to fetch all patients, one to compute the
     * latest visit_date per patient via GROUP BY in `VisitRepository`.
     * Joined in-memory.
     */
    fun listPatientsWithLastVisit(): List<PatientWithLastVisitDTO> {
        val clinicId = currentUser.clinicId()
        val patients = patientRepository.findAllByClinicId(clinicId)
        val lastVisitMap = visitRepository.findLastVisitDatesByClinic(clinicId)
            .associateBy({ it.getPatientId() }, { it.getLastVisitDate() })

        return patients
            .map { p ->
                PatientWithLastVisitDTO(
                    id = p.id,
                    name = p.name,
                    phone = p.phone,
                    gender = p.gender,
                    dob = p.dob,
                    age = p.age,
                    lastVisitDate = lastVisitMap[p.id]
                )
            }
            .sortedWith(
                compareByDescending<PatientWithLastVisitDTO> { it.lastVisitDate ?: java.time.LocalDate.MIN }
                    .thenBy { it.name.lowercase() }
            )
    }
}
