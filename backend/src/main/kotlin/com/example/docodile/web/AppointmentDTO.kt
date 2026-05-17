package com.example.docodile.web

import java.time.LocalDateTime
import java.util.UUID

data class AppointmentDTO(
    val id: UUID,
    val patientId: UUID,
    val patientName: String,
    val patientPhone: String,
    val patientEmail: String?,
    val patientGender: String?,
    val patientDob: String?,
    val patientAge: Int?,
    val doctorId: UUID,
    val scheduledTime: LocalDateTime?,
    val isWalkin: Boolean,
    val status: String?,
    val type: String?,
    val service: String?,
    val payStatus: String?,
    val paymentMethod: String?,
    val notes: String?,
    val fee: java.math.BigDecimal?,
    // True if the linked patient has been archived. The appointment still
    // appears in the queue (so the receptionist can see who's checked in),
    // but the frontend blocks navigation into the prescription pad and
    // surfaces a "patient is archived" toast instead.
    val patientArchived: Boolean = false
)
