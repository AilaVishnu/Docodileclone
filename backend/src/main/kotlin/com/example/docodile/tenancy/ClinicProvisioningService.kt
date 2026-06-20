package com.example.docodile.tenancy

import org.springframework.stereotype.Service
import java.util.UUID
import javax.sql.DataSource

class ProvisioningException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)

@Service
class ClinicProvisioningService(
    private val dataSource: DataSource,
    private val registry: ClinicRegistryDao,
    private val migrator: TenantMigrator,
) {
    /**
     * Atomically provision a clinic:
     *   1. insert registry row (PROVISIONING)
     *   2. CREATE SCHEMA <slug>
     *   3. run tenant baseline migration on the schema
     *   4. seed clinic_settings + admin app_user inside the schema
     *   5. mark ACTIVE
     * On any failure, drop the schema and delete the registry row (compensating cleanup).
     *
     * Note: this is a compensating-transaction design, not a single DB transaction (CREATE
     * SCHEMA + Flyway can't share one). If the JVM dies mid-provision the cleanup may not run,
     * leaving a row stuck in PROVISIONING with no/partial schema — that's an accepted, rare gap
     * recoverable manually (drop the schema + row). Provisioning is infrequent.
     */
    fun provision(name: String, subdomain: String, adminEmail: String): ClinicRecord {
        val slug = slug(subdomain)
        val id = UUID.randomUUID()
        val rec = ClinicRecord(id, name, subdomain.lowercase(), slug, ProvisioningStatus.PROVISIONING)
        try {
            registry.insert(rec)   // inside try: a duplicate-subdomain failure is wrapped + cleaned up
            createSchema(slug)
            migrator.migrateTenant(slug)
            seedClinic(slug, name, adminEmail)
            registry.updateStatus(id, ProvisioningStatus.ACTIVE)
            return rec.copy(status = ProvisioningStatus.ACTIVE)
        } catch (e: Exception) {
            runCatching { dropSchema(slug) }
            runCatching { registry.delete(id) }
            throw ProvisioningException("Failed to provision clinic '$subdomain'", e)
        }
    }

    /** Slugify a subdomain into a safe Postgres identifier. This is the SINGLE validation
     *  point that protects TenantMigrator.migrateTenant from unsafe schema names. */
    fun slug(subdomain: String): String {
        val s = subdomain.lowercase().trim().replace(Regex("[^a-z0-9_]"), "_")
        require(s.isNotEmpty() && s.length <= 63) { "Invalid subdomain '$subdomain'" }
        require(s.first().isLetter()) { "Schema name must start with a letter: '$s'" }
        require(s !in RESERVED) { "Reserved schema name '$s'" }
        return s
    }

    private fun createSchema(slug: String) = exec("""CREATE SCHEMA "$slug"""")
    private fun dropSchema(slug: String) = exec("""DROP SCHEMA IF EXISTS "$slug" CASCADE""")

    private fun seedClinic(slug: String, name: String, adminEmail: String) {
        dataSource.connection.use { c ->
            try {
                c.createStatement().execute("""SET search_path TO "$slug"""")
                c.prepareStatement(
                    "INSERT INTO clinic_settings (id, name) VALUES (?, ?)"
                ).use { ps -> ps.setObject(1, UUID.randomUUID()); ps.setString(2, name); ps.executeUpdate() }
                c.prepareStatement(
                    "INSERT INTO app_user (id, email, role, active, account_status) VALUES (?, ?, 'ADMIN', true, 'PENDING_ACTIVATION')"
                ).use { ps -> ps.setObject(1, UUID.randomUUID()); ps.setString(2, adminEmail); ps.executeUpdate() }
            } finally {
                // Reset search_path before the connection returns to the pool, or a later
                // borrower inherits this clinic's schema (the search_path-hygiene risk).
                // runCatching + use{}: never mask the real exception, always close the Statement.
                runCatching { c.createStatement().use { it.execute("RESET search_path") } }
            }
        }
    }

    private fun exec(sql: String) =
        dataSource.connection.use { c -> c.createStatement().use { it.execute(sql) } }

    companion object {
        private val RESERVED = setOf("platform", "public", "pg_catalog", "information_schema")
    }
}
