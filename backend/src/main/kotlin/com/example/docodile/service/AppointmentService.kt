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

// Thrown when a booking would violate the "one appointment per patient
// per day" rule. Mapped to HTTP 409 Conflict by ClinicStatusController.
class DuplicateAppointmentException(message: String) : RuntimeException(message)

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

        // Find existing patient by phone within this clinic, or create a new one.
        // The phone column stores whatever string the user typed ("+91 99999
        // 99999", "9999999999", "+91-99999-99999", etc.) and an exact-string
        // lookup treated all of those as different patients — so booking the
        // same person twice silently created duplicate Patient rows. Match
        // on the digits-only suffix instead so any reasonable formatting of
        // the same number is recognised as the same patient.
        val reqDigits = normalizePhone(request.patientPhone)
        val existingPatient = reqDigits?.let { digits ->
            patientRepository.findAllByClinicId(clinic.id!!)
                .filter { normalizePhone(it.phone) == digits }
                .minByOrNull { it.createdAt ?: Instant.EPOCH }
        }
        val savedPatient = if (existingPatient != null) {
            // Update mutable fields on the existing patient record.
            existingPatient.name = request.patientName
            existingPatient.email = request.patientEmail
            existingPatient.gender = request.patientGender
            existingPatient.dob = request.patientDob?.let { runCatching { java.time.LocalDate.parse(it) }.getOrNull() }
            existingPatient.age = request.patientAge
            patientRepository.save(existingPatient)
        } else {
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
            patientRepository.save(patient)
        }

        // One appointment per patient per day, per clinic. Blocks both the
        // soft-FE-only path and any direct API call. Storage-side guard is
        // the partial unique index added in V25; this check just lets us
        // surface a friendly 409 instead of letting the constraint trip.
        val dayStart = request.scheduledTime.toLocalDate().atStartOfDay()
        val dayEnd = request.scheduledTime.toLocalDate().atTime(23, 59, 59)
        val sameDay = appointmentRepository
            .findAllByClinicIdAndPatientIdAndScheduledTimeBetween(
                clinic.id!!, savedPatient.id!!, dayStart, dayEnd,
            )
        if (sameDay.isNotEmpty()) {
            throw DuplicateAppointmentException(
                "${savedPatient.name} already has an appointment on ${request.scheduledTime.toLocalDate()}",
            )
        }

        val appointment = Appointment(
            clinic = clinic,
            patient = savedPatient,
            doctor = doctor,
            scheduledTime = request.scheduledTime,
            isWalkin = request.isWalkin,
            status = "BOOKED",
            type = request.type,
            service = request.service,
            payStatus = request.payStatus,
            paymentMethod = request.paymentMethod,
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

        // Server-side enforcement of the edit window — mirrors the
        // BookAppointment modal's readOnly gates so a direct API call
        // can't bypass them. COMPLETED locks instantly; any other
        // status respects the 24h window from createdAt.
        if (appointment.status?.uppercase() == "COMPLETED") {
            throw IllegalArgumentException("Appointment is completed and locked.")
        }
        appointment.createdAt?.let { created ->
            val ageMs = java.time.Duration.between(created, java.time.Instant.now()).toMillis()
            if (ageMs > 24L * 60 * 60 * 1000) {
                throw IllegalArgumentException("Edit window closed (24h after booking). This appointment is locked.")
            }
        }

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
        appointment.paymentMethod = request.paymentMethod
        appointment.fee = request.fee
        appointment.notes = request.notes

        return appointmentRepository.save(appointment).toDTO()
    }

    @Transactional
    fun updatePayment(
        appointmentId: UUID,
        payStatus: String,
        paymentMethod: String?,
        pharmacyAmount: java.math.BigDecimal? = null,
    ): AppointmentDTO {
        val appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow { IllegalArgumentException("Appointment not found") }
        appointment.payStatus = payStatus
        appointment.paymentMethod = paymentMethod
        // Only overwrite pharmacy_amount when the caller actually passes
        // a value (null = "don't touch"). Lets a future consultation-only
        // payment update leave a prior bill intact.
        if (pharmacyAmount != null) appointment.pharmacyAmount = pharmacyAmount
        return appointmentRepository.save(appointment).toDTO()
    }

    @Transactional
    fun updateStatus(appointmentId: UUID, status: String): AppointmentDTO {
        val appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow { IllegalArgumentException("Appointment not found") }
        appointment.status = status
        return appointmentRepository.save(appointment).toDTO()
    }

    // Strip every non-digit and keep the trailing 10 digits — the canonical
    // local form most Indian phone numbers boil down to. Used solely for
    // patient-lookup equality; the original string the user typed is still
    // what we store so the UI keeps the formatting they entered.
    private fun normalizePhone(phone: String?): String? {
        val digits = phone?.filter { it.isDigit() } ?: return null
        if (digits.isEmpty()) return null
        return digits.takeLast(10)
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
            paymentMethod = this.paymentMethod,
            notes = this.notes,
            fee = this.fee,
            patientArchived = this.patient?.archived ?: false,
            createdAt = this.createdAt
        )
    }
}
