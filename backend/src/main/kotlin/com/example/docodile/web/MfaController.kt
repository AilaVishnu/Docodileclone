package com.example.docodile.web

import com.example.docodile.service.AuthService
import com.example.docodile.service.MfaService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class MfaCodeRequest(val code: String)
data class MfaCompleteRequest(val mfaPendingToken: String, val code: String)

@RestController
@RequestMapping("/auth/mfa")
class MfaController(
    private val mfaService: MfaService,
    private val authService: AuthService,
) {

    @PostMapping("/enroll")
    @PreAuthorize("isAuthenticated()")
    fun beginEnrollment(): ResponseEntity<MfaService.EnrollmentResponse> =
        ResponseEntity.ok(mfaService.beginEnrollment())

    @PostMapping("/confirm")
    @PreAuthorize("isAuthenticated()")
    fun confirmEnrollment(@RequestBody req: MfaCodeRequest): ResponseEntity<Map<String, Any>> {
        val ok = mfaService.confirmEnrollment(req.code)
        return if (ok) ResponseEntity.ok(mapOf("enrolled" to true))
        else ResponseEntity.badRequest().body(mapOf("error" to "Invalid TOTP code"))
    }

    @PostMapping("/verify")
    @PreAuthorize("isAuthenticated()")
    fun verifyCode(@RequestBody req: MfaCodeRequest): ResponseEntity<Map<String, Any>> {
        val ok = mfaService.verifyCode(req.code)
        return if (ok) ResponseEntity.ok(mapOf("verified" to true))
        else ResponseEntity.status(401).body(mapOf("error" to "Invalid MFA code"))
    }

    @PostMapping("/complete")
    fun completeMfaLogin(@RequestBody req: MfaCompleteRequest): ResponseEntity<Any> {
        // First verify the TOTP code using the userId from the pending token
        val userId = mfaService.verifyFromPendingToken(req.mfaPendingToken, req.code)
            ?: return ResponseEntity.status(401).body(mapOf("error" to "Invalid MFA code"))
        return try {
            ResponseEntity.ok(authService.completeMfaLogin(req.mfaPendingToken))
        } catch (e: org.springframework.security.authentication.BadCredentialsException) {
            ResponseEntity.status(401).body(mapOf("error" to e.message))
        }
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleBadRequest(e: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
}
