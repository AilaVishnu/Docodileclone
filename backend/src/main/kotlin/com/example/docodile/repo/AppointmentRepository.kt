package com.example.docodile.repo

import com.example.docodile.domain.Appointment
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface AppointmentRepository : JpaRepository<Appointment, UUID> {
    fun findAllByClinicId(clinicId: UUID): List<Appointment>
}
