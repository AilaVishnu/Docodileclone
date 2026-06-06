package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.AuditLog
import com.example.docodile.repo.AuditLogRepository
import com.example.docodile.security.CurrentUser
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.Captor
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import tools.jackson.databind.ObjectMapper
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class AuditServiceTest {

    @Mock
    private lateinit var auditLogRepository: AuditLogRepository

    @Mock
    private lateinit var currentUser: CurrentUser

    @Captor
    private lateinit var auditCaptor: ArgumentCaptor<AuditLog>

    private lateinit var service: AuditService

    @BeforeEach
    fun setUp() {
        service = AuditService(auditLogRepository, currentUser, ObjectMapper())
    }

    @Test
    fun `log saves an AuditLog with the action name and default SUCCESS outcome`() {
        `when`(currentUser.userId()).thenReturn(UUID.randomUUID())
        `when`(currentUser.tenantId()).thenReturn(UUID.randomUUID())
        `when`(currentUser.clinicIdOrNull()).thenReturn(UUID.randomUUID())

        service.log(AuditAction.LOGIN_SUCCESS)

        verify(auditLogRepository).save(auditCaptor.capture())
        assertEquals(AuditAction.LOGIN_SUCCESS.name, auditCaptor.value.action)
        assertEquals("SUCCESS", auditCaptor.value.outcome)
    }

    @Test
    fun `log uses explicit actorId, tenantId and clinicId on the saved entity`() {
        val actorId = UUID.randomUUID()
        val tenantId = UUID.randomUUID()
        val clinicId = UUID.randomUUID()

        service.log(
            AuditAction.PATIENT_ACCESS,
            actorId = actorId,
            tenantId = tenantId,
            clinicId = clinicId,
        )

        verify(auditLogRepository).save(auditCaptor.capture())
        assertEquals(actorId, auditCaptor.value.actorId)
        assertEquals(tenantId, auditCaptor.value.tenantId)
        assertEquals(clinicId, auditCaptor.value.clinicId)
    }

    @Test
    fun `log serializes a non-empty metadata map to a JSON string`() {
        `when`(currentUser.userId()).thenReturn(UUID.randomUUID())
        `when`(currentUser.tenantId()).thenReturn(UUID.randomUUID())
        `when`(currentUser.clinicIdOrNull()).thenReturn(UUID.randomUUID())

        service.log(AuditAction.CONFIG_CHANGED, metadata = mapOf("key" to "value"))

        verify(auditLogRepository).save(auditCaptor.capture())
        val json = auditCaptor.value.metadata
        assertNotNull(json)
        assertTrue(json!!.contains("key"))
        assertTrue(json.contains("value"))
    }

    @Test
    fun `log leaves metadata null for an empty map`() {
        `when`(currentUser.userId()).thenReturn(UUID.randomUUID())
        `when`(currentUser.tenantId()).thenReturn(UUID.randomUUID())
        `when`(currentUser.clinicIdOrNull()).thenReturn(UUID.randomUUID())

        service.log(AuditAction.CONFIG_CHANGED, metadata = emptyMap())

        verify(auditLogRepository).save(auditCaptor.capture())
        assertNull(auditCaptor.value.metadata)
    }

    @Test
    fun `log falls back to currentUser values when actorId and tenantId are not passed`() {
        val fallbackActor = UUID.randomUUID()
        val fallbackTenant = UUID.randomUUID()
        `when`(currentUser.userId()).thenReturn(fallbackActor)
        `when`(currentUser.tenantId()).thenReturn(fallbackTenant)
        `when`(currentUser.clinicIdOrNull()).thenReturn(null)

        service.log(AuditAction.PATIENT_UPDATED)

        verify(auditLogRepository).save(auditCaptor.capture())
        assertEquals(fallbackActor, auditCaptor.value.actorId)
        assertEquals(fallbackTenant, auditCaptor.value.tenantId)
    }
}
