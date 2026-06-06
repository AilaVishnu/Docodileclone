package com.example.docodile.service

import com.example.docodile.domain.AppUser
import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.CorrectionRequest
import com.example.docodile.domain.CorrectionRequestStatus
import com.example.docodile.domain.Patient
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.CorrectionRequestRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.kotlin.any
import org.mockito.kotlin.anyOrNull
import org.mockito.ArgumentMatchers.anyBoolean
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.eq
import org.mockito.Captor
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class CorrectionRequestServiceTest {

    @Mock
    private lateinit var correctionRequestRepository: CorrectionRequestRepository

    @Mock
    private lateinit var patientRepository: PatientRepository

    @Mock
    private lateinit var currentUser: CurrentUser

    @Mock
    private lateinit var auditService: AuditService

    @Mock
    private lateinit var appUserRepository: AppUserRepository

    @Mock
    private lateinit var emailService: EmailService

    @InjectMocks
    private lateinit var service: CorrectionRequestService

    @Captor
    private lateinit var correctionCaptor: ArgumentCaptor<CorrectionRequest>

    @Captor
    private lateinit var patientCaptor: ArgumentCaptor<Patient>

    private val clinicId = UUID.randomUUID()
    private val tenantId = UUID.randomUUID()
    private val userId = UUID.randomUUID()

    private fun newRequest(
        status: CorrectionRequestStatus,
        fieldName: String = "name",
        newValue: String = "New Name",
        patientId: UUID = UUID.randomUUID(),
        requestedBy: UUID = userId,
    ) = CorrectionRequest(
        patientId = patientId,
        clinicId = clinicId,
        tenantId = tenantId,
        status = status.name,
        fieldName = fieldName,
        oldValue = "Old Name",
        newValue = newValue,
        requestedBy = requestedBy,
    )

    // ---- submit ----

    @Test
    fun `submit saves a SUBMITTED request when patient exists`() {
        val patientId = UUID.randomUUID()
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(currentUser.tenantId()).thenReturn(tenantId)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(patientRepository.findByIdAndClinicId(patientId, clinicId)).thenReturn(Patient(id = patientId))
        `when`(correctionRequestRepository.save(any()))
            .thenAnswer { it.arguments[0] }

        service.submit(patientId, "name", "Old Name", "New Name")

        verify(correctionRequestRepository).save(correctionCaptor.capture())
        assertEquals(CorrectionRequestStatus.SUBMITTED.name, correctionCaptor.value.status)
        assertEquals("name", correctionCaptor.value.fieldName)
        assertEquals("New Name", correctionCaptor.value.newValue)
    }

    @Test
    fun `submit throws when patient is not found`() {
        val patientId = UUID.randomUUID()
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(patientRepository.findByIdAndClinicId(patientId, clinicId)).thenReturn(null)

        assertThrows(IllegalArgumentException::class.java) {
            service.submit(patientId, "name", "Old Name", "New Name")
        }
        verify(correctionRequestRepository, never()).save(any())
    }

    // ---- review approve ----

    @Test
    fun `review approve applies the change, logs CORRECTION_APPLIED, and emails the requester`() {
        val patientId = UUID.randomUUID()
        val req = newRequest(CorrectionRequestStatus.SUBMITTED, fieldName = "name", newValue = "Jane Doe", patientId = patientId)
        val patient = Patient(id = patientId, name = "John Doe")
        val requester = AppUser(id = userId, email = "requester@example.com")

        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(correctionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))
        `when`(correctionRequestRepository.save(any()))
            .thenAnswer { it.arguments[0] }
        `when`(patientRepository.findByIdAndClinicId(patientId, clinicId)).thenReturn(patient)
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(requester))

        service.review(req.id, approve = true)

        // status set to APPLIED
        assertEquals(CorrectionRequestStatus.APPLIED.name, req.status)
        // patient field updated and persisted
        verify(patientRepository).save(patientCaptor.capture())
        assertEquals("Jane Doe", patientCaptor.value.name)
        // audit logged
        verify(auditService).log(
            eq(AuditAction.CORRECTION_APPLIED),
            anyOrNull(),
            anyOrNull(),
            anyString(),
            anyOrNull(),
            anyOrNull(),
            anyOrNull(),
            any(),
        )
        // email sent
        verify(emailService).sendCorrectionComplete(eq("requester@example.com"), eq("name"), eq("Jane Doe"), eq(true))
    }

    // ---- review reject ----

    @Test
    fun `review reject sets REJECTED, logs rejection, emails, and does not modify the patient`() {
        val patientId = UUID.randomUUID()
        val req = newRequest(CorrectionRequestStatus.SUBMITTED, patientId = patientId)
        val requester = AppUser(id = userId, email = "requester@example.com")

        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(correctionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))
        `when`(correctionRequestRepository.save(any()))
            .thenAnswer { it.arguments[0] }
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(requester))

        service.review(req.id, approve = false, rejectionNote = "not valid")

        assertEquals(CorrectionRequestStatus.REJECTED.name, req.status)
        // patient field NOT modified
        verify(patientRepository, never()).save(any())
        // rejection logged
        verify(auditService).log(
            eq(AuditAction.CORRECTION_REQUEST_REJECTED),
            anyOrNull(),
            anyOrNull(),
            anyString(),
            anyOrNull(),
            anyOrNull(),
            anyOrNull(),
            any(),
        )
        // rejection email sent
        verify(emailService).sendCorrectionComplete(eq("requester@example.com"), anyString(), anyString(), eq(false))
    }

    // ---- review wrong state ----

    @Test
    fun `review throws when request is not in SUBMITTED state`() {
        val req = newRequest(CorrectionRequestStatus.APPLIED)
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(correctionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))

        assertThrows(IllegalArgumentException::class.java) {
            service.review(req.id, approve = true)
        }
        verify(correctionRequestRepository, never()).save(any())
        verify(patientRepository, never()).save(any())
    }

    // ---- email failure does not break review ----

    @Test
    fun `review completes even when email sending throws`() {
        val patientId = UUID.randomUUID()
        val req = newRequest(CorrectionRequestStatus.SUBMITTED, fieldName = "name", newValue = "Jane Doe", patientId = patientId)
        val patient = Patient(id = patientId, name = "John Doe")
        val requester = AppUser(id = userId, email = "requester@example.com")

        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(correctionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))
        `when`(correctionRequestRepository.save(any()))
            .thenAnswer { it.arguments[0] }
        `when`(patientRepository.findByIdAndClinicId(patientId, clinicId)).thenReturn(patient)
        `when`(appUserRepository.findById(userId)).thenReturn(Optional.of(requester))
        `when`(emailService.sendCorrectionComplete(anyString(), anyString(), anyString(), anyBoolean()))
            .thenThrow(RuntimeException("smtp down"))

        assertDoesNotThrow {
            service.review(req.id, approve = true)
        }
        assertEquals(CorrectionRequestStatus.APPLIED.name, req.status)
    }
}
