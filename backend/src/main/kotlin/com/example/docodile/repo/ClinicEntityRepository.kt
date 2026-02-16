package com.example.docodile.repo

import com.example.docodile.domain.ClinicEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ClinicEntityRepository : JpaRepository<ClinicEntity, UUID>
