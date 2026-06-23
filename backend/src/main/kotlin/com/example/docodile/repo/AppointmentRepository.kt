package com.example.docodile.repo

import com.example.docodile.domain.Appointment
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime
import java.util.UUID

interface AppointmentDoctorProjection {
    fun getPatientId(): UUID
    fun getDoctorId(): UUID?
}

interface AppointmentRepository : JpaRepository<Appointment, UUID> {

    /**
     * Every (patient, doctor) pair appearing in this clinic's appointment
     * book — regardless of whether a visit has been started yet. Used
     * alongside the visit-derived pairs so that a freshly booked patient
     * shows under their doctor's Patient Files filter immediately.
     */
    @Query(
        """
        SELECT DISTINCT a.patient.id AS patientId, a.doctor.id AS doctorId
        FROM Appointment a
        WHERE a.clinic.id = :clinicId
          AND a.doctor IS NOT NULL
        """
    )
    fun findPatientDoctorPairsByClinic(@Param("clinicId") clinicId: UUID): List<AppointmentDoctorProjection>

    fun findAllByClinicId(clinicId: UUID): List<Appointment>

    // Clinic-scoped single lookup — used by every mutation so a caller can
    // only touch appointments in their OWN clinic. Prevents cross-tenant
    // IDOR: findById() alone would happily return another clinic's row.
    fun findByIdAndClinicId(id: UUID, clinicId: UUID): Appointment?

    fun findAllByClinicIdAndScheduledTimeBetween(
        clinicId: UUID,
        start: LocalDateTime,
        end: LocalDateTime
    ): List<Appointment>

    // Used by the "one appointment per patient per day" guard — returns
    // every appointment a given patient already has within the supplied
    // time window. The caller passes the start/end of the candidate day
    // so booking another slot on the same calendar day is blocked.
    fun findAllByClinicIdAndPatientIdAndScheduledTimeBetween(
        clinicId: UUID,
        patientId: UUID,
        start: LocalDateTime,
        end: LocalDateTime
    ): List<Appointment>

    // Bulk-flip every still-pending appointment whose scheduled time falls
    // before `cutoff` to NO_SHOW. Run nightly by NoShowSweepJob; returns
    // the number of rows touched so the job can log a useful number.
    // Matches BOOKED / SCHEDULED / WAITING case-insensitively — anything
    // that means "patient hasn't been seen yet" gets flipped.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
        """
        UPDATE Appointment a
           SET a.status = 'NO_SHOW'
         WHERE UPPER(a.status) IN ('BOOKED', 'SCHEDULED', 'WAITING')
           AND a.scheduledTime < :cutoff
        """
    )
    fun markBookedBeforeAsNoShow(@Param("cutoff") cutoff: LocalDateTime): Int

    // Bulk-flip every "At Doc" appointment the doctor never opened — the
    // patient reached the doctor (status IN_PROGRESS, or the legacy AT_DOC
    // alias) but NO visit was ever started for it — whose scheduled time is
    // before `cutoff`, to UNSEEN. The next stage after the BOOKED → NO_SHOW
    // sweep: this catches patients sent in but whose pad was never opened.
    // The NOT EXISTS guard excludes an appointment whose visit HAS a started
    // session — an opened (even un-finished) consultation was seen, so it must
    // not be marked unseen. Run nightly by NoShowSweepJob; returns rows touched.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
        """
        UPDATE Appointment a
           SET a.status = 'UNSEEN'
         WHERE UPPER(a.status) IN ('IN_PROGRESS', 'AT_DOC')
           AND a.scheduledTime < :cutoff
           AND NOT EXISTS (
               SELECT v.id FROM Visit v
                WHERE v.appointmentId = a.id
                  AND v.sessionStartedAt IS NOT NULL
           )
        """
    )
    fun markStaleAtDocAsUnseen(@Param("cutoff") cutoff: LocalDateTime): Int

    // This patient's PAID/WAIVED appointments, most recent first — the bill
    // footer reads the first row for the "Last Payment" line (its scheduled
    // time + method). Pass PageRequest.of(0, 1) to fetch just the latest.
    @Query(
        """
        SELECT a FROM Appointment a
         WHERE a.clinic.id = :clinicId
           AND a.patient.id = :patientId
           AND UPPER(a.payStatus) IN ('PAID', 'WAIVED')
         ORDER BY a.scheduledTime DESC NULLS LAST
        """
    )
    fun findPaidByPatient(
        @Param("clinicId") clinicId: UUID,
        @Param("patientId") patientId: UUID,
        pageable: Pageable,
    ): List<Appointment>
}
