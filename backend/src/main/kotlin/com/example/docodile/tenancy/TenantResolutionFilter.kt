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
        try {
            val sub = resolveSubdomain(request)
            if (sub != null) {
                val clinic = registry.findBySubdomain(sub)
                if (clinic != null && clinic.status == ProvisioningStatus.ACTIVE) {
                    TenantContext.set(clinic.schemaName)
                }
            }
            filterChain.doFilter(request, response)
        } finally {
            TenantContext.clear()
        }
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
