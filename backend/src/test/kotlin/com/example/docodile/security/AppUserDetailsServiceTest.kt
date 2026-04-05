package com.example.docodile.security

import com.example.docodile.domain.AppUser
import com.example.docodile.domain.Role
import com.example.docodile.domain.Tenant
import com.example.docodile.repo.AppUserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.userdetails.UsernameNotFoundException
import java.util.*

@ExtendWith(MockitoExtension::class)
class AppUserDetailsServiceTest {

    @Mock
    private lateinit var appUserRepository: AppUserRepository

    @InjectMocks
    private lateinit var appUserDetailsService: AppUserDetailsService

    @Test
    fun `loadUserByUsername should return user principal for valid email`() {
        val tenant = Tenant(id = UUID.randomUUID())
        val user = AppUser(
            id = UUID.randomUUID(),
            email = "user@example.com",
            passwordHash = "hash",
            role = Role.ADMIN,
            tenant = tenant,
            active = true
        )

        `when`(appUserRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user))

        val principal = appUserDetailsService.loadUserByUsername("user@example.com") as AppUserPrincipal

        assertEquals(user.id, principal.userId)
        assertEquals(tenant.id, principal.tenantId)
        assertEquals("user@example.com", principal.username)
    }

    @Test
    fun `loadUserByUsername should throw when user not found`() {
        `when`(appUserRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty())

        assertThrows(UsernameNotFoundException::class.java) {
            appUserDetailsService.loadUserByUsername("ghost@example.com")
        }
    }
}
