package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "pharmacy_stock")
class PharmacyStock(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(nullable = false, columnDefinition = "TEXT")
    var name: String = "",

    @Column(nullable = false, columnDefinition = "TEXT")
    var category: String = "Tablets",

    @Column(nullable = false, columnDefinition = "TEXT")
    var form: String = "tablet",

    @Column(name = "invoice_no", columnDefinition = "TEXT")
    var invoiceNo: String? = null,

    @Column(columnDefinition = "TEXT")
    var batch: String? = null,

    @Column(name = "pack_price", nullable = false)
    var packPrice: BigDecimal = BigDecimal.ZERO,

    @Column(name = "pack_mrp", nullable = false)
    var packMrp: BigDecimal = BigDecimal.ZERO,

    @Column(name = "units_per_pack", nullable = false)
    var unitsPerPack: Int = 1,

    @Column(name = "unit_price", nullable = false)
    var unitPrice: BigDecimal = BigDecimal.ZERO,

    @Column(name = "units_in_stock", nullable = false)
    var unitsInStock: Int = 0,

    @Column(nullable = false, length = 7)
    var expiry: String = "",

    @Column(name = "discount_pct", nullable = false)
    var discountPct: BigDecimal = BigDecimal.ZERO,

    @Column(name = "gst_pct", nullable = false)
    var gstPct: BigDecimal = BigDecimal.ZERO,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
