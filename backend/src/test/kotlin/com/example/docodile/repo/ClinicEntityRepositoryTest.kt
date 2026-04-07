package com.example.docodile.repo

import com.example.docodile.domain.ClinicEntity
import com.example.docodile.domain.Tenant
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import java.util.*

@DataJpaTest
@ActiveProfiles("test")
class ClinicEntityRepositoryTest @Autowired constructor(
    private val entityManager: TestEntityManager,
    private val clinicEntityRepository: ClinicEntityRepository
) {

    private lateinit var tenant: Tenant

    @BeforeEach
    fun setup() {
        tenant = Tenant(name = "Test Tenant")
        entityManager.persist(tenant)
        entityManager.flush()
    }

    @Test
    fun `should find clinic by domain ignoring case`() {
        val clinic = ClinicEntity(name = "Test Clinic", domain = "Test-Domain", tenant = tenant)
        entityManager.persist(clinic)
        entityManager.flush()

        val found = clinicEntityRepository.findByDomainIgnoreCase("test-domain")
        assertTrue(found.isPresent)
        assertEquals(clinic.id, found.get().id)
    }

    @Test
    fun `should check if domain exists ignoring case`() {
        val clinic = ClinicEntity(name = "Test Clinic", domain = "Sample.Com", tenant = tenant)
        entityManager.persist(clinic)
        entityManager.flush()

        assertTrue(clinicEntityRepository.existsByDomainIgnoreCase("sample.com"))
        assertFalse(clinicEntityRepository.existsByDomainIgnoreCase("unknown.com"))
    }

    @Test
    fun `should find first clinic by tenant id`() {
        val clinic1 = ClinicEntity(name = "Clinic 1", tenant = tenant)
        val clinic2 = ClinicEntity(name = "Clinic 2", tenant = tenant)
        entityManager.persist(clinic1)
        entityManager.persist(clinic2)
        entityManager.flush()

        val found = clinicEntityRepository.findFirstByTenantId(tenant.id)
        assertTrue(found.isPresent)
        assertEquals(clinic1.id, found.get().id)
    }

    @Test
    fun `should count clinics by tenant id`() {
        entityManager.persist(ClinicEntity(name = "C1", tenant = tenant))
        entityManager.persist(ClinicEntity(name = "C2", tenant = tenant))
        entityManager.flush()

        val count = clinicEntityRepository.countByTenantId(tenant.id)
        assertEquals(2, count)
    }
}
