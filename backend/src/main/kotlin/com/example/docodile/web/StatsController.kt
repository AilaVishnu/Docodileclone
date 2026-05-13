package com.example.docodile.web

import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class DoctorStatsDTO(
    val doctorId: String,
    val name: String,
    val revenue: Long,
    val daysWorked: Int,
    val appointmentCount: Int,
)

data class OverviewStatsDTO(
    val totalAppointments: Int,
    val newPatients: Int,
    val completedAppointments: Int,
    val revenue: Long,
    val composition: Map<String, Int>,
)

@RestController
@RequestMapping("/api/stats")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
class StatsController(
    private val appointmentRepository: AppointmentRepository,
    private val patientRepository: PatientRepository,
    private val currentUser: CurrentUser,
) {

    @GetMapping("/doctors")
    fun doctorStats(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?,
    ): List<DoctorStatsDTO> {
        val clinicId = currentUser.clinicId()
        val start = (startDate ?: LocalDate.now().withDayOfMonth(1)).atStartOfDay()
        val end = (endDate ?: LocalDate.now()).atTime(23, 59, 59)

        val appointments = appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(clinicId, start, end)

        return appointments
            .groupBy { it.doctor }
            .filterKeys { it != null }
            .map { (doctor, apts) ->
                val revenue = apts
                    .filter { it.payStatus?.uppercase() == "PAID" }
                    .mapNotNull { it.fee }
                    .fold(BigDecimal.ZERO, BigDecimal::add)
                    .toLong()
                val daysWorked = apts
                    .mapNotNull { it.scheduledTime?.toLocalDate() }
                    .toSet()
                    .size
                DoctorStatsDTO(
                    doctorId = doctor!!.id.toString(),
                    name = doctor.name ?: doctor.email,
                    revenue = revenue,
                    daysWorked = daysWorked,
                    appointmentCount = apts.size,
                )
            }
            .sortedByDescending { it.revenue }
    }

    @GetMapping("/overview")
    fun overviewStats(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?,
    ): OverviewStatsDTO {
        val clinicId = currentUser.clinicId()
        val start = (startDate ?: LocalDate.now()).atStartOfDay()
        val end = (endDate ?: LocalDate.now()).atTime(23, 59, 59)

        val appointments = appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(clinicId, start, end)
        val completed = appointments.filter { it.payStatus?.uppercase() == "PAID" || it.status?.uppercase() == "COMPLETED" }
        val revenue = completed.mapNotNull { it.fee }.fold(BigDecimal.ZERO, BigDecimal::add).toLong()

        // New patients: patients whose first appointment falls in range
        val allPatients = patientRepository.findAllByClinicId(clinicId)
        val newPatients = allPatients.count { p ->
            val created = p.createdAt
            created != null && !created.isBefore(start.toInstant(java.time.ZoneOffset.UTC))
                && !created.isAfter(end.toInstant(java.time.ZoneOffset.UTC))
        }

        val composition = mapOf(
            "consultation" to appointments.count { it.type?.lowercase() == "consultation" || it.type?.lowercase() == "new" },
            "review"       to appointments.count { it.type?.lowercase() == "review" },
            "walkin"       to appointments.count { it.isWalkin == true },
            "procedure"    to appointments.count {
                it.type?.lowercase() != "consultation" && it.type?.lowercase() != "review" && it.type?.lowercase() != "new" && it.isWalkin != true
            },
        )

        return OverviewStatsDTO(
            totalAppointments = appointments.size,
            newPatients = newPatients,
            completedAppointments = completed.size,
            revenue = revenue,
            composition = composition,
        )
    }
}
