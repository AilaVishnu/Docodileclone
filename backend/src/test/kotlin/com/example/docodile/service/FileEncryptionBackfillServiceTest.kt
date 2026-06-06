package com.example.docodile.service

import com.example.docodile.domain.ClinicEntity
import com.example.docodile.domain.PatientFile
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.PatientFileRepository
import com.example.docodile.security.CurrentUser
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.never
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import java.util.UUID

@ExtendWith(MockitoExtension::class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class FileEncryptionBackfillServiceTest {

    @Mock
    private lateinit var patientFileRepository: PatientFileRepository

    @Mock
    private lateinit var clinicEntityRepository: ClinicEntityRepository

    @Mock
    private lateinit var encryptionService: EncryptionService

    @Mock
    private lateinit var currentUser: CurrentUser

    @Mock
    private lateinit var rowProcessor: FileEncryptionRowProcessor

    // ---- FileEncryptionRowProcessor.encryptOne ----

    @Test
    fun `encryptOne returns false when the row is missing`() {
        val processor = FileEncryptionRowProcessor(patientFileRepository, encryptionService)
        val id = UUID.randomUUID()
        `when`(patientFileRepository.findRawById(id)).thenReturn(null)

        assertFalse(processor.encryptOne(id))
        verify(patientFileRepository, never()).save(any())
    }

    @Test
    fun `encryptOne returns false when the blob is already encrypted`() {
        val processor = FileEncryptionRowProcessor(patientFileRepository, encryptionService)
        val id = UUID.randomUUID()
        val pf = PatientFile(id = id, clinicId = UUID.randomUUID(), fileData = "ENC".toByteArray())
        `when`(patientFileRepository.findRawById(id)).thenReturn(pf)
        `when`(encryptionService.isEncrypted(pf.fileData)).thenReturn(true)

        assertFalse(processor.encryptOne(id))
        verify(patientFileRepository, never()).save(any())
    }

    @Test
    fun `encryptOne encrypts and saves when the blob is plaintext`() {
        val processor = FileEncryptionRowProcessor(patientFileRepository, encryptionService)
        val id = UUID.randomUUID()
        val clinicId = UUID.randomUUID()
        val plaintext = "plain".toByteArray()
        val ciphertext = "cipher".toByteArray()
        val pf = PatientFile(id = id, clinicId = clinicId, fileData = plaintext)
        `when`(patientFileRepository.findRawById(id)).thenReturn(pf)
        `when`(encryptionService.isEncrypted(plaintext)).thenReturn(false)
        `when`(encryptionService.encrypt(plaintext, id, clinicId)).thenReturn(ciphertext)

        assertTrue(processor.encryptOne(id))

        verify(encryptionService).encrypt(plaintext, id, clinicId)
        verify(patientFileRepository).save(pf)
        assertArrayEqualsHelper(ciphertext, pf.fileData)
    }

    private fun assertArrayEqualsHelper(expected: ByteArray, actual: ByteArray) =
        org.junit.jupiter.api.Assertions.assertArrayEquals(expected, actual)

    // ---- FileEncryptionBackfillService.run ----

    @Test
    fun `run returns disabled result and does nothing when encryption is disabled`() {
        val svc = FileEncryptionBackfillService(
            patientFileRepository, clinicEntityRepository, encryptionService, currentUser, rowProcessor,
        )
        `when`(encryptionService.enabled).thenReturn(false)

        val result = svc.run()

        assertFalse(result.enabled)
        assertEquals(0, result.total)
        assertEquals(0, result.encrypted)
        assertEquals(0, result.skipped)
        verify(currentUser, never()).tenantId()
        verify(rowProcessor, never()).encryptOne(any())
    }

    @Test
    fun `run scopes to tenant clinics and tallies encrypted versus skipped`() {
        val svc = FileEncryptionBackfillService(
            patientFileRepository, clinicEntityRepository, encryptionService, currentUser, rowProcessor,
        )
        val tenantId = UUID.randomUUID()
        val clinic = ClinicEntity(id = UUID.randomUUID(), name = "C")
        val id1 = UUID.randomUUID()
        val id2 = UUID.randomUUID()
        val id3 = UUID.randomUUID()

        `when`(encryptionService.enabled).thenReturn(true)
        `when`(currentUser.tenantId()).thenReturn(tenantId)
        `when`(clinicEntityRepository.findAllByTenantId(tenantId)).thenReturn(listOf(clinic))
        `when`(patientFileRepository.findAllIdsByClinicIds(listOf(clinic.id)))
            .thenReturn(listOf(id1, id2, id3))
        `when`(rowProcessor.encryptOne(id1)).thenReturn(true)
        `when`(rowProcessor.encryptOne(id2)).thenReturn(false)
        `when`(rowProcessor.encryptOne(id3)).thenReturn(true)

        val result = svc.run()

        assertTrue(result.enabled)
        assertEquals(3, result.total)
        assertEquals(2, result.encrypted)
        assertEquals(1, result.skipped)
        verify(rowProcessor, times(3)).encryptOne(any())
    }

    @Test
    fun `run returns empty enabled result when tenant has no clinics`() {
        val svc = FileEncryptionBackfillService(
            patientFileRepository, clinicEntityRepository, encryptionService, currentUser, rowProcessor,
        )
        val tenantId = UUID.randomUUID()
        `when`(encryptionService.enabled).thenReturn(true)
        `when`(currentUser.tenantId()).thenReturn(tenantId)
        `when`(clinicEntityRepository.findAllByTenantId(tenantId)).thenReturn(emptyList())

        val result = svc.run()

        assertTrue(result.enabled)
        assertEquals(0, result.total)
        verify(rowProcessor, never()).encryptOne(any())
    }
}
