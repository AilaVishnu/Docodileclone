package com.example.docodile.security

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import java.util.*

class CurrentUserTest {

    private val currentUser = CurrentUser()

    @BeforeEach
    fun setup() {
        SecurityContextHolder.clearContext()
    }

    @AfterEach
    fun teardown() {
        SecurityContextHolder.clearContext()
    }

    private fun setPrincipal(principal: AppUserPrincipal) {
        val auth = UsernamePasswordAuthenticationToken(principal, null, principal.authorities)
        SecurityContextHolder.getContext().authentication = auth
    }

    @Test
    fun `returns ids from authenticated principal`() {
        val userId = UUID.randomUUID()
        val tenantId = UUID.randomUUID()
        val clinicId = UUID.randomUUID()
        setPrincipal(
            AppUserPrincipal(
                userId = userId,
                tenantId = tenantId,
                clinicId = clinicId,
                role = "ADMIN",
                email = "user@example.com",
                passwordHash = "",
                active = true,
            )
        )

        assertEquals(userId, currentUser.userId())
        assertEquals(tenantId, currentUser.tenantId())
        assertEquals(clinicId, currentUser.clinicId())
    }

    @Test
    fun `throws when no authentication is present`() {
        assertThrows(IllegalStateException::class.java) { currentUser.userId() }
        assertThrows(IllegalStateException::class.java) { currentUser.tenantId() }
        assertThrows(IllegalStateException::class.java) { currentUser.clinicId() }
    }

    @Test
    fun `clinicIdOrNull returns null when no authentication is present`() {
        assertNull(currentUser.clinicIdOrNull())
    }
}
