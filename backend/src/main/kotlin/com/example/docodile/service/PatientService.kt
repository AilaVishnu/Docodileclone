package com.example.docodile.service

import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.VisitRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.web.PatientWithLastVisitDTO
import org.springframework.stereotype.Service

@Service
class PatientService(
    private val patientRepository: PatientRepository,
    private val visitRepository: VisitRepository,
    private val appointmentRepository: AppointmentRepository,
    private val appUserRepository: AppUserRepository,
    private val currentUser: CurrentUser
) {
    fun listPatients() = patientRepository.findAllByClinicIdAndDeletedAtIsNull(currentUser.clinicId())

    fun listArchived() = patientRepository.findAllByClinicIdAndDeletedAtIsNotNull(currentUser.clinicId())

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
        val patients = patientRepository.findAllByClinicIdAndDeletedAtIsNull(clinicId)
        val lastVisitMap = visitRepository.findLastVisitDatesByClinic(clinicId)
            .associateBy({ it.getPatientId() }, { it.getLastVisitDate() })
        // Build patientId -> set of treating doctor ids from both visits AND
        // scheduled appointments. Appointment pairs cover the case where a
        // patient has been booked with a doctor but no visit has been created
        // yet (filter would otherwise miss them until first View Pad).
        val doctorMap = mutableMapOf<java.util.UUID, MutableSet<java.util.UUID>>()
        visitRepository.findPatientDoctorPairsByClinic(clinicId).forEach { row ->
            val docId = row.getDoctorId() ?: return@forEach
            doctorMap.getOrPut(row.getPatientId()) { mutableSetOf() }.add(docId)
        }
        appointmentRepository.findPatientDoctorPairsByClinic(clinicId).forEach { row ->
            val docId = row.getDoctorId() ?: return@forEach
            doctorMap.getOrPut(row.getPatientId()) { mutableSetOf() }.add(docId)
        }
        // Resolve each treating-doctor's department in one bulk lookup so we
        // can return treatingDepartments alongside the ids. Skips doctors
        // we can't find (deleted users) or those with no department set.
        val allDoctorIds = doctorMap.values.flatten().toSet()
        val deptByDoctor: Map<java.util.UUID, String> = if (allDoctorIds.isEmpty()) emptyMap() else
            appUserRepository.findAllById(allDoctorIds).mapNotNull { u ->
                u.department?.takeIf { it.isNotBlank() }?.let { u.id to it.trim() }
            }.toMap()

        return patients
            .map { p ->
                PatientWithLastVisitDTO(
                    id = p.id,
                    name = p.name,
                    phone = p.phone,
                    email = p.email,
                    gender = p.gender,
                    dob = p.dob,
                    age = p.age,
                    displayNo = p.displayNo,
                    lastVisitDate = lastVisitMap[p.id],
                    treatingDoctorIds = doctorMap[p.id]?.toList() ?: emptyList(),
                    treatingDepartments = doctorMap[p.id]
                        ?.mapNotNull { deptByDoctor[it] }
                        ?.distinct()
                        ?: emptyList()
                )
            }
            .sortedWith(
                compareByDescending<PatientWithLastVisitDTO> { it.lastVisitDate ?: java.time.LocalDate.MIN }
                    .thenBy { it.name.lowercase() }
            )
    }
}
