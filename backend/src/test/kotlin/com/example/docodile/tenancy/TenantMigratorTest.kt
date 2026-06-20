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

    @Test
    fun `tenant baseline creates domain tables with no clinic_id`() {
        val schema = "t_baseline_check"
        migrator().migrateTenant(schema)

        listOf("app_user", "patient", "appointment", "visit", "rx_row", "clinic_settings")
            .forEach { assertTrue(tableExists(schema, it), "missing $it") }

        assertTrue(!columnExists(schema, "patient", "clinic_id"), "patient still has clinic_id")
        assertTrue(!columnExists(schema, "appointment", "clinic_id"), "appointment still has clinic_id")
        assertTrue(!columnExists(schema, "app_user", "tenant_id"), "app_user still has tenant_id")

        // Broad check: ZERO columns named clinic_id or tenant_id anywhere in this tenant schema
        val strayColumns = dataSource.connection.use { c ->
            c.prepareStatement(
                """SELECT table_name, column_name
                   FROM information_schema.columns
                   WHERE table_schema = ?
                     AND column_name IN ('clinic_id', 'tenant_id')"""
            ).use { ps ->
                ps.setString(1, schema)
                ps.executeQuery().use { rs ->
                    val rows = mutableListOf<String>()
                    while (rs.next()) rows.add("${rs.getString(1)}.${rs.getString(2)}")
                    rows
                }
            }
        }
        assertTrue(strayColumns.isEmpty(), "Found discriminator columns: $strayColumns")
    }
}
