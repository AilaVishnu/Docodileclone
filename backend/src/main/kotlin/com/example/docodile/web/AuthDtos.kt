package com.example.docodile.web

import java.util.UUID


data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val role: String,
    val clinicId: UUID
)
