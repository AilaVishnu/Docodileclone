package com.example.docodile.web

import com.example.docodile.domain.CorrectionRequest
import com.example.docodile.domain.DeletionRequest
import com.example.docodile.domain.DeletionRequestStatus
import com.example.docodile.service.CorrectionRequestService
import com.example.docodile.service.DeletionRequestService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

data class SubmitDeletionRequest(val patientId: UUID, val reason: String?)
data class TransitionRequest(val status: String, val rejectionNote: String? = null)
data class SubmitCorrectionRequest(val patientId: UUID, val fieldName: String, val oldValue: String?, val newValue: String)
data class ReviewCorrectionRequest(val approve: Boolean, val rejectionNote: String? = null)

@RestController
@RequestMapping("/api/data-requests")
class DataWorkflowController(
    private val deletionService: DeletionRequestService,
    private val correctionService: CorrectionRequestService,
) {

    // ── Deletion workflow ──────────────────────────────────────────────────────

    @GetMapping("/deletions")
    @PreAuthorize("hasAnyRole('ADMIN')")
    fun listDeletions(): List<DeletionRequest> = deletionService.list()

    @PostMapping("/deletions")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun submitDeletion(@RequestBody req: SubmitDeletionRequest): ResponseEntity<DeletionRequest> =
        ResponseEntity.status(201).body(deletionService.submit(req.patientId, req.reason))

    @PostMapping("/deletions/{id}/transition")
    @PreAuthorize("hasRole('ADMIN')")
    fun transitionDeletion(
        @PathVariable id: UUID,
        @RequestBody req: TransitionRequest,
    ): DeletionRequest {
        val status = runCatching { DeletionRequestStatus.valueOf(req.status.uppercase()) }
            .getOrElse { throw IllegalArgumentException("Unknown status: ${req.status}") }
        return deletionService.transition(id, status, req.rejectionNote)
    }

    // ── Correction workflow ────────────────────────────────────────────────────

    @GetMapping("/corrections")
    @PreAuthorize("hasAnyRole('ADMIN')")
    fun listCorrections(): List<CorrectionRequest> = correctionService.list()

    @PostMapping("/corrections")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun submitCorrection(@RequestBody req: SubmitCorrectionRequest): ResponseEntity<CorrectionRequest> =
        ResponseEntity.status(201).body(
            correctionService.submit(req.patientId, req.fieldName, req.oldValue, req.newValue)
        )

    @PostMapping("/corrections/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    fun reviewCorrection(
        @PathVariable id: UUID,
        @RequestBody req: ReviewCorrectionRequest,
    ): CorrectionRequest = correctionService.review(id, req.approve, req.rejectionNote)

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleBadRequest(e: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
}
