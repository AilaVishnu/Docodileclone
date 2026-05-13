package com.example.docodile.web

import com.example.docodile.repo.PatientRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.service.PatientService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.util.UUID

data class UpdatePatientRequest(
    val name: String?,
    val phone: String?,
    val email: String?,
    val gender: String?,
    val dob: String?,   // ISO yyyy-MM-dd or null
    val age: Int?       // months, or null
)

@RestController
@RequestMapping("/api/patients")
class PatientController(
    private val patientService: PatientService,
    private val patientRepository: PatientRepository,
    private val currentUser: CurrentUser
) {

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun list(): List<PatientWithLastVisitDTO> = patientService.listPatientsWithLastVisit()

    @PatchMapping("/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    @Transactional
    fun update(
        @PathVariable patientId: UUID,
        @RequestBody req: UpdatePatientRequest
    ): ResponseEntity<Void> {
        val clinicId = currentUser.clinicId()
        val patient = patientRepository.findByIdAndClinicId(patientId, clinicId)
            ?: return ResponseEntity.notFound().build()

        if (!req.name.isNullOrBlank()) patient.name = req.name.trim()
        patient.phone  = req.phone?.takeIf { it.isNotBlank() }
        patient.email  = req.email?.takeIf { it.isNotBlank() }
        patient.gender = req.gender?.takeIf { it.isNotBlank() }
        patient.dob    = req.dob?.takeIf { it.isNotBlank() }?.let { LocalDate.parse(it) }
        patient.age    = req.age

        patientRepository.save(patient)
        return ResponseEntity.noContent().build()
    }
}
