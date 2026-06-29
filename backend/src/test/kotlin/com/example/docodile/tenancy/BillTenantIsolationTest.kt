package com.example.docodile.tenancy

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test

/**
 * Proves the new `bill` data-access path is tenant-isolated: a bill written under
 * one clinic's schema is invisible to another. The Bill repository carries no
 * `clinic_id` discriminator — isolation rides entirely on the per-schema
 * `search_path` set by [SchemaMultiTenantConnectionProvider], so a new table is
 * only as safe as that routing. This is the two-schema check contributing.md
 * requires for any new data path (docs/contributing.md → Testing standards).
 */
class BillTenantIsolationTest : PgContainerTest() {

    private lateinit var provider: SchemaMultiTenantConnectionProvider

    @BeforeAll
    fun setup() {
        val migrator = TenantMigrator(dataSource)
        migrator.migrateControlPlane()
        val svc = ClinicProvisioningService(dataSource, ClinicRegistryDao(dataSource), migrator)
        svc.provision("Acme", "acme", "a@acme.test")
        svc.provision("T Skin", "tskin", "a@tskin.test")
        provider = SchemaMultiTenantConnectionProvider(dataSource)
    }

    private fun insertPatient(schema: String, name: String): String {
        val c = provider.getConnection(schema)
        try {
            c.createStatement().use { st ->
                st.executeQuery("INSERT INTO patient (id, name) VALUES (gen_random_uuid(), '$name') RETURNING id").use { rs ->
                    rs.next(); return rs.getString(1)
                }
            }
        } finally { provider.releaseConnection(schema, c) }
    }

    private fun insertBill(schema: String, patientId: String, invoiceNo: String, seq: Int) {
        val c = provider.getConnection(schema)
        try {
            c.createStatement().use {
                it.execute(
                    "INSERT INTO bill (id, patient_id, invoice_no, seq, bill_date, billed, paid, due, refund, created_at) " +
                        "VALUES (gen_random_uuid(), '$patientId', '$invoiceNo', $seq, CURRENT_DATE, 100, 100, 0, 0, now())",
                )
            }
        } finally { provider.releaseConnection(schema, c) }
    }

    private fun countBills(schema: String): Int {
        val c = provider.getConnection(schema)
        try {
            c.createStatement().use { st ->
                st.executeQuery("SELECT count(*) FROM bill").use { rs -> rs.next(); return rs.getInt(1) }
            }
        } finally { provider.releaseConnection(schema, c) }
    }

    @Test
    fun `bills written under one clinic are invisible to another`() {
        val ashaId = insertPatient("acme", "Asha")
        insertBill("acme", ashaId, "INV_0001", 1)
        insertBill("acme", ashaId, "INV_0002", 2)

        val raviId = insertPatient("tskin", "Ravi")
        insertBill("tskin", raviId, "INV_0001", 1)

        // Each clinic sees only its own invoices — seq numbering is per-schema too.
        assertEquals(2, countBills("acme"))
        assertEquals(1, countBills("tskin"))
    }
}
