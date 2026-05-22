package com.example.docodile.web

import com.example.docodile.service.HealthPlixMigrationService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.ExceptionHandler
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

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
}
