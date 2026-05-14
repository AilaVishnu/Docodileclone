package com.example.docodile.web

import com.example.docodile.service.AIService
import com.example.docodile.service.AIChatService
import com.example.docodile.service.ChatMessage
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
    private val aiChatService: AIChatService,
    private val openAIClient: OpenAIClient,
) {

    @GetMapping("/health")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun health(): Map<String, Any> = mapOf("configured" to openAIClient.isConfigured())

    /** Read-only: returns the cached summary if it still matches the patient's
     *  visit history, otherwise returns generated=false so the UI can show a
     *  Generate button. Never calls OpenAI — safe to call on every page open. */
    @GetMapping("/patients/{patientId}/summary")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    fun patientSummary(@PathVariable patientId: UUID): PatientSummaryResponse {
        val result = aiService.getCachedPatientSummary(patientId)
        return PatientSummaryResponse(
            content = result.content,
            updatedAt = result.updatedAt,
            cached = result.cached,
            generated = result.generated,
        )
    }

    /** Explicit generation — costs tokens. Frontend wires this to the
     *  "Generate AI summary" button (or the Refresh action). */
    @PostMapping("/patients/{patientId}/summary")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    fun generatePatientSummary(@PathVariable patientId: UUID): PatientSummaryResponse {
        val result = aiService.generatePatientSummary(patientId)
        return PatientSummaryResponse(
            content = result.content,
            updatedAt = result.updatedAt,
            cached = result.cached,
            generated = result.generated,
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

    /**
     * Multi-turn clinic assistant chat. Frontend passes the full conversation
     * (user/assistant alternation); we tack on the system prompt and run a
     * tool-using loop against OpenAI so the model can look up real clinic
     * data via the read-only tools defined in AIChatService.
     */
    @PostMapping("/chat")
    @PreAuthorize("isAuthenticated()")
    fun chat(@RequestBody body: ChatRequest): ChatResponse {
        val reply = aiChatService.chat(body.messages.map { ChatMessage(it.role, it.content) })
        return ChatResponse(reply = reply)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }
}

data class PatientSummaryResponse(
    val content: String,
    val updatedAt: Instant,
    val cached: Boolean,
    val generated: Boolean,
)
data class SoapDraftResponse(val content: String)
data class StatsHighlightsResponse(val content: String)
data class ChatRequest(val messages: List<ChatTurn> = emptyList())
data class ChatTurn(val role: String = "user", val content: String = "")
data class ChatResponse(val reply: String)
