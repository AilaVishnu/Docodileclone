package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.Patient
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.RevokedTokenRepository
import com.example.docodile.repo.UserSessionRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.isNull
import org.mockito.Mock
import org.mockito.Mockito.never
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.time.Instant
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class PurgeJobTest {

    @Mock
    private lateinit var revokedTokenRepository: RevokedTokenRepository

    @Mock
    private lateinit var userSessionRepository: UserSessionRepository

    @Mock
    private lateinit var patientRepository: PatientRepository

    @Mock
    private lateinit var auditService: AuditService

    private fun purgeJob() = PurgeJob(
        revokedTokenRepository, userSessionRepository, patientRepository, auditService,
    )

    @Test
    fun `purgeExpiredRevokedTokens deletes expired revoked tokens`() {
        `when`(revokedTokenRepository.deleteExpired(any())).thenReturn(0)

        purgeJob().purgeExpiredRevokedTokens()

        verify(revokedTokenRepository).deleteExpired(any())
    }

    @Test
    fun `purgeExpiredSessions deletes expired sessions`() {
        `when`(userSessionRepository.deleteExpired(any())).thenReturn(0)

        purgeJob().purgeExpiredSessions()

        verify(userSessionRepository).deleteExpired(any())
    }

    @Test
    fun `reportPurgeablePatients logs an audit event when eligible patients exist`() {
        val eligible = listOf(Patient(id = UUID.randomUUID()), Patient(id = UUID.randomUUID()))
        `when`(patientRepository.findSoftDeletedBefore(any())).thenReturn(eligible)

        purgeJob().reportPurgeablePatients()

        verify(auditService, times(1)).log(
            eq(AuditAction.DELETION_EXECUTED),
            isNull(),
            isNull(),
            eq("PENDING_REVIEW"),
            isNull(),
            isNull(),
            isNull(),
            any(),
        )
    }

    @Test
    fun `reportPurgeablePatients does not log when no patients are eligible`() {
        `when`(patientRepository.findSoftDeletedBefore(any())).thenReturn(emptyList())

        purgeJob().reportPurgeablePatients()

        verify(auditService, times(0)).log(
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
        )
    }
}
