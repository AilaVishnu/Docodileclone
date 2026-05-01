package com.example.docodile.repo

import com.example.docodile.domain.ClinicEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional
import java.util.UUID

interface ClinicEntityRepository : JpaRepository<ClinicEntity, UUID> {
    fun findByDomainIgnoreCase(domain: String): Optional<ClinicEntity>
    fun existsByDomainIgnoreCase(domain: String): Boolean
    fun findFirstByTenantId(tenantId: UUID): Optional<ClinicEntity>
    // Deterministic "default clinic" lookup for tenant admins — without an
    // ORDER BY, Postgres can return rows in any order, which made the
    // admin's JWT clinic_id flip between clinics on each login.
    fun findFirstByTenantIdOrderByCreatedAtAsc(tenantId: UUID): Optional<ClinicEntity>
    fun findAllByTenantId(tenantId: UUID): List<ClinicEntity>
    fun countByTenantId(tenantId: UUID): Long
}
