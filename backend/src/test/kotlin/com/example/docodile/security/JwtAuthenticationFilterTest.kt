package com.example.docodile.security

import com.example.docodile.domain.UserSession
import com.example.docodile.repo.UserSessionRepository
import com.example.docodile.tenancy.TenantContext
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.context.SecurityContextHolder
import java.time.Instant
import java.util.*

@ExtendWith(MockitoExtension::class)
class JwtAuthenticationFilterTest {

    @Mock
    private lateinit var tokenService: TokenService

    @Mock
    private lateinit var userSessionRepository: UserSessionRepository

    @Mock
    private lateinit var request: HttpServletRequest

    @Mock
    private lateinit var response: HttpServletResponse

    @Mock
    private lateinit var filterChain: FilterChain

    @InjectMocks
    private lateinit var jwtAuthenticationFilter: JwtAuthenticationFilter

    @BeforeEach
    fun setup() {
        SecurityContextHolder.clearContext()
        TenantContext.set("tskin")
    }

    @AfterEach
    fun teardown() {
        SecurityContextHolder.clearContext()
        TenantContext.clear()
    }

    @Test
    fun `should authenticate with valid bearer token`() {
        val userId = UUID.randomUUID()
        val email = "user@example.com"
        val role = "ADMIN"
        val token = "valid-token"

        val claims = io.jsonwebtoken.Jwts.claims().apply {
            put("user_id", userId.toString())
            put("schema", "tskin")
            put("email", email)
            put("role", role)
        }

        `when`(request.getHeader("Authorization")).thenReturn("Bearer $token")
        `when`(tokenService.validateToken(token)).thenReturn(true)
        `when`(tokenService.extractJti(token)).thenReturn(null)
        `when`(tokenService.isMfaPendingToken(token)).thenReturn(false)
        `when`(tokenService.parseClaims(token)).thenReturn(claims)

        jwtAuthenticationFilter.doFilter(request, response, filterChain)

        val auth = SecurityContextHolder.getContext().authentication
        assertNotNull(auth)
        val principal = auth!!.principal as AppUserPrincipal
        assertEquals(userId, principal.userId)
        assertEquals(email, principal.username)
        assertEquals("ROLE_ADMIN", principal.authorities.first().authority)
        verify(filterChain).doFilter(request, response)
    }

    @Test
    fun `should not authenticate with invalid token`() {
        val token = "invalid-token"
        `when`(request.getHeader("Authorization")).thenReturn("Bearer $token")
        `when`(tokenService.validateToken(token)).thenReturn(false)

        jwtAuthenticationFilter.doFilter(request, response, filterChain)

        assertNull(SecurityContextHolder.getContext().authentication)
        verify(filterChain).doFilter(request, response)
    }

    @Test
    fun `should skip if no authorization header`() {
        `when`(request.getHeader("Authorization")).thenReturn(null)

        jwtAuthenticationFilter.doFilter(request, response, filterChain)

        assertNull(SecurityContextHolder.getContext().authentication)
        verify(filterChain).doFilter(request, response)
    }

    @Test
    fun `should set ROLE authority for valid token`() {
        val userId = UUID.randomUUID()
        val token = "valid-token"
        val jti = UUID.randomUUID()

        val claims = io.jsonwebtoken.Jwts.claims().apply {
            put("user_id", userId.toString())
            put("schema", "tskin")
            put("email", "doc@example.com")
            put("role", "DOCTOR")
        }

        `when`(request.getHeader("Authorization")).thenReturn("Bearer $token")
        `when`(tokenService.validateToken(token)).thenReturn(true)
        `when`(tokenService.extractJti(token)).thenReturn(jti)
        `when`(userSessionRepository.findByJti(jti)).thenReturn(null)
        `when`(tokenService.isMfaPendingToken(token)).thenReturn(false)
        `when`(tokenService.parseClaims(token)).thenReturn(claims)

        jwtAuthenticationFilter.doFilter(request, response, filterChain)

        val auth = SecurityContextHolder.getContext().authentication
        assertNotNull(auth)
        assertEquals("ROLE_DOCTOR", auth!!.authorities.first().authority)
        verify(filterChain).doFilter(request, response)
    }

    @Test
    fun `should reject revoked token`() {
        val token = "revoked-token"
        val jti = UUID.randomUUID()
        val revokedSession = UserSession(
            userId = UUID.randomUUID(),
            jti = jti,
            expiresAt = Instant.now().plusSeconds(3600),
            revokedAt = Instant.now(),
        )

        `when`(request.getHeader("Authorization")).thenReturn("Bearer $token")
        `when`(tokenService.validateToken(token)).thenReturn(true)
        `when`(tokenService.extractJti(token)).thenReturn(jti)
        `when`(userSessionRepository.findByJti(jti)).thenReturn(revokedSession)

        jwtAuthenticationFilter.doFilter(request, response, filterChain)

        assertNull(SecurityContextHolder.getContext().authentication)
        verify(filterChain).doFilter(request, response)
    }

    @Test
    fun `should reject mfa pending token on non-mfa path`() {
        val token = "mfa-pending-token"
        val jti = UUID.randomUUID()

        `when`(request.getHeader("Authorization")).thenReturn("Bearer $token")
        `when`(tokenService.validateToken(token)).thenReturn(true)
        `when`(tokenService.extractJti(token)).thenReturn(jti)
        `when`(userSessionRepository.findByJti(jti)).thenReturn(null)
        `when`(tokenService.isMfaPendingToken(token)).thenReturn(true)
        `when`(request.requestURI).thenReturn("/patients")

        jwtAuthenticationFilter.doFilter(request, response, filterChain)

        assertNull(SecurityContextHolder.getContext().authentication)
        verify(filterChain).doFilter(request, response)
    }
}
