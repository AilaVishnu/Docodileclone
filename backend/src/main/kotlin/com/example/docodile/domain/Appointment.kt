package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.SQLRestriction
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "appointment")
@SQLRestriction("deleted_at IS NULL")
class Appointment(
    @Id
    var id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    var patient: Patient? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    var doctor: AppUser? = null,

    @Column(name = "scheduled_time")
    var scheduledTime: LocalDateTime? = null,

    @Column(name = "is_walkin")
    var isWalkin: Boolean = false,

    var status: String? = null,

    var type: String? = null,

    var service: String? = null,

    @Column(name = "pay_status")
    var payStatus: String? = null,

    @Column(name = "payment_method")
    var paymentMethod: String? = null,

    var fee: BigDecimal? = null,

    @Column(name = "pharmacy_amount")
    var pharmacyAmount: BigDecimal? = null,

    @Column(name = "discount_amount")
    var discountAmount: BigDecimal? = null,

    var notes: String? = null,

    @Column(name = "created_at")
    var createdAt: Instant? = null,

    @Column(name = "updated_at")
    var updatedAt: Instant? = null,

    @Column(name = "deleted_at")
    var deletedAt: Instant? = null,
)
