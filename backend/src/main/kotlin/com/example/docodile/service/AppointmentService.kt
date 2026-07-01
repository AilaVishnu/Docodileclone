package com.example.docodile.service

import com.example.docodile.domain.Appointment
import com.example.docodile.domain.Patient
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.BillRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.web.AppointmentDTO
import com.example.docodile.web.BookAppointmentRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale
import java.util.UUID

// Thrown when a booking would violate the "one appointment per patient
// per day" rule. Mapped to HTTP 409 Conflict by ClinicStatusController.
class DuplicateAppointmentException(message: String) : RuntimeException(message)

@Service
class AppointmentService(
    private val appointmentRepository: AppointmentRepository,
    private val appUserRepository: AppUserRepository,
    private val patientRepository: PatientRepository,
    private val patientDepositService: PatientDepositService,
    private val billRepository: BillRepository,
) {
    fun getAppointmentsForClinic(date: LocalDate): List<AppointmentDTO> {
        val startOfDay = date.atStartOfDay()
        val endOfDay = date.atTime(23, 59, 59)

        // Bills each patient already has on this date → drives the queue kebab's
        // "Create Bill" vs "View/Create Bills" branch (one query, no N+1).
        val billCountByPatient: Map<UUID, Int> = billRepository.countByPatientForDate(date)
            .associate { (it[0] as UUID) to (it[1] as Number).toInt() }

        return appointmentRepository.findAllByScheduledTimeBetween(startOfDay, endOfDay)
            .map { it.toDTO(todayBillCount = billCountByPatient[it.patient?.id] ?: 0) }
    }

    @Transactional
    fun bookAppointment(request: BookAppointmentRequest): AppointmentDTO {
        val doctor = appUserRepository.findById(request.doctorId)
            .orElseThrow { IllegalArgumentException("Doctor not found") }

        // Find existing patient by phone within this clinic, or create a new one.
        // The phone column stores whatever string the user typed ("+91 99999
        // 99999", "9999999999", "+91-99999-99999", etc.), so we match on the
        // digits-only suffix — any reasonable formatting of the same number
        // resolves to the same patient.
        //
        // A phone number is NOT unique per patient: families routinely share
        // one mobile. So phone alone can't identify the person — we also
        // require the name to match. Booking "Sita" on a number already held
        // by "Ravi" therefore creates a new patient for Sita instead of
        // overwriting Ravi's record.
        val reqDigits = normalizePhone(request.patientPhone)
        val existingPatient = reqDigits?.let { digits ->
            patientRepository.findAllByDeletedAtIsNull()
                .filter { normalizePhone(it.phone) == digits }
                .filter { it.name.trim().equals(request.patientName.trim(), ignoreCase = true) }
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
                name = request.patientName,
                phone = request.patientPhone,
                email = request.patientEmail,
                gender = request.patientGender,
                dob = request.patientDob?.let { runCatching { java.time.LocalDate.parse(it) }.getOrNull() },
                age = request.patientAge,
                createdAt = Instant.now(),
                // Next free patient number for this clinic, continuing the
                // sequence used by imports. See V46 / PatientRepository.
                displayNo = patientRepository.findMaxDisplayNo() + 1
            )
            patientRepository.save(patient)
        }

        // One appointment per patient per day, per clinic. Blocks both the
        // soft-FE-only path and any direct API call. The DB-side UNIQUE
        // index was relaxed in V44 — same-day duplicates are allowed when
        // the caller passes `force = true`, which the booking UI sets
        // after the staff explicitly confirms the second appointment.
        if (!request.force) {
            val dayStart = request.scheduledTime.toLocalDate().atStartOfDay()
            val dayEnd = request.scheduledTime.toLocalDate().atTime(23, 59, 59)
            val sameDay = appointmentRepository
                .findAllByPatientIdAndScheduledTimeBetween(
                    savedPatient.id!!, dayStart, dayEnd,
                )
            if (sameDay.isNotEmpty()) {
                val timeFmt = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH)
                val times = sameDay
                    .mapNotNull { it.scheduledTime?.format(timeFmt) }
                    .joinToString(", ")
                val suffix = if (times.isNotEmpty()) " at $times" else ""
                throw DuplicateAppointmentException(
                    "${savedPatient.name} already has an appointment on ${request.scheduledTime.toLocalDate()}$suffix",
                )
            }
        }

        val appointment = Appointment(
            patient = savedPatient,
            doctor = doctor,
            scheduledTime = request.scheduledTime,
            isWalkin = request.isWalkin,
            status = if (request.isWalkin) "WAITING" else "BOOKED",
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
        val appointment = appointmentRepository.findById(appointmentId).orElse(null)
            ?: throw IllegalArgumentException("Appointment not found")

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
        discountAmount: java.math.BigDecimal? = null,
        fee: java.math.BigDecimal? = null,
    ): AppointmentDTO {
        val appointment = appointmentRepository.findById(appointmentId).orElse(null)
            ?: throw IllegalArgumentException("Appointment not found")
        // Reject negative money — a malformed/forged PATCH must not persist
        // negative financials.
        val zero = java.math.BigDecimal.ZERO
        require(pharmacyAmount == null || pharmacyAmount >= zero) { "pharmacyAmount must be >= 0" }
        require(discountAmount == null || discountAmount >= zero) { "discountAmount must be >= 0" }
        require(fee == null || fee >= zero) { "fee must be >= 0" }
        appointment.payStatus = payStatus
        appointment.paymentMethod = paymentMethod
        // Only overwrite pharmacy_amount / discount / fee when the caller passes
        // a value (null = "don't touch"). Lets independent flows update
        // payment status without nuking each other's fields. `fee` is the
        // consultation/service bucket — the single bill writes it (net charged)
        // alongside pharmacyAmount so the two stay separate, no double-count.
        if (pharmacyAmount != null) appointment.pharmacyAmount = pharmacyAmount
        if (discountAmount != null) appointment.discountAmount = discountAmount
        if (fee != null) appointment.fee = fee
        val saved = appointmentRepository.save(appointment)
        // Auto-cover: a PAID bill draws the patient's advance down by up to the
        // bill total (fee + pharmacy − discount), recording a BILL_DEDUCTION.
        // Idempotent per appointment, so re-saving a paid bill won't re-charge
        // the deposit. WAIVED/DUE never consume the advance.
        if (payStatus.uppercase() == "PAID") {
            val billTotal = ((saved.fee ?: zero) + (saved.pharmacyAmount ?: zero) - (saved.discountAmount ?: zero)).max(zero)
            patientDepositService.applyToBill(saved, billTotal)
        }
        return saved.toDTO()
    }

    @Transactional
    fun updateStatus(appointmentId: UUID, status: String): AppointmentDTO {
        val appointment = appointmentRepository.findById(appointmentId).orElse(null)
            ?: throw IllegalArgumentException("Appointment not found")
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

    private fun Appointment.toDTO(todayBillCount: Int = 0): AppointmentDTO {
        return AppointmentDTO(
            id = this.id,
            patientId = this.patient?.id ?: UUID.randomUUID(),
            patientName = this.patient?.name ?: "Unknown Patient",
            patientPhone = this.patient?.phone ?: "N/A",
            patientEmail = this.patient?.email,
            patientGender = this.patient?.gender,
            patientDob = this.patient?.dob?.toString(),
            patientAge = this.patient?.age,
            patientDisplayNo = this.patient?.displayNo,
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
            patientArchived = this.patient?.deletedAt != null,
            createdAt = this.createdAt,
            // Amounts the queue's Bill editor seeds from the appointment/patient
            // (pharmacy total, bill-level discount, and the patient's advance so
            // it can auto-cover). Dropped in the schema-per-tenant rebase.
            pharmacyAmount = this.pharmacyAmount,
            discountAmount = this.discountAmount,
            patientDeposit = this.patient?.deposit,
            todayBillCount = todayBillCount,
        )
    }
}
