package com.example.docodile.web

import com.example.docodile.domain.PrintTemplate
import com.example.docodile.repo.PrintTemplateRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

data class PrintTemplateDTO(
    val id: UUID,
    val name: String,
    val isDefault: Boolean,
    // Raw JSON string — caller decodes and re-encodes. Matches how the
    // entity stores it; saves us from defining the whole template shape
    // server-side just to pass it through.
    val config: String
)

data class PrintTemplateRequest(
    val name: String,
    val isDefault: Boolean = false,
    val config: String
)

@RestController
@RequestMapping("/api/tenant/print-templates")
class PrintTemplateController(
    private val repo: PrintTemplateRepository,
) {
    private fun toDto(t: PrintTemplate) = PrintTemplateDTO(
        id = t.id,
        name = t.name,
        isDefault = t.isDefault,
        config = t.config
    )

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun list(): List<PrintTemplateDTO> =
        repo.findAllByOrderByCreatedAtAsc().map(::toDto)

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    fun create(@RequestBody request: PrintTemplateRequest): ResponseEntity<PrintTemplateDTO> {
        // Enforce the single-default invariant — if the new template is being
        // marked default, flip every other one off first.
        if (request.isDefault) {
            repo.findAllByOrderByCreatedAtAsc().forEach {
                if (it.isDefault) { it.isDefault = false; repo.save(it) }
            }
        }
        val now = Instant.now()
        val saved = repo.save(PrintTemplate(
            name = request.name.trim().ifEmpty { "New template" },
            isDefault = request.isDefault,
            config = request.config,
            createdAt = now,
            updatedAt = now
        ))
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved))
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    fun update(
        @PathVariable id: UUID,
        @RequestBody request: PrintTemplateRequest
    ): ResponseEntity<PrintTemplateDTO> {
        val existing = repo.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        if (request.isDefault && !existing.isDefault) {
            // Flip the previous default off so the partial-unique index is satisfied.
            repo.findAllByOrderByCreatedAtAsc().forEach {
                if (it.isDefault && it.id != id) { it.isDefault = false; repo.save(it) }
            }
        }
        existing.apply {
            name = request.name.trim().ifEmpty { name }
            isDefault = request.isDefault
            config = request.config
            updatedAt = Instant.now()
        }
        return ResponseEntity.ok(toDto(repo.save(existing)))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    fun delete(@PathVariable id: UUID): ResponseEntity<Void> {
        val existing = repo.findById(id).orElse(null) ?: return ResponseEntity.notFound().build()
        val wasDefault = existing.isDefault
        repo.delete(existing)
        // Promote the next-oldest template to default so the clinic always
        // has a default print template available.
        if (wasDefault) {
            repo.findAllByOrderByCreatedAtAsc().firstOrNull()?.let {
                it.isDefault = true
                repo.save(it)
            }
        }
        return ResponseEntity.noContent().build()
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }
}
