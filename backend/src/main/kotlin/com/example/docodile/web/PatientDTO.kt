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
    val lastVisitDate: LocalDate?
)
