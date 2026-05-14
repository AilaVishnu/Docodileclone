package com.example.docodile.web

import java.math.BigDecimal
import java.util.UUID

data class ServiceDTO(
    val id: UUID,
    val name: String,
    val code: String,
    val price: BigDecimal,
    val durationMin: Int,
    val discount: BigDecimal,
    val discountMode: String,
    val gst: BigDecimal
)

data class ServiceRequest(
    val name: String,
    val code: String,
    val price: BigDecimal = BigDecimal.ZERO,
    val durationMin: Int = 0,
    val discount: BigDecimal = BigDecimal.ZERO,
    val discountMode: String = "%",
    val gst: BigDecimal = BigDecimal.ZERO
)
