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
    // Total fee value of bills marked WAIVED — money the clinic chose
    // not to collect. Useful to track goodwill / charity over time.
    val waivedAmount: Long,
    // Revenue split by service short-form / name ("Consultation", "SKR" …).
    // Empty services collapse under "Other".
    val revenueByService: Map<String, Long>,
    // Higher-level type rollup: Consultation / Procedure / Review, using
    // the same classifier as the Overview composition.
    val revenueByType: Map<String, Long>,
    // Bill counts (paid / waived / due) — denominators for the doctor's
    // sanity-check beside the rupee figures.
    val billsCount: BillsCountDTO,
    // Total dispensary revenue across paid bills (sum of
    // appointment.pharmacy_amount). Kept separate from consultation
    // revenue so the Finance dashboard can split the two.
    val pharmacyRevenue: Long,
    // Total revenue (consultation + pharmacy) bucketed by appointment
    // hour-of-day, 0..23. Lets the doctor spot peak earning hours.
    val revenueByHour: Map<Int, Long>,
)

data class BillsCountDTO(val paid: Int, val waived: Int, val due: Int)

data class OperationsStatsDTO(
    val totalAppointments: Int,
    val cancelled: Int,
    val noShow: Int,
    val cancellationRate: Double,
    val noShowRate: Double,
)

