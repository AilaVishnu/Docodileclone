package com.example.docodile.security

import com.example.docodile.repo.AppUserRepository
import com.example.docodile.tenancy.TenantContext
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class AppUserDetailsService(private val appUserRepository: AppUserRepository) : UserDetailsService {
    override fun loadUserByUsername(username: String): UserDetails {
        // The connection is already routed to the tenant schema (Hibernate multitenancy),
        // so the user lookup is implicitly clinic-scoped.
        val user = appUserRepository.findByEmail(username)
            .orElseThrow { UsernameNotFoundException("User not found") }

        val schema = TenantContext.get() ?: throw UsernameNotFoundException("No tenant in context")

        return AppUserPrincipal(
            userId = user.id,
            schema = schema,
            role = user.role.name,
            email = user.email,
            passwordHash = user.passwordHash ?: "",
            active = user.active
        )
    }
}
