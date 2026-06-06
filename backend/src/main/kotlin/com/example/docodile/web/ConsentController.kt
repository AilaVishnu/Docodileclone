package com.example.docodile.web

import com.example.docodile.domain.PatientConsent
import com.example.docodile.service.ConsentService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

data class GrantConsentRequest(
    @field:NotBlank val purpose: String,
    @field:NotBlank @field:Size(max = 50) val version: String
)

@RestController
@RequestMapping("/api/patients/{patientId}/consent")
class ConsentController(private val consentService: ConsentService) {

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun list(@PathVariable patientId: UUID): List<PatientConsent> =
        consentService.listConsents(patientId)

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun grant(
        @PathVariable patientId: UUID,
        @Valid @RequestBody request: GrantConsentRequest,
    ): ResponseEntity<PatientConsent> {
        val consent = consentService.grantConsent(patientId, request.purpose, request.version)
        return ResponseEntity.status(201).body(consent)
    }

    @DeleteMapping("/{consentId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun withdraw(
        @PathVariable patientId: UUID,
        @PathVariable consentId: UUID,
    ): ResponseEntity<Void> {
        consentService.withdrawConsent(patientId, consentId)
        return ResponseEntity.noContent().build()
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
}
