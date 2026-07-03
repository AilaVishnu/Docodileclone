package com.example.docodile.tenancy

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.boot.DefaultApplicationArguments

class TenantBootMigrationRunnerTest : PgContainerTest() {

    // Spring Boot 4.x (Spring Framework 7) made ApplicationArguments non-nullable in the
    // ApplicationRunner interface, so we pass a no-op DefaultApplicationArguments instead of null.
    private val noArgs = DefaultApplicationArguments()

    private fun tableExists(schema: String, table: String): Boolean =
        dataSource.connection.use { c ->
            c.prepareStatement(
                "SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ?"
            ).use { ps ->
                ps.setString(1, schema); ps.setString(2, table)
                ps.executeQuery().use { it.next() }
            }
        }

    @Test
    fun `runner migrates control plane and active tenant schemas idempotently`() {
        val migrator = TenantMigrator(dataSource)
        val registry = ClinicRegistryDao(dataSource)
        val provisioner = ClinicProvisioningService(dataSource, registry, migrator)
        val runner = TenantBootMigrationRunner(migrator, registry)

        // First boot: sets up control plane.
        runner.run(noArgs)
        assertTrue(tableExists("platform", "clinic"))

        // Provision an ACTIVE clinic, then simulate a SUBSEQUENT boot: the runner should
        // (re)migrate the active schema with no error (idempotent) and the baseline tables must exist.
        provisioner.provision("Boot Clinic", "bootclinic", "admin@bootclinic.test")
        runner.run(noArgs)   // second boot — must be idempotent, no exception
        assertTrue(tableExists("bootclinic", "app_user"))
        assertTrue(tableExists("bootclinic", "patient"))
    }
}
