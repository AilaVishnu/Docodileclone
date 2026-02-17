package com.example.docodile.repo

import com.example.docodile.domain.AppUser
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional
import java.util.UUID

interface AppUserRepository : JpaRepository<AppUser, UUID> {
    fun findByEmail(email: String): Optional<AppUser>
    fun findByEmailAndClinicId(email: String, clinicId: UUID): Optional<AppUser>
}
