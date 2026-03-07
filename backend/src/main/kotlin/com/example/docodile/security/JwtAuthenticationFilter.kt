package com.example.docodile.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

@Component
class JwtAuthenticationFilter(
    private val tokenService: TokenService
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authHeader = request.getHeader("Authorization") ?: ""
        if (!authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response)
            return
        }

        val token = authHeader.removePrefix("Bearer ").trim()
        if (!tokenService.validateToken(token)) {
            filterChain.doFilter(request, response)
            return
        }

        val claims = tokenService.parseClaims(token)
        val email = claims["email"] as? String ?: ""
        val role = claims["role"] as? String
        val userId = (claims["user_id"] as? String)?.let { runCatching { UUID.fromString(it) }.getOrNull() }
        val tenantId = (claims["tenant_id"] as? String)?.let { runCatching { UUID.fromString(it) }.getOrNull() }
        val clinicId = (claims["clinic_id"] as? String)?.let { runCatching { UUID.fromString(it) }.getOrNull() }

        if (role != null && userId != null && tenantId != null
            && SecurityContextHolder.getContext().authentication == null
        ) {
            val principal = AppUserPrincipal(
                userId = userId,
                tenantId = tenantId,
                clinicId = clinicId,
                role = role,
                email = email,
                passwordHash = "",
                active = true
            )

            val auth = UsernamePasswordAuthenticationToken(principal, null, principal.authorities)
            auth.details = WebAuthenticationDetailsSource().buildDetails(request)
            SecurityContextHolder.getContext().authentication = auth
        }

        filterChain.doFilter(request, response)
    }
}
