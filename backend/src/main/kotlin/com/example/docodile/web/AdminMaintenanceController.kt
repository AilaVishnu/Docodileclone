package com.example.docodile.web

import com.example.docodile.domain.AuditAction
import com.example.docodile.service.AuditService
import com.example.docodile.service.FileEncryptionBackfillService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Admin-only maintenance operations. These are deliberate, infrequent actions —
 * not part of the normal request flow.
 */
@RestController
@RequestMapping("/api/admin")
class AdminMaintenanceController(
    private val backfillService: FileEncryptionBackfillService,
    private val auditService: AuditService,
) {
    /**
     * Encrypts all patient_files rows that are still stored in plaintext.
     * Idempotent. Run once after FILE_ENCRYPTION_KEY is set and a DB backup taken.
     */
    @PostMapping("/encryption/backfill")
    @PreAuthorize("hasRole('ADMIN')")
    fun backfillFileEncryption(): ResponseEntity<FileEncryptionBackfillService.BackfillResult> {
        val result = backfillService.run()
        auditService.log(
            action   = AuditAction.CONFIG_CHANGED,
            metadata = mapOf(
                "operation" to "file_encryption_backfill",
                "total" to result.total,
                "encrypted" to result.encrypted,
                "skipped" to result.skipped,
                "enabled" to result.enabled,
            ),
        )
        return ResponseEntity.ok(result)
    }
}
