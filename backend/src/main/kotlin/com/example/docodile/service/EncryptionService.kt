package com.example.docodile.service

import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

@Service
class EncryptionService(
    @Value("\${file.encryption.key:}") private val keyBase64: String,
) {
    private val log = LoggerFactory.getLogger(EncryptionService::class.java)
    private val random = SecureRandom()
    private lateinit var secretKey: SecretKeySpec

    val enabled: Boolean get() = keyBase64.isNotBlank()

    @PostConstruct
    fun init() {
        if (keyBase64.isBlank()) {
            log.warn("FILE_ENCRYPTION_KEY is not set — patient file encryption is DISABLED. Set this before any clinical deployment.")
            return
        }
        val keyBytes = Base64.getDecoder().decode(keyBase64)
        check(keyBytes.size == 32) { "FILE_ENCRYPTION_KEY must be a 32-byte (256-bit) key encoded as Base64" }
        secretKey = SecretKeySpec(keyBytes, "AES")
        log.info("EncryptionService: AES-256-GCM encryption enabled for patient files")
    }

    fun encrypt(plaintext: ByteArray): ByteArray {
        if (!enabled) return plaintext
        val iv = ByteArray(IV_SIZE).also { random.nextBytes(it) }
        val cipher = Cipher.getInstance(ALGORITHM)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, GCMParameterSpec(TAG_BITS, iv))
        val ciphertext = cipher.doFinal(plaintext)
        return iv + ciphertext
    }

    fun decrypt(data: ByteArray): ByteArray {
        if (!enabled) return data
        require(data.size > IV_SIZE) { "Encrypted data too short" }
        val iv = data.copyOfRange(0, IV_SIZE)
        val ciphertext = data.copyOfRange(IV_SIZE, data.size)
        val cipher = Cipher.getInstance(ALGORITHM)
        cipher.init(Cipher.DECRYPT_MODE, secretKey, GCMParameterSpec(TAG_BITS, iv))
        return cipher.doFinal(ciphertext)
    }

    companion object {
        private const val ALGORITHM = "AES/GCM/NoPadding"
        private const val IV_SIZE = 12
        private const val TAG_BITS = 128
    }
}
