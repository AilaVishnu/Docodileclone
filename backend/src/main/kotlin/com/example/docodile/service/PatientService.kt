package com.example.docodile.service

import com.example.docodile.domain.Patient
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.VisitRepository
import com.example.docodile.web.PatientWithLastVisitDTO
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.LocalDate

@Service
class PatientService(
    private val patientRepository: PatientRepository,
    private val visitRepository: VisitRepository,
    private val appointmentRepository: AppointmentRepository,
    private val appUserRepository: AppUserRepository,
) {
    fun listPatients() = patientRepository.findAllByDeletedAtIsNull()

    fun listArchived() = patientRepository.findAllByDeletedAtIsNotNull()

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
        val patients = patientRepository.findAllByDeletedAtIsNull()
        val lastVisitMap = visitRepository.findLastVisitDates()
            .associateBy({ it.getPatientId() }, { it.getLastVisitDate() })
        // Build patientId -> set of treating doctor ids from both visits AND
        // scheduled appointments. Appointment pairs cover the case where a
        // patient has been booked with a doctor but no visit has been created
        // yet (filter would otherwise miss them until first View Pad).
        val doctorMap = mutableMapOf<java.util.UUID, MutableSet<java.util.UUID>>()
        visitRepository.findPatientDoctorPairs().forEach { row ->
            val docId = row.getDoctorId() ?: return@forEach
            doctorMap.getOrPut(row.getPatientId()) { mutableSetOf() }.add(docId)
        }
        appointmentRepository.findPatientDoctorPairs().forEach { row ->
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

    /**
     * Find an existing patient (same phone digits + name, case-insensitive) or
     * create a new one with the next per-clinic T### number. Same find-or-create
     * rule the appointment booking uses (see AppointmentService), so billing a
     * walk-in from the New Bill page resolves to the same record instead of
     * duplicating it. A shared phone with a different name → a new patient
     * (families share one mobile).
     */
    fun findOrCreate(
        name: String,
        phone: String?,
        email: String?,
        gender: String?,
        dob: String?,   // ISO yyyy-MM-dd
        age: Int?,      // months
    ): Patient {
        require(name.isNotBlank()) { "Patient name is required" }
        val parsedDob = dob?.let { runCatching { LocalDate.parse(it) }.getOrNull() }
        val reqDigits = normalizePhone(phone)
        val existing = reqDigits?.let { digits ->
            patientRepository.findAllByDeletedAtIsNull()
                .filter { normalizePhone(it.phone) == digits }
                .filter { it.name.trim().equals(name.trim(), ignoreCase = true) }
                .minByOrNull { it.createdAt ?: Instant.EPOCH }
        }
        return if (existing != null) {
            existing.name = name.trim()
            existing.email = email
            existing.gender = gender
            existing.dob = parsedDob
            existing.age = age
            patientRepository.save(existing)
        } else {
            patientRepository.save(
                Patient(
                    name = name.trim(),
                    phone = phone,
                    email = email,
                    gender = gender,
                    dob = parsedDob,
                    age = age,
                    createdAt = Instant.now(),
                    displayNo = patientRepository.findMaxDisplayNo() + 1,
                )
            )
        }
    }

    private fun normalizePhone(phone: String?): String? {
        val digits = phone?.filter { it.isDigit() } ?: return null
        if (digits.isEmpty()) return null
        return digits.takeLast(10)
    }
}
