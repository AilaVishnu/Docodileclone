package com.example.docodile.config

import com.example.docodile.tenancy.ClinicRegistryDao
import com.example.docodile.tenancy.TenantResolutionFilter
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.Ordered

@Configuration
class TenantFilterConfig {
    @Bean
    fun tenantResolutionFilterRegistration(registry: ClinicRegistryDao): FilterRegistrationBean<TenantResolutionFilter> =
        FilterRegistrationBean(TenantResolutionFilter(registry)).apply {
            order = Ordered.HIGHEST_PRECEDENCE + 10
            addUrlPatterns("/*")
        }
}
