package com.example.docodile.web

import com.example.docodile.service.VisitService
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
class VisitController(private val visitService: VisitService) {

    @GetMapping("/patients/{patientId}/visits")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun listForPatient(@PathVariable patientId: UUID): List<VisitDTO> =
        visitService.listForPatient(patientId)

    @GetMapping("/active-sessions")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun activeSessions(): List<ActiveSessionDTO> = visitService.listActiveSessions()

    @GetMapping("/visits/{visitId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun get(@PathVariable visitId: UUID): ResponseEntity<Any> = try {
        ResponseEntity.ok(visitService.get(visitId))
    } catch (e: IllegalArgumentException) {
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }

    @PostMapping("/patients/{patientId}/visits")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun create(
        @PathVariable patientId: UUID,
        @RequestBody request: SaveVisitRequest
    ): ResponseEntity<Any> = try {
        ResponseEntity.ok(visitService.create(patientId, request))
    } catch (e: IllegalArgumentException) {
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }

    @PutMapping("/visits/{visitId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun update(
        @PathVariable visitId: UUID,
        @RequestBody request: SaveVisitRequest
    ): ResponseEntity<Any> = try {
        ResponseEntity.ok(visitService.update(visitId, request))
    } catch (e: IllegalArgumentException) {
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }

    @DeleteMapping("/visits/{visitId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    fun delete(@PathVariable visitId: UUID): ResponseEntity<Any> = try {
        visitService.delete(visitId)
        ResponseEntity.noContent().build()
    } catch (e: IllegalArgumentException) {
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }
}
