package com.example.docodile.web

import com.example.docodile.service.AppointmentService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/api/appointments")
class AppointmentController(private val appointmentService: AppointmentService) {

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST')")
    fun getAppointments(
        @RequestParam(required = false) 
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) 
        date: LocalDate?
    ): List<AppointmentDTO> {
        val searchDate = date ?: LocalDate.now()
        return appointmentService.getAppointmentsForClinic(searchDate)
    }
}
