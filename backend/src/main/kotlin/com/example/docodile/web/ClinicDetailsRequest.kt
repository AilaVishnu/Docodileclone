package com.example.docodile.web

import java.util.UUID

data class ClinicDetailsRequest(
    val id: UUID?,
    val name: String,
    val address: String?,
    val phone: String?,
    val domain: String?,
    val speciality: String?
)
