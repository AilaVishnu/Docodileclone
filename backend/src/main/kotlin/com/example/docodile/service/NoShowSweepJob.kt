package com.example.docodile.service

import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.tenancy.TenantTaskExecutor
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * Nightly sweeper that flips every BOOKED appointment whose scheduled date
 * has already passed to NO_SHOW. Without this, the receptionist sees stale
 * "Booked" pills on yesterday's queue and the stats dashboard miscounts
 * missed visits as still-pending bookings.
 *
 * Cron runs at 01:00 Asia/Kolkata (TZ is forced in DocodileApplication) so
 * the day-boundary has clearly passed and any late-night walk-ins on the
 * previous date have been processed. Also runs once at app boot via
 * `initialDelay` so a freshly deployed server catches up immediately.
 */
@Component
class NoShowSweepJob(
    private val appointmentRepository: AppointmentRepository,
    private val perClinic: TenantTaskExecutor,
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Kolkata")
    fun sweepNightly() {
        perClinic.forEachActiveClinic("no-show sweep (nightly)") { runSweep("nightly cron") }
    }

    // First run on boot so a server restart on the morning after a holiday
    // doesn't leave stale BOOKED rows visible until the next 1am tick.
    @Scheduled(initialDelay = 30_000, fixedDelay = Long.MAX_VALUE)
    fun sweepOnBoot() {
        perClinic.forEachActiveClinic("no-show sweep (startup)") { runSweep("startup") }
    }

    private fun runSweep(reason: String) {
        // Cutoff = start of today; anything scheduled before that and still
        // pending is stale.
        val cutoff: LocalDateTime = LocalDate.now().atStartOfDay()
        // Stage 1 — pre-arrival no-shows: BOOKED/SCHEDULED/WAITING → NO_SHOW.
        val noShow = appointmentRepository.markBookedBeforeAsNoShow(cutoff)
        if (noShow > 0) {
            log.info("NoShowSweep ($reason): marked {} stale BOOKED → NO_SHOW (cutoff {})", noShow, cutoff)
        }
        // Stage 2 — never-opened consultations: an At-Doc (IN_PROGRESS/AT_DOC)
        // appointment whose pad was never opened (no started visit) → UNSEEN.
        val unseen = appointmentRepository.markStaleAtDocAsUnseen(cutoff)
        if (unseen > 0) {
            log.info("NoShowSweep ($reason): marked {} stale At-Doc → UNSEEN (cutoff {})", unseen, cutoff)
        }
    }
}
