package com.example.docodile.service

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Instant

@JsonIgnoreProperties(ignoreUnknown = true)
data class EkaDrugResult(
    val name: String = "",
    val id: String = "",
    val type: String = "",
    @field:JsonProperty("generic_name") val genericName: String = "",
)

data class DrugInteractionWarning(
    val drug: String,
    val interactsWith: String,
    val comment: String,
)

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class EkaAuthResponse(
    @field:JsonProperty("access_token") val accessToken: String = "",
    @field:JsonProperty("expires_in") val expiresIn: Long = 1800,
)

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class EkaDrugPage(
    val drugs: List<EkaDrugResult> = emptyList(),
)

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class PharmacologyResult(
    @field:JsonProperty("precautions_appendix") val precautionsAppendix: String? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class PharmacologyPage(
    val results: List<PharmacologyResult> = emptyList(),
)

private data class RawInteraction(val interactsWith: String, val comment: String)

@Component
class EkaCareClient(
    @Value("\${eka.client-id:}") rawClientId: String,
    @Value("\${eka.client-secret:}") rawClientSecret: String,
) {
    // Trim because a stray newline/space in application-local.properties
    // would otherwise be sent verbatim to Eka's auth endpoint and silently
    // 401, with no clear signal at the UI layer.
    private val clientId = rawClientId.trim()
    private val clientSecret = rawClientSecret.trim()
    private val http = HttpClient.newHttpClient()
    private val mapper = ObjectMapper()
    private val AUTH_URL = "https://api.eka.care/connect-auth/v1/account/login"
    private val DRUG_URL = "https://api.eka.care/medical-db/v1/drugs-and-labs"
    private val PHARMA_URL = "https://api.eka.care/eka-mcp/pharmacology/v1/search"

    @Volatile private var token: String = ""
    @Volatile private var tokenExpiresAt: Instant = Instant.EPOCH

    private fun accessToken(): String {
        if (Instant.now().isBefore(tokenExpiresAt.minusSeconds(60))) return token
        synchronized(this) {
            if (Instant.now().isBefore(tokenExpiresAt.minusSeconds(60))) return token
            val body = mapper.writeValueAsString(mapOf("client_id" to clientId, "client_secret" to clientSecret))
            val req = HttpRequest.newBuilder()
                .uri(URI.create(AUTH_URL))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build()
            val resp = http.send(req, HttpResponse.BodyHandlers.ofString())
            val parsed = mapper.readValue(resp.body(), EkaAuthResponse::class.java)
            token = parsed.accessToken
            tokenExpiresAt = Instant.now().plusSeconds(parsed.expiresIn)
            return token
        }
    }

    fun searchDrugs(query: String, limit: Int = 10): List<EkaDrugResult> {
        if (clientId.isBlank()) return emptyList()
        return try {
            val url = "$DRUG_URL?q=${java.net.URLEncoder.encode(query, "UTF-8")}&limit=$limit&s_type=drug"
            val req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Bearer ${accessToken()}")
                .GET()
                .build()
            val resp = http.send(req, HttpResponse.BodyHandlers.ofString())
            mapper.readValue(resp.body(), EkaDrugPage::class.java).drugs
        } catch (e: Exception) {
            emptyList()
        }
    }

    // Strip dosage from generic name: "Paracetamol (650mg)" → "paracetamol"
    private fun normaliseGeneric(raw: String) =
        raw.replace(Regex("""\(.*?\)"""), "").trim().lowercase()

    private fun fetchInteractionLines(generic: String): List<RawInteraction> {
        return try {
            val q = java.net.URLEncoder.encode(generic, "UTF-8")
            val req = HttpRequest.newBuilder()
                .uri(URI.create("$PHARMA_URL?query=$q&limit=1"))
                .header("Authorization", "Bearer ${accessToken()}")
                .GET()
                .build()
            val resp = http.send(req, HttpResponse.BodyHandlers.ofString())
            val page = mapper.readValue(resp.body(), PharmacologyPage::class.java)
            parseInteractions(page.results.firstOrNull()?.precautionsAppendix)
        } catch (e: Exception) {
            emptyList()
        }
    }

    // Parse the plain-text precautions_appendix into structured pairs.
    // Format per bullet: "Drug: X\n    Interactions: Y, Z\n    Comments: C"
    private fun parseInteractions(appendix: String?): List<RawInteraction> {
        if (appendix.isNullOrBlank()) return emptyList()
        val out = mutableListOf<RawInteraction>()
        val interactionRe = Regex("""Interactions:\s*(.+)""")
        val commentRe = Regex("""Comments:\s*(.+)""")
        appendix.split("•").drop(1).forEach { bullet ->
            val drugs = interactionRe.find(bullet)?.groupValues?.get(1)
                ?.split(",")?.map { it.trim() } ?: return@forEach
            val comment = commentRe.find(bullet)?.groupValues?.get(1)?.trim() ?: ""
            drugs.filter { it.isNotBlank() }.forEach { out.add(RawInteraction(it, comment)) }
        }
        return out
    }

    // Returns true if interactionDrug text covers queryGeneric (fuzzy, case-insensitive).
    private fun matches(interactionDrug: String, queryGeneric: String): Boolean {
        val a = interactionDrug.lowercase()
        val b = queryGeneric.lowercase()
        return a.contains(b) || b.contains(a)
    }

    // Resolve a brand/display name → normalised generic via Eka drug search.
    // Falls back to using the input itself (covers already-generic names).
    private fun resolveGeneric(medicineName: String): String {
        val top = searchDrugs(medicineName, limit = 1).firstOrNull()
        return normaliseGeneric(top?.genericName?.takeIf { it.isNotBlank() } ?: medicineName)
    }

    // Accept brand medicine names (as saved in the DB), resolve to generics,
    // then cross-check interactions. This works after page reload.
    fun checkInteractionsByName(medicineNames: List<String>): List<DrugInteractionWarning> {
        if (clientId.isBlank() || medicineNames.size < 2) return emptyList()
        val generics = medicineNames
            .filter { it.isNotBlank() }
            .map { resolveGeneric(it) }
            .filter { it.isNotBlank() }
            .distinct()
        return checkInteractions(generics)
    }

    fun checkInteractions(rawGenerics: List<String>): List<DrugInteractionWarning> {
        if (clientId.isBlank() || rawGenerics.size < 2) return emptyList()
        val generics = rawGenerics.map { normaliseGeneric(it) }.filter { it.isNotBlank() }
        if (generics.size < 2) return emptyList()

        val warnings = mutableListOf<DrugInteractionWarning>()
        val seen = mutableSetOf<String>()

        for (generic in generics) {
            val interactions = fetchInteractionLines(generic)
            for (other in generics) {
                if (other == generic) continue
                val hit = interactions.firstOrNull { matches(it.interactsWith, other) } ?: continue
                // Deduplicate symmetric pairs (A+B == B+A)
                val key = listOf(generic, other).sorted().joinToString("+")
                if (seen.add(key)) {
                    warnings.add(DrugInteractionWarning(generic, other, hit.comment))
                }
            }
        }
        return warnings
    }
}
