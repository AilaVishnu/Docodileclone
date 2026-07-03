package com.example.docodile.security

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
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
        val schema = "tskin"
        setPrincipal(
            AppUserPrincipal(
                userId = userId,
                schema = schema,
                role = "ADMIN",
                email = "user@example.com",
                passwordHash = "",
                active = true,
            )
        )

        assertEquals(userId, currentUser.userId())
        assertEquals(schema, currentUser.schema())
    }

    @Test
    fun `throws when no authentication is present`() {
        assertThrows(IllegalStateException::class.java) { currentUser.userId() }
        assertThrows(IllegalStateException::class.java) { currentUser.schema() }
    }
}
