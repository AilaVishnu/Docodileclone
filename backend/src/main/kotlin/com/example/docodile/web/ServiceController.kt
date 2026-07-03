package com.example.docodile.web

import com.example.docodile.domain.Service as ServiceEntity
import com.example.docodile.repo.ServiceRepository
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
        serviceRepository.findAllByOrderByCreatedAtAsc()
            .map(::toDto)

    private fun validate(request: ServiceRequest, existingId: UUID?) {
        if (request.name.isBlank()) throw IllegalArgumentException("Service name is required")
        if (request.code.isBlank()) throw IllegalArgumentException("Short form is required")
        if (request.code.trim().length > 8) throw IllegalArgumentException("Short form too long (max 8 chars)")
        if (request.price.signum() < 0) throw IllegalArgumentException("Price cannot be negative")
        if (request.durationMin < 0) throw IllegalArgumentException("Duration cannot be negative")
        if (request.discount.signum() < 0) throw IllegalArgumentException("Discount cannot be negative")
        if (request.discountMode == "%" && request.discount.toDouble() > 100.0) {
            throw IllegalArgumentException("Percentage discount cannot exceed 100")
        }
        if (request.gst.signum() < 0 || request.gst.toDouble() > 100.0) {
            throw IllegalArgumentException("GST must be between 0 and 100")
        }
        // Enforce per-clinic uniqueness of (name, code) — two services with
        // the same short form would be ambiguous on the printed bill.
        val all = serviceRepository.findAllByOrderByCreatedAtAsc()
        val nameClash = all.any { it.id != existingId && it.name.equals(request.name.trim(), ignoreCase = true) }
        if (nameClash) throw IllegalArgumentException("A service with this name already exists")
        val codeClash = all.any { it.id != existingId && it.code.equals(request.code.trim(), ignoreCase = true) }
        if (codeClash) throw IllegalArgumentException("Short form '${request.code.trim()}' is already used")
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    fun create(@RequestBody request: ServiceRequest): ResponseEntity<ServiceDTO> {
        validate(request, existingId = null)
        val saved = serviceRepository.save(ServiceEntity(
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
        val existing = serviceRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        validate(request, existingId = id)
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
        val existing = serviceRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        serviceRepository.delete(existing)
        return ResponseEntity.noContent().build()
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }
}
