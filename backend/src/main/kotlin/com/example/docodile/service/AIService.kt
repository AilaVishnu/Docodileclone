package com.example.docodile.service

import com.example.docodile.domain.PatientAISummary
import com.example.docodile.repo.PatientAISummaryRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.RxRowRepository
import com.example.docodile.repo.VisitRepository
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
) {
    private val log = LoggerFactory.getLogger(AIService::class.java)
    private val dateFmt: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

    // ── Patient summary ─────────────────────────────────────────────────────

    /**
     * Read-only fetch — returns the cached summary only if it matches the
     * patient's current visit fingerprint. Never calls OpenAI. This is what
     * the patient-file card hits on open; nothing happens until the doctor
     * clicks "Generate".
     */
    fun getCachedPatientSummary(patientId: UUID): PatientSummaryResult {
        val patient = patientRepository.findById(patientId).orElse(null)
            ?: throw IllegalArgumentException("Patient not found")
        val visits = visitRepository.findAllByPatientIdOrderByVisitDateAscCreatedAtAsc(patientId)
        val currentHash = visitsHash(visits)
        val cached = patientAISummaryRepo.findById(patientId).orElse(null)
        val isFresh = cached != null && cached.visitsHash == currentHash
        return PatientSummaryResult(
            content = if (isFresh) cached!!.content else "",
            updatedAt = cached?.updatedAt ?: Instant.EPOCH,
            cached = isFresh,
            generated = isFresh,
        )
    }

    /**
     * Generate a fresh AI summary and cache it. Force-call: the caller is
     * responsible for deciding when to spend tokens (Generate button click,
     * Refresh action, etc.). Returns the same shape getCachedPatientSummary
     * does so callers can swap in the new result without reshaping state.
     */
    @Transactional
    fun generatePatientSummary(patientId: UUID): PatientSummaryResult {
        val patient = patientRepository.findById(patientId).orElse(null)
            ?: throw IllegalArgumentException("Patient not found")

        val visits = visitRepository.findAllByPatientIdOrderByVisitDateAscCreatedAtAsc(patientId)
        val hash = visitsHash(visits)

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
            return PatientSummaryResult(
                content = """{"summary":"","activeConditions":[],"allergies":[],"riskFlags":[],"lastVisitGist":"","error":"${e.message?.replace("\"","'") ?: "AI unavailable"}"}""",
                updatedAt = Instant.now(),
                cached = false,
                generated = false,
            )
        }

        val row = patientAISummaryRepo.findById(patientId).orElseGet {
            PatientAISummary(patientId = patientId)
        }
        row.content = raw
        row.visitsHash = hash
        row.updatedAt = Instant.now()
        patientAISummaryRepo.save(row)
        return PatientSummaryResult(raw, row.updatedAt, cached = false, generated = true)
    }

    private fun visitsHash(visits: List<com.example.docodile.domain.Visit>): String = hashVisits(visits.map { v ->
        "${v.id}|${v.updatedAt}|${v.diagnosis ?: ""}|${v.complaints ?: ""}"
    })

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
        val v = visitRepository.findById(visitId).orElse(null)
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
            All money values are in Indian Rupees — always write the
            currency as ₹ (Unicode U+20B9). NEVER use $, USD, or any
            other currency symbol.
        """.trimIndent()
        return try {
            // Belt-and-suspenders: strip any stray $ the model might still
            // emit and force the rupee sign. The prompt asks for ₹ but
            // older / smaller models occasionally fall back to USD.
            openAI.complete(systemPrompt, payload).replace('$', '₹')
        } catch (e: AIClientException) {
            """{"items":[],"error":"${e.message?.replace("\"","'") ?: "AI unavailable"}"}"""
        }
    }

}

data class PatientSummaryResult(
    val content: String,
    val updatedAt: Instant,
    val cached: Boolean,
    // True when the row currently in the DB matches the patient's present
    // visit fingerprint — i.e. nothing's gone stale. False when no row yet,
    // OR when visits have changed since the last generation (button reappears).
    val generated: Boolean,
)
