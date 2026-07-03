package com.example.docodile.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.anyString
import org.mockito.ArgumentMatchers.eq
import org.mockito.Mockito.mock
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.http.HttpStatus
import java.io.PrintWriter
import java.io.StringWriter

class RateLimitFilterTest {

    private fun loginRequest(): HttpServletRequest {
        val request = mock(HttpServletRequest::class.java)
        `when`(request.requestURI).thenReturn("/auth/login")
        `when`(request.remoteAddr).thenReturn("1.2.3.4")
        return request
    }

    @Test
    fun `first login request passes through the chain`() {
        val filter = RateLimitFilter()
        val request = loginRequest()
        val response = mock(HttpServletResponse::class.java)
        val chain = mock(FilterChain::class.java)

        filter.doFilter(request, response, chain)

        verify(chain, times(1)).doFilter(eq(request), any())
    }

    @Test
    fun `login requests beyond the limit return 429 and do not call the chain`() {
        val filter = RateLimitFilter()
        val request = loginRequest()
        val chain = mock(FilterChain::class.java)

        // First 10 requests (capacity = 10/min) should pass through.
        repeat(10) {
            val ok = mock(HttpServletResponse::class.java)
            filter.doFilter(request, ok, chain)
        }
        verify(chain, times(10)).doFilter(eq(request), any())

        // 11th request exceeds the bucket -> 429 with Retry-After, chain NOT called.
        val limited = mock(HttpServletResponse::class.java)
        val writer = PrintWriter(StringWriter())
        `when`(limited.writer).thenReturn(writer)

        filter.doFilter(request, limited, chain)

        verify(limited).status = HttpStatus.TOO_MANY_REQUESTS.value()
        verify(limited).addHeader(eq("Retry-After"), anyString())
        // Chain still only called the original 10 times — the limited request was blocked.
        verify(chain, times(10)).doFilter(eq(request), any())
    }

    @Test
    fun `unrelated path is never rate limited`() {
        val filter = RateLimitFilter()
        val request = mock(HttpServletRequest::class.java)
        `when`(request.requestURI).thenReturn("/api/patients")
        `when`(request.remoteAddr).thenReturn("1.2.3.4")
        val chain = mock(FilterChain::class.java)

        repeat(50) {
            val response = mock(HttpServletResponse::class.java)
            filter.doFilter(request, response, chain)
        }

        verify(chain, times(50)).doFilter(eq(request), any())
    }
}
