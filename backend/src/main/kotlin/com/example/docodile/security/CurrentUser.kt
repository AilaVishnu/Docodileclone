package com.example.docodile.security

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class CurrentUser {
    fun userId(): UUID {
        val principal = SecurityContextHolder.getContext().authentication?.principal as? AppUserPrincipal
        return principal?.userId ?: throw IllegalStateException("Missing user")
    }

    fun tenantId(): UUID {
        val principal = SecurityContextHolder.getContext().authentication?.principal as? AppUserPrincipal
        return principal?.tenantId ?: throw IllegalStateException("Missing tenant")
    }

    fun clinicId(): UUID {
        val principal = SecurityContextHolder.getContext().authentication?.principal as? AppUserPrincipal
        return principal?.clinicId ?: throw IllegalStateException("Missing clinic")
    }

    fun clinicIdOrNull(): UUID? {
        val principal = SecurityContextHolder.getContext().authentication?.principal as? AppUserPrincipal
        return principal?.clinicId
    }

    fun role(): String {
        val principal = SecurityContextHolder.getContext().authentication?.principal as? AppUserPrincipal
        return principal?.authorities?.firstOrNull()?.authority ?: ""
    }
}
