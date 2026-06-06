package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.DeletionRequest
import com.example.docodile.domain.DeletionRequestStatus
import com.example.docodile.domain.Patient
import com.example.docodile.repo.DeletionRequestRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.kotlin.any
import org.mockito.kotlin.anyOrNull
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
class DeletionRequestServiceTest {

    @Mock
    private lateinit var deletionRequestRepository: DeletionRequestRepository

    @Mock
    private lateinit var patientRepository: PatientRepository

    @Mock
    private lateinit var currentUser: CurrentUser

    @Mock
    private lateinit var auditService: AuditService

    @InjectMocks
    private lateinit var service: DeletionRequestService

    @Captor
    private lateinit var deletionCaptor: ArgumentCaptor<DeletionRequest>

    @Captor
    private lateinit var patientCaptor: ArgumentCaptor<Patient>

    private val clinicId = UUID.randomUUID()
    private val tenantId = UUID.randomUUID()
    private val userId = UUID.randomUUID()

    private fun newRequest(status: DeletionRequestStatus, patientId: UUID = UUID.randomUUID()) =
        DeletionRequest(
            patientId = patientId,
            clinicId = clinicId,
            tenantId = tenantId,
            status = status.name,
            requestedBy = userId,
        )

    // ---- submit ----

    @Test
    fun `submit saves a SUBMITTED request and logs the submission when patient exists`() {
        val patientId = UUID.randomUUID()
        val patient = Patient(id = patientId)
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(currentUser.tenantId()).thenReturn(tenantId)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(patientRepository.findByIdAndClinicId(patientId, clinicId)).thenReturn(patient)
        `when`(deletionRequestRepository.save(any()))
            .thenAnswer { it.arguments[0] }

        service.submit(patientId, "no longer a patient")

        verify(deletionRequestRepository).save(deletionCaptor.capture())
        assertEquals(DeletionRequestStatus.SUBMITTED.name, deletionCaptor.value.status)
        assertEquals(patientId, deletionCaptor.value.patientId)
        verify(auditService).log(
            eq(AuditAction.DELETION_REQUEST_SUBMITTED),
            eq("Patient"),
            eq(patientId),
            anyString(),
            anyOrNull(),
            anyOrNull(),
            anyOrNull(),
            any(),
        )
    }

    @Test
    fun `submit throws when patient not found`() {
        val patientId = UUID.randomUUID()
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(currentUser.tenantId()).thenReturn(tenantId)
        `when`(patientRepository.findByIdAndClinicId(patientId, clinicId)).thenReturn(null)

        assertThrows(IllegalArgumentException::class.java) {
            service.submit(patientId, "reason")
        }
        verify(deletionRequestRepository, never()).save(any())
    }

    // ---- transition: legal ----

    @Test
    fun `transition SUBMITTED to VERIFIED succeeds and persists the new status`() {
        val req = newRequest(DeletionRequestStatus.SUBMITTED)
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(deletionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))
        `when`(deletionRequestRepository.save(any()))
            .thenAnswer { it.arguments[0] }

        service.transition(req.id, DeletionRequestStatus.VERIFIED)

