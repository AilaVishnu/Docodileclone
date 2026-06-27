package com.example.docodile.security

import com.example.docodile.repo.UserSessionRepository
import com.example.docodile.tenancy.TenantContext
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
    private val tokenService: TokenService,
    private val userSessionRepository: UserSessionRepository,
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authHeader = request.getHeader("Authorization") ?: ""
        if (!authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); return
        }

        val token = authHeader.removePrefix("Bearer ").trim()
        if (!tokenService.validateToken(token)) {
            filterChain.doFilter(request, response); return
        }

        // Reject tokens whose session has been revoked (logout / logout-all).
        // Revocation now lives on user_session.revoked_at (the revoked_token table was merged in).
        val jti = tokenService.extractJti(token)
        if (jti != null && userSessionRepository.findByJti(jti)?.revokedAt != null) {
            filterChain.doFilter(request, response); return
        }

        // mfa_pending tokens are only valid for /auth/mfa/complete — reject them everywhere else
        if (tokenService.isMfaPendingToken(token) && !request.requestURI.startsWith("/auth/mfa/complete")) {
            filterChain.doFilter(request, response); return
        }

        val claims = tokenService.parseClaims(token)
        val email = claims["email"] as? String ?: ""
        val role = claims["role"] as? String
        val userId = (claims["user_id"] as? String)?.let { runCatching { UUID.fromString(it) }.getOrNull() }
        val schema = claims["schema"] as? String

        // Fail CLOSED on tenant isolation: authenticate only when the token's `schema` claim is
        // present AND equals the request's resolved tenant (set from the subdomain by
        // TenantResolutionFilter). A token with no schema claim, a request whose tenant could not
        // be resolved, or a schema≠subdomain mismatch (cross-tenant replay) is left UNauthenticated
        // — Spring Security then rejects any protected endpoint. Allowlisted non-tenant paths
        // (/actuator, /api/health, /ws) don't need a principal, so not authenticating them is fine.
        val requestTenant = TenantContext.get()
        if (role != null && userId != null && schema != null && schema == requestTenant
            && SecurityContextHolder.getContext().authentication == null
        ) {
            val principal = AppUserPrincipal(
                userId = userId,
                schema = schema,
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
