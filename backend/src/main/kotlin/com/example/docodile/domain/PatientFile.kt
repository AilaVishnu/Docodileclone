package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.SQLRestriction
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "patient_files")
@SQLRestriction("deleted_at IS NULL")
class PatientFile(
    @Id
    var id: UUID = UUID.randomUUID(),

    @Column(name = "patient_id", nullable = false)
    var patientId: UUID = UUID.randomUUID(),

    @Column(name = "clinic_id", nullable = false)
    var clinicId: UUID = UUID.randomUUID(),

    @Column(name = "uploaded_by")
    var uploadedBy: UUID? = null,

    @Column(name = "name", nullable = false)
    var name: String = "",

    @Column(name = "category")
    var category: String? = null,

    @Column(name = "investigation_date")
    var investigationDate: LocalDate? = null,

    @Column(name = "mime_type")
    var mimeType: String? = null,

    @Column(name = "notes")
    var notes: String? = null,

    @Column(name = "file_data", nullable = false)
    var fileData: ByteArray = ByteArray(0),

    @Column(name = "file_size")
    var fileSize: Long? = null,

    @Column(name = "created_at")
    var createdAt: Instant = Instant.now(),

    @Column(name = "deleted_at")
    var deletedAt: Instant? = null,

    @Column(name = "deleted_by")
    var deletedBy: UUID? = null,
)
