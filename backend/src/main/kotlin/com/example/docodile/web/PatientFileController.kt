package com.example.docodile.web

import com.example.docodile.domain.PatientFile
import com.example.docodile.repo.PatientFileRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.service.EncryptionService
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate
import java.util.UUID

data class PatientFileDTO(
    val id: UUID,
    val name: String,
    val category: String?,
    val investigationDate: String?,
    val mimeType: String?,
    val notes: String?,
    val fileSize: Long?,
    val createdAt: String
)

@RestController
@RequestMapping("/api/patients/{patientId}/files")
class PatientFileController(
    private val repo: PatientFileRepository,
    private val currentUser: CurrentUser,
    private val encryptionService: EncryptionService
) {
    private val allRoles = "hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','LAB','OTHER')"

    // Derive a stable UUID from the schema name to use as AAD in
    // EncryptionService (which still requires a UUID for backward compat).
    // Schema is clinic-scoped, so this is functionally equivalent to the
    // old clinicId-based AAD for files written after the schema migration.
    private fun schemaUuid(): UUID =
        UUID.nameUUIDFromBytes(currentUser.schema().toByteArray(Charsets.UTF_8))

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','LAB','OTHER')")
    fun list(@PathVariable patientId: UUID): List<PatientFileDTO> {
        return repo.findAllByPatientIdOrderByCreatedAtDesc(patientId)
            .map { it.toDTO() }
    }

    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','LAB','OTHER')")
    fun upload(
        @PathVariable patientId: UUID,
        @RequestParam("file") file: MultipartFile,
        @RequestParam("category", required = false) category: String?,
        @RequestParam("investigationDate", required = false) investigationDate: String?,
        @RequestParam("notes", required = false) notes: String?
    ): ResponseEntity<PatientFileDTO> {
        val schemaId = schemaUuid()
        // Build the entity first so pf.id (generated on construction) is stable
        // before encrypting — the same ID is used as AAD, so encrypt and decrypt
        // must see the same fileId.
        val pf = PatientFile(
            patientId = patientId,
            uploadedBy = currentUser.userId(),
            name = file.originalFilename ?: file.name,
            category = category?.takeIf { it.isNotBlank() },
            investigationDate = investigationDate?.takeIf { it.isNotBlank() }?.let { LocalDate.parse(it) },
            mimeType = file.contentType,
            notes = notes?.takeIf { it.isNotBlank() },
            fileData = ByteArray(0), // placeholder; overwritten below
            fileSize = file.size
        )
        pf.fileData = encryptionService.encrypt(file.bytes, pf.id, schemaId)
        repo.save(pf)
        return ResponseEntity.status(HttpStatus.CREATED).body(pf.toDTO())
    }

    @GetMapping("/{fileId}/download")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','LAB','OTHER')")
    fun download(@PathVariable patientId: UUID, @PathVariable fileId: UUID): ResponseEntity<ByteArray> {
        val pf = repo.findById(fileId).orElse(null)
            ?: return ResponseEntity.notFound().build()
        val headers = HttpHeaders()
        headers.contentType = MediaType.parseMediaType(pf.mimeType ?: MediaType.APPLICATION_OCTET_STREAM_VALUE)
        headers.setContentDispositionFormData("inline", pf.name)
        return ResponseEntity.ok().headers(headers).body(encryptionService.decrypt(pf.fileData, pf.id, schemaUuid()))
    }

    @DeleteMapping("/{fileId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','LAB','OTHER')")
    fun delete(@PathVariable patientId: UUID, @PathVariable fileId: UUID): ResponseEntity<Void> {
        return if (repo.existsById(fileId)) {
            repo.deleteById(fileId)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    private fun PatientFile.toDTO() = PatientFileDTO(
        id = id,
        name = name,
        category = category,
        investigationDate = investigationDate?.toString(),
        mimeType = mimeType,
        notes = notes,
        fileSize = fileSize,
        createdAt = createdAt.toString()
    )
}
