package com.example.docodile.security

import com.example.docodile.repo.AppUserRepository
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class AppUserDetailsService(private val appUserRepository: AppUserRepository) : UserDetailsService {
    override fun loadUserByUsername(username: String): UserDetails {
        val user = appUserRepository.findByEmail(username)
            .orElseThrow { UsernameNotFoundException("User not found") }

        val tenantId = user.tenant?.id ?: throw UsernameNotFoundException("Tenant not found")

        return AppUserPrincipal(
            userId = user.id,
            tenantId = tenantId,
            clinicId = null,
            role = user.role.name,
            email = user.email,
            passwordHash = user.passwordHash,
            active = user.active
        )
    }
}
