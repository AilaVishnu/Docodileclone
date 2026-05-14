package com.example.docodile.web

import com.example.docodile.service.AIService
import com.example.docodile.service.OpenAIClient
import com.example.docodile.service.PatientSummaryResult
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/ai")
class AIController(
    private val aiService: AIService,
    private val openAIClient: OpenAIClient,
) {

    @GetMapping("/health")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun health(): Map<String, Any> = mapOf("configured" to openAIClient.isConfigured())

    @GetMapping("/patients/{patientId}/summary")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    fun patientSummary(
        @PathVariable patientId: UUID,
        @RequestParam(required = false, defaultValue = "false") refresh: Boolean,
    ): PatientSummaryResponse {
        val result = aiService.getPatientSummary(patientId, forceRefresh = refresh)
        return PatientSummaryResponse(
            content = result.content,
            updatedAt = result.updatedAt,
            cached = result.cached,
        )
    }

    @PostMapping("/visits/{visitId}/soap-draft")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    fun soapDraft(@PathVariable visitId: UUID): SoapDraftResponse =
        SoapDraftResponse(content = aiService.draftSoapForVisit(visitId))

    /** Caller passes the same OverviewStats JSON it already has — we just feed it in. */
    @PostMapping("/stats/highlights")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    fun statsHighlights(@RequestBody body: Map<String, Any>): StatsHighlightsResponse {
        val raw = aiService.statsHighlights(com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(body))
        return StatsHighlightsResponse(content = raw)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }
}

data class PatientSummaryResponse(val content: String, val updatedAt: Instant, val cached: Boolean)
data class SoapDraftResponse(val content: String)
data class StatsHighlightsResponse(val content: String)
