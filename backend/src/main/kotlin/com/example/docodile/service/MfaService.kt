package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.security.CurrentUser
import tools.jackson.databind.ObjectMapper
import dev.samstevens.totp.code.CodeGenerator
import dev.samstevens.totp.code.DefaultCodeGenerator
import dev.samstevens.totp.code.DefaultCodeVerifier
import dev.samstevens.totp.code.HashingAlgorithm
import dev.samstevens.totp.secret.DefaultSecretGenerator
import dev.samstevens.totp.time.SystemTimeProvider
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.SecureRandom
import java.util.Base64
import java.util.UUID

@Service
class MfaService(
    private val appUserRepository: AppUserRepository,
    private val currentUser: CurrentUser,
    private val auditService: AuditService,
    private val objectMapper: ObjectMapper,
) {
    private val secretGenerator = DefaultSecretGenerator()
    private val codeGenerator: CodeGenerator = DefaultCodeGenerator(HashingAlgorithm.SHA1)
    private val verifier = DefaultCodeVerifier(codeGenerator, SystemTimeProvider()).apply { setAllowedTimePeriodDiscrepancy(1) }
    private val backupEncoder = BCryptPasswordEncoder()

    data class EnrollmentResponse(val secret: String, val qrUri: String, val backupCodes: List<String>)

    @Transactional
    fun beginEnrollment(): EnrollmentResponse {
        val userId = currentUser.userId()
        val user = appUserRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        val secret = secretGenerator.generate()
        val rawBackupCodes = generateBackupCodes()

        user.totpSecret = secret
        user.mfaEnabled = false
        user.mfaBackupCodes = objectMapper.writeValueAsString(rawBackupCodes.map { backupEncoder.encode(it) })
        appUserRepository.save(user)

        val qrUri = buildQrUri(user.email, secret)
        auditService.log(AuditAction.MFA_ENROLLED, entityType = "AppUser", entityId = userId)
        return EnrollmentResponse(secret = secret, qrUri = qrUri, backupCodes = rawBackupCodes)
    }

    @Transactional
    fun confirmEnrollment(code: String): Boolean {
        val userId = currentUser.userId()
        val user = appUserRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        val secret = user.totpSecret ?: throw IllegalArgumentException("MFA enrollment not started")
        if (!verifier.isValidCode(secret, code)) return false

        user.mfaEnabled = true
        appUserRepository.save(user)
        auditService.log(AuditAction.MFA_VERIFIED, entityType = "AppUser", entityId = userId)
        return true
    }

    fun verifyCode(code: String): Boolean {
        val userId = currentUser.userId()
        val user = appUserRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        if (!user.mfaEnabled) return true // MFA not required for this user

        val secret = user.totpSecret ?: return false
        if (verifier.isValidCode(secret, code)) {
            auditService.log(AuditAction.MFA_VERIFIED, entityType = "AppUser", entityId = userId, actorId = userId)
            return true
        }
        // Try backup codes
        return verifyAndConsumeBackupCode(user, code)
    }

    private fun verifyAndConsumeBackupCode(user: com.example.docodile.domain.AppUser, code: String): Boolean {
        val hashes: List<String> = runCatching {
            @Suppress("UNCHECKED_CAST")
            objectMapper.readValue(user.mfaBackupCodes ?: "[]", List::class.java) as List<String>
        }.getOrElse { emptyList() }

        val matched = hashes.firstOrNull { backupEncoder.matches(code, it) } ?: return false
        val remaining = hashes.filter { it != matched }
        user.mfaBackupCodes = objectMapper.writeValueAsString(remaining)
        appUserRepository.save(user)
        return true
    }

    private fun buildQrUri(email: String, secret: String): String {
        val encodedLabel = java.net.URLEncoder.encode("Docodile:$email", "UTF-8")
        return "otpauth://totp/$encodedLabel?secret=$secret&issuer=Docodile&algorithm=SHA1&digits=6&period=30"
    }

    private fun generateBackupCodes(): List<String> {
        val random = SecureRandom()
        return (1..8).map {
            val bytes = ByteArray(6)
            random.nextBytes(bytes)
            Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
        }
    }
}
