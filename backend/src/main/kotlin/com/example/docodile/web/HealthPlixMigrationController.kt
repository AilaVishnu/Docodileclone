package com.example.docodile.web

import com.example.docodile.repo.MigrationRunRepository
import com.example.docodile.service.HealthPlixMigrationService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

/**
 * Self-service HealthPlix → Docodile data migration. The clinic admin
 * uploads the four standard HealthPlix export CSVs from Settings; the
 * importer loads them into this clinic's tenant. Every file is optional —
 * a clinic with no Investigations data simply omits that part.
 */
@RestController
@RequestMapping("/api/tenant/migration")
class HealthPlixMigrationController(
    private val migrationService: HealthPlixMigrationService,
    private val migrationRunRepository: MigrationRunRepository,
) {

    // Self-service migration — any signed-in member of a clinic can run it.
    // Multi-tenancy confines the import to the caller's own clinic, so this
    // is no more powerful than the staff member's normal data access.
    @PostMapping("/healthplix", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','LAB','OTHER')")
    fun migrateHealthPlix(
        @RequestParam("patients", required = false) patients: MultipartFile?,
        @RequestParam("clinical", required = false) clinical: MultipartFile?,
        @RequestParam("investigations", required = false) investigations: MultipartFile?,
        @RequestParam("medications", required = false) medications: MultipartFile?,
    ): HealthPlixMigrationService.Result {
        fun MultipartFile?.text(): String? =
            this?.takeIf { !it.isEmpty }?.bytes?.toString(Charsets.UTF_8)

        return migrationService.migrate(
            patientsCsv = patients.text(),
            clinicalCsv = clinical.text(),
            investigationsCsv = investigations.text(),
            medicationsCsv = medications.text(),
        )
    }

    // Single-ZIP variant — the clinic drops one .zip of the whole export and
    // the importer identifies each CSV inside by its header columns.
    @PostMapping("/healthplix/zip", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','LAB','OTHER')")
    fun migrateHealthPlixZip(
        @RequestParam("file") file: MultipartFile,
    ): HealthPlixMigrationService.Result {
        if (file.isEmpty) throw IllegalArgumentException("No ZIP file uploaded")
        return migrationService.migrateZip(file.bytes)
    }

    // The clinic's most recent migration — drives the "last import" card on
    // the Import data screen. 204 when the clinic has never imported.
    @GetMapping("/last")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','LAB','OTHER')")
    fun lastMigration(): ResponseEntity<MigrationRunDTO> {
        val run = migrationRunRepository
            .findFirstByOrderByCreatedAtDesc()
            ?: return ResponseEntity.noContent().build()
        return ResponseEntity.ok(
            MigrationRunDTO(
                platform = run.platform,
                patients = run.patients,
                visits = run.visits,
                prescriptions = run.prescriptions,
                medicines = run.medicines,
                investigations = run.investigations,
                skipped = run.skipped,
                completedAt = run.createdAt?.toString() ?: "",
            )
        )
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
}

data class MigrationRunDTO(
    val platform: String,
    val patients: Int,
    val visits: Int,
    val prescriptions: Int,
    val medicines: Int,
    val investigations: Int,
    val skipped: Int,
    val completedAt: String,
)
