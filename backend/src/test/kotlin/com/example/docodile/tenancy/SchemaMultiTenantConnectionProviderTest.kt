package com.example.docodile.tenancy

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test

class SchemaMultiTenantConnectionProviderTest : PgContainerTest() {

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

    private fun insertPatient(schema: String, name: String) {
        val c = provider.getConnection(schema)
        try {
            c.createStatement().use { it.execute("INSERT INTO patient (id, name) VALUES (gen_random_uuid(), '$name')") }
        } finally { provider.releaseConnection(schema, c) }
    }

    private fun countPatients(schema: String): Int {
        val c = provider.getConnection(schema)
        try {
            c.createStatement().use { st ->
                st.executeQuery("SELECT count(*) FROM patient").use { rs -> rs.next(); return rs.getInt(1) }
            }
        } finally { provider.releaseConnection(schema, c) }
    }

    @Test
    fun `getConnection routes to the named schema and isolates tenants`() {
        insertPatient("acme", "Alice")
        insertPatient("acme", "Bob")
        insertPatient("tskin", "Carol")
        assertEquals(2, countPatients("acme"))
        assertEquals(1, countPatients("tskin"))
    }

    @Test
    fun `releaseConnection resets search_path so a pooled connection does not leak tenant scope`() {
        val c1 = provider.getConnection("acme"); provider.releaseConnection("acme", c1)
        dataSource.connection.use { raw ->
            raw.createStatement().use { st ->
                st.executeQuery("SHOW search_path").use { rs -> rs.next()
                    val sp = rs.getString(1)
                    assert(!sp.contains("acme")) { "search_path leaked: $sp" }
                }
            }
        }
    }
}
