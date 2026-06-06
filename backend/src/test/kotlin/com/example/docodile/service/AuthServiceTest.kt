package com.example.docodile.service

import com.example.docodile.domain.*
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.ClinicStaffRepository
import com.example.docodile.repo.RevokedTokenRepository
import com.example.docodile.repo.UserSessionRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.security.TokenService
import com.example.docodile.web.LoginRequest
import com.example.docodile.web.StaffLoginRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
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
    private lateinit var clinicEntityRepository: ClinicEntityRepository

    @Mock
    private lateinit var clinicStaffRepository: ClinicStaffRepository

    @Mock
    private lateinit var passwordEncoder: PasswordEncoder

    @Mock
    private lateinit var tokenService: TokenService

    @Mock
    private lateinit var currentUser: CurrentUser

    @Mock
    private lateinit var auditService: AuditService

    @Mock
    private lateinit var revokedTokenRepository: RevokedTokenRepository

    @Mock
    private lateinit var userSessionRepository: UserSessionRepository

    @InjectMocks
    private lateinit var authService: AuthService

    // ---------------------------------------------------------------------
    // login()
    // ---------------------------------------------------------------------

    @Test
    fun `login should succeed for valid admin credentials`() {
        val tenant = Tenant(id = UUID.randomUUID())
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            tenant = tenant,
            active = true
        )
        val clinic = ClinicEntity(id = UUID.randomUUID(), name = "Test Clinic", tenant = tenant)
        val request = LoginRequest(email = "admin@example.com", password = "password")

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))
        `when`(passwordEncoder.matches(request.password, user.passwordHash)).thenReturn(true)
        `when`(clinicEntityRepository.findFirstByTenantIdOrderByCreatedAtAsc(tenant.id))
            .thenReturn(Optional.of(clinic))
        `when`(tokenService.generateToken(user.id, tenant.id, user.role.name, user.email, clinic.id))
            .thenReturn("valid_token")

        val response = authService.login(request)

        assertEquals("valid_token", response.token)
        assertEquals("ADMIN", response.role)
        assertEquals(clinic.id, response.clinicId)
    }

    @Test
    fun `login should fail for non-admin role`() {
        val user = AppUser(
            email = "staff@example.com",
            passwordHash = "hashed_pw",
            role = Role.DOCTOR,
            active = true
        )
        val request = LoginRequest(email = "staff@example.com", password = "password")

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))

        assertThrows(BadCredentialsException::class.java) {
            authService.login(request)
        }
    }

    @Test
    fun `login should fail for inactive user`() {
        val tenant = Tenant(id = UUID.randomUUID())
        val user = AppUser(
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            tenant = tenant,
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
        val tenant = Tenant(id = UUID.randomUUID())
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            tenant = tenant,
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
            tenantId = tenant.id,
            metadata = mapOf("email" to request.email),
        )
    }

    @Test
    fun `login throws LockedException when account is locked`() {
        val tenant = Tenant(id = UUID.randomUUID())
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            tenant = tenant,
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
        val tenant = Tenant(id = UUID.randomUUID())
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            tenant = tenant,
            active = true
        )
        user.failedLoginAttempts = 3
        user.lockedUntil = null
        val clinic = ClinicEntity(id = UUID.randomUUID(), name = "Test Clinic", tenant = tenant)
        val request = LoginRequest(email = "admin@example.com", password = "password")

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))
        `when`(passwordEncoder.matches(request.password, user.passwordHash)).thenReturn(true)
        `when`(clinicEntityRepository.findFirstByTenantIdOrderByCreatedAtAsc(tenant.id))
            .thenReturn(Optional.of(clinic))
        `when`(tokenService.generateToken(user.id, tenant.id, user.role.name, user.email, clinic.id))
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
        val tenant = Tenant(id = UUID.randomUUID())
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            tenant = tenant,
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
            user.id, tenant.id, user.role.name, user.email, null
        )
    }

    // ---------------------------------------------------------------------
    // loginStaff()
    // ---------------------------------------------------------------------

    @Test
    fun `loginStaff should succeed for valid staff credentials and domain`() {
        val tenant = Tenant(id = UUID.randomUUID())
        val clinic = ClinicEntity(id = UUID.randomUUID(), name = "Clinic One", tenant = tenant)
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "staff@example.com",
            passwordHash = "hashed_pw",
            role = Role.DOCTOR,
            active = true
        )
        val request = StaffLoginRequest(domain = "clinic1", email = "staff@example.com", password = "password")

        `when`(clinicEntityRepository.findByDomainIgnoreCase("clinic1")).thenReturn(Optional.of(clinic))
        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))
        `when`(clinicStaffRepository.existsByIdClinicIdAndIdStaffId(clinic.id, user.id)).thenReturn(true)
        `when`(passwordEncoder.matches(request.password, user.passwordHash)).thenReturn(true)
        `when`(tokenService.generateToken(user.id, tenant.id, user.role.name, user.email, clinic.id))
            .thenReturn("staff_token")

        val response = authService.loginStaff(request)

        assertEquals("staff_token", response.token)
        assertEquals("DOCTOR", response.role)
        assertEquals(clinic.id, response.clinicId)
    }

    @Test
    fun `loginStaff should fail when user is not a clinic member`() {
        val tenant = Tenant(id = UUID.randomUUID())
        val clinic = ClinicEntity(id = UUID.randomUUID(), name = "Clinic One", tenant = tenant)
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "staff@example.com",
            passwordHash = "hashed_pw",
            role = Role.DOCTOR,
            active = true
        )
        val request = StaffLoginRequest(domain = "clinic1", email = "staff@example.com", password = "password")

        `when`(clinicEntityRepository.findByDomainIgnoreCase("clinic1")).thenReturn(Optional.of(clinic))
        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))
        `when`(clinicStaffRepository.existsByIdClinicIdAndIdStaffId(clinic.id, user.id)).thenReturn(false)

        assertThrows(BadCredentialsException::class.java) {
            authService.loginStaff(request)
        }
    }

    @Test
    fun `loginStaff should fail for admin role`() {
        val tenant = Tenant(id = UUID.randomUUID())
        val clinic = ClinicEntity(id = UUID.randomUUID(), name = "Clinic One", tenant = tenant)
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            active = true
        )
        val request = StaffLoginRequest(domain = "clinic1", email = "admin@example.com", password = "password")

        `when`(clinicEntityRepository.findByDomainIgnoreCase("clinic1")).thenReturn(Optional.of(clinic))
        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))

        assertThrows(BadCredentialsException::class.java) {
            authService.loginStaff(request)
        }
    }

    // ---------------------------------------------------------------------
    // logout() / logoutAll()
    // ---------------------------------------------------------------------

    @Test
    fun `logout saves a revoked token and logs logout`() {
        val userId = UUID.randomUUID()
        val jti = UUID.randomUUID()
        val token = "the.jwt.token"
        val bearer = "Bearer $token"

        `when`(tokenService.extractJti(token)).thenReturn(jti)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(tokenService.parseClaims(token)).thenThrow(RuntimeException("no expiry"))
        `when`(userSessionRepository.findByJti(jti)).thenReturn(null)

        authService.logout(bearer)

        verify(revokedTokenRepository, times(1)).save(any())
        verify(auditService, atLeastOnce()).log(action = AuditAction.LOGOUT)
    }

    @Test
    fun `logoutAll revokes all active sessions for current user`() {
        val userId = UUID.randomUUID()
        val session = UserSession(
            userId = userId,
            jti = UUID.randomUUID(),
            expiresAt = Instant.now().plusSeconds(3600),
        )

        `when`(currentUser.userId()).thenReturn(userId)
        `when`(userSessionRepository.findAllByUserIdAndRevokedAtIsNull(userId))
            .thenReturn(listOf(session))

        authService.logoutAll()

        verify(revokedTokenRepository, times(1)).save(any())
        verify(userSessionRepository, times(1)).revokeAllForUser(
            eq(userId),
            any()
        )
        assertNotNull(session.revokedAt)
    }

    // ---------------------------------------------------------------------
    // unlockAccount()
    // ---------------------------------------------------------------------

    @Test
    fun `unlockAccount resets lock state for same-tenant user and logs unlock`() {
        val tenant = Tenant(id = UUID.randomUUID())
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "locked@example.com",
            role = Role.DOCTOR,
            tenant = tenant,
            active = true,
        )
        user.failedLoginAttempts = 5
        user.lockedUntil = Instant.now().plusSeconds(600)

        `when`(currentUser.tenantId()).thenReturn(tenant.id)
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

    @Test
    fun `unlockAccount throws for cross-tenant user`() {
        val callerTenant = Tenant(id = UUID.randomUUID())
        val otherTenant = Tenant(id = UUID.randomUUID())
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "locked@example.com",
            role = Role.DOCTOR,
            tenant = otherTenant,
            active = true,
        )

        `when`(currentUser.tenantId()).thenReturn(callerTenant.id)
        `when`(appUserRepository.findById(user.id)).thenReturn(Optional.of(user))

        assertThrows(IllegalArgumentException::class.java) {
            authService.unlockAccount(user.id)
        }
    }

    // ---------------------------------------------------------------------
    // completeMfaLogin()
    // ---------------------------------------------------------------------

    @Test
    fun `completeMfaLogin issues full token then rejects replay of same token`() {
        val tenant = Tenant(id = UUID.randomUUID())
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            tenant = tenant,
            active = true,
            mfaEnabled = true,
        )
        val clinic = ClinicEntity(id = UUID.randomUUID(), name = "Test Clinic", tenant = tenant)
        val jti = UUID.randomUUID()
        val pendingToken = "pending.token"

        `when`(tokenService.isMfaPendingToken(pendingToken)).thenReturn(true)
        `when`(tokenService.extractUserId(pendingToken)).thenReturn(user.id)
        `when`(tokenService.extractJti(pendingToken)).thenReturn(jti)
        `when`(tokenService.parseClaims(pendingToken)).thenThrow(RuntimeException("no expiry"))
        // First call: not yet revoked. Second call: already revoked (replay).
        `when`(revokedTokenRepository.existsByJti(jti)).thenReturn(false).thenReturn(true)
        `when`(appUserRepository.findById(user.id)).thenReturn(Optional.of(user))
        `when`(clinicEntityRepository.findFirstByTenantIdOrderByCreatedAtAsc(tenant.id))
            .thenReturn(Optional.of(clinic))
        `when`(tokenService.generateToken(user.id, tenant.id, user.role.name, user.email, clinic.id))
            .thenReturn("full_token")

        val response = authService.completeMfaLogin(pendingToken)
        assertEquals("full_token", response.token)
        verify(revokedTokenRepository, times(1)).save(any())

        assertThrows(BadCredentialsException::class.java) {
            authService.completeMfaLogin(pendingToken)
        }
    }

    // ---------------------------------------------------------------------
    // BCrypt -> Argon2 upgrade on login
    // ---------------------------------------------------------------------

    @Test
    fun `login with bcrypt stored hash upgrades hash to argon2`() {
        val tenant = Tenant(id = UUID.randomUUID())
        val rawPassword = "password"
        val bcryptHash = BCryptPasswordEncoder().encode(rawPassword)
        val argon2Hash = "\$argon2id\$v=19\$re-encoded-hash"

        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = bcryptHash,
            role = Role.ADMIN,
            tenant = tenant,
            active = true
        )
        val clinic = ClinicEntity(id = UUID.randomUUID(), name = "Test Clinic", tenant = tenant)
        val request = LoginRequest(email = "admin@example.com", password = rawPassword)

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))
        `when`(passwordEncoder.encode(rawPassword)).thenReturn(argon2Hash)
        `when`(clinicEntityRepository.findFirstByTenantIdOrderByCreatedAtAsc(tenant.id))
            .thenReturn(Optional.of(clinic))
        `when`(tokenService.generateToken(user.id, tenant.id, user.role.name, user.email, clinic.id))
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
