package com.example.docodile.web

import java.time.Instant
import java.time.LocalDate
import java.util.UUID

// One in-progress consultation, surfaced to the live "Active Sessions"
// indicator. Carries enough patient detail for the client to open the pad
// without a second fetch. `sessionStartedAt` is the source of truth for the
// elapsed timer (client renders now − sessionStartedAt).
data class ActiveSessionDTO(
    val visitId: UUID,
    val patientId: UUID,
    val appointmentId: UUID?,
    val sessionStartedAt: Instant,
    val name: String,
    val phone: String?,
    val email: String?,
    val gender: String?,
    val dob: LocalDate?,
    val age: Int?,
    val displayNo: Int?,
)
