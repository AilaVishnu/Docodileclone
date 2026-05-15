package com.example.docodile.service

import com.example.docodile.domain.*
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.ClinicStaffRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.security.TokenService
import com.example.docodile.web.LoginRequest
import com.example.docodile.web.StaffLoginRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import java.util.*

@ExtendWith(MockitoExtension::class)
class AuthServiceTest {

    @Mock
    private lateinit var appUserRepository: AppUserRepository

    @Mock
    private lateinit var clinicEntityRepository: ClinicEntityRepository

    @Mock
    private lateinit var clinicStaffRepository: ClinicStaffRepository

    @Mock
    private lateinit var passwordEncoder: PasswordEncoder

    @Mock
    private lateinit var tokenService: TokenService

    @Mock
    private lateinit var currentUser: CurrentUser

    @InjectMocks
    private lateinit var authService: AuthService

    @Test
    fun `login should succeed for valid admin credentials`() {
        val tenant = Tenant(id = UUID.randomUUID())
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "admin@example.com",
            passwordHash = "hashed_pw",
            role = Role.ADMIN,
            tenant = tenant,
            active = true
        )
        val clinic = ClinicEntity(id = UUID.randomUUID(), name = "Test Clinic", tenant = tenant)
        val request = LoginRequest(email = "admin@example.com", password = "password")

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))
        `when`(passwordEncoder.matches(request.password, user.passwordHash)).thenReturn(true)
        `when`(clinicEntityRepository.findFirstByTenantIdOrderByCreatedAtAsc(tenant.id))
            .thenReturn(Optional.of(clinic))
        `when`(tokenService.generateToken(user.id, tenant.id, user.role.name, user.email, clinic.id))
            .thenReturn("valid_token")

        val response = authService.login(request)

        assertEquals("valid_token", response.token)
        assertEquals("ADMIN", response.role)
        assertEquals(clinic.id, response.clinicId)
    }

    @Test
    fun `login should fail for non-admin role`() {
        val user = AppUser(
            email = "staff@example.com",
            role = Role.DOCTOR,
            active = true
        )
        val request = LoginRequest(email = "staff@example.com", password = "password")

        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))

        assertThrows(BadCredentialsException::class.java) {
            authService.login(request)
        }
    }

    @Test
    fun `loginStaff should succeed for valid staff credentials and domain`() {
        val tenant = Tenant(id = UUID.randomUUID())
        val clinic = ClinicEntity(id = UUID.randomUUID(), name = "Clinic One", tenant = tenant)
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "staff@example.com",
            passwordHash = "hashed_pw",
            role = Role.DOCTOR,
            active = true
        )
        val request = StaffLoginRequest(domain = "clinic1", email = "staff@example.com", password = "password")

        `when`(clinicEntityRepository.findByDomainIgnoreCase("clinic1")).thenReturn(Optional.of(clinic))
        `when`(appUserRepository.findByEmail(request.email)).thenReturn(Optional.of(user))
        `when`(clinicStaffRepository.existsByIdClinicIdAndIdStaffId(clinic.id, user.id)).thenReturn(true)
        `when`(passwordEncoder.matches(request.password, user.passwordHash)).thenReturn(true)
        `when`(tokenService.generateToken(user.id, tenant.id, user.role.name, user.email, clinic.id))
            .thenReturn("staff_token")

        val response = authService.loginStaff(request)

        assertEquals("staff_token", response.token)
        assertEquals("DOCTOR", response.role)
        assertEquals(clinic.id, response.clinicId)
    }
}
