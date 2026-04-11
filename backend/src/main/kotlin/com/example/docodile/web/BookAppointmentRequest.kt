package com.example.docodile.web

import java.time.LocalDateTime
import java.util.UUID

data class BookAppointmentRequest(
    val patientName: String,
    val patientEmail: String? = null,
    val patientPhone: String? = null,
    val patientGender: String? = null,
    val patientDob: String? = null,
    val patientAge: Int? = null,
    val doctorId: UUID,
    val scheduledTime: LocalDateTime,
    val type: String? = "New",
    val service: String? = "Consultation",
    val isWalkin: Boolean = false,
    val paymentMethod: String? = null,
    val notes: String? = null,
    val fee: java.math.BigDecimal? = null,
    val payStatus: String? = "Unpaid"
)
