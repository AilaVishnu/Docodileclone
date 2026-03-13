package com.example.docodile.web

import java.util.UUID

data class StaffRequest(
    val id: UUID? = null,
    val name: String,
    val email: String,
    val phone: String,
    val gender: String,
    val role: String,
    val speciality: String? = null,
    val registrationNo: String? = null
)
