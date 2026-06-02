package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.Role
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.ClinicStaffRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.security.TokenService
import com.example.docodile.web.LoginRequest
import com.example.docodile.web.LoginResponse
import com.example.docodile.web.StaffLoginRequest
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AuthService(
    private val appUserRepository: AppUserRepository,
    private val clinicEntityRepository: ClinicEntityRepository,
    private val clinicStaffRepository: ClinicStaffRepository,
    private val passwordEncoder: PasswordEncoder,
    private val tokenService: TokenService,
    private val currentUser: CurrentUser,
    private val auditService: AuditService,
) {
    fun login(request: LoginRequest): LoginResponse {
        val user = appUserRepository.findByEmail(request.email).orElse(null)

        if (user == null || !user.active || user.role != Role.ADMIN || user.passwordHash == null) {
            auditService.log(
                action = AuditAction.LOGIN_FAILURE,
                outcome = "FAILURE",
                metadata = mapOf("email" to request.email),
            )
            throw BadCredentialsException("Invalid credentials")
        }

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            auditService.log(
                action   = AuditAction.LOGIN_FAILURE,
                outcome  = "FAILURE",
                actorId  = user.id,
                tenantId = user.tenant?.id,
                metadata = mapOf("email" to request.email),
            )
            throw BadCredentialsException("Invalid credentials")
        }

        val tenantId = user.tenant?.id ?: throw BadCredentialsException("Invalid credentials")
        // Pick the oldest clinic in the tenant as the admin's default. This
        // used to be `findAllByTenantId(...).firstOrNull()`, which has no
        // ORDER BY — Postgres could return clinics in any order, and the
        // admin would land in a different clinic between logins (e.g. one
        // session in "Tskin", the next in "Your Clinic 2"), making
        // appointments and suggestion catalogues silently disappear.
        val clinic = clinicEntityRepository
            .findFirstByTenantIdOrderByCreatedAtAsc(tenantId)
            .orElse(null)
        val token = tokenService.generateToken(user.id, tenantId, user.role.name, user.email, clinic?.id)

        auditService.log(
            action   = AuditAction.LOGIN_SUCCESS,
            actorId  = user.id,
            tenantId = tenantId,
            clinicId = clinic?.id,
        )

        val clinicName = clinic?.name ?: "your clinic"
        return LoginResponse(token = token, role = user.role.name, clinicId = clinic?.id, clinicName = clinicName, gender = user.gender)
    }

    fun loginStaff(request: StaffLoginRequest): LoginResponse {
        val clinic = clinicEntityRepository.findByDomainIgnoreCase(request.domain.trim())
            .orElseThrow { BadCredentialsException("Invalid credentials") }

        val user = appUserRepository.findByEmail(request.email).orElse(null)

        if (user == null || !user.active || user.role == Role.ADMIN) {
            auditService.log(
                action  = AuditAction.LOGIN_FAILURE,
                outcome = "FAILURE",
                metadata = mapOf("email" to request.email, "domain" to request.domain),
            )
            throw BadCredentialsException("Invalid credentials")
        }

        val isMember = clinicStaffRepository.existsByIdClinicIdAndIdStaffId(clinic.id, user.id)
        if (!isMember) {
            auditService.log(
                action   = AuditAction.LOGIN_FAILURE,
                outcome  = "FAILURE",
                actorId  = user.id,
                metadata = mapOf("email" to request.email, "reason" to "not_a_member"),
            )
            throw BadCredentialsException("Invalid credentials")
        }

        if (user.passwordHash == null || !passwordEncoder.matches(request.password, user.passwordHash)) {
            auditService.log(
                action   = AuditAction.LOGIN_FAILURE,
                outcome  = "FAILURE",
                actorId  = user.id,
                tenantId = clinic.tenant?.id,
                metadata = mapOf("email" to request.email),
            )
            throw BadCredentialsException("Invalid credentials")
        }

        val tenantId = clinic.tenant?.id ?: throw BadCredentialsException("Invalid credentials")
        val token = tokenService.generateToken(user.id, tenantId, user.role.name, user.email, clinic.id)

        auditService.log(
            action   = AuditAction.LOGIN_SUCCESS,
            actorId  = user.id,
            tenantId = tenantId,
            clinicId = clinic.id,
        )

        return LoginResponse(
            token = token,
            role = user.role.name,
            clinicId = clinic.id,
            clinicName = clinic.name,
            gender = user.gender
        )
    }

    fun logout() {
        auditService.log(action = AuditAction.LOGOUT)
    }

    fun switchClinic(targetClinicId: UUID): LoginResponse {
        val userId   = currentUser.userId()
        val tenantId = currentUser.tenantId()
        val user     = appUserRepository.findById(userId)
            .orElseThrow { BadCredentialsException("User not found") }

        val clinic = clinicEntityRepository.findById(targetClinicId)
            .orElseThrow { BadCredentialsException("Clinic not found") }

        // Guard: clinic must belong to the same tenant
        if (clinic.tenant?.id != tenantId) {
            throw BadCredentialsException("Clinic not found")
        }

        val token = tokenService.generateToken(user.id, tenantId, user.role.name, user.email, clinic.id)
        return LoginResponse(
            token = token,
            role = user.role.name,
            clinicId = clinic.id,
            clinicName = clinic.name,
            gender = user.gender
        )
    }
}
