package com.example.docodile.repo

import com.example.docodile.domain.DataSubjectRequest
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface DataSubjectRequestRepository : JpaRepository<DataSubjectRequest, UUID> {
    fun findAllByStatus(status: String): List<DataSubjectRequest>
    fun findAllByType(type: String): List<DataSubjectRequest>
    fun findAllByPatientId(patientId: UUID): List<DataSubjectRequest>
}
