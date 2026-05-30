package com.example.docodile.web

import com.example.docodile.domain.RxTemplate
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.RxTemplateRepository
import com.example.docodile.security.CurrentUser
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.Instant

data class RxTemplateDTO(val name: String, val content: String)
data class RxTemplateRequest(val name: String = "", val content: String = "")

// Clinic-shared prescription templates. `content` is an opaque JSON blob the
// frontend owns; the backend only stores/returns it, keyed by name per clinic.
@RestController
@RequestMapping("/api/tenant/rx-templates")
class RxTemplateController(
    private val repo: RxTemplateRepository,
    private val clinicEntityRepository: ClinicEntityRepository,
    private val currentUser: CurrentUser,
) {
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun list(): List<RxTemplateDTO> =
        repo.findAllByClinicIdOrderByNameAsc(currentUser.clinicId())
            .map { RxTemplateDTO(it.name, it.content) }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    @Transactional
    fun save(@RequestBody req: RxTemplateRequest): ResponseEntity<RxTemplateDTO> {
        val name = req.name.trim()
        if (name.isBlank()) throw IllegalArgumentException("Template name is required")
        if (name.length > 160) throw IllegalArgumentException("Template name too long (max 160)")
        if (req.content.isBlank()) throw IllegalArgumentException("Template is empty")
        val clinicId = currentUser.clinicId()
        // Upsert by (clinic, name): re-saving the same name overwrites.
        val existing = repo.findByClinicIdAndName(clinicId, name)
        val saved = if (existing != null) {
            existing.content = req.content
            repo.save(existing)
        } else {
            val clinic = clinicEntityRepository.findById(clinicId)
                .orElseThrow { IllegalArgumentException("Clinic not found") }
            repo.save(RxTemplate(clinic = clinic, name = name, content = req.content, createdAt = Instant.now()))
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(RxTemplateDTO(saved.name, saved.content))
    }

    @DeleteMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    @Transactional
    fun delete(@RequestParam name: String): ResponseEntity<Void> {
        val existing = repo.findByClinicIdAndName(currentUser.clinicId(), name.trim())
            ?: return ResponseEntity.notFound().build()
        repo.delete(existing)
        return ResponseEntity.noContent().build()
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
}
