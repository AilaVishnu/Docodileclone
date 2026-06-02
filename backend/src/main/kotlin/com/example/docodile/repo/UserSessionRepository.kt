package com.example.docodile.repo

import com.example.docodile.domain.UserSession
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

interface UserSessionRepository : JpaRepository<UserSession, UUID> {
    fun findAllByUserIdAndRevokedAtIsNull(userId: UUID): List<UserSession>
    fun findByJti(jti: UUID): UserSession?

    @Transactional
    @Modifying
    @Query("UPDATE UserSession s SET s.revokedAt = :now WHERE s.userId = :userId AND s.revokedAt IS NULL")
    fun revokeAllForUser(@Param("userId") userId: UUID, @Param("now") now: Instant): Int
}
