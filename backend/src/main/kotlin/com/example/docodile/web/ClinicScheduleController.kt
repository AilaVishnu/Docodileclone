package com.example.docodile.web

import com.example.docodile.domain.ClinicSchedule
import com.example.docodile.repo.ClinicScheduleRepository
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.Instant

data class ClinicScheduleDTO(
    // Raw JSON string round-tripped from the JSONB column. The frontend
    // owns the shape (default week + overrides + configured flag).
    val schedule: String
)

@RestController
@RequestMapping("/api/tenant/clinic-schedule")
class ClinicScheduleController(
    private val repo: ClinicScheduleRepository,
) {

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun get(): ClinicScheduleDTO {
        val row = repo.findAll().firstOrNull()
        return ClinicScheduleDTO(schedule = row?.schedule ?: "{}")
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    fun update(@RequestBody body: ClinicScheduleDTO): ClinicScheduleDTO {
        val row = repo.findAll().firstOrNull() ?: ClinicSchedule()
        row.schedule = body.schedule.ifBlank { "{}" }
        row.updatedAt = Instant.now()
        val saved = repo.save(row)
        return ClinicScheduleDTO(schedule = saved.schedule)
    }
}
