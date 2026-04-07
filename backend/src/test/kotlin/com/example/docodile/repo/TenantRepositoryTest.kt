package com.example.docodile.repo

import com.example.docodile.domain.Tenant
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.test.context.ActiveProfiles

@DataJpaTest
@ActiveProfiles("test")
class TenantRepositoryTest @Autowired constructor(
    private val entityManager: TestEntityManager,
    private val tenantRepository: TenantRepository
) {

    @Test
    fun `should save and find tenant`() {
        val tenant = Tenant(name = "New Tenant")
        val saved = tenantRepository.save(tenant)
        
        val found = tenantRepository.findById(saved.id)
        assertTrue(found.isPresent)
        assertEquals("New Tenant", found.get().name)
    }
}
