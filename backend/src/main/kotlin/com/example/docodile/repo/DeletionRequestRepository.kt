package com.example.docodile.repo

import com.example.docodile.domain.DeletionRequest
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface DeletionRequestRepository : JpaRepository<DeletionRequest, UUID> {
    fun findAllByClinicId(clinicId: UUID): List<DeletionRequest>
    fun findAllByPatientId(patientId: UUID): List<DeletionRequest>
}
