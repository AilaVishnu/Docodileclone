package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.UserSession
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.UserSessionRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.security.TokenService
import com.example.docodile.tenancy.TenantContext
import com.example.docodile.web.LoginRequest
import com.example.docodile.web.LoginResponse
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
    private val passwordEncoder: PasswordEncoder,
    private val tokenService: TokenService,
    private val currentUser: CurrentUser,
    private val auditService: AuditService,
    private val userSessionRepository: UserSessionRepository,
) {
    /**
     * Single login. The clinic (tenant schema) is resolved from the request
     * subdomain by TenantResolutionFilter and exposed via TenantContext; the
     * user lookup is implicitly scoped to that schema by Hibernate multitenancy.
     */
    @Transactional
    fun login(request: LoginRequest): LoginResponse {
        val schema = TenantContext.get()
            ?: throw BadCredentialsException("Invalid credentials")

        val user = appUserRepository.findByEmail(request.email).orElse(null)
        if (user == null || !user.active || user.passwordHash == null) {
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
                action  = AuditAction.LOGIN_FAILURE,
                outcome = "FAILURE",
                actorId = user.id,
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
                action  = AuditAction.MFA_VERIFIED,
                outcome = "MFA_REQUIRED",
                actorId = user.id,
                metadata = mapOf("step" to "password_ok_mfa_pending"),
            )
            return LoginResponse(token = mfaToken, role = user.role.name, gender = user.gender, mfaPending = true)
        }

        val token = issueSession(user.id, schema, user.role.name, user.email)
        auditService.log(action = AuditAction.LOGIN_SUCCESS, actorId = user.id)
        return LoginResponse(token = token, role = user.role.name, gender = user.gender)
    }

    @Transactional
    fun completeMfaLogin(mfaPendingToken: String): LoginResponse {
        if (!tokenService.isMfaPendingToken(mfaPendingToken)) {
            throw BadCredentialsException("Invalid token")
        }
        val schema = TenantContext.get() ?: throw BadCredentialsException("Invalid token")
        val userId = tokenService.extractUserId(mfaPendingToken)
            ?: throw BadCredentialsException("Invalid token")

        // Single-use: mark the pending token's jti consumed (a revoked session row).
        // If it's already marked, the pending token has been used — reject.
        val jti = tokenService.extractJti(mfaPendingToken)
        if (jti != null) {
            if (userSessionRepository.findByJti(jti)?.revokedAt != null) {
                throw BadCredentialsException("Invalid token")
            }
            val pendingExpiry = runCatching {
                tokenService.parseClaims(mfaPendingToken).expiration?.toInstant() ?: Instant.now()
            }.getOrElse { Instant.now() }
            userSessionRepository.save(
                UserSession(userId = userId, jti = jti, expiresAt = pendingExpiry, revokedAt = Instant.now())
            )
        }

        val user = appUserRepository.findById(userId)
            .orElseThrow { BadCredentialsException("Invalid credentials") }
        val token = issueSession(user.id, schema, user.role.name, user.email)
        auditService.log(action = AuditAction.LOGIN_SUCCESS, actorId = user.id, metadata = mapOf("method" to "totp"))
        return LoginResponse(token = token, role = user.role.name, gender = user.gender)
    }

    @Transactional
    fun logout(bearerToken: String?) {
        if (bearerToken != null) {
            val token = bearerToken.removePrefix("Bearer ").trim()
            tokenService.extractJti(token)?.let { jti ->
                userSessionRepository.findByJti(jti)?.let { s ->
                    s.revokedAt = Instant.now()
                    userSessionRepository.save(s)
                }
            }
        }
        auditService.log(action = AuditAction.LOGOUT)
    }

    @Transactional
    fun logoutAll() {
        val userId = currentUser.userId()
        val revoked = userSessionRepository.revokeAllForUser(userId, Instant.now())
        auditService.log(action = AuditAction.TOKEN_REVOKED, metadata = mapOf("revokedSessions" to revoked))
    }

    @Transactional
    fun unlockAccount(userId: UUID) {
        // Schema-scoped: the user lives in the caller's clinic schema.
        val user = appUserRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        user.failedLoginAttempts = 0
        user.lockedUntil = null
        appUserRepository.save(user)
        auditService.log(action = AuditAction.ACCOUNT_UNLOCKED, entityType = "AppUser", entityId = userId)
    }

    private fun issueSession(userId: UUID, schema: String, role: String, email: String): String {
        val token = tokenService.generateToken(userId, schema, role, email)
        val jti = tokenService.extractJti(token)
        if (jti != null) {
            val httpReq = (RequestContextHolder.getRequestAttributes() as? ServletRequestAttributes)?.request
            userSessionRepository.save(
                UserSession(
                    userId    = userId,
                    jti       = jti,
                    ipAddress = httpReq?.remoteAddr,
                    userAgent = httpReq?.getHeader("User-Agent"),
                    expiresAt = Instant.now().plusMillis(tokenService.expirationMs),
                )
            )
        }
        return token
    }

    private fun checkAccountLockout(user: com.example.docodile.domain.AppUser) {
        val lockedUntil = user.lockedUntil ?: return
        if (lockedUntil.isAfter(Instant.now())) {
            val secondsRemaining = lockedUntil.epochSecond - Instant.now().epochSecond
            throw LockedException("Account locked. Try again in $secondsRemaining seconds.")
        }
        user.lockedUntil = null
        user.failedLoginAttempts = 0
    }

    private fun recordFailedAttempt(user: com.example.docodile.domain.AppUser) {
        user.failedLoginAttempts++
        if (user.failedLoginAttempts >= LOCKOUT_THRESHOLD) {
            user.lockedUntil = Instant.now().plusSeconds(LOCKOUT_SECONDS)
            auditService.log(
                action     = AuditAction.ACCOUNT_LOCKED,
                entityType = "AppUser",
                entityId   = user.id,
                actorId    = user.id,
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
        // BCrypt hashes start with $2a$/$2b$/$2y$. Verify legacy BCrypt then re-hash to Argon2id.
        val isBcrypt = storedHash.startsWith("\$2a\$") || storedHash.startsWith("\$2b\$") || storedHash.startsWith("\$2y\$")
        if (isBcrypt) {
            val bcrypt = BCryptPasswordEncoder()
            if (!bcrypt.matches(rawPassword, storedHash)) return false
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
}
