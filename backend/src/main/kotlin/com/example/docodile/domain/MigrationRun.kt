package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

/**
 * One completed data-migration run for a clinic. Written at the end of
 * every successful import so the Import data screen can show "your last
 * import" — what platform, how much, and when.
 */
@Entity
@Table(name = "migration_run")
class MigrationRun(
    @Id
    var id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clinic_id", nullable = false)
    var clinic: ClinicEntity? = null,

    var platform: String = "",
    var patients: Int = 0,
    var visits: Int = 0,
    var prescriptions: Int = 0,
    var medicines: Int = 0,
    var investigations: Int = 0,
    var skipped: Int = 0,

    @Column(name = "created_at")
    var createdAt: Instant? = null,
)
