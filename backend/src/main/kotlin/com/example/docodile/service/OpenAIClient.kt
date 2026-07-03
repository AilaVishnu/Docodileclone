package com.example.docodile.service

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

/**
 * Thin HTTP client for OpenAI's Chat Completions API. Every AI feature in
 * the app routes through here so the API key, model, retries, and logging
 * live in one place. The key is never exposed to the frontend.
 *
 * Configure via env vars (read by application.properties):
 *   OPENAI_API_KEY      required — leaves the app non-functional if blank
 *   OPENAI_MODEL        optional, defaults to gpt-4o-mini
 *
 * Callers pass a system prompt + user content and a flag for JSON-mode.
 * Returns the raw assistant content as a String (caller parses).
 */
@Component
class OpenAIClient(
    @Value("\${openai.api-key:}") private val apiKey: String,
    @Value("\${openai.model:gpt-4o-mini}") private val defaultModel: String,
) {
    private val log = LoggerFactory.getLogger(OpenAIClient::class.java)
    private val http: HttpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(15))
        .build()
    private val mapper = ObjectMapper()
    private val ENDPOINT = "https://api.openai.com/v1/chat/completions"

    fun isConfigured(): Boolean = apiKey.isNotBlank()

    /**
     * One-shot chat completion. Pass `jsonMode=true` to get strict JSON back —
     * the system prompt should also instruct the model to return JSON. Throws
     * AIClientException on transport / parse failure so callers can decide
     * whether to surface or fall back.
     */
    /**
     * Free-form chat with optional OpenAI tool calling. Caller passes raw
     * messages (system / user / assistant / tool) and an optional `tools`
     * array. Returns the raw JSON of the assistant's last message so the
     * caller can inspect tool_calls vs. final content.
     */
    fun chat(
        messages: List<Map<String, Any?>>,
        tools: List<Map<String, Any?>>? = null,
        temperature: Double = 0.2,
        model: String = defaultModel,
    ): Map<String, Any?> {
        if (apiKey.isBlank()) throw AIClientException("OPENAI_API_KEY is not configured")
        val body = buildMap<String, Any> {
            put("model", model)
            put("temperature", temperature)
            put("messages", messages)
            if (!tools.isNullOrEmpty()) put("tools", tools)
        }
        val req = HttpRequest.newBuilder()
            .uri(URI.create(ENDPOINT))
            .timeout(Duration.ofSeconds(60))
            .header("Authorization", "Bearer $apiKey")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
            .build()
        val resp = try {
            http.send(req, HttpResponse.BodyHandlers.ofString())
        } catch (e: Exception) {
            throw AIClientException("OpenAI request failed: ${e.message}", e)
        }
        if (resp.statusCode() !in 200..299) {
            log.warn("OpenAI returned ${resp.statusCode()}: ${resp.body().take(500)}")
            throw AIClientException("OpenAI returned HTTP ${resp.statusCode()}")
        }
        @Suppress("UNCHECKED_CAST")
        val parsed = mapper.readValue(resp.body(), Map::class.java) as Map<String, Any?>
        @Suppress("UNCHECKED_CAST")
        val choices = parsed["choices"] as? List<Map<String, Any?>> ?: emptyList()
        @Suppress("UNCHECKED_CAST")
        return (choices.firstOrNull()?.get("message") as? Map<String, Any?>) ?: emptyMap()
    }

    fun complete(
        systemPrompt: String,
        userContent: String,
        jsonMode: Boolean = true,
        temperature: Double = 0.2,
        model: String = defaultModel,
    ): String {
        if (apiKey.isBlank()) throw AIClientException("OPENAI_API_KEY is not configured")
        val body = buildMap<String, Any> {
            put("model", model)
            put("temperature", temperature)
            put("messages", listOf(
                mapOf("role" to "system", "content" to systemPrompt),
                mapOf("role" to "user", "content" to userContent),
            ))
            if (jsonMode) put("response_format", mapOf("type" to "json_object"))
        }
        val req = HttpRequest.newBuilder()
            .uri(URI.create(ENDPOINT))
            .timeout(Duration.ofSeconds(60))
            .header("Authorization", "Bearer $apiKey")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
            .build()
        val resp = try {
            http.send(req, HttpResponse.BodyHandlers.ofString())
        } catch (e: Exception) {
            throw AIClientException("OpenAI request failed: ${e.message}", e)
        }
        if (resp.statusCode() !in 200..299) {
            log.warn("OpenAI returned ${resp.statusCode()}: ${resp.body().take(500)}")
            throw AIClientException("OpenAI returned HTTP ${resp.statusCode()}")
        }
        val parsed = try {
            mapper.readValue(resp.body(), ChatCompletionResponse::class.java)
        } catch (e: Exception) {
            throw AIClientException("Couldn't parse OpenAI response: ${e.message}", e)
        }
        return parsed.choices.firstOrNull()?.message?.content
            ?: throw AIClientException("OpenAI response had no content")
    }
}

class AIClientException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class ChatCompletionResponse(
    val choices: List<Choice> = emptyList(),
)

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class Choice(
    val message: Message = Message(),
)

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class Message(
    val content: String = "",
)
