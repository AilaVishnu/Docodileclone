package com.example.docodile.service

import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.core.env.Environment
import java.util.Base64
import java.util.UUID

@ExtendWith(MockitoExtension::class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class EncryptionServiceTest {

    @Mock
    private lateinit var env: Environment

    private fun key32Base64(): String =
        Base64.getEncoder().encodeToString(ByteArray(32) { it.toByte() })

    private fun enabledService(): EncryptionService {
        `when`(env.activeProfiles).thenReturn(arrayOf("test"))
        val svc = EncryptionService(key32Base64(), env)
        svc.init()
        return svc
    }

    @Test
    fun `enabled service round-trips encrypt then decrypt back to original`() {
        val svc = enabledService()
        val fileId = UUID.randomUUID()
        val clinicId = UUID.randomUUID()
        val plaintext = "patient file contents".toByteArray()

        val encrypted = svc.encrypt(plaintext, fileId, clinicId)
        val decrypted = svc.decrypt(encrypted, fileId, clinicId)

        assertArrayEquals(plaintext, decrypted)
    }

    @Test
    fun `encrypted output differs from plaintext and is flagged as encrypted`() {
        val svc = enabledService()
        val fileId = UUID.randomUUID()
        val clinicId = UUID.randomUUID()
        val plaintext = "secret".toByteArray()

        val encrypted = svc.encrypt(plaintext, fileId, clinicId)

        assertFalse(encrypted.contentEquals(plaintext))
        assertTrue(svc.isEncrypted(encrypted))
        assertFalse(svc.isEncrypted(plaintext))
    }

    @Test
    fun `decrypt with different fileId fails the AAD tag check`() {
        val svc = enabledService()
        val fileId = UUID.randomUUID()
        val clinicId = UUID.randomUUID()
        val encrypted = svc.encrypt("data".toByteArray(), fileId, clinicId)

        assertThrows(Exception::class.java) {
            svc.decrypt(encrypted, UUID.randomUUID(), clinicId)
        }
    }

    @Test
    fun `decrypt with different clinicId fails the AAD tag check`() {
        val svc = enabledService()
        val fileId = UUID.randomUUID()
        val clinicId = UUID.randomUUID()
        val encrypted = svc.encrypt("data".toByteArray(), fileId, clinicId)

        assertThrows(Exception::class.java) {
            svc.decrypt(encrypted, fileId, UUID.randomUUID())
        }
    }

    @Test
    fun `decrypt of a legacy plaintext blob returns it unchanged`() {
        val svc = enabledService()
        val legacy = "not encrypted, no ENC1 header".toByteArray()

        val result = svc.decrypt(legacy, UUID.randomUUID(), UUID.randomUUID())

        assertArrayEquals(legacy, result)
    }

    @Test
    fun `init throws when key is not 32 bytes`() {
        `when`(env.activeProfiles).thenReturn(arrayOf("test"))
        val key16 = Base64.getEncoder().encodeToString(ByteArray(16) { it.toByte() })
        val svc = EncryptionService(key16, env)

        assertThrows(IllegalStateException::class.java) {
            svc.init()
        }
    }

    @Test
    fun `disabled service in test profile is not enabled and passes plaintext through`() {
        `when`(env.activeProfiles).thenReturn(arrayOf("test"))
        val svc = EncryptionService("", env)
        svc.init()

        assertFalse(svc.enabled)
        val plaintext = "x".toByteArray()
        assertArrayEquals(plaintext, svc.encrypt(plaintext, UUID.randomUUID(), UUID.randomUUID()))
    }

    @Test
    fun `disabled service refuses to decrypt an ENC1-headered blob`() {
        // Build a blob carrying the ENC1 magic header using an enabled service first.
        `when`(env.activeProfiles).thenReturn(arrayOf("test"))
        val enabled = EncryptionService(key32Base64(), env)
        enabled.init()
        val fileId = UUID.randomUUID()
        val clinicId = UUID.randomUUID()
        val encryptedBlob = enabled.encrypt("data".toByteArray(), fileId, clinicId)

        val disabled = EncryptionService("", env)
        disabled.init()

        assertThrows(IllegalStateException::class.java) {
            disabled.decrypt(encryptedBlob, fileId, clinicId)
        }
    }

    @Test
    fun `blank key in a non-dev profile fails fast on init`() {
        `when`(env.activeProfiles).thenReturn(arrayOf("prod"))
        val svc = EncryptionService("", env)

        assertThrows(IllegalStateException::class.java) {
            svc.init()
        }
    }
}
