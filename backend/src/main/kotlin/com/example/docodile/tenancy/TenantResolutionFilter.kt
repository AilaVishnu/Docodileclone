package com.example.docodile.tenancy

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.web.filter.OncePerRequestFilter

/**
 * Resolves the tenant schema from the request subdomain into TenantContext.
 * Plan 2a: built + unit-tested but NOT registered on the filter chain (no @Component).
 * Plan 2b registers it (with @Bean/order) and decides the reject-unknown-subdomain policy.
 */
class TenantResolutionFilter(
    private val registry: ClinicRegistryDao,
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        // Let CORS preflight through untouched: an OPTIONS preflight carries no X-Tenant
        // (browsers never send custom headers on preflight) and must reach the CORS handler,
        // not be rejected here as "unknown clinic".
        if (request.method.equals("OPTIONS", ignoreCase = true)) {
            filterChain.doFilter(request, response); return
        }
        try {
            val sub = resolveSubdomain(request)
            if (sub != null) {
                val clinic = registry.findBySubdomain(sub)
                if (clinic != null && clinic.status == ProvisioningStatus.ACTIVE) {
                    TenantContext.set(clinic.schemaName)
                }
            }
            // Reject tenant-scoped requests with no resolved tenant
            if (TenantContext.get() == null && isTenantScopedPath(request)) {
                response.contentType = "application/json"
                response.status = HttpServletResponse.SC_BAD_REQUEST
                response.writer.write("""{"error":"Unknown or missing clinic"}""")
                return
            }
            filterChain.doFilter(request, response)
        } finally {
            TenantContext.clear()
        }
    }

    private fun isTenantScopedPath(request: HttpServletRequest): Boolean {
        val path = request.requestURI
        return !path.startsWith("/actuator") && !path.startsWith("/api/health") && !path.startsWith("/ws")
    }

    /** First DNS label for known base domains, or the X-Tenant header override. Null if none. */
    private fun resolveSubdomain(request: HttpServletRequest): String? {
        request.getHeader("X-Tenant")?.trim()?.takeIf { it.isNotEmpty() }?.let { return it.lowercase() }
        val host = request.serverName?.lowercase() ?: return null
        val label = when {
            host.endsWith(".docodile.app") -> host.removeSuffix(".docodile.app")
            host.endsWith(".lvh.me")       -> host.removeSuffix(".lvh.me")
            host.endsWith(".localhost")    -> host.removeSuffix(".localhost")
            else -> return null
        }
        if (label.isEmpty() || label.contains('.')) return null
        if (label in RESERVED_LABELS) return null
        return label
    }

    companion object {
        private val RESERVED_LABELS = setOf("www", "api", "app")
    }
}
