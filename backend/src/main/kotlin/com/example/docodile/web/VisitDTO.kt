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
    // Prescribing doctor's name, resolved server-side so the prescription print
    // shows it even when that doctor isn't in the caller's scoped /api/doctors
    // list (different department, archived, or a non-doctor user printing).
    val createdByDoctorName: String?,
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

    // The appointment this visit belongs to (null for legacy/imported
    // visits). Lets the pad show the visit tied to the open appointment.
    val appointmentId: UUID?,

    // The owning appointment's status (e.g. COMPLETED / IN_PROGRESS / AT_DOC),
    // resolved server-side. Null when the visit has no appointment. Lets the
    // prescription pad lock/label each visit tab from its OWN completion state
    // rather than the appointment the chart was opened through.
    val appointmentStatus: String?,

    val prescriptions: List<RxRowDTO>
)
