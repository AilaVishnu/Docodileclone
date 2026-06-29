package com.example.docodile.tenancy

import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Profile
import org.springframework.core.annotation.Order
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import javax.sql.DataSource

/**
 * Dev-only convenience seeder (profile `local`, which `./gradlew bootRun` activates).
 *
 * A wiped/fresh database has no clinics or users, so login is impossible until a tenant
 * is provisioned. This idempotently provisions a "T Skin" dev clinic (subdomain `tskin`)
 * and activates its admin with a known password, so `admin@tskin.test` / `Test1234` works
 * out of the box after a DB reset. Safe to delete — it only runs under the `local` profile
 * and skips entirely when the clinic already exists.
 *
 * Runs after TenantBootMigrationRunner so the control plane is ready.
 */
@Component
@Profile("local")
@Order(100)
class DevDataSeeder(
    private val registry: ClinicRegistryDao,
    private val provisioner: ClinicProvisioningService,
    private val passwordEncoder: PasswordEncoder,
    private val dataSource: DataSource,
) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(DevDataSeeder::class.java)

    private data class DevClinic(val name: String, val subdomain: String, val adminEmail: String, val password: String)

    private val seeds = listOf(
        DevClinic("T Skin", "tskin", "admin@tskin.test", "Test1234"),
    )

    override fun run(args: ApplicationArguments) {
        for (s in seeds) {
            try {
                if (registry.findBySubdomain(s.subdomain) != null) {
                    log.info("[dev-seed] clinic '{}' already present — skipping", s.subdomain)
                    continue
                }
                val rec = provisioner.provision(s.name, s.subdomain, s.adminEmail)
                activateAdmin(rec.schemaName, s.adminEmail, s.password)
                log.info("[dev-seed] provisioned '{}' — login {} / {}", s.subdomain, s.adminEmail, s.password)
            } catch (e: Exception) {
                // Never block boot on a dev convenience.
                log.warn("[dev-seed] failed to seed clinic '{}': {}", s.subdomain, e.message)
            }
        }
    }

    /** Set a usable password + ACTIVE status on the freshly-provisioned (PENDING_ACTIVATION) admin. */
    private fun activateAdmin(schema: String, email: String, password: String) {
        dataSource.connection.use { c ->
            try {
                c.createStatement().execute("""SET search_path TO "$schema"""")
                c.prepareStatement(
                    "UPDATE app_user SET password_hash = ?, account_status = 'ACTIVE', active = true WHERE email = ?"
                ).use { ps ->
                    ps.setString(1, passwordEncoder.encode(password))
                    ps.setString(2, email)
                    ps.executeUpdate()
                }
            } finally {
                runCatching { c.createStatement().use { it.execute("RESET search_path") } }
            }
        }
    }
}
