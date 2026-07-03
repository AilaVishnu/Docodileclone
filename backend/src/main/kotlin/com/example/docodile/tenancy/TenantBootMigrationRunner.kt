package com.example.docodile.tenancy

import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component

/**
 * On startup: migrate the platform control plane, then bring every registered
 * ACTIVE clinic schema up to the latest tenant baseline. Idempotent — Flyway skips
 * already-applied migrations. Runs after Spring Boot's own (unrelated)
 * classpath:db/migration autoconfig.
 */
@Component
@Order(0)
class TenantBootMigrationRunner(
    private val migrator: TenantMigrator,
    private val registry: ClinicRegistryDao,
) : ApplicationRunner {
    override fun run(args: ApplicationArguments) {
        migrator.migrateControlPlane()
        // Any per-tenant migration failure is intentionally fatal: a partial boot (some tenants
        // live, some silently un-migrated) is worse than failing loudly. Don't wrap this in a
        // blanket try/catch without designing a resilient degraded mode first.
        registry.listActiveSchemas().forEach { migrator.migrateTenant(it) }
    }
}
