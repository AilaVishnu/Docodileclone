package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "appointment")
class Appointment(
    @Id
    var id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clinic_id", nullable = false)
    var clinic: ClinicEntity? = null,

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

    // Latest pharmacy bill total for this visit. Set by the Bill
    // Medicines flow; null when the patient hasn't been billed for meds
    // yet. Kept separate from `fee` so the Finance dashboard can split
    // consultation vs dispensary revenue.
    @Column(name = "pharmacy_amount")
    var pharmacyAmount: BigDecimal? = null,

    // Rupee discount applied at payment time (Pay Due / waiver). The
    // booking `fee` stays as the original quoted amount; collected
    // revenue is (fee + pharmacy_amount - discount_amount) for PAID
    // rows. Null when no discount was applied.
    @Column(name = "discount_amount")
    var discountAmount: BigDecimal? = null,

    var notes: String? = null,

    @Column(name = "created_at")
    var createdAt: Instant? = null
)
