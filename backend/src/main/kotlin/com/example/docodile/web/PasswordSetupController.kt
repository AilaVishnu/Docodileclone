package com.example.docodile.web

import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.security.CurrentUser
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
    private val clinicEntityRepository: ClinicEntityRepository,
    private val passwordEncoder: PasswordEncoder,
    private val emailService: EmailService,
    private val currentUser: CurrentUser,
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
        val tenantId = currentUser.tenantId()
        val user = appUserRepository.findById(staffId)
            .filter { it.tenant?.id == tenantId }
            .orElseThrow { IllegalArgumentException("Staff member not found") }

        val rawToken = passwordTokenService.generateToken(user.id)
        val setupLink = passwordTokenService.buildSetupLink(rawToken)
        val clinicName = user.tenant?.id?.let {
            clinicEntityRepository.findFirstByTenantIdOrderByCreatedAtAsc(it).orElse(null)?.name
        } ?: "your clinic"
        emailService.sendWelcomeEmail(user.email, user.name ?: "", clinicName, setupLink)

        return ResponseEntity.ok(mapOf("success" to true))
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
}
