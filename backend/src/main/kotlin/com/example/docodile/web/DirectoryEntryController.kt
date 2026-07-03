package com.example.docodile.web

import com.example.docodile.domain.DirectoryEntry
import com.example.docodile.repo.DirectoryEntryRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

data class DirectoryEntryDTO(
    val id: UUID,
    val category: String,
    val name: String,
    // Opaque JSON string (subtitle/phone/whatsapp/email/address/tags). The
    // client decodes it into its own typed shape.
    val config: String
)

data class DirectoryEntryRequest(
    val category: String,
    val name: String,
    val config: String = "{}"
)

@RestController
@RequestMapping("/api/tenant/directory")
class DirectoryEntryController(
    private val repo: DirectoryEntryRepository,
) {
    private fun toDto(e: DirectoryEntry) = DirectoryEntryDTO(
        id = e.id,
        category = e.category,
        name = e.name,
        config = e.config
    )

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun list(@RequestParam(required = false) category: String?): List<DirectoryEntryDTO> {
        val entries = if (category.isNullOrBlank())
            repo.findAll()
        else
            repo.findAllByCategoryOrderByCreatedAtAsc(category)
        return entries.map(::toDto)
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    fun create(@RequestBody request: DirectoryEntryRequest): ResponseEntity<DirectoryEntryDTO> {
        val name = request.name.trim()
        if (name.isEmpty()) throw IllegalArgumentException("Name is required")
        if (request.category.isBlank()) throw IllegalArgumentException("Category is required")
        val now = Instant.now()
        val saved = repo.save(DirectoryEntry(
            category = request.category.trim(),
            name = name,
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
        @RequestBody request: DirectoryEntryRequest
    ): ResponseEntity<DirectoryEntryDTO> {
        val existing = repo.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        val name = request.name.trim()
        if (name.isEmpty()) throw IllegalArgumentException("Name is required")
        existing.apply {
            category = request.category.trim().ifEmpty { category }
            this.name = name
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
        repo.delete(existing)
        return ResponseEntity.noContent().build()
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }
}
