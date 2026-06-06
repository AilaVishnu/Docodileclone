package com.example.docodile.service

import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.env.Environment
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.util.Base64
import java.util.UUID
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * AES-256-GCM encryption for patient file blobs.
 *
 * Storage format (encrypted): MAGIC(4) + IV(12) + GCM-ciphertext+tag
 * MAGIC = 0x45 0x4E 0x43 0x31 ("ENC1") — presence determines decrypt path,
 * allowing plaintext rows stored before encryption was enabled to be served
 * correctly without a backfill migration.
 *
 * AAD (Additional Authenticated Data) binds ciphertext to a specific file +
 * clinic, preventing one record's ciphertext from being substituted into another.
 *
 * Key is required in non-local/non-test profiles — app refuses to start without it.
 */
@Service
class EncryptionService(
    @Value("\${file.encryption.key:}") private val keyBase64: String,
    private val env: Environment,
) {
    private val log = LoggerFactory.getLogger(EncryptionService::class.java)
    private val random = SecureRandom()
    private var secretKey: SecretKeySpec? = null

    val enabled: Boolean get() = secretKey != null

    @PostConstruct
    fun init() {
        if (keyBase64.isBlank()) {
            val isDevOrTest = env.activeProfiles.any { it in setOf("local", "test") }
            if (isDevOrTest) {
                log.warn("FILE_ENCRYPTION_KEY not set — file encryption DISABLED (dev/test profile). Set before any clinical deployment.")
            } else {
                error(
                    "FILE_ENCRYPTION_KEY is required but not set. " +
                    "Generate with: openssl rand -base64 32"
                )
            }
            return
        }
        val keyBytes = runCatching { Base64.getDecoder().decode(keyBase64) }
            .getOrElse { error("FILE_ENCRYPTION_KEY is not valid Base64") }
        check(keyBytes.size == 32) {
            "FILE_ENCRYPTION_KEY must be exactly 32 bytes (256-bit) encoded as Base64; got ${keyBytes.size} bytes"
        }
        secretKey = SecretKeySpec(keyBytes, "AES")
        log.info("EncryptionService: AES-256-GCM encryption enabled for patient files")
    }

    /**
     * Encrypts [plaintext] and returns MAGIC + IV + ciphertext.
     * [fileId] and [clinicId] are bound into the GCM tag via AAD —
     * decryption will fail if the blob is used with different IDs.
     *
     * When encryption is disabled (no key), returns plaintext unchanged.
     */
    fun encrypt(plaintext: ByteArray, fileId: UUID, clinicId: UUID): ByteArray {
        val key = secretKey ?: return plaintext
        val iv = ByteArray(IV_SIZE).also { random.nextBytes(it) }
        val cipher = Cipher.getInstance(ALGORITHM)
        cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(TAG_BITS, iv))
        cipher.updateAAD(aad(fileId, clinicId))
        val ciphertext = cipher.doFinal(plaintext)
        return MAGIC + iv + ciphertext
    }

    /**
     * Decrypts a blob previously produced by [encrypt].
     * If the blob does not start with MAGIC (legacy plaintext row), returns it as-is.
     * If encryption is now disabled but the blob IS encrypted, throws to prevent
     * serving ciphertext as if it were the original file.
     */
    fun decrypt(data: ByteArray, fileId: UUID, clinicId: UUID): ByteArray {
        val isEncrypted = data.size >= MAGIC.size && data.take(MAGIC.size) == MAGIC.asList()
        if (!isEncrypted) {
            // Plaintext blob stored before encryption was enabled — serve as-is.
            return data
        }
        val key = secretKey
            ?: error("Blob is encrypted (ENC1 header present) but FILE_ENCRYPTION_KEY is not set. Cannot decrypt.")
        val iv = data.copyOfRange(MAGIC.size, MAGIC.size + IV_SIZE)
        val ciphertext = data.copyOfRange(MAGIC.size + IV_SIZE, data.size)
        val cipher = Cipher.getInstance(ALGORITHM)
        cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(TAG_BITS, iv))
        cipher.updateAAD(aad(fileId, clinicId))
        return cipher.doFinal(ciphertext)
    }

    /** True if [data] carries the ENC1 magic header (i.e. is already encrypted). */
    fun isEncrypted(data: ByteArray): Boolean =
        data.size >= MAGIC.size && data.take(MAGIC.size) == MAGIC.asList()

    private fun aad(fileId: UUID, clinicId: UUID): ByteArray =
        "$fileId|$clinicId".toByteArray(Charsets.UTF_8)

    companion object {
        private const val ALGORITHM = "AES/GCM/NoPadding"
        private const val IV_SIZE = 12
        private const val TAG_BITS = 128
        // "ENC1" magic header — presence signals an encrypted blob
        private val MAGIC = byteArrayOf(0x45, 0x4E, 0x43, 0x31)
    }
}
