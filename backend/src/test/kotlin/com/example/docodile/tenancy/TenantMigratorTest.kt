package com.example.docodile.tenancy

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class TenantMigratorTest : PgContainerTest() {

    private fun migrator() = TenantMigrator(dataSource)

    private fun tableExists(schema: String, table: String): Boolean =
        dataSource.connection.use { c ->
            c.prepareStatement(
                "SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ?"
            ).use { ps ->
                ps.setString(1, schema); ps.setString(2, table)
                ps.executeQuery().use { it.next() }
            }
        }

    private fun columnExists(schema: String, table: String, column: String): Boolean =
        dataSource.connection.use { c ->
            c.prepareStatement(
                "SELECT 1 FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?"
            ).use { ps ->
                ps.setString(1, schema); ps.setString(2, table); ps.setString(3, column)
                ps.executeQuery().use { it.next() }
            }
        }

    @Test
    fun `control plane migration creates platform clinic registry`() {
        migrator().migrateControlPlane()
        assertTrue(tableExists("platform", "clinic"))
        assertTrue(tableExists("platform", "clinic_provisioning"))
    }
}
