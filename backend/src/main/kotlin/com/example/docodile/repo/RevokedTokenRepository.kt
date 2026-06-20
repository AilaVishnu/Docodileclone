package com.example.docodile.repo

import com.example.docodile.domain.RevokedToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

interface RevokedTokenRepository : JpaRepository<RevokedToken, UUID> {
    fun existsByJti(jti: UUID): Boolean

    @Transactional
    @Modifying
    @Query("DELETE FROM RevokedToken t WHERE t.expiresAt < :now")
    fun deleteExpired(@Param("now") now: Instant): Int
}
