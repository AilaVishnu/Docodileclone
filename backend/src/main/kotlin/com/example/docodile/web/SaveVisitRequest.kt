package com.example.docodile.web

import java.time.Instant
import java.time.LocalDate
import java.util.UUID

// Used for both POST (create) and PUT (update). Full-replacement semantics:
// the body represents the entire visit as it should be after the call —
// missing fields become NULL, and the prescriptions list replaces the
// existing rx_row collection wholesale (delete-and-recreate).
data class SaveVisitRequest(
    val visitDate: LocalDate? = null,        // server defaults to today on create if null

    // Vitals + units
    val bpSystolic: String? = null,
    val bpDiastolic: String? = null,
    val bpUnit: String? = null,
    val bmi: String? = null,
    val bmiUnit: String? = null,
    val height: String? = null,
    val heightUnit: String? = null,
    val weight: String? = null,
    val weightUnit: String? = null,
    val temperature: String? = null,
    val temperatureUnit: String? = null,
    val pulse: String? = null,
    val pulseUnit: String? = null,
    val waist: String? = null,
    val waistUnit: String? = null,
    val hip: String? = null,
    val hipUnit: String? = null,
    val spo2: String? = null,
    val spo2Unit: String? = null,

    // History
    val familyHistory: String? = null,
    val allergies: String? = null,
    val personalHistory: String? = null,
    val pastMedicalHistory: String? = null,

    // Free-text + Autocomplete fields
    val complaints: String? = null,
    val diagnosis: String? = null,
    val notesForPatient: String? = null,
    val privateNotes: String? = null,
    val tests: String? = null,

    // Treating doctor (the one whose pad this visit belongs to). Carried
    // through from the appointment when the doctor opens View Pad, so the
    // visit gets correctly attributed even when the caller is a receptionist.
    val createdByDoctorId: UUID? = null,

    // Referral + next review
    val referDoctorId: UUID? = null,
    val reviewDate: LocalDate? = null,
    val reviewDays: Int? = null,
    val reviewNotes: String? = null,

    // Prescription pad's SessionBar timing — set by the frontend on
    // Start Session / End Session. Server treats them as opaque.
    val sessionStartedAt: Instant? = null,
    val sessionEndedAt: Instant? = null,
    val sessionDurationSec: Int? = null,

    val prescriptions: List<RxRowDTO> = emptyList()
)
