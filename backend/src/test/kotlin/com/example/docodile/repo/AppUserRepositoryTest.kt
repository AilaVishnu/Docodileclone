package com.example.docodile.repo

import com.example.docodile.domain.AppUser
import com.example.docodile.domain.Role
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.test.context.ActiveProfiles

@DataJpaTest
@ActiveProfiles("test")
class AppUserRepositoryTest @Autowired constructor(
    private val entityManager: TestEntityManager,
    private val appUserRepository: AppUserRepository
) {

    @Test
    fun `should find app user by email`() {
        val user = AppUser(
            email = "test@example.com",
            role = Role.ADMIN
        )
        entityManager.persist(user)
        entityManager.flush()

        val found = appUserRepository.findByEmail("test@example.com")
        assertTrue(found.isPresent)
        assertTrue(found.get().email == "test@example.com")
    }

    @Test
    fun `should check if email exists ignoring case`() {
        val user = AppUser(
            email = "Test@Example.Com",
            role = Role.ADMIN
        )
        entityManager.persist(user)
        entityManager.flush()

        assertTrue(appUserRepository.existsByEmailIgnoreCase("test@example.com"))
        assertTrue(appUserRepository.existsByEmailIgnoreCase("TEST@EXAMPLE.COM"))
    }

    @Test
    fun `should check if phone exists`() {
        val user = AppUser(
            email = "phone@example.com",
            phone = "1234567890",
            role = Role.RECEPTIONIST
        )
        entityManager.persist(user)
        entityManager.flush()

        assertTrue(appUserRepository.existsByPhone("1234567890"))
        assertFalse(appUserRepository.existsByPhone("0000000000"))
    }
}
