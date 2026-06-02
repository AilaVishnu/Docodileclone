package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.SQLRestriction
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "visit")
@SQLRestriction("deleted_at IS NULL")
@EntityListeners(AuditingEntityListener::class)
class Visit(
    @Id
    var id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clinic_id", nullable = false)
    var clinic: ClinicEntity? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    var patient: Patient? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_doctor_id")
    var createdByDoctor: AppUser? = null,

    @Column(name = "visit_date", nullable = false)
    var visitDate: LocalDate = LocalDate.now(),

    // ── Vitals + units ───────────────────────────────────────────────────
    @Column(name = "bp_systolic")  var bpSystolic: String? = null,
    @Column(name = "bp_diastolic") var bpDiastolic: String? = null,
    @Column(name = "bp_unit")      var bpUnit: String? = null,
    var bmi: String? = null,
    @Column(name = "bmi_unit")     var bmiUnit: String? = null,
    var height: String? = null,
    @Column(name = "height_unit")  var heightUnit: String? = null,
    var weight: String? = null,
    @Column(name = "weight_unit")  var weightUnit: String? = null,
    var temperature: String? = null,
    @Column(name = "temperature_unit") var temperatureUnit: String? = null,
    var pulse: String? = null,
    @Column(name = "pulse_unit")   var pulseUnit: String? = null,
    var waist: String? = null,
    @Column(name = "waist_unit")   var waistUnit: String? = null,
    var hip: String? = null,
    @Column(name = "hip_unit")     var hipUnit: String? = null,
    var spo2: String? = null,
    @Column(name = "spo2_unit")    var spo2Unit: String? = null,

    // ── History (four Autocomplete fields) ───────────────────────────────
    @Column(name = "family_history")       var familyHistory: String? = null,
    var allergies: String? = null,
    @Column(name = "personal_history")     var personalHistory: String? = null,
    @Column(name = "past_medical_history") var pastMedicalHistory: String? = null,

    // ── Free-text + Autocomplete fields ──────────────────────────────────
    var complaints: String? = null,
    var diagnosis: String? = null,
    @Column(name = "notes_for_patient") var notesForPatient: String? = null,
    @Column(name = "private_notes")     var privateNotes: String? = null,
    var tests: String? = null,

    // ── Referral + next review ───────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refer_doctor_id")
    var referDoctor: AppUser? = null,

    @Column(name = "review_date") var reviewDate: LocalDate? = null,
    @Column(name = "review_days") var reviewDays: Int? = null,
    @Column(name = "review_notes") var reviewNotes: String? = null,

    // ── Session timing (Prescription form's SessionBar) ─────────────────
    // Set when the doctor clicks Start Session on the prescription pad.
    @Column(name = "session_started_at") var sessionStartedAt: Instant? = null,
    // Set when End Session fires; the bar locks at this instant.
    @Column(name = "session_ended_at")   var sessionEndedAt: Instant? = null,
    // Final elapsed seconds shown on the bar at End. Cached separately
    // so we don't have to recompute from started/ended (e.g. paused
    // segments make a wall-clock diff incorrect).
    @Column(name = "session_duration_sec") var sessionDurationSec: Int? = null,

    @Column(name = "created_at") var createdAt: Instant? = null,

    @LastModifiedDate
    @Column(name = "updated_at") var updatedAt: Instant? = null,

    @CreatedBy
    @Column(name = "created_by") var createdBy: UUID? = null,

    @LastModifiedBy
    @Column(name = "updated_by") var updatedBy: UUID? = null,

    @Column(name = "deleted_at") var deletedAt: Instant? = null,
    @Column(name = "deleted_by") var deletedBy: UUID? = null,

    // "<patientExternalRef>|<visitDate>" when this visit was bulk-imported.
    // Null for visits created natively. Makes re-imports idempotent.
    @Column(name = "external_ref") var externalRef: String? = null,

    // The appointment this visit was opened from. Lets a patient have a
    // distinct visit per same-day appointment. Null for legacy/imported
    // visits or visits created outside an appointment.
    @Column(name = "appointment_id") var appointmentId: UUID? = null
)
