package com.example.docodile.web

import com.example.docodile.domain.ClinicSchedule
import com.example.docodile.repo.ClinicScheduleRepository
import com.example.docodile.security.CurrentUser
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
    private val currentUser: CurrentUser
) {

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun get(): ClinicScheduleDTO {
        val clinicId = currentUser.clinicId()
        val row = repo.findById(clinicId).orElse(null)
        return ClinicScheduleDTO(schedule = row?.schedule ?: "{}")
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    fun update(@RequestBody body: ClinicScheduleDTO): ClinicScheduleDTO {
        val clinicId = currentUser.clinicId()
        val row = repo.findById(clinicId).orElseGet {
            ClinicSchedule(clinicId = clinicId)
        }
        row.schedule = body.schedule.ifBlank { "{}" }
        row.updatedAt = Instant.now()
        val saved = repo.save(row)
        return ClinicScheduleDTO(schedule = saved.schedule)
    }
}
