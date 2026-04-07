package com.example.docodile.web

import com.example.docodile.service.AppointmentService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
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

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST')")
    fun bookAppointment(@RequestBody request: BookAppointmentRequest): ResponseEntity<Any> {
        return try {
            val appointment = appointmentService.bookAppointment(request)
            ResponseEntity.ok(appointment)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
        }
    }
}
