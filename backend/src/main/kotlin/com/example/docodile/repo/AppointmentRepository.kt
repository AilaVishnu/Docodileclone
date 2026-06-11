package com.example.docodile.repo

import com.example.docodile.domain.Appointment
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
}
