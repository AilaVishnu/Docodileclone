package com.example.docodile.service

import com.example.docodile.domain.Appointment
import com.example.docodile.domain.Patient
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.web.AppointmentDTO
import com.example.docodile.web.BookAppointmentRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Service
class AppointmentService(
    private val appointmentRepository: AppointmentRepository,
    private val clinicEntityRepository: ClinicEntityRepository,
    private val appUserRepository: AppUserRepository,
    private val patientRepository: PatientRepository,
    private val currentUser: CurrentUser
) {
    fun getAppointmentsForClinic(date: LocalDate): List<AppointmentDTO> {
        val clinicId = currentUser.clinicId()
        val startOfDay = date.atStartOfDay()
        val endOfDay = date.atTime(23, 59, 59)

        return appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(clinicId, startOfDay, endOfDay)
            .map { it.toDTO() }
    }

    @Transactional
    fun bookAppointment(request: BookAppointmentRequest): AppointmentDTO {
        val clinicId = currentUser.clinicId()
        val clinic = clinicEntityRepository.findById(clinicId)
            .orElseThrow { IllegalArgumentException("Clinic not found") }

        val doctor = appUserRepository.findById(request.doctorId)
            .orElseThrow { IllegalArgumentException("Doctor not found") }

        // Create or find patient by name + clinic
        val patient = Patient(
            clinic = clinic,
            name = request.patientName,
            phone = request.patientPhone,
            email = request.patientEmail,
            gender = request.patientGender,
            dob = request.patientDob?.let { runCatching { java.time.LocalDate.parse(it) }.getOrNull() },
            age = request.patientAge,
            createdAt = Instant.now()
        )
        val savedPatient = patientRepository.save(patient)

        val appointment = Appointment(
            clinic = clinic,
            patient = savedPatient,
            doctor = doctor,
            scheduledTime = request.scheduledTime,
            isWalkin = request.isWalkin,
            status = "Scheduled",
            type = request.type,
            service = request.service,
            payStatus = request.payStatus,
            fee = request.fee,
            notes = request.notes,
            createdAt = Instant.now()
        )

        val saved = appointmentRepository.save(appointment)
        return saved.toDTO()
    }

    @Transactional
    fun updateAppointment(appointmentId: UUID, request: BookAppointmentRequest): AppointmentDTO {
        val appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow { IllegalArgumentException("Appointment not found") }

        val doctor = appUserRepository.findById(request.doctorId)
            .orElseThrow { IllegalArgumentException("Doctor not found") }

        // Update patient
        val patient = appointment.patient
        if (patient != null) {
            patient.name = request.patientName
            patient.phone = request.patientPhone
            patient.email = request.patientEmail
            patient.gender = request.patientGender
            patient.dob = request.patientDob?.let { runCatching { java.time.LocalDate.parse(it) }.getOrNull() }
            patient.age = request.patientAge
            patientRepository.save(patient)
        }

        // Update appointment
        appointment.doctor = doctor
        appointment.scheduledTime = request.scheduledTime
        appointment.isWalkin = request.isWalkin
        appointment.type = request.type
        appointment.service = request.service
        appointment.payStatus = request.payStatus
        appointment.fee = request.fee
        appointment.notes = request.notes

        return appointmentRepository.save(appointment).toDTO()
    }

    private fun Appointment.toDTO(): AppointmentDTO {
        return AppointmentDTO(
            id = this.id,
            patientId = this.patient?.id ?: UUID.randomUUID(),
            patientName = this.patient?.name ?: "Unknown Patient",
            patientPhone = this.patient?.phone ?: "N/A",
            patientEmail = this.patient?.email,
            patientGender = this.patient?.gender,
            patientDob = this.patient?.dob?.toString(),
            patientAge = this.patient?.age,
            doctorId = this.doctor?.id ?: UUID.randomUUID(),
            scheduledTime = this.scheduledTime,
            isWalkin = this.isWalkin,
            status = this.status,
            type = this.type,
            service = this.service,
            payStatus = this.payStatus,
            notes = this.notes,
            fee = this.fee
        )
    }
}
