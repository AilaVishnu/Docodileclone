package com.example.docodile.repo

import com.example.docodile.domain.CorrectionRequest
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface CorrectionRequestRepository : JpaRepository<CorrectionRequest, UUID> {
    fun findAllByClinicId(clinicId: UUID): List<CorrectionRequest>
    fun findAllByPatientId(patientId: UUID): List<CorrectionRequest>
}
