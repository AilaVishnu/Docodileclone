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
    @Query("""
        SELECT DISTINCT a.patient.id AS patientId, a.doctor.id AS doctorId
        FROM Appointment a
        WHERE a.doctor IS NOT NULL
    """)
    fun findPatientDoctorPairs(): List<AppointmentDoctorProjection>

    fun findAllByScheduledTimeBetween(start: LocalDateTime, end: LocalDateTime): List<Appointment>

    fun findAllByPatientIdAndScheduledTimeBetween(
        patientId: UUID,
        start: LocalDateTime,
        end: LocalDateTime
    ): List<Appointment>

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE Appointment a
           SET a.status = 'NO_SHOW'
         WHERE UPPER(a.status) IN ('BOOKED', 'SCHEDULED', 'WAITING')
           AND a.scheduledTime < :cutoff
    """)
    fun markBookedBeforeAsNoShow(@Param("cutoff") cutoff: LocalDateTime): Int
}
