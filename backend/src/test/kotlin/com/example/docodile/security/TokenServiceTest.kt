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
        val tenantId = UUID.randomUUID()
        val clinicId = UUID.randomUUID()
        val role = "ADMIN"
        val email = "test@example.com"

        val token = tokenService.generateToken(userId, tenantId, role, email, clinicId)
        assertNotNull(token)
        assertTrue(tokenService.validateToken(token))

        val claims = tokenService.parseClaims(token)
        assertEquals(userId.toString(), claims["user_id"])
        assertEquals(tenantId.toString(), claims["tenant_id"])
        assertEquals(clinicId.toString(), claims["clinic_id"])
        assertEquals(role, claims["role"])
    }

    @Test
    fun `should fail for invalid token`() {
        assertFalse(tokenService.validateToken("invalid.token.here"))
    }

    @Test
    fun `parsed claims expose email`() {
        val token = tokenService.generateToken(
            UUID.randomUUID(), UUID.randomUUID(), "DOCTOR", "doc@example.com", UUID.randomUUID()
        )
        val claims = tokenService.parseClaims(token)
        assertEquals("doc@example.com", claims["email"])
    }

    @Test
    fun `tampered token fails validation`() {
        val token = tokenService.generateToken(
            UUID.randomUUID(), UUID.randomUUID(), "ADMIN", "test@example.com", UUID.randomUUID()
        )
        val tampered = token + "junk"
        assertFalse(tokenService.validateToken(tampered))
    }

    @Test
    fun `extractJti returns a non-null uuid that differs between tokens`() {
        val token1 = tokenService.generateToken(
            UUID.randomUUID(), UUID.randomUUID(), "ADMIN", "a@example.com", UUID.randomUUID()
        )
        val token2 = tokenService.generateToken(
            UUID.randomUUID(), UUID.randomUUID(), "ADMIN", "b@example.com", UUID.randomUUID()
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
            userId, UUID.randomUUID(), "ADMIN", "test@example.com", UUID.randomUUID()
        )

        assertTrue(tokenService.isMfaPendingToken(pending))
        assertFalse(tokenService.isMfaPendingToken(full))
        assertEquals(userId, tokenService.extractUserId(pending))
    }
}
