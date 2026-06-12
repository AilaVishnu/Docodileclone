package com.example.docodile.repo

import com.example.docodile.domain.Visit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate
import java.util.UUID

interface VisitRepository : JpaRepository<Visit, UUID> {
    fun findAllByClinicIdAndVisitDateBetween(clinicId: UUID, start: LocalDate, end: LocalDate): List<Visit>

    // Keyword search across visit free-text (complaints / diagnosis / notes /
    // tests / review) for the Patient Files "notes / prescriptions" search.
    // `q` is a lower-cased "%term%" pattern.
    @Query("""
        SELECT v FROM Visit v
        WHERE v.clinic.id = :clinicId
          AND (
            LOWER(v.complaints) LIKE :q
            OR LOWER(v.diagnosis) LIKE :q
            OR LOWER(v.notesForPatient) LIKE :q
            OR LOWER(v.privateNotes) LIKE :q
            OR LOWER(v.tests) LIKE :q
            OR LOWER(v.reviewNotes) LIKE :q
          )
        ORDER BY v.visitDate DESC
    """)
    fun searchNotes(@Param("clinicId") clinicId: UUID, @Param("q") q: String): List<Visit>

    @Query("""
        SELECT v FROM Visit v
        WHERE v.clinic.id = :clinicId
          AND v.reviewDate IS NOT NULL
          AND v.reviewDate < :today
        ORDER BY v.reviewDate ASC
    """)
    fun findOverdueReviews(@Param("clinicId") clinicId: UUID, @Param("today") today: LocalDate): List<Visit>

    // Order by visit date, then creation time, so multiple visits on the same
    // day (e.g. several "Today" visits) keep a STABLE order. Without the
    // createdAt tiebreaker their order shuffled on every fetch, which made the
    // prescription tabs remap to different visits when a new one was added —
    // a tab would appear to "lose" its data even though it was untouched.
    fun findAllByClinicIdAndPatientIdOrderByVisitDateAscCreatedAtAsc(clinicId: UUID, patientId: UUID): List<Visit>

    // Active consultations for the live "Active Sessions" indicator: the
    // doctor opened the pad (session started) and hasn't ended the session
    // (no end). We ALSO exclude any visit whose appointment is already in a
    // terminal status — a visit can be marked done at the appointment level
    // without the session end being stamped (e.g. completed via a path that
    // didn't touch the visit), and such a consultation must not linger as
    // "active". Server-owned so the list is accurate across devices.
    @Query("""
        SELECT v FROM Visit v
        WHERE v.clinic.id = :clinicId
          AND v.sessionStartedAt IS NOT NULL
          AND v.sessionEndedAt IS NULL
          AND (
            v.appointmentId IS NULL
            OR NOT EXISTS (
              SELECT 1 FROM Appointment a
              WHERE a.id = v.appointmentId
                AND UPPER(a.status) IN ('COMPLETED', 'CANCELLED', 'NO_SHOW')
            )
          )
    """)
    fun findActiveSessions(@Param("clinicId") clinicId: UUID): List<Visit>

    @Query("SELECT v FROM Visit v WHERE v.clinic.id = :clinicId AND v.patient.id IN :patientIds ORDER BY v.visitDate ASC")
    fun findAllByClinicIdAndPatientIdInOrderByVisitDateAsc(
        @Param("clinicId") clinicId: UUID,
        @Param("patientIds") patientIds: List<UUID>
    ): List<Visit>

    // Cross-clinic guard: even if a caller knows a visitId, they can only
    // load it if it belongs to their clinic. Mirrors the pattern used by
    // PatientRepository.findAllByClinicId.
    fun findByIdAndClinicId(id: UUID, clinicId: UUID): Visit?

    // All previously-imported visits in a clinic — used by the data
    // migration importer to upsert by external_ref.
    fun findAllByClinicIdAndExternalRefIsNotNull(clinicId: UUID): List<Visit>

    /**
     * Most-recent visit_date per patient, scoped to one clinic. Used by the
     * patient list endpoint to render "last visit DD MMM" without N+1
     * fetches. Returns rows of `[patientId, lastVisitDate]`.
     */
    @Query(
        """
        SELECT v.patient.id AS patientId, MAX(v.visitDate) AS lastVisitDate
        FROM Visit v
        WHERE v.clinic.id = :clinicId
        GROUP BY v.patient.id
        """
    )
    fun findLastVisitDatesByClinic(@Param("clinicId") clinicId: UUID): List<LastVisitProjection>

    /**
     * Every (patient, doctor) pair appearing in this clinic's visits, so the
     * frontend can filter patients by treating doctor / department without
     * having to fetch each patient's visit history individually.
     */
    @Query(
        """
        SELECT DISTINCT v.patient.id AS patientId, v.createdByDoctor.id AS doctorId
        FROM Visit v
        WHERE v.clinic.id = :clinicId
          AND v.createdByDoctor IS NOT NULL
        """
    )
    fun findPatientDoctorPairsByClinic(@Param("clinicId") clinicId: UUID): List<PatientDoctorProjection>
}

interface LastVisitProjection {
    fun getPatientId(): UUID
    fun getLastVisitDate(): LocalDate?
}

interface PatientDoctorProjection {
    fun getPatientId(): UUID
    fun getDoctorId(): UUID?
}