        verify(deletionRequestRepository).save(deletionCaptor.capture())
        assertEquals(DeletionRequestStatus.VERIFIED.name, deletionCaptor.value.status)
    }

    // ---- transition: illegal ----

    @Test
    fun `transition SUBMITTED to EXECUTED throws`() {
        val req = newRequest(DeletionRequestStatus.SUBMITTED)
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(deletionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))

        assertThrows(IllegalArgumentException::class.java) {
            service.transition(req.id, DeletionRequestStatus.EXECUTED)
        }
        verify(deletionRequestRepository, never()).save(any())
    }

    @Test
    fun `transition SUBMITTED to APPROVED throws`() {
        val req = newRequest(DeletionRequestStatus.SUBMITTED)
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(deletionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))

        assertThrows(IllegalArgumentException::class.java) {
            service.transition(req.id, DeletionRequestStatus.APPROVED)
        }
        verify(deletionRequestRepository, never()).save(any())
    }

    // ---- transition: REJECTED reachable ----

    @Test
    fun `REJECTED is reachable from SUBMITTED`() {
        val req = newRequest(DeletionRequestStatus.SUBMITTED)
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(deletionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))
        `when`(deletionRequestRepository.save(any()))
            .thenAnswer { it.arguments[0] }

        service.transition(req.id, DeletionRequestStatus.REJECTED, "duplicate")

        verify(deletionRequestRepository).save(deletionCaptor.capture())
        assertEquals(DeletionRequestStatus.REJECTED.name, deletionCaptor.value.status)
    }

    @Test
    fun `REJECTED is reachable from VERIFIED`() {
        val req = newRequest(DeletionRequestStatus.VERIFIED)
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(deletionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))
        `when`(deletionRequestRepository.save(any()))
            .thenAnswer { it.arguments[0] }

        service.transition(req.id, DeletionRequestStatus.REJECTED)

        verify(deletionRequestRepository).save(deletionCaptor.capture())
        assertEquals(DeletionRequestStatus.REJECTED.name, deletionCaptor.value.status)
    }

    @Test
    fun `REJECTED is reachable from LEGAL_HOLD_CHECK`() {
        val req = newRequest(DeletionRequestStatus.LEGAL_HOLD_CHECK)
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(deletionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))
        `when`(deletionRequestRepository.save(any()))
            .thenAnswer { it.arguments[0] }

        service.transition(req.id, DeletionRequestStatus.REJECTED)

        verify(deletionRequestRepository).save(deletionCaptor.capture())
        assertEquals(DeletionRequestStatus.REJECTED.name, deletionCaptor.value.status)
    }

    // ---- transition: EXECUTED soft-deletes patient ----

    @Test
    fun `transition APPROVED to EXECUTED soft-deletes the patient`() {
        val patientId = UUID.randomUUID()
        val req = newRequest(DeletionRequestStatus.APPROVED, patientId)
        val patient = Patient(id = patientId)
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(deletionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))
        `when`(deletionRequestRepository.save(any()))
            .thenAnswer { it.arguments[0] }
        `when`(patientRepository.findByIdAndClinicId(patientId, clinicId)).thenReturn(patient)

        service.transition(req.id, DeletionRequestStatus.EXECUTED)

        verify(patientRepository).save(patientCaptor.capture())
        assertNotNull(patientCaptor.value.deletedAt)
        assertEquals(DeletionRequestStatus.EXECUTED.name, req.status)
    }

    // ---- transition: audit logging ----

    @Test
    fun `transition logs an audit event`() {
        val req = newRequest(DeletionRequestStatus.SUBMITTED)
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(currentUser.userId()).thenReturn(userId)
        `when`(deletionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))
        `when`(deletionRequestRepository.save(any()))
            .thenAnswer { it.arguments[0] }

        service.transition(req.id, DeletionRequestStatus.VERIFIED)

        verify(auditService).log(
            any(),
            anyOrNull(),
            anyOrNull(),
            anyString(),
            anyOrNull(),
            anyOrNull(),
            anyOrNull(),
            any(),
        )
    }

    // ---- transition: clinic scoping ----

    @Test
    fun `transition throws when request belongs to another clinic`() {
        val req = DeletionRequest(
            patientId = UUID.randomUUID(),
            clinicId = UUID.randomUUID(), // different clinic
            tenantId = tenantId,
            status = DeletionRequestStatus.SUBMITTED.name,
            requestedBy = userId,
        )
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(deletionRequestRepository.findById(req.id)).thenReturn(Optional.of(req))

        assertThrows(IllegalArgumentException::class.java) {
            service.transition(req.id, DeletionRequestStatus.VERIFIED)
        }
        verify(deletionRequestRepository, never()).save(any())
    }
}
