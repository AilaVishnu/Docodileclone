package com.example.docodile.web

import com.example.docodile.domain.AuditAction
import com.example.docodile.service.AuditService
import com.example.docodile.service.ConsentService
import com.example.docodile.service.VisitService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api")
class VisitController(
    private val visitService: VisitService,
    private val auditService: AuditService,
    private val consentService: ConsentService,
) {

    @GetMapping("/patients/{patientId}/visits")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun listForPatient(@PathVariable patientId: UUID): List<VisitDTO> {
        consentService.checkConsent(patientId)
        auditService.log(AuditAction.PATIENT_ACCESS, entityType = "Patient", entityId = patientId)
        return visitService.listForPatient(patientId)
    }

    @GetMapping("/visits/{visitId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun get(@PathVariable visitId: UUID): ResponseEntity<Any> = try {
        val dto = visitService.get(visitId)
        auditService.log(AuditAction.PATIENT_ACCESS, entityType = "Visit", entityId = visitId)
        ResponseEntity.ok(dto)
    } catch (e: IllegalArgumentException) {
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }

    @PostMapping("/patients/{patientId}/visits")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun create(
        @PathVariable patientId: UUID,
        @Valid @RequestBody request: SaveVisitRequest
    ): ResponseEntity<Any> = try {
        consentService.checkConsent(patientId)
        val dto = visitService.create(patientId, request)
        auditService.log(AuditAction.PRESCRIPTION_CREATED, entityType = "Visit", entityId = patientId)
        ResponseEntity.ok(dto)
    } catch (e: IllegalArgumentException) {
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }

    @PutMapping("/visits/{visitId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun update(
        @PathVariable visitId: UUID,
        @Valid @RequestBody request: SaveVisitRequest
    ): ResponseEntity<Any> = try {
        val dto = visitService.update(visitId, request)
        auditService.log(AuditAction.PRESCRIPTION_UPDATED, entityType = "Visit", entityId = visitId)
        ResponseEntity.ok(dto)
    } catch (e: IllegalArgumentException) {
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }

    @DeleteMapping("/visits/{visitId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    fun delete(@PathVariable visitId: UUID): ResponseEntity<Any> = try {
        visitService.delete(visitId)
        auditService.log(AuditAction.PRESCRIPTION_DELETED, entityType = "Visit", entityId = visitId)
        ResponseEntity.noContent().build()
    } catch (e: IllegalArgumentException) {
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }
}
