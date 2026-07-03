package com.example.docodile.service

import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.VisitRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

/**
 * Clinic-aware chat assistant. The model can call a small set of read-only
 * tools (search patients, get history, etc.) — every tool resolves the
 * caller's clinic id from the JWT so the assistant can never reach data
 * outside the active clinic, no matter what it's asked.
 *
 * Tool loop is capped at 5 turns to prevent runaway costs if the model
 * keeps calling tools indefinitely.
 */
@Service
class AIChatService(
    private val openAI: OpenAIClient,
    private val patientRepository: PatientRepository,
    private val visitRepository: VisitRepository,
    private val appointmentRepository: AppointmentRepository,
) {
    private val log = LoggerFactory.getLogger(AIChatService::class.java)
    private val mapper = ObjectMapper()
    private val dateFmt: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    private val MAX_TOOL_TURNS = 5

    private val systemPrompt = """
        You are a clinic-side assistant for doctors and staff. You have read-only
        tools to look up the *current clinic's* patients, visits, and appointments.
        Answer concisely. When the user asks about specific people, use the tools
        to fetch real data rather than guessing. Never invent patient names,
        diagnoses, or counts. If a tool returns nothing useful, say so plainly.

        - Today is ${LocalDate.now()}.
        - If the user's question is ambiguous, ask one clarifying question.
        - Format lists as short bullet points; otherwise plain prose.
    """.trimIndent()

    fun chat(userMessages: List<ChatMessage>): String {
        val messages = mutableListOf<Map<String, Any?>>()
        messages.add(mapOf("role" to "system", "content" to systemPrompt))
        userMessages.forEach { m ->
            messages.add(mapOf("role" to m.role, "content" to m.content))
        }

        repeat(MAX_TOOL_TURNS) {
            val assistant = openAI.chat(messages, tools = TOOL_SPECS)
            @Suppress("UNCHECKED_CAST")
            val toolCalls = assistant["tool_calls"] as? List<Map<String, Any?>>
            if (toolCalls.isNullOrEmpty()) {
                return (assistant["content"] as? String) ?: ""
            }
            // Persist the assistant turn (with its tool_calls) before adding tool results.
            messages.add(assistant)
            for (call in toolCalls) {
                val id = call["id"] as? String ?: continue
                @Suppress("UNCHECKED_CAST")
                val fn = call["function"] as? Map<String, Any?> ?: continue
                val name = fn["name"] as? String ?: continue
                val argsJson = (fn["arguments"] as? String) ?: "{}"
                val args: Map<String, Any?> = try {
                    @Suppress("UNCHECKED_CAST")
                    mapper.readValue(argsJson, Map::class.java) as Map<String, Any?>
                } catch (_: Exception) { emptyMap() }
                val result = try {
                    runTool(name, args)
                } catch (e: Exception) {
                    log.warn("Tool '$name' failed: ${e.message}")
                    mapOf("error" to (e.message ?: "tool failed"))
                }
                messages.add(mapOf(
                    "role" to "tool",
                    "tool_call_id" to id,
                    "content" to mapper.writeValueAsString(result),
                ))
            }
        }
        return "I couldn't finish — too many tool calls. Try a more specific question."
    }

    // ── Tools ───────────────────────────────────────────────────────────────

    private fun runTool(name: String, args: Map<String, Any?>): Any {
        return when (name) {
            "search_patients" -> searchPatients((args["query"] as? String).orEmpty())
            "patient_history" -> patientHistory(args["patientId"] as? String)
            "today_queue_status" -> todayQueueStatus()
            "overdue_reviews" -> overdueReviews()
            "find_patients_by_condition" -> findPatientsByCondition((args["term"] as? String).orEmpty())
            else -> mapOf("error" to "Unknown tool: $name")
        }
    }

    private fun searchPatients(query: String): Any {
        if (query.isBlank()) return emptyList<Any>()
        val q = query.lowercase()
        return patientRepository.findAllByDeletedAtIsNull()
            .asSequence()
            .filter {
                it.name.lowercase().contains(q) ||
                    (it.phone ?: "").contains(q) ||
                    (it.email ?: "").lowercase().contains(q)
            }
            .take(10)
            .map { p ->
                mapOf(
                    "id" to p.id.toString(),
                    "name" to p.name,
                    "phone" to p.phone,
                    "gender" to p.gender,
                    "ageMonths" to p.age,
                )
            }
            .toList()
    }

    private fun patientHistory(patientIdStr: String?): Any {
        val id = try { UUID.fromString(patientIdStr ?: "") }
            catch (_: Exception) { return mapOf("error" to "Invalid patientId") }
        val p = patientRepository.findById(id).orElse(null)
            ?: return mapOf("error" to "Patient not found")
        val visits = visitRepository.findAllByPatientIdOrderByVisitDateAscCreatedAtAsc(id)
        return mapOf(
            "name" to p.name,
            "phone" to p.phone,
            "gender" to p.gender,
            "visits" to visits.takeLast(10).map { v ->
                mapOf(
                    "date" to dateFmt.format(v.visitDate ?: LocalDate.now()),
                    "complaints" to v.complaints,
                    "diagnosis" to v.diagnosis,
                )
            },
        )
    }

    private fun todayQueueStatus(): Any {
        val today = LocalDate.now()
        val apts = appointmentRepository.findAllByScheduledTimeBetween(
            today.atStartOfDay(),
            today.atTime(23, 59, 59),
        )
        return mapOf(
            "total" to apts.size,
            "waiting" to apts.count { it.status?.uppercase() in setOf("WAITING", "BOOKED", "SCHEDULED") },
            "atDoc" to apts.count { it.status?.uppercase() == "AT_DOC" },
            "inProgress" to apts.count { it.status?.uppercase() == "IN_PROGRESS" },
            "completed" to apts.count { it.status?.uppercase() == "COMPLETED" },
            "noShow" to apts.count { it.status?.uppercase() in setOf("NO_SHOW", "CANCELLED") },
        )
    }

    private fun overdueReviews(): Any {
        val today = LocalDate.now()
        return visitRepository.findOverdueReviews(today)
            .take(20)
            .map { v ->
                mapOf(
                    "patientName" to v.patient?.name,
                    "patientId" to v.patient?.id?.toString(),
                    "reviewDate" to v.reviewDate?.let { dateFmt.format(it) },
                    "daysOverdue" to v.reviewDate?.let { today.toEpochDay() - it.toEpochDay() },
                    "lastDiagnosis" to v.diagnosis,
                )
            }
    }

    private fun findPatientsByCondition(term: String): Any {
        if (term.isBlank()) return emptyList<Any>()
        val t = term.lowercase()
        val matched = mutableMapOf<UUID, MutableList<String>>()
        // Walk recent visits; gather patients whose complaints/diagnosis match.
        val cutoff = LocalDate.now().minusMonths(12)
        val visits = visitRepository.findAllByVisitDateBetween(cutoff, LocalDate.now())
        for (v in visits) {
            val text = listOfNotNull(v.complaints, v.diagnosis).joinToString(" ").lowercase()
            if (text.contains(t)) {
                val pid = v.patient?.id ?: continue
                matched.getOrPut(pid) { mutableListOf() }.add(dateFmt.format(v.visitDate ?: LocalDate.now()))
            }
        }
        if (matched.isEmpty()) return emptyList<Any>()
        val patientsById = patientRepository.findAllByDeletedAtIsNull().associateBy { it.id }
        return matched.entries.take(20).map { (pid, dates) ->
            val p = patientsById[pid]
            mapOf(
                "id" to pid.toString(),
                "name" to (p?.name ?: ""),
                "phone" to p?.phone,
                "matchingVisits" to dates,
            )
        }
    }

    companion object {
        val TOOL_SPECS: List<Map<String, Any?>> = listOf(
            mapOf(
                "type" to "function",
                "function" to mapOf(
                    "name" to "search_patients",
                    "description" to "Search the current clinic's patients by name, phone, or email substring. Returns up to 10 matches.",
                    "parameters" to mapOf(
                        "type" to "object",
                        "properties" to mapOf(
                            "query" to mapOf("type" to "string", "description" to "Name fragment, phone, or email to match against")
                        ),
                        "required" to listOf("query")
                    )
                )
            ),
            mapOf(
                "type" to "function",
                "function" to mapOf(
                    "name" to "patient_history",
                    "description" to "Recent visit history (up to last 10) for a specific patient by id, within the current clinic.",
                    "parameters" to mapOf(
                        "type" to "object",
                        "properties" to mapOf(
                            "patientId" to mapOf("type" to "string", "description" to "Patient UUID from search_patients")
                        ),
                        "required" to listOf("patientId")
                    )
                )
            ),
            mapOf(
                "type" to "function",
                "function" to mapOf(
                    "name" to "today_queue_status",
                    "description" to "Live count of today's appointments by status (waiting, at-doc, in-progress, completed, no-show).",
                    "parameters" to mapOf("type" to "object", "properties" to mapOf<String, Any>())
                )
            ),
            mapOf(
                "type" to "function",
                "function" to mapOf(
                    "name" to "overdue_reviews",
                    "description" to "Patients with review dates in the past (recommended return but didn't). Returns up to 20.",
                    "parameters" to mapOf("type" to "object", "properties" to mapOf<String, Any>())
                )
            ),
            mapOf(
                "type" to "function",
                "function" to mapOf(
                    "name" to "find_patients_by_condition",
                    "description" to "Find patients whose recent visits mention a condition or symptom term (matches complaints + diagnosis text in last 12 months).",
                    "parameters" to mapOf(
                        "type" to "object",
                        "properties" to mapOf(
                            "term" to mapOf("type" to "string", "description" to "Condition or symptom, e.g. 'diabetes', 'hypertension', 'fever'")
                        ),
                        "required" to listOf("term")
                    )
                )
            ),
        )
    }
}

data class ChatMessage(val role: String, val content: String)
