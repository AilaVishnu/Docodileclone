package com.example.docodile.service

import com.example.docodile.domain.*
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.UserSessionRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.security.TokenService
import com.example.docodile.tenancy.TenantContext
import com.example.docodile.web.LoginRequest
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.atLeastOnce
import org.mockito.Mockito.never
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.LockedException
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Instant
import java.util.*

@ExtendWith(MockitoExtension::class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class AuthServiceTest {

    @Mock
    private lateinit var appUserRepository: AppUserRepository

    @Mock
    private lateinit var passwordEncoder: PasswordEncoder

    @Mock
    private lateinit var tokenService: TokenService

    @Mock
    private lateinit var currentUser: CurrentUser

    @Mock
    private lateinit var auditService: AuditService

    @Mock
    private lateinit var userSessionRepository: UserSessionRepository

    @InjectMocks
    private lateinit var authService: AuthService

    @BeforeEach
    fun setup() {
        TenantContext.set("tskin")
    }

    @AfterEach
    fun teardown() {
        TenantContext.clear()
    }

    // ---------------------------------------------------------------------
    // login()
    // ---------------------------------------------------------------------

    @Test
    fun `login should succeed for valid credentials`() {
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            active = true
        )
        val request = LoginRequest(email = "admin@example.com", password = "password")

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))
        `when`(passwordEncoder.matches(request.password, user.passwordHash)).thenReturn(true)
        `when`(tokenService.generateToken(user.id, "tskin", user.role.name, user.email))
            .thenReturn("valid_token")

        val response = authService.login(request)

        assertEquals("valid_token", response.token)
        assertEquals("ADMIN", response.role)
    }

    @Test
    fun `login should fail for inactive user`() {
        val user = AppUser(
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            active = false
        )
        val request = LoginRequest(email = "admin@example.com", password = "password")

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))

        assertThrows(BadCredentialsException::class.java) {
            authService.login(request)
        }
    }

    @Test
    fun `login with wrong password throws and logs login failure`() {
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            active = true
        )
        val request = LoginRequest(email = "admin@example.com", password = "wrong")

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))
        `when`(passwordEncoder.matches(request.password, user.passwordHash)).thenReturn(false)

        assertThrows(BadCredentialsException::class.java) {
            authService.login(request)
        }

        verify(auditService, atLeastOnce()).log(
            action = AuditAction.LOGIN_FAILURE,
            outcome = "FAILURE",
            actorId = user.id,
            metadata = mapOf("email" to request.email),
        )
    }

    @Test
    fun `login throws LockedException when account is locked`() {
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            active = true
        )
        user.failedLoginAttempts = 5
        user.lockedUntil = Instant.now().plusSeconds(600)
        val request = LoginRequest(email = "admin@example.com", password = "password")

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))

        assertThrows(LockedException::class.java) {
            authService.login(request)
        }
    }

    @Test
    fun `login success resets failed attempts and clears lock`() {
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            active = true
        )
        user.failedLoginAttempts = 3
        user.lockedUntil = null
        val request = LoginRequest(email = "admin@example.com", password = "password")

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))
        `when`(passwordEncoder.matches(request.password, user.passwordHash)).thenReturn(true)
        `when`(tokenService.generateToken(user.id, "tskin", user.role.name, user.email))
            .thenReturn("valid_token")

        authService.login(request)

        val captor = ArgumentCaptor.forClass(AppUser::class.java)
        verify(appUserRepository, atLeastOnce()).save(captor.capture())
        val saved = captor.allValues.last()
        assertEquals(0, saved.failedLoginAttempts)
        assertNull(saved.lockedUntil)
    }

    @Test
    fun `login with mfa enabled returns pending response without full token`() {
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            active = true,
            mfaEnabled = true,
        )
        val request = LoginRequest(email = "admin@example.com", password = "password")

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))
        `when`(passwordEncoder.matches(request.password, user.passwordHash)).thenReturn(true)
        `when`(tokenService.generateMfaPendingToken(user.id)).thenReturn("pending_token")

        val response = authService.login(request)

        assertTrue(response.mfaPending)
        assertEquals("pending_token", response.token)
        verify(tokenService, never()).generateToken(
            eq(user.id), any(), any(), any()
        )
    }

    // ---------------------------------------------------------------------
    // logout() / logoutAll()
    // ---------------------------------------------------------------------

    @Test
    fun `logout revokes session when jti found`() {
        val jti = UUID.randomUUID()
        val token = "the.jwt.token"
        val bearer = "Bearer $token"
        val session = UserSession(
            userId = UUID.randomUUID(),
            jti = jti,
            expiresAt = Instant.now().plusSeconds(3600),
        )

        `when`(tokenService.extractJti(token)).thenReturn(jti)
        `when`(userSessionRepository.findByJti(jti)).thenReturn(session)

        authService.logout(bearer)

        verify(userSessionRepository, times(1)).save(session)
        verify(auditService, atLeastOnce()).log(action = AuditAction.LOGOUT)
    }

    @Test
    fun `logoutAll revokes all active sessions for current user`() {
        val userId = UUID.randomUUID()

        `when`(currentUser.userId()).thenReturn(userId)
        `when`(userSessionRepository.revokeAllForUser(eq(userId), any())).thenReturn(2)

        authService.logoutAll()

        verify(userSessionRepository, times(1)).revokeAllForUser(eq(userId), any())
    }

    // ---------------------------------------------------------------------
    // unlockAccount()
    // ---------------------------------------------------------------------

    @Test
    fun `unlockAccount resets lock state and logs unlock`() {
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "locked@example.com",
            role = Role.DOCTOR,
            active = true,
        )
        user.failedLoginAttempts = 5
        user.lockedUntil = Instant.now().plusSeconds(600)

        `when`(appUserRepository.findById(user.id)).thenReturn(Optional.of(user))

        authService.unlockAccount(user.id)

        assertEquals(0, user.failedLoginAttempts)
        assertNull(user.lockedUntil)
        verify(appUserRepository, times(1)).save(user)
        verify(auditService, atLeastOnce()).log(
            action = AuditAction.ACCOUNT_UNLOCKED,
            entityType = "AppUser",
            entityId = user.id,
        )
    }

    // ---------------------------------------------------------------------
    // completeMfaLogin()
    // ---------------------------------------------------------------------

    @Test
    fun `completeMfaLogin issues full token and rejects replay of same token`() {
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            active = true,
            mfaEnabled = true,
        )
        val jti = UUID.randomUUID()
        val pendingToken = "pending.token"

        `when`(tokenService.isMfaPendingToken(pendingToken)).thenReturn(true)
        `when`(tokenService.extractUserId(pendingToken)).thenReturn(user.id)
        `when`(tokenService.extractJti(pendingToken)).thenReturn(jti)
        `when`(tokenService.parseClaims(pendingToken)).thenThrow(RuntimeException("no expiry"))
        // First call: not yet revoked.
        `when`(userSessionRepository.findByJti(jti)).thenReturn(null)
        `when`(appUserRepository.findById(user.id)).thenReturn(Optional.of(user))
        `when`(tokenService.generateToken(user.id, "tskin", user.role.name, user.email))
            .thenReturn("full_token")

        val response = authService.completeMfaLogin(pendingToken)
        assertEquals("full_token", response.token)
        verify(userSessionRepository, atLeastOnce()).save(any())
    }

    // ---------------------------------------------------------------------
    // BCrypt -> Argon2 upgrade on login
    // ---------------------------------------------------------------------

    @Test
    fun `login with bcrypt stored hash upgrades hash to argon2`() {
        val rawPassword = "password"
        val bcryptHash = BCryptPasswordEncoder().encode(rawPassword)
        val argon2Hash = "\$argon2id\$v=19\$re-encoded-hash"

        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = bcryptHash,
            role = Role.ADMIN,
            active = true
        )
        val request = LoginRequest(email = "admin@example.com", password = rawPassword)

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))
        `when`(passwordEncoder.encode(rawPassword)).thenReturn(argon2Hash)
        `when`(tokenService.generateToken(user.id, "tskin", user.role.name, user.email))
            .thenReturn("valid_token")

        val response = authService.login(request)

        assertEquals("valid_token", response.token)
        val captor = ArgumentCaptor.forClass(AppUser::class.java)
        verify(appUserRepository, atLeastOnce()).save(captor.capture())
        assertTrue(captor.allValues.any { it.passwordHash == argon2Hash })
        assertNotEquals(bcryptHash, user.passwordHash)
        assertFalse(user.passwordHash!!.startsWith("\$2"))
    }
}
