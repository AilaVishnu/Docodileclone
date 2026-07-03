package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "service")
class Service(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(nullable = false, columnDefinition = "TEXT")
    var name: String = "",

    @Column(nullable = false, columnDefinition = "TEXT")
    var code: String = "",

    @Column(nullable = false)
    var price: BigDecimal = BigDecimal.ZERO,

    @Column(name = "duration_min", nullable = false)
    var durationMin: Int = 0,

    @Column(nullable = false)
    var discount: BigDecimal = BigDecimal.ZERO,

    // "%" or "₹" — keep as text so the frontend's mode picker maps 1:1.
    @Column(name = "discount_mode", nullable = false, length = 2)
    var discountMode: String = "%",

    @Column(nullable = false)
    var gst: BigDecimal = BigDecimal.ZERO,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now()
)
