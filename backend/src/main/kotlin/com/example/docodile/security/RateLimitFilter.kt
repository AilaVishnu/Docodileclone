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

// Per-IP rate limits applied before JWT authentication.
// Limits (all keyed on TCP remoteAddr, not X-Forwarded-For):
//   /auth/login + /auth/staff/login  : 10 req/min
//   /auth/forgot-password            : 5 req/hr
//   /auth/mfa/verify                 : 5 req/10 min
//   /api/stats/**                    : 10 req/hr
// For multi-node deployments replace ConcurrentHashMap with a Redis-backed ProxyManager.
@Component
class RateLimitFilter : OncePerRequestFilter() {

    private val loginBuckets = ConcurrentHashMap<String, Bucket>()
    private val forgotPasswordBuckets = ConcurrentHashMap<String, Bucket>()
    private val mfaVerifyBuckets = ConcurrentHashMap<String, Bucket>()
    private val statsBuckets = ConcurrentHashMap<String, Bucket>()

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        chain: FilterChain,
    ) {
        val ip = request.remoteAddr ?: "unknown"
        val path = request.requestURI

        val bucket = when {
            path == "/auth/login" || path == "/auth/staff/login" ->
                loginBuckets.computeIfAbsent(ip) { newLoginBucket() }
            path == "/auth/forgot-password" ->
                forgotPasswordBuckets.computeIfAbsent(ip) { newForgotPasswordBucket() }
            path == "/auth/mfa/verify" ->
                mfaVerifyBuckets.computeIfAbsent(ip) { newMfaVerifyBucket() }
            path.startsWith("/api/stats/") ->
                statsBuckets.computeIfAbsent(ip) { newStatsBucket() }
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
            .addLimit(Bandwidth.builder().capacity(10).refillIntervally(10, Duration.ofMinutes(1)).build())
            .build()

    private fun newForgotPasswordBucket(): Bucket =
        Bucket.builder()
            .addLimit(Bandwidth.builder().capacity(5).refillIntervally(5, Duration.ofHours(1)).build())
            .build()

    private fun newMfaVerifyBucket(): Bucket =
        Bucket.builder()
            .addLimit(Bandwidth.builder().capacity(5).refillIntervally(5, Duration.ofMinutes(10)).build())
            .build()

    private fun newStatsBucket(): Bucket =
        Bucket.builder()
            .addLimit(Bandwidth.builder().capacity(10).refillIntervally(10, Duration.ofHours(1)).build())
            .build()
}
