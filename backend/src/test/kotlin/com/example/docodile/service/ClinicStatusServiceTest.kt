package com.example.docodile.service

import com.example.docodile.domain.AppUser
import com.example.docodile.domain.ClinicSettings
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicSettingsRepository
import com.example.docodile.security.CurrentUser
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
    private lateinit var clinicSettingsRepository: ClinicSettingsRepository

    @Mock
    private lateinit var appUserRepository: AppUserRepository

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
    fun `isClinicComplete returns false when no settings exist`() {
        `when`(clinicSettingsRepository.findAll()).thenReturn(emptyList())

        val result = clinicStatusService.isClinicComplete()

        assertFalse(result)
    }

    @Test
    fun `isClinicComplete returns false when settings have blank name`() {
        val settings = ClinicSettings(name = "", address = "Some Address")
        `when`(clinicSettingsRepository.findAll()).thenReturn(listOf(settings))

        val result = clinicStatusService.isClinicComplete()

        assertFalse(result)
    }

    @Test
    fun `isClinicComplete returns true when settings are complete and active staff exists`() {
        val settings = ClinicSettings(name = "Clinic", address = "Address")
        val activeUser = AppUser(active = true)
        `when`(clinicSettingsRepository.findAll()).thenReturn(listOf(settings))
        `when`(appUserRepository.findAll()).thenReturn(listOf(activeUser))

        val result = clinicStatusService.isClinicComplete()

        assertTrue(result)
    }

    @Test
    fun `saveClinicDetails saves and returns updated settings`() {
        val request = ClinicDetailsRequest(id = null, name = "My Clinic", address = "123 St", phone = null, domain = null, speciality = null)
        `when`(clinicSettingsRepository.findAll()).thenReturn(emptyList())
        `when`(clinicSettingsRepository.save(any(ClinicSettings::class.java)))
            .thenAnswer { it.arguments[0] as ClinicSettings }

        val result = clinicStatusService.saveClinicDetails(request)

        assertEquals("My Clinic", result.name)
        assertEquals("123 St", result.address)
    }

    @Test
    fun `saveStaff throws on invalid email`() {
        val request = StaffRequest(
            name = "User", email = "invalid", phone = "1234567890", role = "OTHER", gender = "OTHER"
        )
        assertThrows(IllegalArgumentException::class.java) {
            clinicStatusService.saveStaff(request)
        }
    }

    @Test
    fun `saveStaff throws on short phone`() {
        val request = StaffRequest(
            name = "User", email = "test@example.com", phone = "123", role = "OTHER", gender = "OTHER"
        )
        assertThrows(IllegalArgumentException::class.java) {
            clinicStatusService.saveStaff(request)
        }
    }
}
