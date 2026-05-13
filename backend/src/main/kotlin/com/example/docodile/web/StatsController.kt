package com.example.docodile.web

import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.RxRowRepository
import com.example.docodile.repo.VisitRepository
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
import java.time.ZoneOffset
import java.util.UUID

// ─── DTOs ────────────────────────────────────────────────────────────────────

data class NameCountDTO(val name: String, val count: Int)
data class InClinicDTO(val waiting: Int, val inConsult: Int, val done: Int)
data class HourlyCountDTO(val hour: Int, val count: Int)
data class DailyCountDTO(val date: String, val count: Int)

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
    val inClinic: InClinicDTO,
    val noShowRate: Double,
    val hourlyTrend: List<HourlyCountDTO>,
    val dailyTrend: List<DailyCountDTO>,
    val peakHours: Map<String, Map<Int, Int>>,
    val topComplaints: List<NameCountDTO>,
)

data class PatientsStatsDTO(
    val activePatients: Int,
    val ageGroups: Map<String, Int>,
    val genderSplit: Map<String, Int>,
)

data class ClinicalStatsDTO(
    val topComplaints: List<NameCountDTO>,
    val topDiagnoses: List<NameCountDTO>,
    val topMedicines: List<NameCountDTO>,
    val reviewScheduledRate: Int,
)

data class FinanceStatsDTO(
    val revenue: Long,
    val outstandingDues: Long,
    val avgPerVisit: Long,
    val revenueTrend: List<DailyCountDTO>,
    val paymentMix: Map<String, Long>,
)

data class OperationsStatsDTO(
    val totalAppointments: Int,
    val cancelled: Int,
    val noShow: Int,
    val cancellationRate: Double,
    val noShowRate: Double,
)

