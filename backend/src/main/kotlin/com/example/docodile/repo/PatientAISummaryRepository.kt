package com.example.docodile.repo

import com.example.docodile.domain.PatientAISummary
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PatientAISummaryRepository : JpaRepository<PatientAISummary, UUID>
