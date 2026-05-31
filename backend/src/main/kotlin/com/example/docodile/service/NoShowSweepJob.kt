package com.example.docodile.service

import com.example.docodile.repo.AppointmentRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
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
    private val appointmentRepository: AppointmentRepository
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Kolkata")
    @Transactional
    fun sweepNightly() {
        runSweep("nightly cron")
    }

    // First run on boot so a server restart on the morning after a holiday
    // doesn't leave stale BOOKED rows visible until the next 1am tick.
    @Scheduled(initialDelay = 30_000, fixedDelay = Long.MAX_VALUE)
    @Transactional
    fun sweepOnBoot() {
        runSweep("startup")
    }

    private fun runSweep(reason: String) {
        // Cutoff = start of today; anything scheduled before that and still
        // BOOKED was a no-show.
        val cutoff: LocalDateTime = LocalDate.now().atStartOfDay()
        val touched = appointmentRepository.markBookedBeforeAsNoShow(cutoff)
        if (touched > 0) {
            log.info("NoShowSweep ($reason): marked {} stale BOOKED → NO_SHOW (cutoff {})", touched, cutoff)
        }
    }
}
