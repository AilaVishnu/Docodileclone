package com.example.docodile.service

import com.example.docodile.domain.AppUser
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.security.TokenService
import dev.samstevens.totp.code.DefaultCodeGenerator
import dev.samstevens.totp.secret.DefaultSecretGenerator
import dev.samstevens.totp.time.SystemTimeProvider
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.Mock
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import tools.jackson.databind.ObjectMapper
import java.time.Instant
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class MfaServiceTest {

    @Mock
    private lateinit var appUserRepository: AppUserRepository

    @Mock
    private lateinit var currentUser: CurrentUser

    @Mock
    private lateinit var auditService: AuditService

    @Mock
    private lateinit var tokenService: TokenService

    private val objectMapper = ObjectMapper()

    private lateinit var mfaService: MfaService

    private val bcrypt = BCryptPasswordEncoder()

    @org.junit.jupiter.api.BeforeEach
    fun setUp() {
        mfaService = MfaService(appUserRepository, currentUser, auditService, objectMapper, tokenService)
    }

    private fun validCodeFor(secret: String): String =
        DefaultCodeGenerator().generate(secret, SystemTimeProvider().time / 30)

    private fun newUser(id: UUID = UUID.randomUUID()): AppUser =
        AppUser(id = id, email = "doc@example.com")

    // ---- beginEnrollment ----

    @Test
    fun `beginEnrollment returns a valid otpauth uri, secret and 8 backup codes and saves user disabled`() {
        val userId = UUID.randomUUID()
        val user = newUser(userId)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(user))

        val response = mfaService.beginEnrollment()

        assertTrue(response.qrUri.startsWith("otpauth://totp/"), "qrUri should be an otpauth totp uri")
        assertTrue(response.secret.isNotBlank(), "secret should be non-blank")
        assertEquals(8, response.backupCodes.size, "should generate exactly 8 backup codes")

        val captor = ArgumentCaptor.forClass(AppUser::class.java)
        verify(appUserRepository).save(captor.capture())
        val saved = captor.value
        assertNotNull(saved.totpSecret, "totpSecret should be set on the saved user")
        assertFalse(saved.mfaEnabled, "mfaEnabled should remain false until confirmed")
    }

    // ---- confirmEnrollment ----

    @Test
    fun `confirmEnrollment with a valid code enables mfa and returns true`() {
        val userId = UUID.randomUUID()
        val secret = DefaultSecretGenerator().generate()
        val user = newUser(userId).apply { totpSecret = secret }
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(user))

        val result = mfaService.confirmEnrollment(validCodeFor(secret))

        assertTrue(result)
        assertTrue(user.mfaEnabled, "mfaEnabled should be set to true")
        verify(appUserRepository).save(user)
    }

    @Test
    fun `confirmEnrollment with a wrong code returns false and does not enable mfa`() {
        val userId = UUID.randomUUID()
        val secret = DefaultSecretGenerator().generate()
        val user = newUser(userId).apply { totpSecret = secret }
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(user))

        val result = mfaService.confirmEnrollment("000000")

        assertFalse(result)
        assertFalse(user.mfaEnabled, "mfaEnabled should remain false on an invalid code")
        verify(appUserRepository, never()).save(user)
    }

    // ---- verifyCode ----

    @Test
    fun `verifyCode returns true when mfa is not enabled for the user`() {
        val userId = UUID.randomUUID()
        val user = newUser(userId).apply { mfaEnabled = false }
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(user))

        assertTrue(mfaService.verifyCode("anything"))
    }

    @Test
    fun `verifyCode returns true for a valid totp when mfa enabled`() {
        val userId = UUID.randomUUID()
        val secret = DefaultSecretGenerator().generate()
        val user = newUser(userId).apply {
            mfaEnabled = true
            totpSecret = secret
        }
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(user))

        assertTrue(mfaService.verifyCode(validCodeFor(secret)))
    }

    @Test
    fun `verifyCode returns false for an invalid code with no matching backup`() {
        val userId = UUID.randomUUID()
        val secret = DefaultSecretGenerator().generate()
        val user = newUser(userId).apply {
            mfaEnabled = true
            totpSecret = secret
            mfaBackupCodes = "[]"
        }
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(user))

        assertFalse(mfaService.verifyCode("000000"))
    }

    @Test
    fun `verifyCode consumes a matching backup code and returns true`() {
        val userId = UUID.randomUUID()
        val secret = DefaultSecretGenerator().generate()
        val rawBackup = "MY-BACKUP-CODE"
        val hash: String = bcrypt.encode(rawBackup)!!
        val user = newUser(userId).apply {
            mfaEnabled = true
            totpSecret = secret
            mfaBackupCodes = objectMapper.writeValueAsString(listOf(hash))
        }
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(user))

        val result = mfaService.verifyCode(rawBackup)

        assertTrue(result)
        val captor = ArgumentCaptor.forClass(AppUser::class.java)
        verify(appUserRepository).save(captor.capture())
        assertFalse(
            captor.value.mfaBackupCodes!!.contains(hash),
            "consumed backup code hash should be removed from the user",
        )
    }

    // ---- verifyFromPendingToken ----

    @Test
    fun `verifyFromPendingToken returns null when token is not an mfa pending token`() {
        val token = "not-a-pending-token"
        `when`(tokenService.isMfaPendingToken(token)).thenReturn(false)

        assertNull(mfaService.verifyFromPendingToken(token, "123456"))
    }

    @Test
    fun `verifyFromPendingToken returns null when the account is locked`() {
        val userId = UUID.randomUUID()
        val token = "pending-token"
        val secret = DefaultSecretGenerator().generate()
        val user = newUser(userId).apply {
            mfaEnabled = true
            totpSecret = secret
            lockedUntil = Instant.now().plusSeconds(600)
        }
        `when`(tokenService.isMfaPendingToken(token)).thenReturn(true)
        `when`(tokenService.extractUserId(token)).thenReturn(userId)
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(user))

        assertNull(mfaService.verifyFromPendingToken(token, validCodeFor(secret)))
    }

    @Test
    fun `verifyFromPendingToken locks the account after the fifth invalid code`() {
        val userId = UUID.randomUUID()
        val token = "pending-token"
        val secret = DefaultSecretGenerator().generate()
        val user = newUser(userId).apply {
            mfaEnabled = true
            totpSecret = secret
            failedLoginAttempts = 4
        }
        `when`(tokenService.isMfaPendingToken(token)).thenReturn(true)
        `when`(tokenService.extractUserId(token)).thenReturn(userId)
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(user))

        val result = mfaService.verifyFromPendingToken(token, "000000")

        assertNull(result)
        assertEquals(5, user.failedLoginAttempts)
        val captor = ArgumentCaptor.forClass(AppUser::class.java)
        verify(appUserRepository).save(captor.capture())
        assertNotNull(captor.value.lockedUntil, "account should be locked after the 5th failure")
        assertTrue(captor.value.lockedUntil!!.isAfter(Instant.now()))
    }

    @Test
    fun `verifyFromPendingToken returns userId and resets failures on a valid code`() {
        val userId = UUID.randomUUID()
        val token = "pending-token"
        val secret = DefaultSecretGenerator().generate()
        val user = newUser(userId).apply {
            mfaEnabled = true
            totpSecret = secret
            failedLoginAttempts = 3
        }
        `when`(tokenService.isMfaPendingToken(token)).thenReturn(true)
        `when`(tokenService.extractUserId(token)).thenReturn(userId)
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(user))

        val result = mfaService.verifyFromPendingToken(token, validCodeFor(secret))

        assertEquals(userId, result)
        assertEquals(0, user.failedLoginAttempts, "failed attempts should reset to 0 on success")
    }
}
