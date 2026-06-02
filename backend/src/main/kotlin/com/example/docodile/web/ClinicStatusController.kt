package com.example.docodile.web

import com.example.docodile.domain.ClinicEntity
import com.example.docodile.service.AppointmentService
import com.example.docodile.service.ClinicStatusService
import com.example.docodile.service.DuplicateAppointmentException
import org.springframework.format.annotation.DateTimeFormat
import java.time.LocalDate
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import com.example.docodile.web.StaffRequest
import com.example.docodile.domain.AppUser
import java.util.UUID
import com.example.docodile.web.ClinicDetailsRequest

@RestController
@RequestMapping("/api/tenant")
class ClinicStatusController(
    private val clinicStatusService: ClinicStatusService,
    private val appointmentService: AppointmentService
) {
    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST')")
    fun status(): Map<String, Boolean> {
        return mapOf("complete" to clinicStatusService.isClinicComplete())
    }

    @PostMapping("/clinic")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    fun saveClinic(@RequestBody request: ClinicDetailsRequest): ResponseEntity<ClinicEntity> {
        val saved = clinicStatusService.saveClinicDetails(request)
        return ResponseEntity.ok(saved)
    }

    @GetMapping("/clinics")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    fun listClinics(): List<ClinicEntity> {
        return clinicStatusService.getClinicsForTenant()
    }

    @GetMapping("/clinics/{clinicId}/staff")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    fun listStaff(@PathVariable clinicId: UUID): List<AppUser> {
        return clinicStatusService.getStaffForClinic(clinicId)
    }

    @PostMapping("/clinics/{clinicId}/staff")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    fun saveStaff(
        @PathVariable clinicId: UUID,
        @RequestBody request: StaffRequest
    ): AppUser {
        return clinicStatusService.saveStaff(clinicId, request)
    }

    @DeleteMapping("/clinics/{clinicId}/staff/{staffId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    fun deleteStaff(
        @PathVariable clinicId: UUID,
        @PathVariable staffId: UUID
    ): ResponseEntity<Void> {
        clinicStatusService.deleteStaff(clinicId, staffId)
        return ResponseEntity.noContent().build()
    }

    @PatchMapping("/clinics/{clinicId}/staff/{staffId}/reactivate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    fun reactivateStaff(
        @PathVariable clinicId: UUID,
        @PathVariable staffId: UUID
    ): ResponseEntity<Void> {
        clinicStatusService.reactivateStaff(clinicId, staffId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun getAppointments(
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        date: LocalDate?
    ): List<AppointmentDTO> {
        return appointmentService.getAppointmentsForClinic(date ?: LocalDate.now())
    }

    @PostMapping("/appointments")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun bookAppointment(@RequestBody request: BookAppointmentRequest): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(appointmentService.bookAppointment(request))
        } catch (e: DuplicateAppointmentException) {
            // 409 + duplicate flag lets the booking UI distinguish "already
            // booked today" (where it can prompt to add anyway) from any
            // other booking failure.
            ResponseEntity.status(HttpStatus.CONFLICT).body(
                mapOf("error" to (e.message ?: "Duplicate appointment"), "duplicate" to true)
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
        }
    }

    @PutMapping("/appointments/{appointmentId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun updateAppointment(
        @PathVariable appointmentId: UUID,
        @RequestBody request: BookAppointmentRequest
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(appointmentService.updateAppointment(appointmentId, request))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
        }
    }

    @PatchMapping("/appointments/{appointmentId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun updateAppointmentStatus(
        @PathVariable appointmentId: UUID,
        @RequestBody body: Map<String, String>
    ): ResponseEntity<Any> {
        return try {
            val status = body["status"] ?: throw IllegalArgumentException("Status is required")
            ResponseEntity.ok(appointmentService.updateStatus(appointmentId, status))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
        }
    }

    // Payment + pay-status update — called by the Bill Medicines flow
    // after Charge & Bill / Mark Waived. `payStatus` is the new label
    // (PAID / WAIVED / DUE) and `paymentMethod` is the channel
    // (Cash/Card/UPI/Waive). Storing both keeps the queue's Pay pill
    // accurate without a separate billing table.
    @PatchMapping("/appointments/{appointmentId}/payment")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun updateAppointmentPayment(
        @PathVariable appointmentId: UUID,
        @RequestBody body: Map<String, Any?>
    ): ResponseEntity<Any> {
        return try {
            val payStatus = body["payStatus"]?.toString() ?: throw IllegalArgumentException("payStatus is required")
            val paymentMethod = body["paymentMethod"]?.toString()
            // pharmacyAmount / discountAmount arrive as JSON numbers —
            // Kotlin's Map<String, Any?> surfaces them as Number; convert
            // defensively for either Number or String.
            fun parseMoney(key: String): java.math.BigDecimal? = when (val v = body[key]) {
                null -> null
                is Number -> java.math.BigDecimal(v.toString())
                is String -> if (v.isBlank()) null else java.math.BigDecimal(v)
                else -> null
            }
            val pharmacyAmount = parseMoney("pharmacyAmount")
            val discountAmount = parseMoney("discountAmount")
            ResponseEntity.ok(appointmentService.updatePayment(appointmentId, payStatus, paymentMethod, pharmacyAmount, discountAmount))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
        }
    }

    @GetMapping("/domain/check")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    fun checkDomain(@RequestParam domain: String): Map<String, Boolean> {
        return mapOf("available" to clinicStatusService.isDomainAvailable(domain))
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }
}
