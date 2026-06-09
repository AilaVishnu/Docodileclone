package com.example.docodile.repo

import com.example.docodile.domain.PasswordResetToken
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PasswordResetTokenRepository : JpaRepository<PasswordResetToken, UUID> {
    fun findByTokenHash(tokenHash: String): PasswordResetToken?
    fun findAllByUserIdAndUsedAtIsNull(userId: UUID): List<PasswordResetToken>
}
