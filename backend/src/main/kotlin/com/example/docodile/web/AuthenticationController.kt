package com.example.docodile.web

import com.example.docodile.service.AuthService
import com.example.docodile.web.StaffLoginRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.LockedException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/auth")
class AuthenticationController(private val authService: AuthService) {
    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {
        return ResponseEntity.ok(authService.login(request))
    }

    @PostMapping("/staff/login")
    fun staffLogin(@RequestBody request: StaffLoginRequest): ResponseEntity<LoginResponse> {
        return ResponseEntity.ok(authService.loginStaff(request))
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    fun logout(): ResponseEntity<Void> {
        authService.logout()
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/switch-clinic")
    @PreAuthorize("hasRole('ADMIN')")
    fun switchClinic(@RequestBody request: SwitchClinicRequest): ResponseEntity<LoginResponse> {
        return ResponseEntity.ok(authService.switchClinic(request.clinicId))
    }

    @PostMapping("/admin/users/{userId}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    fun unlockAccount(@PathVariable userId: UUID): ResponseEntity<Void> {
        authService.unlockAccount(userId)
        return ResponseEntity.noContent().build()
    }

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentials(): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(mapOf("error" to "Invalid credentials"))
    }

    @ExceptionHandler(LockedException::class)
    fun handleLocked(e: LockedException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body(mapOf("error" to (e.message ?: "Account temporarily locked")))
    }
}
