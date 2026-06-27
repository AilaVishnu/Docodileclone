package com.example.docodile.security

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.*

class AppUserPrincipalTest {

    private fun principal(
        role: String = "DOCTOR",
        active: Boolean = true,
        accountLocked: Boolean = false,
    ) = AppUserPrincipal(
        userId = UUID.randomUUID(),
        schema = "tskin",
        role = role,
        email = "user@example.com",
        passwordHash = "",
        active = active,
        accountLocked = accountLocked,
    )

    @Test
    fun `getAuthorities returns a single ROLE authority`() {
        val p = principal(role = "ADMIN")
        assertEquals(1, p.authorities.size)
        assertEquals("ROLE_ADMIN", p.authorities.first().authority)
    }

    @Test
    fun `isAccountNonLocked reflects accountLocked flag`() {
        assertFalse(principal(accountLocked = true).isAccountNonLocked)
        assertTrue(principal(accountLocked = false).isAccountNonLocked)
    }

    @Test
    fun `isEnabled reflects active flag`() {
        assertTrue(principal(active = true).isEnabled)
        assertFalse(principal(active = false).isEnabled)
    }
}
