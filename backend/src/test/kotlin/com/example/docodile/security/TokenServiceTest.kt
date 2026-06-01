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
}
