package com.example.docodile.repo

import com.example.docodile.domain.ClinicEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.List
import java.util.Optional
import java.util.UUID

interface ClinicEntityRepository : JpaRepository<ClinicEntity, UUID> {
    fun findByDomainIgnoreCase(domain: String): Optional<ClinicEntity>
    fun findAllByTenantId(tenantId: UUID): List<ClinicEntity>
}
