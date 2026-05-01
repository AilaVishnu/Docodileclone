package com.example.docodile.web

import com.example.docodile.domain.ClinicEntity
import com.example.docodile.service.AppointmentService
import com.example.docodile.service.ClinicStatusService
import org.springframework.format.annotation.DateTimeFormat
import java.time.LocalDate
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

    @GetMapping("/appointments")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    fun getAppointments(
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        date: LocalDate?
    ): List<AppointmentDTO> {
        return appointmentService.getAppointmentsForClinic(date ?: LocalDate.now())
    }

    @PostMapping("/appointments")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    fun bookAppointment(@RequestBody request: BookAppointmentRequest): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(appointmentService.bookAppointment(request))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
        }
    }

    @PutMapping("/appointments/{appointmentId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
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
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
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
