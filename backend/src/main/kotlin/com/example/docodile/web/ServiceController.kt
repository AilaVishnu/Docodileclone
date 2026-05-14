package com.example.docodile.web

import com.example.docodile.domain.Service as ServiceEntity
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.ServiceRepository
import com.example.docodile.security.CurrentUser
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/tenant/services")
class ServiceController(
    private val serviceRepository: ServiceRepository,
    private val clinicEntityRepository: ClinicEntityRepository,
    private val currentUser: CurrentUser
) {
    private fun toDto(s: ServiceEntity) = ServiceDTO(
        id = s.id,
        name = s.name,
        code = s.code,
        price = s.price,
        durationMin = s.durationMin,
        discount = s.discount,
        discountMode = s.discountMode,
        gst = s.gst
    )

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun list(): List<ServiceDTO> =
        serviceRepository.findAllByClinicIdOrderByCreatedAtAsc(currentUser.clinicId())
            .map(::toDto)

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    fun create(@RequestBody request: ServiceRequest): ResponseEntity<ServiceDTO> {
        val clinicId = currentUser.clinicId()
        val clinic = clinicEntityRepository.findById(clinicId)
            .orElseThrow { IllegalArgumentException("Clinic not found") }
        val saved = serviceRepository.save(ServiceEntity(
            clinic = clinic,
            name = request.name.trim(),
            code = request.code.trim(),
            price = request.price,
            durationMin = request.durationMin,
            discount = request.discount,
            discountMode = if (request.discountMode == "₹") "₹" else "%",
            gst = request.gst,
            createdAt = Instant.now()
        ))
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved))
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    fun update(
        @PathVariable id: UUID,
        @RequestBody request: ServiceRequest
    ): ResponseEntity<ServiceDTO> {
        val clinicId = currentUser.clinicId()
        val existing = serviceRepository.findByIdAndClinicId(id, clinicId)
            ?: return ResponseEntity.notFound().build()
        existing.apply {
            name = request.name.trim()
            code = request.code.trim()
            price = request.price
            durationMin = request.durationMin
            discount = request.discount
            discountMode = if (request.discountMode == "₹") "₹" else "%"
            gst = request.gst
        }
        return ResponseEntity.ok(toDto(serviceRepository.save(existing)))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    fun delete(@PathVariable id: UUID): ResponseEntity<Void> {
        val clinicId = currentUser.clinicId()
        val existing = serviceRepository.findByIdAndClinicId(id, clinicId)
            ?: return ResponseEntity.notFound().build()
        serviceRepository.delete(existing)
        return ResponseEntity.noContent().build()
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }
}
