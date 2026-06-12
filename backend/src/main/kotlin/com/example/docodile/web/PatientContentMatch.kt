package com.example.docodile.web

import java.util.UUID

// One "notes / prescriptions" search hit for the Patient Files keyword search.
// `type` is "Rx" (matched a prescription) or "Visit" (matched a visit note);
// `snippet` is a windowed excerpt of the matching text with the keyword in it
// (the frontend highlights the keyword and renders "<type> · <snippet>").
data class PatientContentMatch(
    val patientId: UUID,
    val patientName: String,
    val patientGender: String?,
    val patientAge: Int?,
    val patientDisplayNo: Int?,
    val type: String,
    val snippet: String,
)
