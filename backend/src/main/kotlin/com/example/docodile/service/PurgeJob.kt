package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.UserSessionRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.temporal.ChronoUnit

@Component
class PurgeJob(
    private val userSessionRepository: UserSessionRepository,
    private val patientRepository: PatientRepository,
    private val auditService: AuditService,
) {
    private val log = LoggerFactory.getLogger(PurgeJob::class.java)

    // Run every Sunday at 02:15 — purge user_session rows for fully expired sessions.
    // (Revocation now lives on user_session.revoked_at; the separate revoked_token table was merged in.)
    @Scheduled(cron = "0 15 2 * * SUN")
    @Transactional
    fun purgeExpiredSessions() {
        val deleted = userSessionRepository.deleteExpired(Instant.now())
        log.info("PurgeJob: deleted {} expired user_session rows", deleted)
    }

    // Run on the 1st of every month at 03:00 — hard-delete patient records that
    // were soft-deleted more than RETENTION_YEARS years ago. Medical records
    // in India must be retained for 3 years (MCI guidelines); we use 7 for safety.
    // NOTE: This does NOT cascade to visits/rx_rows — add that when the legal
    // team confirms the retention policy. Currently only logs what would be purged.
    @Scheduled(cron = "0 0 3 1 * *")
    fun reportPurgeablePatients() {
        val cutoff = Instant.now().minus(RETENTION_YEARS * 365L, ChronoUnit.DAYS)
        val purgeable = patientRepository.findSoftDeletedBefore(cutoff)
        if (purgeable.isEmpty()) {
            log.info("PurgeJob: no patients eligible for hard purge (retention = {} years)", RETENTION_YEARS)
            return
        }
        log.warn(
            "PurgeJob: {} patient records are eligible for hard purge " +
            "(soft-deleted before {}). Hard purge is currently disabled — " +
            "implement cascade deletion and legal sign-off before enabling.",
            purgeable.size, cutoff
        )
        auditService.log(
            action   = AuditAction.DELETION_EXECUTED,
            outcome  = "PENDING_REVIEW",
            metadata = mapOf("eligibleCount" to purgeable.size, "cutoffDate" to cutoff.toString())
        )
    }

    companion object {
        private const val RETENTION_YEARS = 7L
    }
}
