package com.example.docodile.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.UUID

class AppUserPrincipal(
    val userId: UUID,
    val schema: String,
    private val role: String,
    private val email: String,
    private val passwordHash: String,
    private val active: Boolean,
    private val accountLocked: Boolean = false,
) : UserDetails {
    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return mutableListOf(SimpleGrantedAuthority("ROLE_$role"))
    }

    override fun getPassword(): String = passwordHash
    override fun getUsername(): String = email
    override fun isAccountNonExpired(): Boolean = true
    override fun isAccountNonLocked(): Boolean = !accountLocked
    override fun isCredentialsNonExpired(): Boolean = true
    override fun isEnabled(): Boolean = active
}
