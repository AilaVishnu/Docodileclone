package com.example.docodile.service

import com.example.docodile.domain.Role
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.ClinicStaffRepository
import com.example.docodile.security.TokenService
import com.example.docodile.web.LoginRequest
import com.example.docodile.web.LoginResponse
import com.example.docodile.web.StaffLoginRequest
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val appUserRepository: AppUserRepository,
    private val clinicEntityRepository: ClinicEntityRepository,
    private val clinicStaffRepository: ClinicStaffRepository,
    private val passwordEncoder: PasswordEncoder,
    private val tokenService: TokenService
) {
    fun login(request: LoginRequest): LoginResponse {
        val user = appUserRepository.findByEmail(request.email)
            .orElseThrow { BadCredentialsException("Invalid credentials") }

        if (!user.active) {
            throw BadCredentialsException("Invalid credentials")
        }

        if (user.role != Role.ADMIN) {
            throw BadCredentialsException("Invalid credentials")
        }

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw BadCredentialsException("Invalid credentials")
        }

        val tenantId = user.tenant?.id ?: throw BadCredentialsException("Invalid credentials")
        val clinic = clinicEntityRepository.findAllByTenantId(tenantId).firstOrNull()
        val token = tokenService.generateToken(user.id, tenantId, user.role.name, user.email, clinic?.id)

        val clinicName = clinic?.name ?: "your clinic"
        return LoginResponse(token = token, role = user.role.name, clinicId = clinic?.id, clinicName = clinicName)
    }

    fun loginStaff(request: StaffLoginRequest): LoginResponse {
        val clinic = clinicEntityRepository.findByDomainIgnoreCase(request.domain.trim())
            .orElseThrow { BadCredentialsException("Invalid credentials") }

        val user = appUserRepository.findByEmail(request.email)
            .orElseThrow { BadCredentialsException("Invalid credentials") }

        if (!user.active || user.role == Role.ADMIN) {
            throw BadCredentialsException("Invalid credentials")
        }

        val isMember = clinicStaffRepository.existsByIdClinicIdAndIdStaffId(clinic.id, user.id)
        if (!isMember) {
            throw BadCredentialsException("Invalid credentials")
        }

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw BadCredentialsException("Invalid credentials")
        }

        val tenantId = clinic.tenant?.id ?: throw BadCredentialsException("Invalid credentials")
        val token = tokenService.generateToken(user.id, tenantId, user.role.name, user.email, clinic.id)
        return LoginResponse(
            token = token,
            role = user.role.name,
            clinicId = clinic.id,
            clinicName = clinic.name
        )
    }
}
