package com.example.docodile.config

import com.example.docodile.security.AppUserPrincipal
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.domain.AuditorAware
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.security.core.context.SecurityContextHolder
import java.util.Optional
import java.util.UUID

@Configuration
@EnableJpaAuditing(auditorAwareRef = "securityAuditorAware")
class JpaAuditConfig {

    @Bean
    fun securityAuditorAware(): AuditorAware<UUID> = AuditorAware {
        val principal = SecurityContextHolder.getContext()
            .authentication?.principal as? AppUserPrincipal
        Optional.ofNullable(principal?.userId)
    }
}
