package com.example.docodile.service

import com.example.docodile.domain.*
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.ClinicStaffRepository
import com.example.docodile.repo.TenantRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.service.AuditService
import com.example.docodile.service.EmailService
import com.example.docodile.service.PasswordTokenService
import com.example.docodile.web.ClinicDetailsRequest
import com.example.docodile.web.StaffRequest
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.jupiter.MockitoExtension
import java.util.*

@ExtendWith(MockitoExtension::class)
class ClinicStatusServiceTest {

    @Mock
    private lateinit var clinicEntityRepository: ClinicEntityRepository

    @Mock
    private lateinit var clinicStaffRepository: ClinicStaffRepository

    @Mock
    private lateinit var appUserRepository: AppUserRepository

    @Mock
    private lateinit var tenantRepository: TenantRepository

    @Mock
    private lateinit var currentUser: CurrentUser

    @Mock
    private lateinit var passwordTokenService: PasswordTokenService

    @Mock
    private lateinit var emailService: EmailService

    @Mock
    private lateinit var auditService: AuditService

    @InjectMocks
    private lateinit var clinicStatusService: ClinicStatusService

    @Test
    fun `isClinicComplete should return true when all criteria met`() {
        val tenantId = UUID.randomUUID()
        val clinic = ClinicEntity(id = UUID.randomUUID(), name = "Clinic", address = "Address", phone = "123")
        
        `when`(currentUser.tenantId()).thenReturn(tenantId)
        `when`(clinicEntityRepository.findAllByTenantId(tenantId)).thenReturn(listOf(clinic))
        `when`(clinicStaffRepository.countByIdClinicId(clinic.id)).thenReturn(1L)

        val result = clinicStatusService.isClinicComplete()
        assertTrue(result)
    }

    @Test
    fun `saveClinicDetails should throw exception if domain changed after being set`() {
        val tenantId = UUID.randomUUID()
        val clinicId = UUID.randomUUID()
        val existingClinic = ClinicEntity(id = clinicId, domain = "old-domain", tenant = Tenant(id = tenantId))
        val request = ClinicDetailsRequest(id = clinicId, domain = "new-domain", name = "Clinic", address = null, phone = null, speciality = null)

        `when`(currentUser.tenantId()).thenReturn(tenantId)
        `when`(clinicEntityRepository.findById(clinicId)).thenReturn(Optional.of(existingClinic))

        assertThrows(IllegalArgumentException::class.java) {
            clinicStatusService.saveClinicDetails(request)
        }
    }

    @Test
    fun `saveClinicDetails should check for domain uniqueness when setting for first time`() {
        val tenantId = UUID.randomUUID()
        val clinicId = UUID.randomUUID()
        val existingClinic = ClinicEntity(id = clinicId, domain = null, tenant = Tenant(id = tenantId))
        val request = ClinicDetailsRequest(id = clinicId, domain = "taken-domain", name = "Clinic", address = null, phone = null, speciality = null)

        `when`(currentUser.tenantId()).thenReturn(tenantId)
        `when`(clinicEntityRepository.findById(clinicId)).thenReturn(Optional.of(existingClinic))
        `when`(clinicEntityRepository.existsByDomainIgnoreCase("taken-domain")).thenReturn(true)

        val exception = assertThrows(IllegalArgumentException::class.java) {
            clinicStatusService.saveClinicDetails(request)
        }
        assertEquals("Domain name already exists in application", exception.message)
    }

    @Test
    fun `saveStaff should validate email and phone format`() {
        val clinicId = UUID.randomUUID()
        val tenantId = UUID.randomUUID()
        val clinic = ClinicEntity(id = clinicId, tenant = Tenant(id = tenantId))

        `when`(currentUser.tenantId()).thenReturn(tenantId)
        `when`(clinicEntityRepository.findById(clinicId)).thenReturn(Optional.of(clinic))

        val invalidEmailRequest = StaffRequest(name = "User", email = "invalid", phone = "1234567890", role = "DOCTOR", gender = "OTHER")
        assertThrows(IllegalArgumentException::class.java) {
            clinicStatusService.saveStaff(clinicId, invalidEmailRequest)
        }

        val invalidPhoneRequest = StaffRequest(name = "User", email = "test@example.com", phone = "123", role = "DOCTOR", gender = "OTHER")
        assertThrows(IllegalArgumentException::class.java) {
            clinicStatusService.saveStaff(clinicId, invalidPhoneRequest)
        }
    }
}
