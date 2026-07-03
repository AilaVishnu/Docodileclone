package com.example.docodile.web

import java.time.LocalDate
import java.util.UUID

// List shape for the Prescription-page patient picker. Each row carries
// just enough to render: name, phone, dob, and the last visit date
// (computed via a GROUP-BY join in PatientService — no N+1).
data class PatientWithLastVisitDTO(
    val id: UUID,
    val name: String,
    val phone: String?,
    val email: String?,
    val gender: String?,
    val dob: LocalDate?,
    val age: Int?,
    // Sequential per-clinic patient number shown as the "T###" code. Null
    // only for rows predating V46's backfill. See Patient.displayNo.
    val displayNo: Int?,
    val lastVisitDate: LocalDate?,
    // Distinct doctors this patient has been seen by, derived from visits.
    // Used by the Patient Files filter to scope patients by doctor /
    // department without an extra fetch per row.
    val treatingDoctorIds: List<UUID>,
    // Distinct department names attached to those treating doctors. Resolved
    // server-side so the frontend doesn't have to cross-reference the doctor
    // list (which can drift on missing/casing-different department values).
    val treatingDepartments: List<String>
)
