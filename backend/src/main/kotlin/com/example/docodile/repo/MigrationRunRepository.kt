package com.example.docodile.repo

import com.example.docodile.domain.MigrationRun
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface MigrationRunRepository : JpaRepository<MigrationRun, UUID> {
    // The clinic's most recent migration — drives the "last import" card.
    fun findFirstByClinicIdOrderByCreatedAtDesc(clinicId: UUID): MigrationRun?
}
