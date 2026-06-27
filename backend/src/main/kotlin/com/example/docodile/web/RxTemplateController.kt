package com.example.docodile.web

import com.example.docodile.domain.RxTemplate
import com.example.docodile.repo.RxTemplateRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.Instant

data class RxTemplateDTO(val name: String, val content: String, val kind: String)
data class RxTemplateRequest(val name: String = "", val content: String = "", val kind: String = "")

// Per-section, clinic-shared templates. `kind` scopes a template to a single
// card (complaints / diagnosis / tests / notes_for_patient / private_notes /
// rx) — saving from one section only surfaces in that section's Load list.
@RestController
@RequestMapping("/api/tenant/rx-templates")
class RxTemplateController(
    private val repo: RxTemplateRepository,
) {
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun list(@RequestParam kind: String): List<RxTemplateDTO> {
        val k = kind.trim()
        if (k.isBlank()) throw IllegalArgumentException("kind is required")
        return repo.findAllByKindOrderByNameAsc(k)
            .map { RxTemplateDTO(it.name, it.content, it.kind) }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    @Transactional
    fun save(@RequestBody req: RxTemplateRequest): ResponseEntity<RxTemplateDTO> {
        val name = req.name.trim()
        val kind = req.kind.trim()
        if (name.isBlank()) throw IllegalArgumentException("Template name is required")
        if (name.length > 160) throw IllegalArgumentException("Template name too long (max 160)")
        if (kind.isBlank()) throw IllegalArgumentException("kind is required")
        if (req.content.isBlank()) throw IllegalArgumentException("Template is empty")
        // Upsert by (kind, name): re-saving the same name in the same
        // section overwrites; the same name in a different section is a new row.
        val existing = repo.findByKindAndName(kind, name)
        val saved = if (existing != null) {
            existing.content = req.content
            repo.save(existing)
        } else {
            repo.save(RxTemplate(kind = kind, name = name, content = req.content, createdAt = Instant.now()))
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(RxTemplateDTO(saved.name, saved.content, saved.kind))
    }

    @DeleteMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    @Transactional
    fun delete(@RequestParam name: String, @RequestParam kind: String): ResponseEntity<Void> {
        val existing = repo.findByKindAndName(kind.trim(), name.trim())
            ?: return ResponseEntity.notFound().build()
        repo.delete(existing)
        return ResponseEntity.noContent().build()
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
}
