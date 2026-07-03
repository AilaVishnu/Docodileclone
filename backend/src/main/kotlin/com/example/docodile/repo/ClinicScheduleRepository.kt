package com.example.docodile.repo

import com.example.docodile.domain.ClinicSchedule
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ClinicScheduleRepository : JpaRepository<ClinicSchedule, UUID>
