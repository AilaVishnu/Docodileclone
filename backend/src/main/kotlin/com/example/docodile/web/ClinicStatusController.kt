package com.example.docodile.web

import com.example.docodile.domain.ClinicEntity
import com.example.docodile.service.ClinicStatusService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import com.example.docodile.web.StaffRequest
import com.example.docodile.domain.AppUser
import java.util.UUID
import com.example.docodile.web.ClinicDetailsRequest

@RestController
@RequestMapping("/api/tenant")
class ClinicStatusController(private val clinicStatusService: ClinicStatusService) {
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
