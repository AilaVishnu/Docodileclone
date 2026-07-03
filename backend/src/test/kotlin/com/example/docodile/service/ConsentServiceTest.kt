package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.Patient
import com.example.docodile.domain.PatientConsent
import com.example.docodile.repo.PatientConsentRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.anyOrNull
import org.mockito.kotlin.argumentCaptor
import java.time.Instant
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class ConsentServiceTest {

    @Mock
    private lateinit var consentRepository: PatientConsentRepository

    @Mock
    private lateinit var patientRepository: PatientRepository

    @Mock
    private lateinit var currentUser: CurrentUser

    @Mock
    private lateinit var auditService: AuditService

    private fun service(enforcementEnabled: Boolean): ConsentService =
        ConsentService(consentRepository, patientRepository, currentUser, auditService, enforcementEnabled)

    private fun consent(
        patientId: UUID,
        purpose: String = "treatment",
        withdrawnAt: Instant? = null,
    ) = PatientConsent(
        patientId = patientId,
        purpose = purpose,
        version = "v1",
        withdrawnAt = withdrawnAt,
    )

    // ---- grantConsent ----

    @Test
    fun `grantConsent persists a consent and logs CONSENT_GRANTED when patient exists`() {
        val svc = service(false)
        val patientId = UUID.randomUUID()
        `when`(patientRepository.findById(patientId)).thenReturn(Optional.of(Patient()))
        `when`(consentRepository.save(any()))
            .thenAnswer { it.arguments[0] }

        svc.grantConsent(patientId, "treatment", "v1")

        verify(consentRepository).save(any())
        val actionCaptor = argumentCaptor<AuditAction>()
        verify(auditService).log(
            actionCaptor.capture(),
            anyOrNull(),
            anyOrNull(),
            anyString(),
            anyOrNull(),
            any(),
        )
        assertEquals(AuditAction.CONSENT_GRANTED, actionCaptor.firstValue)
    }

    @Test
    fun `grantConsent throws when patient is not found`() {
        val svc = service(false)
        val patientId = UUID.randomUUID()
        `when`(patientRepository.findById(patientId)).thenReturn(Optional.empty())

        assertThrows(IllegalArgumentException::class.java) {
            svc.grantConsent(patientId, "treatment", "v1")
        }
    }

    // ---- withdrawConsent ----

    @Test
    fun `withdrawConsent sets withdrawnAt and logs CONSENT_WITHDRAWN`() {
        val svc = service(false)
        val patientId = UUID.randomUUID()
        val consentId = UUID.randomUUID()
        val existing = consent(patientId)
        existing.id = consentId
        `when`(consentRepository.findById(consentId)).thenReturn(Optional.of(existing))

        svc.withdrawConsent(patientId, consentId)

        val captor = argumentCaptor<PatientConsent>()
        verify(consentRepository).save(captor.capture())
        assertTrue(captor.firstValue.withdrawnAt != null, "withdrawnAt should be set")
        val actionCaptor = argumentCaptor<AuditAction>()
        verify(auditService).log(
            actionCaptor.capture(),
            anyOrNull(),
            anyOrNull(),
            anyString(),
            anyOrNull(),
            any(),
        )
        assertEquals(AuditAction.CONSENT_WITHDRAWN, actionCaptor.firstValue)
    }

    @Test
    fun `withdrawConsent throws when already withdrawn`() {
        val svc = service(false)
        val patientId = UUID.randomUUID()
        val consentId = UUID.randomUUID()
        val existing = consent(patientId, withdrawnAt = Instant.now())
        existing.id = consentId
        `when`(consentRepository.findById(consentId)).thenReturn(Optional.of(existing))

        assertThrows(IllegalArgumentException::class.java) {
            svc.withdrawConsent(patientId, consentId)
        }
    }

    // ---- hasActiveConsent ----

    @Test
    fun `hasActiveConsent returns true for a non-withdrawn consent for the purpose`() {
        val svc = service(false)
        val patientId = UUID.randomUUID()
        `when`(consentRepository.findAllByPatientId(patientId))
            .thenReturn(listOf(consent(patientId, purpose = "treatment")))

        assertTrue(svc.hasActiveConsent(patientId, "treatment"))
    }

    @Test
    fun `hasActiveConsent returns false when only a withdrawn consent exists`() {
        val svc = service(false)
        val patientId = UUID.randomUUID()
        `when`(consentRepository.findAllByPatientId(patientId))
            .thenReturn(listOf(consent(patientId, purpose = "treatment", withdrawnAt = Instant.now())))

        assertFalse(svc.hasActiveConsent(patientId, "treatment"))
    }

    // ---- checkConsent ----

    @Test
    fun `checkConsent does not throw when enforcement disabled even with no consent`() {
        val svc = service(false)
        val patientId = UUID.randomUUID()
        `when`(consentRepository.findAllByPatientId(patientId)).thenReturn(emptyList())

        assertDoesNotThrow { svc.checkConsent(patientId, "treatment") }
    }

    @Test
    fun `checkConsent throws ConsentRequiredException when enforcement enabled and no active consent`() {
        val svc = service(true)
        val patientId = UUID.randomUUID()
        `when`(consentRepository.findAllByPatientId(patientId)).thenReturn(emptyList())

        assertThrows(ConsentRequiredException::class.java) {
            svc.checkConsent(patientId, "treatment")
        }
    }

    @Test
    fun `checkConsent does not throw when enforcement enabled and active consent exists`() {
        val svc = service(true)
        val patientId = UUID.randomUUID()
        `when`(consentRepository.findAllByPatientId(patientId))
            .thenReturn(listOf(consent(patientId, purpose = "treatment")))

        assertDoesNotThrow { svc.checkConsent(patientId, "treatment") }
    }
}
