package com.example.docodile.config

import com.example.docodile.tenancy.SchemaMultiTenantConnectionProvider
import com.example.docodile.tenancy.SchemaTenantResolver
import org.hibernate.cfg.AvailableSettings
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer
import org.springframework.context.annotation.Configuration

@Configuration
class MultiTenancyConfig(
    private val connectionProvider: SchemaMultiTenantConnectionProvider,
    private val tenantResolver: SchemaTenantResolver,
) : HibernatePropertiesCustomizer {
    override fun customize(hibernateProperties: MutableMap<String, Any>) {
        hibernateProperties[AvailableSettings.MULTI_TENANT_CONNECTION_PROVIDER] = connectionProvider
        hibernateProperties[AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER] = tenantResolver
    }
}
