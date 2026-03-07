package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import java.io.Serializable
import java.util.UUID

@Embeddable
class ClinicStaffId(
    @Column(name = "clinic_id")
    var clinicId: UUID = UUID.randomUUID(),

    @Column(name = "staff_id")
    var staffId: UUID = UUID.randomUUID()
) : Serializable
