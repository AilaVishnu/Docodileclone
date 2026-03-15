package com.example.docodile.web

import java.time.LocalDateTime
import java.util.UUID

data class AppointmentDTO(
    val id: UUID,
    val patientId: UUID,
    val patientName: String,
    val patientPhone: String,
    val doctorId: UUID,
    val scheduledTime: LocalDateTime?,
    val isWalkin: Boolean,
    val status: String?,
    val type: String?,
    val payStatus: String?,
    val notes: String?
)
