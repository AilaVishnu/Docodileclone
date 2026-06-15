package com.example.docodile.service

import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.PatientFileRepository
import com.example.docodile.security.CurrentUser
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * One-time backfill that encrypts patient_files rows stored before file
 * encryption was enabled. Idempotent — rows already carrying the ENC1 magic
 * header are skipped, so it is safe to re-run.
 *
 * Triggered manually via the admin endpoint (POST /api/admin/encryption/backfill)
 * rather than on startup, because it rewrites every file blob and should be run
 * deliberately after FILE_ENCRYPTION_KEY is set and a full DB backup is taken.
 *
 * Scoped to the calling admin's tenant only (tenant isolation). Pages through
 * file IDs and loads + re-saves one row at a time in its own transaction, so a
 * large file table never balloons the heap or holds row locks for the whole run.
 * Includes soft-deleted rows, since their blobs remain at rest in the database.
 *
 * The per-row transactional work lives in [FileEncryptionRowProcessor] — a
 * separate bean so the REQUIRES_NEW transaction is honoured (a self-invocation
 * within one bean would bypass Spring's transactional proxy).
 */
@Service
class FileEncryptionBackfillService(
    private val patientFileRepository: PatientFileRepository,
    private val clinicEntityRepository: ClinicEntityRepository,
    private val encryptionService: EncryptionService,
    private val currentUser: CurrentUser,
    private val rowProcessor: FileEncryptionRowProcessor,
) {
    private val log = LoggerFactory.getLogger(FileEncryptionBackfillService::class.java)

    data class BackfillResult(val total: Int, val encrypted: Int, val skipped: Int, val enabled: Boolean)

    fun run(): BackfillResult {
        if (!encryptionService.enabled) {
            log.warn("Backfill requested but FILE_ENCRYPTION_KEY is not set — nothing to do.")
            return BackfillResult(total = 0, encrypted = 0, skipped = 0, enabled = false)
        }

        val tenantId = currentUser.tenantId()
        val clinicIds = clinicEntityRepository.findAllByTenantId(tenantId).map { it.id }
        if (clinicIds.isEmpty()) {
            return BackfillResult(total = 0, encrypted = 0, skipped = 0, enabled = true)
        }

        val ids = patientFileRepository.findAllIdsByClinicIds(clinicIds)
        var encrypted = 0
        var skipped = 0
        for (id in ids) {
            if (rowProcessor.encryptOne(id)) encrypted++ else skipped++
        }

        log.info(
            "File encryption backfill complete (tenant={}): total={} encrypted={} skipped={}",
            tenantId, ids.size, encrypted, skipped,
        )
        return BackfillResult(total = ids.size, encrypted = encrypted, skipped = skipped, enabled = true)
    }
}

/**
 * Encrypts a single file row in its own transaction. Kept in a separate bean
 * from the orchestrator so Spring's transactional proxy applies REQUIRES_NEW.
 */
@Service
class FileEncryptionRowProcessor(
    private val patientFileRepository: PatientFileRepository,
    private val encryptionService: EncryptionService,
) {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun encryptOne(id: UUID): Boolean {
        val pf = patientFileRepository.findRawById(id) ?: return false
        if (encryptionService.isEncrypted(pf.fileData)) return false
        pf.fileData = encryptionService.encrypt(pf.fileData, pf.id, pf.clinicId)
        patientFileRepository.save(pf)
        return true
    }
}
