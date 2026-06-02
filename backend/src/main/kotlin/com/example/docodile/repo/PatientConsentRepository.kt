package com.example.docodile.repo

import com.example.docodile.domain.PatientConsent
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PatientConsentRepository : JpaRepository<PatientConsent, UUID> {
    fun findAllByPatientIdAndClinicId(patientId: UUID, clinicId: UUID): List<PatientConsent>
}
