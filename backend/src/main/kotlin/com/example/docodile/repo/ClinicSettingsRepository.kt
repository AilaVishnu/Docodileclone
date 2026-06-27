package com.example.docodile.repo

import com.example.docodile.domain.ClinicSettings
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ClinicSettingsRepository : JpaRepository<ClinicSettings, UUID>
