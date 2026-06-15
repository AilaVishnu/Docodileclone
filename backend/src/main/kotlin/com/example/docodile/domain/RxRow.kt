package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.SQLRestriction
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

@EntityListeners(AuditingEntityListener::class)
@Entity
@Table(name = "rx_row")
@SQLRestriction("deleted_at IS NULL")
class RxRow(
    @Id
    var id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id", nullable = false)
    var visit: Visit? = null,

    @Column(nullable = false)
    var position: Short = 0,

    var medicine: String? = null,

    @Column(name = "medicine_note")
    var medicineNote: String? = null,

    var dosage: String? = null,

    @Column(name = "when_to_take")
    var whenToTake: String? = null,

    var frequency: String? = null,

    // Dosing interval (daily / weekly / monthly / stat / sos …) — the
    // "Frequency" dropdown on the pad. Distinct from `frequency` (the 1-0-1
    // per-day pattern). See V47.
    @Column(name = "frequency_interval")
    var frequencyInterval: String? = null,

    var duration: String? = null,

    var notes: String? = null,

    @Column(name = "created_at")
    var createdAt: Instant? = null,

    @Column(name = "deleted_at")
    var deletedAt: Instant? = null,

    @Column(name = "deleted_by")
    var deletedBy: UUID? = null,

    @LastModifiedDate
    @Column(name = "updated_at") var updatedAt: Instant? = null,
    @LastModifiedBy
    @Column(name = "updated_by") var updatedBy: UUID? = null,
)
