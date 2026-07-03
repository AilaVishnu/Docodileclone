package com.example.docodile.web

import java.util.UUID

// Doctor option for the Prescription "Refer to" picker. Returned as a flat
// list scoped to the caller's clinic (multi-tenant isolation enforced by
// service layer via currentUser.clinicId()).
data class DoctorDTO(
    val id: UUID,
    val name: String,
    val department: String?,
    val specialty: String?,
    val registrationNo: String?,
    val qualification: String?,
    val medicalCouncil: String?,
    val experienceYears: Int?
)
