package com.example.docodile.tenancy

import org.junit.jupiter.api.Assertions.assertEquals
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

        // Present tables — core domain
        listOf("app_user", "patient", "appointment", "visit", "rx_row", "clinic_settings")
            .forEach { assertTrue(tableExists(schema, it), "missing $it") }

        // Present tables — new/merged from V54-V61
        listOf("audit_log", "user_session", "patient_consent", "data_subject_request", "suggestion")
            .forEach { assertTrue(tableExists(schema, it), "missing new table $it") }

        // Absent control-plane tables
        assertTrue(!tableExists(schema, "tenant"),          "tenant should not exist in tenant schema")
        assertTrue(!tableExists(schema, "clinic"),          "clinic should not exist in tenant schema")
        assertTrue(!tableExists(schema, "clinic_staff"),    "clinic_staff should not exist in tenant schema")

        // Absent dropped tables (rule 4: revoked_token; rule 5: merged into data_subject_request)
        assertTrue(!tableExists(schema, "revoked_token"),   "revoked_token must be dropped")
        assertTrue(!tableExists(schema, "deletion_request"), "deletion_request must be merged into data_subject_request")
        assertTrue(!tableExists(schema, "correction_request"), "correction_request must be merged into data_subject_request")

        // Broad check: ZERO columns named clinic_id or tenant_id anywhere in this tenant schema
        val strayDiscriminators = dataSource.connection.use { c ->
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
        assertTrue(strayDiscriminators.isEmpty(), "Found discriminator columns: $strayDiscriminators")

        // Broad check: ZERO actor/provenance columns created_by/updated_by/deleted_by (rule 6)
        val strayProvenance = dataSource.connection.use { c ->
            c.prepareStatement(
                """SELECT table_name, column_name
                   FROM information_schema.columns
                   WHERE table_schema = ?
                     AND column_name IN ('created_by', 'updated_by', 'deleted_by')"""
            ).use { ps ->
                ps.setString(1, schema)
                ps.executeQuery().use { rs ->
                    val rows = mutableListOf<String>()
                    while (rs.next()) rows.add("${rs.getString(1)}.${rs.getString(2)}")
                    rows
                }
            }
        }
        assertTrue(strayProvenance.isEmpty(), "Found provenance actor columns (rule 6): $strayProvenance")

        // Security columns from V57 (lockout) + V61 (TOTP) survived the squash
        assertTrue(columnExists(schema, "app_user", "failed_login_attempts"), "app_user missing failed_login_attempts")
        assertTrue(columnExists(schema, "app_user", "locked_until"),          "app_user missing locked_until")
        assertTrue(columnExists(schema, "app_user", "totp_secret"),           "app_user missing totp_secret")
        assertTrue(columnExists(schema, "app_user", "mfa_enabled"),           "app_user missing mfa_enabled")
        assertTrue(columnExists(schema, "app_user", "mfa_backup_codes"),      "app_user missing mfa_backup_codes")

        // patient.archived / patient.archived_at dropped (rule 7); deleted_at kept
        assertTrue(!columnExists(schema, "patient", "archived"),    "patient.archived must be dropped (rule 7)")
        assertTrue(!columnExists(schema, "patient", "archived_at"), "patient.archived_at must be dropped (rule 7)")
        assertTrue(columnExists(schema, "patient", "deleted_at"),   "patient.deleted_at must be present")
    }
}
