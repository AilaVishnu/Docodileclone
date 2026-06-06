package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.RevokedToken
import com.example.docodile.domain.Role
import com.example.docodile.domain.UserSession
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.ClinicStaffRepository
import com.example.docodile.repo.RevokedTokenRepository
import com.example.docodile.repo.UserSessionRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.security.TokenService
import com.example.docodile.web.LoginRequest
import com.example.docodile.web.LoginResponse
import com.example.docodile.web.StaffLoginRequest
import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.LockedException
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import java.time.Instant
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
    private val revokedTokenRepository: RevokedTokenRepository,
    private val userSessionRepository: UserSessionRepository,
) {
    @Transactional
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

        checkAccountLockout(user)

        if (!verifyPassword(request.password, user.passwordHash!!, user)) {
            recordFailedAttempt(user)
            auditService.log(
                action   = AuditAction.LOGIN_FAILURE,
                outcome  = "FAILURE",
                actorId  = user.id,
                tenantId = user.tenant?.id,
                metadata = mapOf("email" to request.email),
            )
            throw BadCredentialsException("Invalid credentials")
        }

        user.failedLoginAttempts = 0
        user.lockedUntil = null
        appUserRepository.save(user)

        // If MFA is enabled, issue a short-lived pending token instead of the full JWT
        if (user.mfaEnabled) {
            val mfaToken = tokenService.generateMfaPendingToken(user.id)
            auditService.log(
                action   = AuditAction.MFA_VERIFIED,
                outcome  = "MFA_REQUIRED",
                actorId  = user.id,
                tenantId = user.tenant?.id,
                metadata = mapOf("step" to "password_ok_mfa_pending"),
            )
            return LoginResponse(
                token      = mfaToken,
                role       = user.role.name,
                clinicId   = null,
                clinicName = "mfa_required",
                gender     = user.gender,
                mfaPending = true
            )
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
        val expiresAt = Instant.now().plusMillis(tokenService.expirationMs)
        recordSession(token, user.id, expiresAt)

        auditService.log(
            action   = AuditAction.LOGIN_SUCCESS,
            actorId  = user.id,
            tenantId = tenantId,
            clinicId = clinic?.id,
        )

        val clinicName = clinic?.name ?: "your clinic"
        return LoginResponse(token = token, role = user.role.name, clinicId = clinic?.id, clinicName = clinicName, gender = user.gender)
    }

    @Transactional
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

        checkAccountLockout(user)

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

        if (user.passwordHash == null || !verifyPassword(request.password, user.passwordHash!!, user)) {
            recordFailedAttempt(user)
            auditService.log(
                action   = AuditAction.LOGIN_FAILURE,
                outcome  = "FAILURE",
                actorId  = user.id,
                tenantId = clinic.tenant?.id,
                metadata = mapOf("email" to request.email),
            )
            throw BadCredentialsException("Invalid credentials")
        }

        user.failedLoginAttempts = 0
        user.lockedUntil = null
        appUserRepository.save(user)

        // If MFA is enabled, issue a short-lived pending token instead of the full JWT
        if (user.mfaEnabled) {
            val mfaToken = tokenService.generateMfaPendingToken(user.id)
            auditService.log(
                action   = AuditAction.MFA_VERIFIED,
                outcome  = "MFA_REQUIRED",
                actorId  = user.id,
                tenantId = user.tenant?.id,
                metadata = mapOf("step" to "password_ok_mfa_pending"),
            )
            return LoginResponse(
                token      = mfaToken,
                role       = user.role.name,
                clinicId   = null,
                clinicName = "mfa_required",
                gender     = user.gender,
                mfaPending = true
            )
        }

        val tenantId = clinic.tenant?.id ?: throw BadCredentialsException("Invalid credentials")
        val token = tokenService.generateToken(user.id, tenantId, user.role.name, user.email, clinic.id)
        val expiresAt = Instant.now().plusMillis(tokenService.expirationMs)
        recordSession(token, user.id, expiresAt)

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

    @Transactional
    fun logout(bearerToken: String?) {
        if (bearerToken != null) {
            val token = bearerToken.removePrefix("Bearer ").trim()
            revokeToken(token)
        }
        auditService.log(action = AuditAction.LOGOUT)
    }

    @Transactional
    fun logoutAll() {
        val userId = currentUser.userId()
        val now = Instant.now()
        // Revoke all active sessions in the session table
        val sessions = userSessionRepository.findAllByUserIdAndRevokedAtIsNull(userId)
        sessions.forEach { s ->
            s.revokedAt = now
            revokedTokenRepository.save(
                RevokedToken(jti = s.jti, userId = userId, expiresAt = s.expiresAt)
            )
        }
        userSessionRepository.saveAll(sessions)
        userSessionRepository.revokeAllForUser(userId, now)
        auditService.log(action = AuditAction.TOKEN_REVOKED, metadata = mapOf("revokedSessions" to sessions.size))
    }

    private fun revokeToken(token: String) {
        val jti = tokenService.extractJti(token) ?: return
        val userId = currentUser.userId()
        val expiresAt = runCatching {
            tokenService.parseClaims(token).expiration?.toInstant() ?: Instant.now()
        }.getOrElse { Instant.now() }
        revokedTokenRepository.save(RevokedToken(jti = jti, userId = userId, expiresAt = expiresAt))
        userSessionRepository.findByJti(jti)?.let { s ->
            s.revokedAt = Instant.now()
            userSessionRepository.save(s)
        }
        auditService.log(action = AuditAction.TOKEN_REVOKED)
    }

    private fun recordSession(token: String, userId: UUID, expiresAt: Instant) {
        val jti = tokenService.extractJti(token) ?: return
        val httpReq = (RequestContextHolder.getRequestAttributes() as? ServletRequestAttributes)?.request
        userSessionRepository.save(
            UserSession(
                userId    = userId,
                jti       = jti,
                ipAddress = httpReq?.remoteAddr,
                userAgent = httpReq?.getHeader("User-Agent"),
                expiresAt = expiresAt,
            )
        )
    }

    @Transactional
    fun unlockAccount(userId: UUID) {
        val callerTenantId = currentUser.tenantId()
        val user = appUserRepository.findById(userId)
            .filter { it.tenant?.id == callerTenantId }
            .orElseThrow { IllegalArgumentException("User not found") }
        user.failedLoginAttempts = 0
        user.lockedUntil = null
        appUserRepository.save(user)
        auditService.log(
            action     = AuditAction.ACCOUNT_UNLOCKED,
            entityType = "AppUser",
            entityId   = userId,
        )
    }

    private fun checkAccountLockout(user: com.example.docodile.domain.AppUser) {
        val lockedUntil = user.lockedUntil ?: return
        if (lockedUntil.isAfter(Instant.now())) {
            val secondsRemaining = lockedUntil.epochSecond - Instant.now().epochSecond
            throw LockedException("Account locked. Try again in $secondsRemaining seconds.")
        }
        // Lock has expired — clear it so the next success resets cleanly
        user.lockedUntil = null
        user.failedLoginAttempts = 0
    }

    private fun recordFailedAttempt(user: com.example.docodile.domain.AppUser) {
        user.failedLoginAttempts++
        if (user.failedLoginAttempts >= LOCKOUT_THRESHOLD) {
            user.lockedUntil = Instant.now().plusSeconds(LOCKOUT_SECONDS)
            auditService.log(
                action   = AuditAction.ACCOUNT_LOCKED,
                entityType = "AppUser",
                entityId   = user.id,
                actorId    = user.id,
                tenantId   = user.tenant?.id,
                metadata   = mapOf("failedAttempts" to user.failedLoginAttempts),
            )
        }
        appUserRepository.save(user)
    }

    private fun verifyPassword(
        rawPassword: String,
        storedHash: String,
        user: com.example.docodile.domain.AppUser,
    ): Boolean {
        // BCrypt hashes start with $2a$ / $2b$ / $2y$. If the stored hash is
        // still BCrypt (from before the Argon2id migration), verify with BCrypt
        // and transparently re-hash with Argon2id so next login uses the new algo.
        val isBcrypt = storedHash.startsWith("\$2a\$") || storedHash.startsWith("\$2b\$") || storedHash.startsWith("\$2y\$")
        if (isBcrypt) {
            val bcrypt = BCryptPasswordEncoder()
            if (!bcrypt.matches(rawPassword, storedHash)) return false
            // Upgrade to Argon2id in-place
            user.passwordHash = passwordEncoder.encode(rawPassword)
            appUserRepository.save(user)
            return true
        }
        return passwordEncoder.matches(rawPassword, storedHash)
    }

    companion object {
        private const val LOCKOUT_THRESHOLD = 5
        private const val LOCKOUT_SECONDS = 15 * 60L // 15 minutes
    }

    @Transactional
    fun completeMfaLogin(mfaPendingToken: String): LoginResponse {
        if (!tokenService.isMfaPendingToken(mfaPendingToken)) {
            throw BadCredentialsException("Invalid token")
        }
        val userId = tokenService.extractUserId(mfaPendingToken)
            ?: throw BadCredentialsException("Invalid token")

        // Single-use: revoke the pending token immediately so it cannot be
        // replayed within its 5-minute / 30-second-TOTP window. If its jti is
        // already revoked, this token has been used — reject.
        val jti = tokenService.extractJti(mfaPendingToken)
        if (jti != null) {
            if (revokedTokenRepository.existsByJti(jti)) {
                throw BadCredentialsException("Invalid token")
            }
            val pendingExpiry = runCatching {
                tokenService.parseClaims(mfaPendingToken).expiration?.toInstant() ?: Instant.now()
            }.getOrElse { Instant.now() }
            revokedTokenRepository.save(RevokedToken(jti = jti, userId = userId, expiresAt = pendingExpiry))
        }

        val user = appUserRepository.findById(userId)
            .orElseThrow { BadCredentialsException("Invalid credentials") }
        val tenantId = user.tenant?.id ?: throw BadCredentialsException("Invalid credentials")
        val clinic = clinicEntityRepository.findFirstByTenantIdOrderByCreatedAtAsc(tenantId).orElse(null)
        val token = tokenService.generateToken(user.id, tenantId, user.role.name, user.email, clinic?.id)
        val expiresAt = Instant.now().plusMillis(tokenService.expirationMs)
        recordSession(token, user.id, expiresAt)
        auditService.log(
            action   = AuditAction.LOGIN_SUCCESS,
            actorId  = user.id,
            tenantId = tenantId,
            clinicId = clinic?.id,
            metadata = mapOf("method" to "totp"),
        )
        return LoginResponse(token = token, role = user.role.name, clinicId = clinic?.id,
            clinicName = clinic?.name ?: "your clinic", gender = user.gender)
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
