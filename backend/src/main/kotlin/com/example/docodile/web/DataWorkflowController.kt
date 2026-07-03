package com.example.docodile.web

import com.example.docodile.domain.DataSubjectRequest
import com.example.docodile.service.DataSubjectRequestService
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
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

data class SubmitDeletionRequest(val patientId: UUID, @field:Size(max = 1000) val reason: String?)
data class TransitionRequest(val status: String, val rejectionNote: String? = null)
data class SubmitCorrectionRequest(
    val patientId: UUID,
    @field:NotBlank @field:Size(max = 100) val fieldName: String,
    @field:Size(max = 5000) val oldValue: String?,
    @field:NotBlank @field:Size(max = 5000) val newValue: String
)
data class ReviewCorrectionRequest(val approve: Boolean, @field:Size(max = 1000) val rejectionNote: String? = null)

@RestController
@RequestMapping("/api/data-requests")
class DataWorkflowController(
    private val dataSubjectRequestService: DataSubjectRequestService,
) {

    // ── Deletion workflow ──────────────────────────────────────────────────────

    @GetMapping("/deletions")
    @PreAuthorize("hasAnyRole('ADMIN')")
    fun listDeletions(): List<DataSubjectRequest> = dataSubjectRequestService.listDeletions()

    @PostMapping("/deletions")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun submitDeletion(@Valid @RequestBody req: SubmitDeletionRequest): ResponseEntity<DataSubjectRequest> =
        ResponseEntity.status(201).body(dataSubjectRequestService.submitDeletion(req.patientId, req.reason))

    @PostMapping("/deletions/{id}/transition")
    @PreAuthorize("hasRole('ADMIN')")
    fun transitionDeletion(
        @PathVariable id: UUID,
        @RequestBody req: TransitionRequest,
    ): DataSubjectRequest = dataSubjectRequestService.transitionDeletion(id, req.status.uppercase(), req.rejectionNote)

    // ── Correction workflow ────────────────────────────────────────────────────

    @GetMapping("/corrections")
    @PreAuthorize("hasAnyRole('ADMIN')")
    fun listCorrections(): List<DataSubjectRequest> = dataSubjectRequestService.listCorrections()

    @PostMapping("/corrections")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun submitCorrection(@Valid @RequestBody req: SubmitCorrectionRequest): ResponseEntity<DataSubjectRequest> =
        ResponseEntity.status(201).body(
            dataSubjectRequestService.submitCorrection(req.patientId, req.fieldName, req.oldValue, req.newValue)
        )

    @PostMapping("/corrections/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    fun reviewCorrection(
        @PathVariable id: UUID,
        @Valid @RequestBody req: ReviewCorrectionRequest,
    ): DataSubjectRequest = dataSubjectRequestService.reviewCorrection(id, req.approve, req.rejectionNote)

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleBadRequest(e: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
}
