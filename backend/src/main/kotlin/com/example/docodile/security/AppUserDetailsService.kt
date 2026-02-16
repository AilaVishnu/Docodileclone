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

        val clinicId = user.clinic?.id ?: throw UsernameNotFoundException("Clinic not found")

        return AppUserPrincipal(
            userId = user.id,
            clinicId = clinicId,
            role = user.role.name,
            email = user.email,
            passwordHash = user.passwordHash,
            active = user.active
        )
    }
}
