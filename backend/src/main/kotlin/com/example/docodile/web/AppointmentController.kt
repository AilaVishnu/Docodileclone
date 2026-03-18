package com.example.docodile.web

import com.example.docodile.service.AppointmentService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = ["http://localhost:3000"])
class AppointmentController(
    private val appointmentService: AppointmentService
) {
    
    // ============ Patient Endpoints ============
    
    /**
     * Search patients by phone number or name
     * GET /api/patients/search?q=9876
     */
    @GetMapping("/patients/search")
    fun searchPatients(
        @RequestParam q: String,
        @RequestHeader("X-Clinic-ID") clinicId: UUID
    ): ResponseEntity<List<PatientSearchResult>> {
        val results = appointmentService.searchPatients(clinicId, q)
        return ResponseEntity.ok(results)
    }
    
    /**
     * Create a new patient
     * POST /api/patients
     */
    @PostMapping("/patients")
    fun createPatient(
        @RequestBody request: CreatePatientRequest,
        @RequestHeader("X-Clinic-ID") clinicId: UUID
    ): ResponseEntity<PatientDto> {
        val patient = appointmentService.createPatient(clinicId, request)
        return ResponseEntity.ok(patient)
    }
    
    /**
     * Get patient by ID
     * GET /api/patients/{id}
     */
    @GetMapping("/patients/{id}")
    fun getPatient(@PathVariable id: UUID): ResponseEntity<PatientDto> {
        val patient = appointmentService.getPatient(id)
        return ResponseEntity.ok(patient)
    }
    
    // ============ Appointment Endpoints ============
    
    /**
     * Get today's appointment queue
     * GET /api/appointments/queue?doctorId=xxx (optional filter)
     */
    @GetMapping("/appointments/queue")
    fun getTodayQueue(
        @RequestParam(required = false) doctorId: UUID?,
        @RequestHeader("X-Clinic-ID") clinicId: UUID
    ): ResponseEntity<TodayQueueResponse> {
        val queue = appointmentService.getTodayQueue(clinicId, doctorId)
        return ResponseEntity.ok(queue)
    }
    
    /**
     * Create a new appointment (walk-in or scheduled)
     * POST /api/appointments
     */
    @PostMapping("/appointments")
    fun createAppointment(
        @RequestBody request: CreateAppointmentRequest,
        @RequestHeader("X-Clinic-ID") clinicId: UUID
    ): ResponseEntity<AppointmentDto> {
        val appointment = appointmentService.createAppointment(clinicId, request)
        return ResponseEntity.ok(appointment)
    }
    
    /**
     * Update appointment status (WAITING -> IN_CONSULTATION -> DONE)
     * PATCH /api/appointments/{id}/status
     */
    @PatchMapping("/appointments/{id}/status")
    fun updateAppointmentStatus(
        @PathVariable id: UUID,
        @RequestBody request: UpdateAppointmentStatusRequest
    ): ResponseEntity<AppointmentDto> {
        val appointment = appointmentService.updateAppointmentStatus(id, request)
        return ResponseEntity.ok(appointment)
    }
}
