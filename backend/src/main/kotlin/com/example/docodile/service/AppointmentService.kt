package com.example.docodile.service

import com.example.docodile.domain.Appointment
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.web.AppointmentDTO
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Service
class AppointmentService(
    private val appointmentRepository: AppointmentRepository,
    private val currentUser: CurrentUser
) {
    fun getAppointmentsForClinic(date: LocalDate): List<AppointmentDTO> {
        val clinicId = currentUser.clinicId()
        val startOfDay = date.atStartOfDay()
        val endOfDay = date.atTime(23, 59, 59)

        return appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(clinicId, startOfDay, endOfDay)
            .map { it.toDTO() }
    }

    private fun Appointment.toDTO(): AppointmentDTO {
        return AppointmentDTO(
            id = this.id,
            patientId = this.patient?.id ?: UUID.randomUUID(),
            patientName = this.patient?.name ?: "Unknown Patient",
            patientPhone = this.patient?.phone ?: "N/A",
            doctorId = this.doctor?.id ?: UUID.randomUUID(),
            scheduledTime = this.scheduledTime,
            isWalkin = this.isWalkin,
            status = this.status,
            type = this.type,
            payStatus = this.payStatus,
            notes = this.notes
        )
    }
}
