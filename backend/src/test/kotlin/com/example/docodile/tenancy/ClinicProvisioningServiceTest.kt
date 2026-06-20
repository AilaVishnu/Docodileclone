package com.example.docodile.tenancy

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test

class ClinicProvisioningServiceTest : PgContainerTest() {

    private lateinit var service: ClinicProvisioningService

    @BeforeAll
    fun setupControlPlane() {
        val migrator = TenantMigrator(dataSource)
        migrator.migrateControlPlane()
        service = ClinicProvisioningService(dataSource, ClinicRegistryDao(dataSource), migrator)
    }

    private fun countPatients(schema: String): Int =
        dataSource.connection.use { c ->
            c.createStatement().use { it.execute("""SET search_path TO "$schema"""") }
            c.createStatement().use { st ->
                st.executeQuery("SELECT count(*) FROM patient").use { rs -> rs.next(); rs.getInt(1) }
            }
        }

    private fun insertPatient(schema: String, name: String) {
        dataSource.connection.use { c ->
            c.createStatement().use { it.execute("""SET search_path TO "$schema"""") }
            c.createStatement().use { it.execute("INSERT INTO patient (id, name) VALUES (gen_random_uuid(), '$name')") }
        }
    }

    @Test
    fun `provisioning two clinics yields isolated schemas`() {
        val acme = service.provision("Acme Skin", "acme", "admin@acme.test")
        val tskin = service.provision("T Skin", "tskin", "admin@tskin.test")

        assertEquals(ProvisioningStatus.ACTIVE, acme.status)
        assertEquals(ProvisioningStatus.ACTIVE, tskin.status)

        insertPatient("acme", "Alice")
        insertPatient("acme", "Bob")
        insertPatient("tskin", "Carol")

        assertEquals(2, countPatients("acme"))
        assertEquals(1, countPatients("tskin"))
    }

    @Test
    fun `duplicate subdomain rolls back with no orphan schema`() {
        service.provision("First", "dupe", "a@dupe.test")
        assertThrows(ProvisioningException::class.java) {
            service.provision("Second", "dupe", "b@dupe.test")
        }
        dataSource.connection.use { c ->
            c.prepareStatement(
                "SELECT count(*) FROM platform.clinic WHERE subdomain = 'dupe'"
            ).use { ps -> ps.executeQuery().use { rs -> rs.next(); assertEquals(1, rs.getInt(1)) } }
        }
    }
}
