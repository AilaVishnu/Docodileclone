package com.example.docodile.security

import com.example.docodile.config.JwtProperties
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.util.*

class TokenServiceTest {

    private lateinit var jwtProperties: JwtProperties
    private lateinit var tokenService: TokenService

    @BeforeEach
    fun setup() {
        jwtProperties = JwtProperties().apply {
            secret = "mysecretkeymustbeatleast32characterslongforsafehmacsha256"
            expirationMs = 3600000
        }
        tokenService = TokenService(jwtProperties)
    }

    @Test
    fun `should generate and validate token`() {
        val userId = UUID.randomUUID()
        val schema = "tskin"
        val role = "ADMIN"
        val email = "test@example.com"

        val token = tokenService.generateToken(userId, schema, role, email)
        assertNotNull(token)
        assertTrue(tokenService.validateToken(token))

        val claims = tokenService.parseClaims(token)
        assertEquals(userId.toString(), claims["user_id"])
        assertEquals(schema, claims["schema"])
        assertEquals(role, claims["role"])
    }

    @Test
    fun `should fail for invalid token`() {
        assertFalse(tokenService.validateToken("invalid.token.here"))
    }

    @Test
    fun `parsed claims expose email`() {
        val token = tokenService.generateToken(
            UUID.randomUUID(), "tskin", "DOCTOR", "doc@example.com"
        )
        val claims = tokenService.parseClaims(token)
        assertEquals("doc@example.com", claims["email"])
    }

    @Test
    fun `tampered token fails validation`() {
        val token = tokenService.generateToken(
            UUID.randomUUID(), "tskin", "ADMIN", "test@example.com"
        )
        val tampered = token + "junk"
        assertFalse(tokenService.validateToken(tampered))
    }

    @Test
    fun `extractJti returns a non-null uuid that differs between tokens`() {
        val token1 = tokenService.generateToken(
            UUID.randomUUID(), "tskin", "ADMIN", "a@example.com"
        )
        val token2 = tokenService.generateToken(
            UUID.randomUUID(), "tskin", "ADMIN", "b@example.com"
        )
        val jti1 = tokenService.extractJti(token1)
        val jti2 = tokenService.extractJti(token2)
        assertNotNull(jti1)
        assertNotNull(jti2)
        assertNotEquals(jti1, jti2)
    }

    @Test
    fun `mfa pending token is recognised and exposes user id`() {
        val userId = UUID.randomUUID()
        val pending = tokenService.generateMfaPendingToken(userId)
        val full = tokenService.generateToken(
            userId, "tskin", "ADMIN", "test@example.com"
        )

        assertTrue(tokenService.isMfaPendingToken(pending))
        assertFalse(tokenService.isMfaPendingToken(full))
        assertEquals(userId, tokenService.extractUserId(pending))
    }
}
