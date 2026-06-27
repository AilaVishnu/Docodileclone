package com.example.docodile.web

import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicSettingsRepository
import com.example.docodile.service.EmailService
import com.example.docodile.service.PasswordTokenService
import com.example.docodile.service.TokenInvalidException
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*
import java.util.UUID

data class SetupPasswordRequest(
    val token: String,
    val password: String,
    val confirmPassword: String,
)

@RestController
class PasswordSetupController(
    private val passwordTokenService: PasswordTokenService,
    private val appUserRepository: AppUserRepository,
    private val clinicSettingsRepository: ClinicSettingsRepository,
    private val passwordEncoder: PasswordEncoder,
    private val emailService: EmailService,
) {
    @GetMapping("/auth/validate-token")
    fun validateToken(@RequestParam token: String): ResponseEntity<Map<String, Any?>> {
        return try {
            val prt = passwordTokenService.validateToken(token)
            val user = appUserRepository.findById(prt.userId).orElse(null)
            ResponseEntity.ok(mapOf(
                "valid" to true,
                "role" to user?.role?.name,
                "name" to user?.name,
            ))
        } catch (e: Exception) {
            ResponseEntity.ok(mapOf("valid" to false, "role" to null, "name" to null))
        }
    }

    @PostMapping("/auth/forgot-password")
    fun forgotPassword(@RequestBody request: ForgotPasswordRequest): ResponseEntity<Map<String, Any?>> {
        // The clinic is resolved from the request subdomain (tenant schema), so the
        // user lookup is implicitly clinic-scoped — any active user of this clinic
        // may request a password reset.
        val email = request.email.trim()
        val user = appUserRepository.findByEmail(email).orElse(null)
            ?: return ResponseEntity.status(404).body(mapOf("error" to "Email ID does not exist"))

        if (!user.active) {
            return ResponseEntity.status(404).body(mapOf("error" to "Email ID does not exist"))
        }

        val rawToken = passwordTokenService.generateToken(user.id)
        val resetLink = passwordTokenService.buildSetupLink(rawToken)
        emailService.sendPasswordResetEmail(user.email, user.name ?: "", resetLink)

        return ResponseEntity.ok(mapOf("success" to true))
    }

    @PostMapping("/auth/setup-password")
    fun setupPassword(@RequestBody request: SetupPasswordRequest): ResponseEntity<Map<String, Any?>> {
        if (request.password.length < 8) {
            return ResponseEntity.badRequest()
                .body(mapOf("error" to "Password must be at least 8 characters"))
        }
        if (request.password != request.confirmPassword) {
            return ResponseEntity.badRequest()
                .body(mapOf("error" to "Passwords do not match"))
        }

        return try {
            val prt = passwordTokenService.validateToken(request.token)
            val user = appUserRepository.findById(prt.userId)
                .orElseThrow { IllegalStateException("User not found") }

            user.passwordHash = passwordEncoder.encode(request.password)
            user.accountStatus = "ACTIVE"
            appUserRepository.save(user)
            passwordTokenService.markUsed(prt)

            ResponseEntity.ok(mapOf("success" to true))
        } catch (e: TokenInvalidException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

    @PostMapping("/api/tenant/staff/{staffId}/resend-welcome")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    fun resendWelcome(@PathVariable staffId: UUID): ResponseEntity<Map<String, Any?>> {
        val user = appUserRepository.findById(staffId)
            .orElseThrow { IllegalArgumentException("Staff member not found") }

        val rawToken = passwordTokenService.generateToken(user.id)
        val setupLink = passwordTokenService.buildSetupLink(rawToken)
        val clinicName = clinicSettingsRepository.findAll().firstOrNull()?.name ?: "your clinic"
        emailService.sendWelcomeEmail(user.email, user.name ?: "", clinicName, setupLink)

        return ResponseEntity.ok(mapOf("success" to true))
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
}
