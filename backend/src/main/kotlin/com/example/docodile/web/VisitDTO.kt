package com.example.docodile.web

import java.time.Instant
import java.time.LocalDate
import java.util.UUID

// Complete read shape for a single visit returned to the frontend. Flat —
// no nested patient/clinic objects (just IDs); the Rx rows ARE nested
// since they're a 1:N child collection.
data class VisitDTO(
    val id: UUID,
    val patientId: UUID,
    val clinicId: UUID,
    val createdByDoctorId: UUID?,
    val visitDate: LocalDate,

    // Vitals + units
    val bpSystolic: String?,
    val bpDiastolic: String?,
    val bpUnit: String?,
    val bmi: String?,
    val bmiUnit: String?,
    val height: String?,
    val heightUnit: String?,
    val weight: String?,
    val weightUnit: String?,
    val temperature: String?,
    val temperatureUnit: String?,
    val pulse: String?,
    val pulseUnit: String?,
    val waist: String?,
    val waistUnit: String?,
    val hip: String?,
    val hipUnit: String?,
    val spo2: String?,
    val spo2Unit: String?,

    // History
    val familyHistory: String?,
    val allergies: String?,
    val personalHistory: String?,
    val pastMedicalHistory: String?,

    // Free-text + Autocomplete fields
    val complaints: String?,
    val diagnosis: String?,
    val notesForPatient: String?,
    val privateNotes: String?,
    val tests: String?,

    // Referral + next review
    val referDoctorId: UUID?,
    val referDoctorName: String?,
    val reviewDate: LocalDate?,
    val reviewDays: Int?,
    val reviewNotes: String?,

    // Session timing — when the doctor started/ended the prescription
    // pad's timer for this visit, plus the locked-in duration shown on
    // the SessionBar's "Session Ended" pill.
    val sessionStartedAt: Instant?,
    val sessionEndedAt: Instant?,
    val sessionDurationSec: Int?,

    val prescriptions: List<RxRowDTO>
)
