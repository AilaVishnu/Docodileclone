package com.example.docodile.service

import com.example.docodile.config.AppProperties
import com.example.docodile.domain.PasswordResetToken
import com.example.docodile.repo.PasswordResetTokenRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.MessageDigest
import java.security.SecureRandom
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Base64
import java.util.UUID

class TokenInvalidException(message: String) : RuntimeException(message)

@Service
class PasswordTokenService(
    private val passwordResetTokenRepository: PasswordResetTokenRepository,
    private val appProperties: AppProperties,
) {
    @Transactional
    fun generateToken(userId: UUID): String {
        // Invalidate all existing unused tokens for this user
        val existing = passwordResetTokenRepository.findAllByUserIdAndUsedAtIsNull(userId)
        if (existing.isNotEmpty()) {
            existing.forEach { it.usedAt = Instant.now() }
            passwordResetTokenRepository.saveAll(existing)
        }

        val rawToken = generateSecureToken()
        val hash = sha256Hex(rawToken)
        val token = PasswordResetToken(
            userId = userId,
            tokenHash = hash,
            expiresAt = Instant.now().plus(appProperties.tokenExpiryHours, ChronoUnit.HOURS),
        )
        passwordResetTokenRepository.save(token)
        return rawToken
    }

    fun validateToken(rawToken: String): PasswordResetToken {
        val hash = sha256Hex(rawToken)
        val token = passwordResetTokenRepository.findByTokenHash(hash)
            ?: throw TokenInvalidException("Invalid or expired link")
        if (token.usedAt != null) throw TokenInvalidException("This link has already been used")
        if (Instant.now().isAfter(token.expiresAt)) throw TokenInvalidException("This link has expired")
        return token
    }

    @Transactional
    fun markUsed(token: PasswordResetToken) {
        token.usedAt = Instant.now()
        passwordResetTokenRepository.save(token)
    }

    fun buildSetupLink(rawToken: String): String =
        "${appProperties.frontendUrl}/setup-password?token=$rawToken"

    private fun generateSecureToken(): String {
        val bytes = ByteArray(32)
        SecureRandom().nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }

    private fun sha256Hex(input: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(input.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(it) }
    }
}