data class OverdueReviewDTO(val patientName: String, val doctorName: String, val reviewDate: String, val daysSince: Long)
data class ComplaintTrendDTO(val name: String, val points: List<Int>)
data class HealthSubscoreDTO(val label: String, val value: Int, val hint: String)
data class HealthInsightDTO(val tone: String, val text: String, val action: String?)
data class HealthStatsDTO(
    val overallScore: Int,
    val subscores: List<HealthSubscoreDTO>,
    val insights: List<HealthInsightDTO>,
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

        // Classify by SERVICE, not type. Appointment.type means "new
        // patient vs review patient" — a procedure booking still carries
        // type=new, so the old logic miscounted procedures as consults.
        // Walk-ins remain their own bucket; among the rest, the service
        // name decides:
        //   • empty / "consultation" / shortform "C"  → consultation
        //   • "review"                                 → review
        //   • anything else                            → procedure
        fun isConsultService(svc: String?): Boolean {
            val s = svc?.trim()?.lowercase() ?: return true   // empty service ≈ default consult
            return s.isEmpty() || s == "consultation" || s == "consult" || s == "c"
        }
        val composition = mapOf(
            "consultation" to appointments.count { it.isWalkin != true && it.type?.lowercase() != "review" && isConsultService(it.service) },
            "review"       to appointments.count { it.type?.lowercase() == "review" },
            "walkin"       to appointments.count { it.isWalkin == true },
            "procedure"    to appointments.count {
                it.isWalkin != true
                    && it.type?.lowercase() != "review"
                    && !isConsultService(it.service)
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

        // All patients registered to this clinic
        val allPatients = patientRepository.findAllByClinicId(clinicId)

        val ageGroups = mutableMapOf("0–12" to 0, "13–25" to 0, "26–40" to 0, "41–60" to 0, "61+" to 0)
        allPatients.forEach { p ->
            val age = p.age ?: p.dob?.let { today.year - it.year } ?: return@forEach
            when {
                age <= 12 -> ageGroups["0–12"] = ageGroups["0–12"]!! + 1
                age <= 25 -> ageGroups["13–25"] = ageGroups["13–25"]!! + 1
                age <= 40 -> ageGroups["26–40"] = ageGroups["26–40"]!! + 1
                age <= 60 -> ageGroups["41–60"] = ageGroups["41–60"]!! + 1
                else      -> ageGroups["61+"]   = ageGroups["61+"]!! + 1
            }
        }

        val genderSplit = allPatients
            .groupBy {
                when {
                    it.gender?.lowercase()?.trim()?.startsWith("m") == true -> "male"
                    it.gender?.lowercase()?.trim()?.startsWith("f") == true -> "female"
                    else -> "other"
                }
            }
            .mapValues { (_, list) -> list.size }

        return PatientsStatsDTO(
            activePatients = allPatients.size,
            ageGroups = ageGroups,
            genderSplit = genderSplit,
        )
    }

    // ── Health score ──────────────────────────────────────────────────────────

    @GetMapping("/health")
    fun healthStats(): HealthStatsDTO {
        val clinicId = currentUser.clinicId()
        val today = LocalDate.now()
        val thirtyAgo = today.minusDays(29)
        val start = thirtyAgo.atStartOfDay()
        val end = today.atTime(23, 59, 59)

        val apts = appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(clinicId, start, end)
        val total = apts.size.coerceAtLeast(1)
        val completed  = apts.count { it.status?.uppercase() == "COMPLETED" || it.payStatus?.uppercase() == "PAID" }
        val cancelled  = apts.count { it.status?.uppercase() == "CANCELLED" }
        val noShow     = apts.count { it.status?.uppercase() == "NO_SHOW" }
        val paid       = apts.filter { it.payStatus?.uppercase() == "PAID" }
        val unpaid     = apts.filter { it.payStatus?.uppercase() != "PAID" && (it.fee ?: BigDecimal.ZERO) > BigDecimal.ZERO }
        val totalFee   = apts.mapNotNull { it.fee }.fold(BigDecimal.ZERO, BigDecimal::add)
        val paidFee    = paid.mapNotNull { it.fee }.fold(BigDecimal.ZERO, BigDecimal::add)
        val collectionRate = if (totalFee > BigDecimal.ZERO) (paidFee.toDouble() / totalFee.toDouble() * 100).toInt() else 100

        val completionRate = (completed * 100 / total)
        val noShowRate     = (noShow * 100 / total)
        val cancelRate     = (cancelled * 100 / total)

        val visits = visitRepository.findAllByClinicIdAndVisitDateBetween(clinicId, thirtyAgo, today)
        val totalVisits = visits.size.coerceAtLeast(1)
        val diagFilled  = visits.count { !it.diagnosis.isNullOrBlank() }
        val reviewSet   = visits.count { it.reviewDate != null }
        val diagRate    = diagFilled * 100 / totalVisits
        val reviewRate  = reviewSet * 100 / totalVisits

        // Compute subscores (0–100)
        val patientExp = (70 + when {
            noShowRate > 25  -> -20
            noShowRate > 15  -> -10
            noShowRate < 5   -> 10
            else             -> 0
        } + when {
            completionRate > 80 -> 15
            completionRate < 50 -> -10
            else                -> 0
        } + when {
            cancelRate > 20 -> -10
            cancelRate < 5  ->  5
            else            ->  0
        }).coerceIn(0, 100)

        val operational = (70 + when {
            cancelRate > 20 -> -20
            cancelRate > 10 -> -10
            cancelRate < 5  ->  15
            else            ->  0
        } + when {
            completionRate > 80 -> 10
            completionRate < 50 -> -15
            else                -> 0
        }).coerceIn(0, 100)

        val clinical = (60 + when {
            diagRate > 80 -> 25
            diagRate > 60 -> 15
            diagRate < 30 -> -15
            else          -> 0
        } + when {
            reviewRate > 70 -> 15
            reviewRate > 40 ->  5
            else            ->  0
        }).coerceIn(0, 100)

        val financial = (60 + when {
            collectionRate > 90 -> 30
            collectionRate > 75 -> 15
            collectionRate > 60 ->  5
            collectionRate < 40 -> -20
            else                -> -5
        }).coerceIn(0, 100)

        val overallScore = ((patientExp + operational + clinical + financial) / 4.0).toInt()

        val patExpHint = if (noShowRate < 5) "Low no-show, strong completion rate"
                         else if (noShowRate > 15) "High no-show rate — follow up with patients"
                         else "Moderate no-show rate; completion is ${completionRate}%"
        val opHint = if (cancelRate < 5) "Cancellations under control; slots well-filled"
                     else if (cancelRate > 15) "Cancellation rate at ${cancelRate}% — check roster"
                     else "Cancellation rate at ${cancelRate}%; completion ${completionRate}%"
        val clinHint = "Diagnosis filled ${diagRate}%; review plans set ${reviewRate}%"
        val finHint = "Collection rate ${collectionRate}%; ${unpaid.size} unpaid appointments"

        val subscores = listOf(
            HealthSubscoreDTO("Patient experience", patientExp, patExpHint),
            HealthSubscoreDTO("Operational",        operational, opHint),
            HealthSubscoreDTO("Clinical quality",   clinical,   clinHint),
            HealthSubscoreDTO("Financial",          financial,  finHint),
        )

        // Dynamic insights
        val insights = mutableListOf<HealthInsightDTO>()
        if (completionRate > 75)
            insights += HealthInsightDTO("good", "Appointment completion rate is ${completionRate}% — strong throughput.", null)
        if (noShowRate > 15)
            insights += HealthInsightDTO("act",  "${noShow} no-shows in the last 30 days (${noShowRate}%). Consider SMS reminders.", "Review no-show patients")
        if (cancelRate > 10)
            insights += HealthInsightDTO("watch","Cancellation rate at ${cancelRate}% — check if specific slots or doctors are affected.", "Review cancellation patterns")
        if (diagRate < 60)
            insights += HealthInsightDTO("watch","Only ${diagRate}% of visits have a diagnosis recorded. Remind doctors to fill this.", "Share reminder with clinical team")
        if (reviewRate > 60)
            insights += HealthInsightDTO("good", "${reviewRate}% of visits have a follow-up date set — good continuity of care.", null)
        if (reviewRate < 30)
            insights += HealthInsightDTO("watch","Only ${reviewRate}% of visits schedule a follow-up. Consider adding review reminders.", "Discuss with clinical leads")
        if (collectionRate < 70)
            insights += HealthInsightDTO("act",  "Payment collection at ${collectionRate}%. ${unpaid.size} appointments have outstanding dues.", "Run dues collection report")
        if (collectionRate > 90)
            insights += HealthInsightDTO("good", "Excellent payment collection — ${collectionRate}% of billed appointments paid.", null)
        if (insights.isEmpty())
            insights += HealthInsightDTO("good", "Clinic is running smoothly. No critical issues detected in the last 30 days.", null)

        return HealthStatsDTO(overallScore = overallScore, subscores = subscores, insights = insights)
    }

    // ── Overdue reviews ───────────────────────────────────────────────────────

    @GetMapping("/overdue")
    fun overdueReviews(): List<OverdueReviewDTO> {
        val clinicId = currentUser.clinicId()
        val today = LocalDate.now()

        val overdueVisits = visitRepository.findOverdueReviews(clinicId, today)

        // De-duplicate: for each patient keep only their most-overdue visit
        return overdueVisits
            .groupBy { it.patient?.id }
            .filterKeys { it != null }
            .map { (_, visits) -> visits.minByOrNull { it.reviewDate!! }!! }
            .sortedBy { it.reviewDate }
            .take(10)
            .map { v ->
                val daysSince = today.toEpochDay() - v.reviewDate!!.toEpochDay()
                OverdueReviewDTO(
                    patientName = v.patient?.name ?: "Unknown",
                    doctorName  = v.createdByDoctor?.let { it.name ?: it.email } ?: "—",
                    reviewDate  = v.reviewDate.toString(),
                    daysSince   = daysSince,
                )
            }
    }

    // ── Complaints trend ──────────────────────────────────────────────────────

    @GetMapping("/complaints/trend")
    fun complaintsTrend(): List<ComplaintTrendDTO> {
        val clinicId = currentUser.clinicId()
        val today = LocalDate.now()
        val sevenWeeksAgo = today.minusWeeks(7)

        val visits = visitRepository.findAllByClinicIdAndVisitDateBetween(clinicId, sevenWeeksAgo, today)

        // Flatten to (complaint, visitDate) pairs
        val pairs = visits.flatMap { v ->
            tokenize(v.complaints).map { capitalize(it) to v.visitDate }
        }

        // Top 5 complaints overall
        val topNames = pairs.groupBy { it.first }
            .entries.sortedByDescending { it.value.size }
            .take(5).map { it.key }

        val startMonday = today.minusWeeks(6).with(java.time.DayOfWeek.MONDAY)

        return topNames.map { name ->
            val points = (0..6).map { w ->
                val wStart = startMonday.plusWeeks(w.toLong())
                val wEnd   = wStart.plusDays(6)
                pairs.count { (cName, date) -> cName == name && !date.isBefore(wStart) && !date.isAfter(wEnd) }
            }
            ComplaintTrendDTO(name = name, points = points)
        }
    }

    // ── Weekly doctor schedule ────────────────────────────────────────────────

    @GetMapping("/schedule")
    fun weeklySchedule(): Map<String, Map<String, Int>> {
        val clinicId = currentUser.clinicId()
        val today = LocalDate.now()
        val startOfWeek = today.with(java.time.DayOfWeek.MONDAY)
        val endOfWeek   = today.with(java.time.DayOfWeek.SUNDAY)

        val appointments = appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(
            clinicId, startOfWeek.atStartOfDay(), endOfWeek.atTime(23, 59, 59)
        )
        val dayNames = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")

        return appointments
            .filter { it.doctor != null && it.scheduledTime != null }
            .groupBy { it.doctor!!.name ?: it.doctor!!.email }
            .mapValues { (_, apts) ->
                apts.groupBy { dayNames[it.scheduledTime!!.dayOfWeek.value - 1] }
                    .mapValues { (_, dayApts) -> dayApts.size }
            }
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

        // Same service classifier the Overview composition uses so
        // "Consultation" rollups match between the two views.
        fun isConsultService(svc: String?): Boolean {
            val s = svc?.trim()?.lowercase() ?: return true
            return s.isEmpty() || s == "consultation" || s == "consult" || s == "c"
        }

        val waived = appointments.filter { it.payStatus?.uppercase() == "WAIVED" }
        val waivedAmount = waived.mapNotNull { it.fee }.fold(BigDecimal.ZERO, BigDecimal::add).toLong()

        // Revenue by raw service label — but skip the generic Consultation
        // bucket here because it already has its own row under "By Type".
        // Doubling it up would clutter the chart and let the receptionist
        // double-count when reading the numbers.
        val revenueByService = paid
            .filter { !isConsultService(it.service) }
            .groupBy { it.service?.trim()?.ifBlank { null } ?: "Other" }
            .mapValues { (_, apts) -> apts.mapNotNull { it.fee }.fold(BigDecimal.ZERO, BigDecimal::add).toLong() }

        val revenueByType: Map<String, Long> = paid
            .groupBy {
                when {
                    it.type?.lowercase() == "review" -> "Review"
                    isConsultService(it.service) -> "Consultation"
                    else -> "Procedure"
                }
            }
            .mapValues { (_, apts) -> apts.mapNotNull { it.fee }.fold(BigDecimal.ZERO, BigDecimal::add).toLong() }

        val dueCount = appointments.count {
            val ps = it.payStatus?.uppercase()
            ps != "PAID" && ps != "WAIVED" && (it.fee ?: BigDecimal.ZERO) > BigDecimal.ZERO
        }

        val pharmacyRevenue = paid
            .mapNotNull { it.pharmacyAmount }
            .fold(BigDecimal.ZERO, BigDecimal::add)
            .toLong()

        // Revenue (consultation fee + pharmacy bill) bucketed by the
        // appointment's scheduled hour. Empty hours stay out of the map
        // so the chart only shows hours with actual revenue.
        val revenueByHour: Map<Int, Long> = paid
            .filter { it.scheduledTime != null }
            .groupBy { it.scheduledTime!!.hour }
            .mapValues { (_, apts) ->
                apts.sumOf { (it.fee ?: BigDecimal.ZERO) + (it.pharmacyAmount ?: BigDecimal.ZERO) }.toLong()
            }

        return FinanceStatsDTO(
            revenue = revenue,
            outstandingDues = outstanding,
            avgPerVisit = avgPerVisit,
            revenueTrend = revenueTrend,
            paymentMix = paymentMix,
            waivedAmount = waivedAmount,
            revenueByService = revenueByService,
            revenueByType = revenueByType,
            billsCount = BillsCountDTO(paid = paid.size, waived = waived.size, due = dueCount),
            pharmacyRevenue = pharmacyRevenue,
            revenueByHour = revenueByHour,
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