// ─── Controller ──────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/stats")
@PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
class StatsController(
    private val appointmentRepository: AppointmentRepository,
    private val patientRepository: PatientRepository,
    private val visitRepository: VisitRepository,
    private val rxRowRepository: RxRowRepository,
    private val currentUser: CurrentUser,
) {

    private fun dateTimeRange(startDate: LocalDate?, endDate: LocalDate?): Pair<LocalDateTime, LocalDateTime> {
        val today = LocalDate.now()
        return (startDate ?: today).atStartOfDay() to (endDate ?: today).atTime(23, 59, 59)
    }

    private fun tokenize(text: String?) = (text ?: "")
        .split(",", "\n", ";")
        .map { it.trim() }
        .filter { it.length > 2 }

    private fun capitalize(s: String) = s.lowercase().replaceFirstChar { it.uppercase() }

    // ── Doctors ─────────────────────────────────────────────────────────────

    @GetMapping("/doctors")
    fun doctorStats(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?,
    ): List<DoctorStatsDTO> {
        val clinicId = currentUser.clinicId()
        val (start, end) = dateTimeRange(startDate, endDate)
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
                    .toSet().size
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

    // ── Overview ─────────────────────────────────────────────────────────────

    @GetMapping("/overview")
    fun overviewStats(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?,
    ): OverviewStatsDTO {
        val clinicId = currentUser.clinicId()
        val (start, end) = dateTimeRange(startDate, endDate)
        val today = LocalDate.now()

        val appointments = appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(clinicId, start, end)
        val completed = appointments.filter {
            it.payStatus?.uppercase() == "PAID" || it.status?.uppercase() == "COMPLETED"
        }
        val revenue = completed.mapNotNull { it.fee }.fold(BigDecimal.ZERO, BigDecimal::add).toLong()

        val allPatients = patientRepository.findAllByClinicId(clinicId)
        val newPatients = allPatients.count { p ->
            val created = p.createdAt
            created != null
                && !created.isBefore(start.toInstant(ZoneOffset.UTC))
                && !created.isAfter(end.toInstant(ZoneOffset.UTC))
        }

        val composition = mapOf(
            "consultation" to appointments.count { it.type?.lowercase() in listOf("consultation", "new") },
            "review"       to appointments.count { it.type?.lowercase() == "review" },
            "walkin"       to appointments.count { it.isWalkin == true },
            "procedure"    to appointments.count {
                it.type?.lowercase() !in listOf("consultation", "review", "new") && it.isWalkin != true
            },
        )

        // Live in-clinic counts from today's appointments
        val todayApts = if (startDate == null && endDate == null || startDate == today) {
            appointments
        } else {
            appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(
                clinicId, today.atStartOfDay(), today.atTime(23, 59, 59)
            )
        }
        val inClinic = InClinicDTO(
            waiting   = todayApts.count { it.status?.uppercase() in listOf("WAITING", "BOOKED", "SCHEDULED") },
            inConsult = todayApts.count { it.status?.uppercase() == "IN_PROGRESS" },
            done      = todayApts.count { it.status?.uppercase() == "COMPLETED" },
        )

        val noShowCount = appointments.count { it.status?.uppercase() in listOf("NO_SHOW", "CANCELLED") }
        val noShowRate = if (appointments.isNotEmpty()) noShowCount.toDouble() / appointments.size * 100 else 0.0

        // Hourly breakdown (for today range)
        val hourlyTrend = appointments
            .mapNotNull { it.scheduledTime }
            .groupBy { it.hour }
            .map { (h, list) -> HourlyCountDTO(h, list.size) }
            .sortedBy { it.hour }

        // Daily breakdown (for week/month/year ranges)
        val dailyTrend = appointments
            .mapNotNull { it.scheduledTime?.toLocalDate()?.toString() }
            .groupBy { it }
            .map { (date, list) -> DailyCountDTO(date, list.size) }
            .sortedBy { it.date }

        // Peak-hours heatmap: always last 30 days
        val thirtyAgo = today.minusDays(29).atStartOfDay()
        val recentApts = appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(
            clinicId, thirtyAgo, today.atTime(23, 59, 59)
        )
        val dayNames = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
        val peakHours = recentApts
            .mapNotNull { it.scheduledTime }
            .groupBy { dayNames[it.dayOfWeek.value - 1] }
            .mapValues { (_, times) -> times.groupBy { it.hour }.mapValues { (_, h) -> h.size } }

        // Top complaints from visits in range
        val visits = visitRepository.findAllByClinicIdAndVisitDateBetween(
            clinicId, start.toLocalDate(), end.toLocalDate()
        )
        val topComplaints = visits
            .flatMap { tokenize(it.complaints) }
            .groupBy { capitalize(it) }
            .map { (name, list) -> NameCountDTO(name, list.size) }
            .sortedByDescending { it.count }
            .take(5)

        return OverviewStatsDTO(
            totalAppointments = appointments.size,
            newPatients = newPatients,
            completedAppointments = completed.size,
            revenue = revenue,
            composition = composition,
            inClinic = inClinic,
            noShowRate = noShowRate,
            hourlyTrend = hourlyTrend,
            dailyTrend = dailyTrend,
            peakHours = peakHours,
            topComplaints = topComplaints,
        )
    }

    // ── Patients ─────────────────────────────────────────────────────────────

    @GetMapping("/patients")
    fun patientsStats(): PatientsStatsDTO {
        val clinicId = currentUser.clinicId()
        val today = LocalDate.now()

        val sixMonthsAgo = today.minusMonths(6).atStartOfDay()
        val recentApts = appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(
            clinicId, sixMonthsAgo, today.atTime(23, 59, 59)
        )
        val activeIds = recentApts.mapNotNull { it.patient?.id }.toSet()
        val allPatients = patientRepository.findAllByClinicId(clinicId)
        val activePts = allPatients.filter { it.id in activeIds }

        val ageGroups = mutableMapOf("0–12" to 0, "13–25" to 0, "26–40" to 0, "41–60" to 0, "61+" to 0)
        activePts.forEach { p ->
            val age = p.age ?: p.dob?.let { today.year - it.year } ?: return@forEach
            when {
                age <= 12 -> ageGroups["0–12"] = ageGroups["0–12"]!! + 1
                age <= 25 -> ageGroups["13–25"] = ageGroups["13–25"]!! + 1
                age <= 40 -> ageGroups["26–40"] = ageGroups["26–40"]!! + 1
                age <= 60 -> ageGroups["41–60"] = ageGroups["41–60"]!! + 1
                else      -> ageGroups["61+"]  = ageGroups["61+"]!! + 1
            }
        }

        val genderSplit = activePts
            .groupBy {
                when {
                    it.gender?.lowercase()?.trim()?.startsWith("m") == true -> "male"
                    it.gender?.lowercase()?.trim()?.startsWith("f") == true -> "female"
                    else -> "other"
                }
            }
            .mapValues { (_, list) -> list.size }

        return PatientsStatsDTO(
            activePatients = activeIds.size,
            ageGroups = ageGroups,
            genderSplit = genderSplit,
        )
    }

    // ── Clinical ─────────────────────────────────────────────────────────────

    @GetMapping("/clinical")
    fun clinicalStats(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?,
    ): ClinicalStatsDTO {
        val clinicId = currentUser.clinicId()
        val today = LocalDate.now()
        val start = startDate ?: today
        val end = endDate ?: today

        val visits = visitRepository.findAllByClinicIdAndVisitDateBetween(clinicId, start, end)

        val topComplaints = visits
            .flatMap { tokenize(it.complaints) }
            .groupBy { capitalize(it) }
            .map { (k, v) -> NameCountDTO(k, v.size) }
            .sortedByDescending { it.count }
            .take(5)

        val topDiagnoses = visits
            .flatMap { tokenize(it.diagnosis) }
            .groupBy { capitalize(it) }
            .map { (k, v) -> NameCountDTO(k, v.size) }
            .sortedByDescending { it.count }
            .take(6)

        val visitIds = visits.map { it.id }
        val topMedicines = if (visitIds.isEmpty()) emptyList() else {
            rxRowRepository.findMedicinesByVisitIds(visitIds)
                .groupBy { capitalize(it) }
                .map { (k, v) -> NameCountDTO(k, v.size) }
                .sortedByDescending { it.count }
                .take(6)
        }

        val withReview = visits.count { it.reviewDate != null }
        val reviewRate = if (visits.isNotEmpty()) withReview * 100 / visits.size else 0

        return ClinicalStatsDTO(
            topComplaints = topComplaints,
            topDiagnoses = topDiagnoses,
            topMedicines = topMedicines,
            reviewScheduledRate = reviewRate,
        )
    }

    // ── Finance ──────────────────────────────────────────────────────────────

    @GetMapping("/finance")
    fun financeStats(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?,
    ): FinanceStatsDTO {
        val clinicId = currentUser.clinicId()
        val (start, end) = dateTimeRange(startDate, endDate)
        val appointments = appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(clinicId, start, end)

        val paid = appointments.filter { it.payStatus?.uppercase() == "PAID" }
        val revenue = paid.mapNotNull { it.fee }.fold(BigDecimal.ZERO, BigDecimal::add).toLong()
        val outstanding = appointments
            .filter { it.payStatus?.uppercase() != "PAID" && (it.fee ?: BigDecimal.ZERO) > BigDecimal.ZERO }
            .mapNotNull { it.fee }.fold(BigDecimal.ZERO, BigDecimal::add).toLong()
        val avgPerVisit = if (paid.isNotEmpty()) revenue / paid.size else 0L

        val revenueTrend = paid
            .groupBy { it.scheduledTime?.toLocalDate()?.toString() ?: "" }
            .filterKeys { it.isNotEmpty() }
            .map { (date, apts) ->
                DailyCountDTO(date, apts.mapNotNull { it.fee }.fold(BigDecimal.ZERO, BigDecimal::add).toLong().toInt())
            }
            .sortedBy { it.date }

        val paymentMix = paid
            .groupBy { it.paymentMethod?.uppercase()?.ifBlank { "CASH" } ?: "CASH" }
            .mapValues { (_, apts) -> apts.mapNotNull { it.fee }.fold(BigDecimal.ZERO, BigDecimal::add).toLong() }

        return FinanceStatsDTO(
            revenue = revenue,
            outstandingDues = outstanding,
            avgPerVisit = avgPerVisit,
            revenueTrend = revenueTrend,
            paymentMix = paymentMix,
        )
    }

    // ── Operations ────────────────────────────────────────────────────────────

    @GetMapping("/operations")
    fun operationsStats(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?,
    ): OperationsStatsDTO {
        val clinicId = currentUser.clinicId()
        val (start, end) = dateTimeRange(startDate, endDate)
        val appointments = appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(clinicId, start, end)

        val total = appointments.size
        val cancelled = appointments.count { it.status?.uppercase() == "CANCELLED" }
        val noShow = appointments.count { it.status?.uppercase() == "NO_SHOW" }

        return OperationsStatsDTO(
            totalAppointments = total,
            cancelled = cancelled,
            noShow = noShow,
            cancellationRate = if (total > 0) cancelled.toDouble() / total * 100 else 0.0,
            noShowRate = if (total > 0) noShow.toDouble() / total * 100 else 0.0,
        )
    }
}
