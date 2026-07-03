package com.example.docodile.web

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val role: String,
    val gender: String?,
    val mfaPending: Boolean = false
)

data class ForgotPasswordRequest(
    val email: String,
)
