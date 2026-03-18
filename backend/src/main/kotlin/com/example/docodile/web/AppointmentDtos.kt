package com.example.docodile.web

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

// ============ Patient DTOs ============

data class PatientDto(
    val id: UUID,
    val name: String,
    val phone: String?,
    val gender: String?,
    val dob: LocalDate?,
    val age: Int?
)

data class CreatePatientRequest(
    val name: String,
    val phone: String,
    val gender: String?,
    val dob: LocalDate?,
    val age: Int?
)

data class PatientSearchResult(
    val id: UUID,
    val name: String,
    val phone: String?,
    val gender: String?,
    val age: Int?
)

// ============ Appointment DTOs ============

enum class AppointmentStatus {
    WAITING,
    IN_CONSULTATION,
    DONE,
    CANCELLED
}

enum class AppointmentType {
    CONSULTATION,
    REVIEW
}

enum class PaymentStatus {
    PENDING,
    PAID
}

enum class PaymentMode {
    CASH,
    UPI,
    CARD
}

data class AppointmentDto(
    val id: UUID,
    val patient: PatientDto,
    val doctorId: UUID,
    val doctorName: String?,
    val scheduledTime: LocalDateTime?,
    val status: AppointmentStatus,
    val type: AppointmentType,
    val fee: BigDecimal?,
    val paymentStatus: PaymentStatus,
    val paymentMode: PaymentMode?,
    val notes: String?,
    val tokenNumber: Int?
)

data class CreateAppointmentRequest(
    val patientId: UUID?,              // null for new patient
    val newPatient: CreatePatientRequest?,  // provided if patientId is null
    val doctorId: UUID,
    val scheduledTime: LocalDateTime?,  // null for walk-in (immediate)
    val type: AppointmentType,
    val fee: BigDecimal?,
    val paymentStatus: PaymentStatus = PaymentStatus.PENDING,
    val paymentMode: PaymentMode?,
    val notes: String?
)

data class UpdateAppointmentStatusRequest(
    val status: AppointmentStatus
)

data class QueueSummary(
    val waiting: Int,
    val inConsultation: Int,
    val done: Int,
    val total: Int
)

data class TodayQueueResponse(
    val appointments: List<AppointmentDto>,
    val summary: QueueSummary
)
