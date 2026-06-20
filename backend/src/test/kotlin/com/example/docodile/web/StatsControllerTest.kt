package com.example.docodile.web

import com.example.docodile.domain.AppUser
import com.example.docodile.domain.Appointment
import com.example.docodile.domain.Patient
import com.example.docodile.domain.Role
import com.example.docodile.domain.Visit
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.RxRowRepository
import com.example.docodile.repo.VisitRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.service.AuditService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.UUID

@WebMvcTest(StatsController::class)
@Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class StatsControllerTest @Autowired constructor(
    private val mockMvc: MockMvc,
) {

    @MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService

    @MockitoBean
    private lateinit var revokedTokenRepository: com.example.docodile.repo.RevokedTokenRepository

    @MockitoBean
    private lateinit var appointmentRepository: AppointmentRepository

    @MockitoBean
    private lateinit var patientRepository: PatientRepository

    @MockitoBean
    private lateinit var visitRepository: VisitRepository

    @MockitoBean
    private lateinit var rxRowRepository: RxRowRepository

    @MockitoBean
    private lateinit var currentUser: CurrentUser

    @MockitoBean
    private lateinit var auditService: AuditService

    private val clinicId: UUID = UUID.randomUUID()

    // ── fixtures ──────────────────────────────────────────────────────────

    private fun doctor(name: String): AppUser = AppUser(
        id = UUID.randomUUID(),
        name = name,
        email = "$name@clinic.test",
        role = Role.DOCTOR,
    )

    private fun appointment(
        doc: AppUser? = null,
        scheduledTime: LocalDateTime? = LocalDateTime.now().withHour(10),
        status: String? = "COMPLETED",
        payStatus: String? = "PAID",
        fee: BigDecimal? = BigDecimal("500"),
        pharmacyAmount: BigDecimal? = null,
        discountAmount: BigDecimal? = null,
        paymentMethod: String? = "CASH",
        type: String? = "new",
        service: String? = "Consultation",
        isWalkin: Boolean = false,
    ): Appointment = Appointment(
        id = UUID.randomUUID(),
        doctor = doc,
        scheduledTime = scheduledTime,
        status = status,
        payStatus = payStatus,
        fee = fee,
        pharmacyAmount = pharmacyAmount,
        discountAmount = discountAmount,
        paymentMethod = paymentMethod,
        type = type,
        service = service,
        isWalkin = isWalkin,
    )

    private fun patient(
        name: String = "P",
        age: Int? = null,
        gender: String? = null,
    ): Patient = Patient(
        id = UUID.randomUUID(),
        name = name,
        age = age,
        gender = gender,
    )

    private fun visit(
        complaints: String? = null,
        diagnosis: String? = null,
        reviewDate: LocalDate? = null,
        visitDate: LocalDate = LocalDate.now(),
        pat: Patient? = null,
        doc: AppUser? = null,
    ): Visit = Visit(
        id = UUID.randomUUID(),
        visitDate = visitDate,
        complaints = complaints,
        diagnosis = diagnosis,
        reviewDate = reviewDate,
        patient = pat,
        createdByDoctor = doc,
    )

    private fun stubClinic() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
    }

    // ── /doctors ──────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `doctors returns per-doctor stats with paid revenue summed`() {
        stubClinic()
        val drA = doctor("DrA")
        val drB = doctor("DrB")
        whenever(
            appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(eq(clinicId), any(), any())
        ).thenReturn(
            listOf(
                appointment(doc = drA, payStatus = "PAID", fee = BigDecimal("500")),
                appointment(doc = drA, payStatus = "PAID", fee = BigDecimal("300")),
                appointment(doc = drB, payStatus = "PAID", fee = BigDecimal("1000")),
            )
        )

        mockMvc.perform(get("/api/stats/doctors"))
            .andExpect(status().isOk)
            // sorted by revenue desc → DrB (1000) first
            .andExpect(jsonPath("$[0].name").value("DrB"))
            .andExpect(jsonPath("$[0].revenue").value(1000))
            .andExpect(jsonPath("$[1].name").value("DrA"))
            .andExpect(jsonPath("$[1].revenue").value(800))
            .andExpect(jsonPath("$[1].appointmentCount").value(2))
    }

    // ── /overview ─────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `overview computes totals, revenue and composition`() {
        stubClinic()
        val now = LocalDate.now().atTime(LocalTime.of(10, 0))
        val appts = listOf(
            appointment(scheduledTime = now, status = "COMPLETED", payStatus = "PAID", fee = BigDecimal("500"), type = "new", service = "Consultation"),
            appointment(scheduledTime = now, status = "COMPLETED", payStatus = "PAID", fee = BigDecimal("700"), type = "review"),
            appointment(scheduledTime = now, status = "BOOKED", payStatus = "UNPAID", fee = BigDecimal("400"), isWalkin = true),
        )
        whenever(
            appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(eq(clinicId), any(), any())
        ).thenReturn(appts)
        whenever(patientRepository.findAllByClinicId(clinicId)).thenReturn(emptyList())
        whenever(
            visitRepository.findAllByClinicIdAndVisitDateBetween(eq(clinicId), any(), any())
        ).thenReturn(emptyList())

        mockMvc.perform(get("/api/stats/overview"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.totalAppointments").value(3))
            // completed = PAID or status COMPLETED → first two
            .andExpect(jsonPath("$.completedAppointments").value(2))
            // revenue = 500 + 700 = 1200
            .andExpect(jsonPath("$.revenue").value(1200))
            .andExpect(jsonPath("$.composition.consultation").value(1))
            .andExpect(jsonPath("$.composition.review").value(1))
            .andExpect(jsonPath("$.composition.walkin").value(1))
    }

    // ── /patients ─────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `patients returns age groups and gender split`() {
        stubClinic()
        whenever(patientRepository.findAllByClinicId(clinicId)).thenReturn(
            listOf(
                // age is persisted in MONTHS (years × 12): 8y, 35y, 70y.
                patient(name = "kid", age = 8 * 12, gender = "male"),
                patient(name = "adult", age = 35 * 12, gender = "female"),
                patient(name = "senior", age = 70 * 12, gender = "M"),
            )
        )

        mockMvc.perform(get("/api/stats/patients"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.activePatients").value(3))
            .andExpect(jsonPath("$.ageGroups['0–12']").value(1))
            .andExpect(jsonPath("$.ageGroups['26–40']").value(1))
            .andExpect(jsonPath("$.ageGroups['61+']").value(1))
            .andExpect(jsonPath("$.genderSplit.male").value(2))
            .andExpect(jsonPath("$.genderSplit.female").value(1))
    }

    // ── /health ───────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `health returns overall score with four subscores`() {
        stubClinic()
        whenever(
            appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(eq(clinicId), any(), any())
        ).thenReturn(
            listOf(
                appointment(status = "COMPLETED", payStatus = "PAID", fee = BigDecimal("500")),
                appointment(status = "COMPLETED", payStatus = "PAID", fee = BigDecimal("500")),
            )
        )
        whenever(
            visitRepository.findAllByClinicIdAndVisitDateBetween(eq(clinicId), any(), any())
        ).thenReturn(
            listOf(visit(diagnosis = "Flu", reviewDate = LocalDate.now().plusDays(7)))
        )

        mockMvc.perform(get("/api/stats/health"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.overallScore").isNumber)
            .andExpect(jsonPath("$.subscores.length()").value(4))
            .andExpect(jsonPath("$.subscores[0].label").value("Patient experience"))
            .andExpect(jsonPath("$.insights").isArray)
    }

    // ── /overdue ──────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `overdue returns one row per patient with days since review`() {
        stubClinic()
        val pat = patient(name = "Late Larry")
        val reviewDate = LocalDate.now().minusDays(5)
        whenever(visitRepository.findOverdueReviews(eq(clinicId), any())).thenReturn(
            listOf(visit(reviewDate = reviewDate, pat = pat, doc = doctor("DrA")))
        )

        mockMvc.perform(get("/api/stats/overdue"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].patientName").value("Late Larry"))
            .andExpect(jsonPath("$[0].daysSince").value(5))
    }

    // ── /complaints/trend ─────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `complaints trend returns named series with seven weekly points`() {
        stubClinic()
        whenever(
            visitRepository.findAllByClinicIdAndVisitDateBetween(eq(clinicId), any(), any())
        ).thenReturn(
            listOf(
                visit(complaints = "Fever", visitDate = LocalDate.now()),
                visit(complaints = "Fever", visitDate = LocalDate.now()),
                visit(complaints = "Cough", visitDate = LocalDate.now()),
            )
        )

        mockMvc.perform(get("/api/stats/complaints/trend"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Fever"))
            // 7 weekly buckets
            .andExpect(jsonPath("$[0].points.length()").value(7))
    }

    // ── /schedule ─────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `schedule groups appointment counts by doctor and weekday`() {
        stubClinic()
        val dr = doctor("DrA")
        // pick a fixed weekday inside the current week (Monday)
        val monday = LocalDate.now().with(java.time.DayOfWeek.MONDAY).atTime(9, 0)
        whenever(
            appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(eq(clinicId), any(), any())
        ).thenReturn(
            listOf(
                appointment(doc = dr, scheduledTime = monday),
                appointment(doc = dr, scheduledTime = monday),
            )
        )

        mockMvc.perform(get("/api/stats/schedule"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.DrA.Mon").value(2))
    }

    // ── /clinical ─────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `clinical returns top complaints, diagnoses and review rate`() {
        stubClinic()
        val v1 = visit(complaints = "Fever", diagnosis = "Viral", reviewDate = LocalDate.now().plusDays(3))
        val v2 = visit(complaints = "Fever", diagnosis = "Viral")
        whenever(
            visitRepository.findAllByClinicIdAndVisitDateBetween(eq(clinicId), any(), any())
        ).thenReturn(listOf(v1, v2))
        whenever(rxRowRepository.findMedicinesByVisitIds(any())).thenReturn(listOf("Paracetamol", "Paracetamol"))

        mockMvc.perform(get("/api/stats/clinical"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.topComplaints[0].name").value("Fever"))
            .andExpect(jsonPath("$.topComplaints[0].count").value(2))
            .andExpect(jsonPath("$.topDiagnoses[0].name").value("Viral"))
            .andExpect(jsonPath("$.topMedicines[0].name").value("Paracetamol"))
            // 1 of 2 visits has a review date → 50%
            .andExpect(jsonPath("$.reviewScheduledRate").value(50))
    }

    // ── /finance ──────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `finance computes collected revenue, dues and bill counts`() {
        stubClinic()
        val now = LocalDate.now().atTime(11, 0)
        whenever(
            appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(eq(clinicId), any(), any())
        ).thenReturn(
            listOf(
                // paid: fee 500 + pharmacy 100 - discount 50 = 550
                appointment(scheduledTime = now, payStatus = "PAID", fee = BigDecimal("500"),
                    pharmacyAmount = BigDecimal("100"), discountAmount = BigDecimal("50"), paymentMethod = "CASH"),
                // outstanding due
                appointment(scheduledTime = now, payStatus = "UNPAID", fee = BigDecimal("400")),
                // waived
                appointment(scheduledTime = now, payStatus = "WAIVED", fee = BigDecimal("300")),
            )
        )

        mockMvc.perform(get("/api/stats/finance"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.revenue").value(550))
            .andExpect(jsonPath("$.outstandingDues").value(400))
            .andExpect(jsonPath("$.waivedAmount").value(300))
            .andExpect(jsonPath("$.pharmacyRevenue").value(100))
            .andExpect(jsonPath("$.billsCount.paid").value(1))
            .andExpect(jsonPath("$.billsCount.waived").value(1))
            .andExpect(jsonPath("$.billsCount.due").value(1))
    }

    // ── /operations ───────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = ["ADMIN"])
    fun `operations computes cancellation and no-show rates`() {
        stubClinic()
        whenever(
            appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(eq(clinicId), any(), any())
        ).thenReturn(
            listOf(
                appointment(status = "COMPLETED"),
                appointment(status = "CANCELLED"),
                appointment(status = "NO_SHOW"),
                appointment(status = "COMPLETED"),
            )
        )

        mockMvc.perform(get("/api/stats/operations"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.totalAppointments").value(4))
            .andExpect(jsonPath("$.cancelled").value(1))
            .andExpect(jsonPath("$.noShow").value(1))
            .andExpect(jsonPath("$.cancellationRate").value(25.0))
            .andExpect(jsonPath("$.noShowRate").value(25.0))
    }
}
