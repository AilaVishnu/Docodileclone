package com.example.docodile.service

import com.example.docodile.config.AppProperties
import com.example.docodile.domain.PasswordResetToken
import com.example.docodile.repo.PasswordResetTokenRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.security.MessageDigest
import java.time.Instant
import java.util.UUID

@ExtendWith(MockitoExtension::class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class PasswordTokenServiceTest {

    @Mock
    private lateinit var passwordResetTokenRepository: PasswordResetTokenRepository

    @Mock
    private lateinit var appProperties: AppProperties

    @InjectMocks
    private lateinit var passwordTokenService: PasswordTokenService

    private fun sha256Hex(input: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(input.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(it) }
    }

    // ---------------------------------------------------------------------
    // generateToken()
    // ---------------------------------------------------------------------

    @Test
    fun `generateToken persists a row and returns a raw token whose hash matches`() {
        val userId = UUID.randomUUID()
        whenever(appProperties.tokenExpiryHours).thenReturn(24)
        whenever(passwordResetTokenRepository.findAllByUserIdAndUsedAtIsNull(userId))
            .thenReturn(emptyList())

        val rawToken = passwordTokenService.generateToken(userId)

        assertTrue(rawToken.isNotEmpty())
        val captor = argumentCaptor<PasswordResetToken>()
        verify(passwordResetTokenRepository).save(captor.capture())
        val saved = captor.firstValue
        assertEquals(userId, saved.userId)
        assertEquals(sha256Hex(rawToken), saved.tokenHash)
        assertNull(saved.usedAt)
    }

    @Test
    fun `generateToken sets expiry based on configured tokenExpiryHours`() {
        val userId = UUID.randomUUID()
        whenever(appProperties.tokenExpiryHours).thenReturn(2)
        whenever(passwordResetTokenRepository.findAllByUserIdAndUsedAtIsNull(userId))
            .thenReturn(emptyList())

        val before = Instant.now()
        passwordTokenService.generateToken(userId)
        val after = Instant.now()

        val captor = argumentCaptor<PasswordResetToken>()
        verify(passwordResetTokenRepository).save(captor.capture())
        val expires = captor.firstValue.expiresAt
        assertTrue(expires.isAfter(before.plusSeconds(2 * 3600 - 5)))
        assertTrue(expires.isBefore(after.plusSeconds(2 * 3600 + 5)))
    }

    @Test
    fun `generateToken invalidates existing unused tokens for the user`() {
        val userId = UUID.randomUUID()
        val existing = PasswordResetToken(
            userId = userId,
            tokenHash = "old",
            expiresAt = Instant.now().plusSeconds(3600),
        )
        whenever(appProperties.tokenExpiryHours).thenReturn(24)
        whenever(passwordResetTokenRepository.findAllByUserIdAndUsedAtIsNull(userId))
            .thenReturn(listOf(existing))

        passwordTokenService.generateToken(userId)

        assertNotNull(existing.usedAt)
        verify(passwordResetTokenRepository).saveAll(any<List<PasswordResetToken>>())
    }

    @Test
    fun `generateToken does not call saveAll when there are no existing tokens`() {
        val userId = UUID.randomUUID()
        whenever(appProperties.tokenExpiryHours).thenReturn(24)
        whenever(passwordResetTokenRepository.findAllByUserIdAndUsedAtIsNull(userId))
            .thenReturn(emptyList())

        passwordTokenService.generateToken(userId)

        verify(passwordResetTokenRepository, never()).saveAll(any<List<PasswordResetToken>>())
    }

    @Test
    fun `generateToken produces distinct tokens on successive calls`() {
        val userId = UUID.randomUUID()
        whenever(appProperties.tokenExpiryHours).thenReturn(24)
        whenever(passwordResetTokenRepository.findAllByUserIdAndUsedAtIsNull(userId))
            .thenReturn(emptyList())

        val a = passwordTokenService.generateToken(userId)
        val b = passwordTokenService.generateToken(userId)

        org.junit.jupiter.api.Assertions.assertNotEquals(a, b)
    }

    // ---------------------------------------------------------------------
    // buildSetupLink()
    // ---------------------------------------------------------------------

    @Test
    fun `buildSetupLink composes URL from frontend url and token`() {
        whenever(appProperties.frontendUrl).thenReturn("https://app.docodile.com")

        val link = passwordTokenService.buildSetupLink("RAW123")

        assertEquals("https://app.docodile.com/setup-password?token=RAW123", link)
    }

    // ---------------------------------------------------------------------
    // validateToken()
    // ---------------------------------------------------------------------

    @Test
    fun `validateToken returns token for a valid unused unexpired token`() {
        val raw = "good-token"
        val token = PasswordResetToken(
            userId = UUID.randomUUID(),
            tokenHash = sha256Hex(raw),
            expiresAt = Instant.now().plusSeconds(3600),
        )
        whenever(passwordResetTokenRepository.findByTokenHash(sha256Hex(raw))).thenReturn(token)

        val result = passwordTokenService.validateToken(raw)

        assertSame(token, result)
    }

    @Test
    fun `validateToken throws for unknown token`() {
        whenever(passwordResetTokenRepository.findByTokenHash(any())).thenReturn(null)

        assertThrows(TokenInvalidException::class.java) {
            passwordTokenService.validateToken("nope")
        }
    }

    @Test
    fun `validateToken throws for an already used token`() {
        val raw = "used-token"
        val token = PasswordResetToken(
            userId = UUID.randomUUID(),
            tokenHash = sha256Hex(raw),
            expiresAt = Instant.now().plusSeconds(3600),
            usedAt = Instant.now().minusSeconds(60),
        )
        whenever(passwordResetTokenRepository.findByTokenHash(sha256Hex(raw))).thenReturn(token)

        assertThrows(TokenInvalidException::class.java) {
            passwordTokenService.validateToken(raw)
        }
    }

    @Test
    fun `validateToken throws for an expired token`() {
        val raw = "expired-token"
        val token = PasswordResetToken(
            userId = UUID.randomUUID(),
            tokenHash = sha256Hex(raw),
            expiresAt = Instant.now().minusSeconds(60),
        )
        whenever(passwordResetTokenRepository.findByTokenHash(sha256Hex(raw))).thenReturn(token)

        assertThrows(TokenInvalidException::class.java) {
            passwordTokenService.validateToken(raw)
        }
    }

    // ---------------------------------------------------------------------
    // markUsed()
    // ---------------------------------------------------------------------

    @Test
    fun `markUsed stamps usedAt and saves`() {
        val token = PasswordResetToken(
            userId = UUID.randomUUID(),
            tokenHash = "hash",
            expiresAt = Instant.now().plusSeconds(3600),
        )

        passwordTokenService.markUsed(token)

        assertNotNull(token.usedAt)
        verify(passwordResetTokenRepository).save(token)
    }
}
