package com.example.docodile.security

import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap

/**
 * Enforces per-IP rate limits on auth endpoints to mitigate brute-force attacks.
 *
 * Limits:
 *  - /auth/login              → max 10 requests/minute per IP
 *  - /auth/forgot-password    → max 5 requests/hour per IP
 *
 * Buckets are stored in-process ConcurrentHashMap (suitable for single-node
 * deployments). For multi-node, replace with a Redis-backed Bucket4j ProxyManager.
 */
@Component
class RateLimitFilter : OncePerRequestFilter() {

    private val loginBuckets = ConcurrentHashMap<String, Bucket>()
    private val forgotPasswordBuckets = ConcurrentHashMap<String, Bucket>()

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        chain: FilterChain,
    ) {
        val ip = resolveIp(request)
        val path = request.requestURI

        val bucket = when {
            path == "/auth/login" || path == "/auth/staff/login" ->
                loginBuckets.computeIfAbsent(ip) { newLoginBucket() }
            path == "/auth/forgot-password" ->
                forgotPasswordBuckets.computeIfAbsent(ip) { newForgotPasswordBucket() }
            else -> null
        }

        if (bucket != null) {
            val probe = bucket.tryConsumeAndReturnRemaining(1)
            if (!probe.isConsumed) {
                val retryAfter = probe.nanosToWaitForRefill / 1_000_000_000L
                response.status = HttpStatus.TOO_MANY_REQUESTS.value()
                response.addHeader("Retry-After", retryAfter.toString())
                response.contentType = MediaType.APPLICATION_JSON_VALUE
                response.writer.write("""{"error":"Too many requests. Please try again later."}""")
                return
            }
        }

        chain.doFilter(request, response)
    }

    private fun newLoginBucket(): Bucket =
        Bucket.builder()
            .addLimit(
                Bandwidth.builder()
                    .capacity(10)
                    .refillIntervally(10, Duration.ofMinutes(1))
                    .build()
            )
            .build()

    private fun newForgotPasswordBucket(): Bucket =
        Bucket.builder()
            .addLimit(
                Bandwidth.builder()
                    .capacity(5)
                    .refillIntervally(5, Duration.ofHours(1))
                    .build()
            )
            .build()

    private fun resolveIp(request: HttpServletRequest): String {
        val forwarded = request.getHeader("X-Forwarded-For")
        return if (!forwarded.isNullOrBlank()) forwarded.split(",").first().trim()
        else request.remoteAddr ?: "unknown"
    }
}
