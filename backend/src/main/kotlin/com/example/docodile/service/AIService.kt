package com.example.docodile.service

import com.example.docodile.domain.PatientAISummary
import com.example.docodile.repo.PatientAISummaryRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.RxRowRepository
import com.example.docodile.repo.VisitRepository
import com.example.docodile.security.CurrentUser
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.MessageDigest
import java.time.Instant
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID

/**
 * AI features for the clinic app. Every public method enforces clinic
 * isolation (no patient or visit ever leaves the caller's clinic) before
 * building a prompt and calling OpenAI through OpenAIClient.
 *
 * Caching: only the patient summary is cached today (per-patient row in
 * patient_ai_summary, invalidated by a hash of the visit list). Other
 * features are fast-enough on-demand and don't need a store yet.
 */
@Service
class AIService(
    private val openAI: OpenAIClient,
    private val patientRepository: PatientRepository,
    private val visitRepository: VisitRepository,
    private val rxRowRepository: RxRowRepository,
    private val patientAISummaryRepo: PatientAISummaryRepository,
    private val ekaCareClient: EkaCareClient,
    private val currentUser: CurrentUser,
) {
    private val log = LoggerFactory.getLogger(AIService::class.java)
    private val dateFmt: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

    // ── Patient summary ─────────────────────────────────────────────────────

    /**
     * AI-generated rolling summary of a patient's history. Returns the raw
     * JSON string the model produced (shape owned by the prompt below) so the
     * frontend can render fields it cares about without us re-validating
     * every key here.
     */
    @Transactional
    fun getPatientSummary(patientId: UUID, forceRefresh: Boolean = false): PatientSummaryResult {
        val clinicId = currentUser.clinicId()
        val patient = patientRepository.findByIdAndClinicId(patientId, clinicId)
            ?: throw IllegalArgumentException("Patient not found")

        val visits = visitRepository.findAllByClinicIdAndPatientIdOrderByVisitDateAsc(clinicId, patientId)
        val hash = hashVisits(visits.map { v ->
            "${v.id}|${v.updatedAt}|${v.diagnosis ?: ""}|${v.complaints ?: ""}"
        })

        if (!forceRefresh) {
            val cached = patientAISummaryRepo.findById(patientId).orElse(null)
            if (cached != null && cached.visitsHash == hash) {
                return PatientSummaryResult(cached.content, cached.updatedAt, cached = true)
            }
        }

        // Build the prompt. Compact JSON-y blob of patient context — gives
        // the model structure without spending tokens on pretty-printing.
        val ctx = buildPatientContext(patient.name, patient.gender, patient.dob, patient.age, visits)
        val systemPrompt = """
            You are a clinical summarisation assistant for a doctor's chart.
            Read the patient's chronological visit history and produce a
            concise, factual summary. Respond ONLY with valid JSON matching:
            {
              "summary": string (2-4 sentences, plain text),
              "activeConditions": string[] (deduplicated, present-tense),
              "allergies": string[] (or empty),
              "riskFlags": string[] (e.g. "Hypertension uncontrolled", "Missed last 2 follow-ups"),
              "lastVisitGist": string (one sentence describing the most recent visit)
            }
            Do not invent data. If a field is unknown, return an empty string or empty array.
        """.trimIndent()

        val raw = try {
            openAI.complete(systemPrompt, ctx)
        } catch (e: AIClientException) {
            log.warn("Patient summary AI call failed: ${e.message}")
            return PatientSummaryResult("""{"summary":"","activeConditions":[],"allergies":[],"riskFlags":[],"lastVisitGist":"","error":"${e.message?.replace("\"","'") ?: "AI unavailable"}"}""", Instant.now(), cached = false)
        }

        val row = patientAISummaryRepo.findById(patientId).orElseGet {
            PatientAISummary(patientId = patientId, clinicId = clinicId)
        }
        row.clinicId = clinicId
        row.content = raw
        row.visitsHash = hash
        row.updatedAt = Instant.now()
        patientAISummaryRepo.save(row)
        return PatientSummaryResult(raw, row.updatedAt, cached = false)
    }

    private fun buildPatientContext(
        name: String,
        gender: String?,
        dob: LocalDate?,
        ageMonths: Int?,
        visits: List<com.example.docodile.domain.Visit>,
    ): String {
        val header = buildString {
            append("Patient: $name")
            gender?.let { append(", gender=$it") }
            dob?.let { append(", dob=${dateFmt.format(it)}") }
            if (ageMonths != null) append(", age=${ageMonths / 12}y ${ageMonths % 12}m")
        }
        val visitBlocks = visits.takeLast(15).map { v ->
            buildString {
                appendLine("--- Visit ${dateFmt.format(v.visitDate ?: LocalDate.now())} ---")
                v.complaints?.takeIf { it.isNotBlank() }?.let { appendLine("Complaints: $it") }
                v.diagnosis?.takeIf { it.isNotBlank() }?.let { appendLine("Diagnosis: $it") }
                v.allergies?.takeIf { it.isNotBlank() }?.let { appendLine("Allergies: $it") }
                v.familyHistory?.takeIf { it.isNotBlank() }?.let { appendLine("Family hx: $it") }
                v.pastMedicalHistory?.takeIf { it.isNotBlank() }?.let { appendLine("Past medical hx: $it") }
                v.notesForPatient?.takeIf { it.isNotBlank() }?.let { appendLine("Notes: $it") }
                val rx = rxRowRepository.findByVisitIdOrderByPositionAsc(v.id)
                if (rx.isNotEmpty()) {
                    appendLine("Rx: " + rx.joinToString("; ") {
                        listOfNotNull(it.medicine, it.dosage, it.frequency, it.duration)
                            .filter { p -> p.isNotBlank() }
                            .joinToString(" ")
                    })
                }
            }
        }
        return header + "\n\n" + visitBlocks.joinToString("\n")
    }

    private fun hashVisits(parts: List<String>): String {
        val md = MessageDigest.getInstance("SHA-256")
        parts.forEach { md.update(it.toByteArray(Charsets.UTF_8)) }
        return md.digest().joinToString("") { "%02x".format(it) }.take(32)
    }

    // ── Visit SOAP draft ────────────────────────────────────────────────────

    /**
     * Generate a structured SOAP-style draft from a doctor's free-text notes
     * captured on a single visit. Doesn't mutate the visit — caller picks
     * what to keep and writes it back through the regular save flow.
     */
    fun draftSoapForVisit(visitId: UUID): String {
        val clinicId = currentUser.clinicId()
        val v = visitRepository.findByIdAndClinicId(visitId, clinicId)
            ?: throw IllegalArgumentException("Visit not found")
        val ctx = buildString {
            appendLine("Date: ${dateFmt.format(v.visitDate ?: LocalDate.now())}")
            v.complaints?.takeIf { it.isNotBlank() }?.let { appendLine("Complaints: $it") }
            v.diagnosis?.takeIf { it.isNotBlank() }?.let { appendLine("Provisional diagnosis: $it") }
            v.privateNotes?.takeIf { it.isNotBlank() }?.let { appendLine("Private notes: $it") }
            v.notesForPatient?.takeIf { it.isNotBlank() }?.let { appendLine("Notes for patient: $it") }
            // Vitals
            if (v.bpSystolic != null || v.bpDiastolic != null) {
                appendLine("BP: ${v.bpSystolic ?: "-"}/${v.bpDiastolic ?: "-"} ${v.bpUnit ?: "mmHg"}")
            }
            v.pulse?.let { appendLine("Pulse: $it ${v.pulseUnit ?: ""}") }
            v.spo2?.let { appendLine("SpO2: $it") }
            v.temperature?.let { appendLine("Temp: $it ${v.temperatureUnit ?: ""}") }
        }
        val systemPrompt = """
            You are a medical scribe. Rewrite the doctor's raw notes into a
            structured SOAP draft. Respond ONLY with JSON:
            {
              "subjective": string,
              "objective": string,
              "assessment": string,
              "plan": string
            }
            Be concise. Don't invent findings or treatments. Empty string if
            a section has nothing to put.
        """.trimIndent()
        return try {
            openAI.complete(systemPrompt, ctx)
        } catch (e: AIClientException) {
            """{"subjective":"","objective":"","assessment":"","plan":"","error":"${e.message?.replace("\"","'") ?: "AI unavailable"}"}"""
        }
    }

    // ── Stats narrative ─────────────────────────────────────────────────────

    /**
     * Turn the Overview stats payload (already computed numerically by
     * StatsController) into 3-5 short narrative bullets. The frontend's
     * deriveHighlights() heuristic is the fallback when this isn't called.
     */
    fun statsHighlights(payload: String): String {
        val systemPrompt = """
            You read a clinic's daily/weekly summary JSON and write 3-5 short
            insight bullets a clinician would care about. Respond ONLY with JSON:
            {
              "items": [
                { "tone": "good" | "warn" | "info", "text": string }
              ]
            }
            Each bullet < 100 chars. Focus on what changed or what needs
            attention; skip filler.
        """.trimIndent()
        return try {
            openAI.complete(systemPrompt, payload)
        } catch (e: AIClientException) {
            """{"items":[],"error":"${e.message?.replace("\"","'") ?: "AI unavailable"}"}"""
        }
    }

    // ── Drug interaction explanations ───────────────────────────────────────

    /**
     * Plain-English explanation of a single drug-drug interaction (or set
     * of interactions). Calls the structured Eka data first to ground the
     * model on real interaction text, then asks for patient-friendly copy.
     */
    fun explainInteractions(medicines: List<String>): String {
        if (medicines.size < 2) {
            return """{"items":[]}"""
        }
        val interactions = ekaCareClient.checkInteractionsByName(medicines)
        if (interactions.isEmpty()) return """{"items":[]}"""
        val ctx = interactions.joinToString("\n") { i ->
            "${i.drug} + ${i.interactsWith}: ${i.comment}"
        }
        val systemPrompt = """
            For each drug-drug interaction below, write one short, clinician-
            facing explanation (why it matters) and one short patient-facing
            tip (what to watch for). Respond ONLY with JSON:
            {
              "items": [
                {
                  "drug": string,
                  "interactsWith": string,
                  "severity": "low" | "moderate" | "high",
                  "clinical": string,
                  "patientTip": string
                }
              ]
            }
        """.trimIndent()
        return try {
            openAI.complete(systemPrompt, ctx)
        } catch (e: AIClientException) {
            """{"items":[],"error":"${e.message?.replace("\"","'") ?: "AI unavailable"}"}"""
        }
    }
}

data class PatientSummaryResult(
    val content: String,
    val updatedAt: Instant,
    val cached: Boolean,
)
