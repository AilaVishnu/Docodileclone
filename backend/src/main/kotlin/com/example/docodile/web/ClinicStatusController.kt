package com.example.docodile.web

import com.example.docodile.service.ClinicStatusService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/tenant")
class ClinicStatusController(private val clinicStatusService: ClinicStatusService) {
    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST')")
    fun status(): Map<String, Boolean> {
        return mapOf("complete" to clinicStatusService.isClinicComplete())
    }
}
