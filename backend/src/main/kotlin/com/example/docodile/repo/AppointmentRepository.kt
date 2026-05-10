package com.example.docodile.repo

import com.example.docodile.domain.Appointment
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime
import java.util.UUID

interface AppointmentRepository : JpaRepository<Appointment, UUID> {
    fun findAllByClinicId(clinicId: UUID): List<Appointment>

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
}
