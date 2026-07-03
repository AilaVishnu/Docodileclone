package com.example.docodile.tenancy

import org.hibernate.context.spi.CurrentTenantIdentifierResolver
import org.springframework.stereotype.Component

/**
 * Resolves the current tenant schema from TenantContext for Hibernate.
 * Falls back to defaultSchema when no tenant is set (e.g. startup / non-request
 * threads). validateExistingCurrentSessions=true makes Hibernate reject reusing
 * a Session bound to a different tenant. Registered with Hibernate via MultiTenancyConfig.
 */
@Component
class SchemaTenantResolver(
    private val defaultSchema: String = "public",
) : CurrentTenantIdentifierResolver<String> {

    override fun resolveCurrentTenantIdentifier(): String = TenantContext.get() ?: defaultSchema

    override fun validateExistingCurrentSessions(): Boolean = true
}
