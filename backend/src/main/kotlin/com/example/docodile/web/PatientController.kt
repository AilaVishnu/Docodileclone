package com.example.docodile.web

import com.example.docodile.domain.AuditAction
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.service.AuditService
import com.example.docodile.service.BillService
import com.example.docodile.service.PatientDepositService
import com.example.docodile.service.PatientService
import com.example.docodile.service.VisitService
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

data class UpdatePatientRequest(
    val name: String?,
    val phone: String?,
    val email: String?,
    val gender: String?,
    val dob: String?,   // ISO yyyy-MM-dd or null
    val age: Int?       // months, or null
)

// Footer shown at the bottom of the Bill modal: when the patient was first
// registered, and their most recent payment (date + method).
data class BillFooterDTO(
    val registeredAt: Instant?,
    val lastPaymentAt: LocalDateTime?,
    val lastPaymentMethod: String?,
)

@RestController
@RequestMapping("/api/patients")
class PatientController(
    private val patientService: PatientService,
    private val patientRepository: PatientRepository,
    private val appointmentRepository: AppointmentRepository,
    private val visitService: VisitService,
    private val auditService: AuditService,
    private val patientDepositService: PatientDepositService,
    private val billService: BillService,
) {

    // Bill-modal footer: patient registration date + the most recent PAID/WAIVED
    // appointment's time and method ("Last Payment: N days ago (method)").
    @GetMapping("/{patientId}/bill-footer")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun billFooter(@PathVariable patientId: UUID): ResponseEntity<Any> {
        val patient = patientRepository.findById(patientId).orElse(null)
            ?: return ResponseEntity.notFound().build()
        val lastPaid = appointmentRepository
            .findPaidByPatient(patientId, PageRequest.of(0, 1))
            .firstOrNull()
        return ResponseEntity.ok(
            BillFooterDTO(
                registeredAt = patient.createdAt,
                lastPaymentAt = lastPaid?.scheduledTime,
                lastPaymentMethod = lastPaid?.paymentMethod,
            )
        )
    }

    // Patient advance/deposit: current net + full movement history.
    @GetMapping("/{patientId}/deposit")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun getDeposit(@PathVariable patientId: UUID): ResponseEntity<Any> =
        ResponseEntity.ok(patientDepositService.getDeposit(patientId))

    // Record a deposit (type=DEPOSIT) or refund (type=REFUND) from the Deposit
    // drawer. `amount` is the non-negative magnitude; `mode`/`details` are kept
    // in the ledger. Returns the updated net + history.
    @PostMapping("/{patientId}/deposit")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun recordDeposit(
        @PathVariable patientId: UUID,
        @RequestBody body: Map<String, Any?>,
    ): ResponseEntity<Any> {
        return try {
            val amount = when (val v = body["amount"]) {
                is Number -> java.math.BigDecimal(v.toString())
                is String -> if (v.isBlank()) throw IllegalArgumentException("amount is required") else java.math.BigDecimal(v)
                else -> throw IllegalArgumentException("amount is required")
            }
            val type = body["type"]?.toString() ?: "DEPOSIT"
            val mode = body["mode"]?.toString()
            val details = body["details"]?.toString()
            ResponseEntity.ok(patientDepositService.recordMovement(patientId, type, amount, mode, details))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
        } catch (e: NumberFormatException) {
            ResponseEntity.badRequest().body(mapOf("error" to "amount must be a number"))
        }
    }

    // Recent Bills history for a patient (newest invoice first).
    @GetMapping("/{patientId}/bills")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun listBills(@PathVariable patientId: UUID): ResponseEntity<Any> =
        ResponseEntity.ok(billService.listBills(patientId))

    // Snapshot one bill/invoice on Charge & Bill. Additive history — does not
    // touch appointment payment/finance/deposit (those go via /payment).
    @PostMapping("/{patientId}/bills")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun createBill(
        @PathVariable patientId: UUID,
        @RequestBody request: com.example.docodile.web.CreateBillRequest,
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(billService.createBill(patientId, request))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun list(): List<PatientWithLastVisitDTO> = patientService.listPatientsWithLastVisit()

    // Patient Files "notes / prescriptions" keyword search — matches visit
    // free-text + prescriptions, returns "Rx"/"Visit" snippets to highlight.
    @GetMapping("/content-search")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun contentSearch(@RequestParam q: String): List<PatientContentMatch> =
        visitService.contentSearch(q)

    // Archived patients — preserved in DB but hidden from the main list.
    // No last-visit join here; archived list is a simple roster for a
    // future "restore" UI.
    @GetMapping("/archived")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun listArchived(): List<Map<String, Any?>> = patientService.listArchived().map { p ->
        mapOf(
            "id" to p.id,
            "name" to p.name,
            "phone" to p.phone,
            "gender" to p.gender,
            "archivedAt" to p.deletedAt
        )
    }

    @PostMapping("/{patientId}/archive")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    @Transactional
    fun archive(@PathVariable patientId: UUID): ResponseEntity<Void> {
        val patient = patientRepository.findById(patientId).orElse(null)
            ?: return ResponseEntity.notFound().build()
        if (patient.deletedAt == null) {
            patient.deletedAt = Instant.now()
            patientRepository.save(patient)
            auditService.log(AuditAction.PATIENT_ARCHIVED, entityType = "Patient", entityId = patientId)
        }
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{patientId}/unarchive")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    @Transactional
    fun unarchive(@PathVariable patientId: UUID): ResponseEntity<Void> {
        val patient = patientRepository.findById(patientId).orElse(null)
            ?: return ResponseEntity.notFound().build()
        if (patient.deletedAt != null) {
            patient.deletedAt = null
            patientRepository.save(patient)
            auditService.log(AuditAction.PATIENT_UNARCHIVED, entityType = "Patient", entityId = patientId)
        }
        return ResponseEntity.noContent().build()
    }

    @PatchMapping("/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    @Transactional
    fun update(
        @PathVariable patientId: UUID,
        @RequestBody req: UpdatePatientRequest
    ): ResponseEntity<Void> {
        val patient = patientRepository.findById(patientId).orElse(null)
            ?.takeIf { it.deletedAt == null }
            ?: return ResponseEntity.notFound().build()

        // Validate inputs to match the rigour ClinicStatusService.saveStaff
        // applies — bad data here ends up on patient cards and printouts.
        if (!req.name.isNullOrBlank() && req.name.trim().length < 2) {
            throw IllegalArgumentException("Name must be at least 2 characters")
        }
        if (!req.phone.isNullOrBlank()) {
            val digits = req.phone.filter { it.isDigit() }
            if (digits.length < 10) throw IllegalArgumentException("Phone number must have at least 10 digits")
        }
        if (!req.email.isNullOrBlank()) {
            val emailRegex = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
            if (!emailRegex.matches(req.email.trim())) {
                throw IllegalArgumentException("Invalid email format")
            }
        }
        val parsedDob: LocalDate? = req.dob?.takeIf { it.isNotBlank() }?.let {
            try { LocalDate.parse(it) } catch (e: Exception) {
                throw IllegalArgumentException("Date of birth must be in yyyy-MM-dd format")
            }
        }
        if (parsedDob != null && parsedDob.isAfter(LocalDate.now())) {
            throw IllegalArgumentException("Date of birth cannot be in the future")
        }
        if (req.age != null && (req.age < 0 || req.age > 200 * 12)) {
            throw IllegalArgumentException("Age (in months) is out of range")
        }
        if (!req.gender.isNullOrBlank() && req.gender.lowercase() !in setOf("male", "female", "other")) {
            throw IllegalArgumentException("Gender must be male, female, or other")
        }

        if (!req.name.isNullOrBlank()) patient.name = req.name.trim()
        patient.phone  = req.phone?.takeIf { it.isNotBlank() }
        patient.email  = req.email?.takeIf { it.isNotBlank() }?.lowercase()
        patient.gender = req.gender?.takeIf { it.isNotBlank() }?.lowercase()
        patient.dob    = parsedDob
        patient.age    = req.age

        patientRepository.save(patient)
        auditService.log(AuditAction.PATIENT_UPDATED, entityType = "Patient", entityId = patientId)
        return ResponseEntity.noContent().build()
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }
}
