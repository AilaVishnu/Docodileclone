package com.example.docodile.web

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.PharmacyStock
import com.example.docodile.repo.PharmacyStockRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.service.AuditService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/tenant/pharmacy-stock")
class PharmacyStockController(
    private val repo: PharmacyStockRepository,
    private val currentUser: CurrentUser,
    private val auditService: AuditService,
) {

    private fun toDto(s: PharmacyStock) = PharmacyStockDTO(
        id = s.id,
        name = s.name,
        category = s.category,
        form = s.form,
        invoiceNo = s.invoiceNo,
        batch = s.batch,
        packPrice = s.packPrice,
        packMrp = s.packMrp,
        unitsPerPack = s.unitsPerPack,
        unitPrice = s.unitPrice,
        unitsInStock = s.unitsInStock,
        expiry = s.expiry,
        discountPct = s.discountPct,
        gstPct = s.gstPct,
    )

    private fun applyRequest(target: PharmacyStock, req: PharmacyStockRequest) {
        target.name = req.name.trim()
        target.category = req.category.ifBlank { "Tablets" }
        target.form = req.form.ifBlank { "tablet" }
        target.invoiceNo = req.invoiceNo?.trim()?.ifBlank { null }
        target.batch = req.batch?.trim()?.ifBlank { null }
        target.packPrice = req.packPrice
        target.packMrp = req.packMrp
        target.unitsPerPack = req.unitsPerPack.coerceAtLeast(1)
        target.unitPrice = req.unitPrice
        target.unitsInStock = req.unitsInStock.coerceAtLeast(0)
        target.expiry = req.expiry.take(7)
        target.discountPct = req.discountPct
        target.gstPct = req.gstPct
        target.updatedAt = Instant.now()
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun list(): List<PharmacyStockDTO> =
        repo.findAllByOrderByNameAsc().map(::toDto)

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    @Transactional
    fun create(@RequestBody request: PharmacyStockRequest): ResponseEntity<PharmacyStockDTO> {
        if (request.name.isBlank()) throw IllegalArgumentException("Medicine name is required")
        val row = PharmacyStock().also { applyRequest(it, request) }
        val saved = repo.save(row)
        auditService.log(AuditAction.INVENTORY_CREATED, entityType = "PharmacyStock", entityId = saved.id,
            metadata = mapOf("name" to saved.name))
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved))
    }

    /**
     * Upsert for CSV imports. Existing rows are matched by the natural
     * identity (name + batch + invoiceNo, case-insensitive) and updated in
     * place; new rows are inserted. Lets the user re-paste their
     * "current inventory" export every day without creating duplicates —
     * stock counts and prices on existing batches just refresh.
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    @Transactional
    fun bulkCreate(@RequestBody requests: List<PharmacyStockRequest>): BulkResult {
        val now = Instant.now()

        // Build a lookup keyed by (name|batch|invoice) so each request row
        // can find its existing twin in O(1). All keys are lower-cased so a
        // stray case difference in the CSV doesn't cause a false miss.
        fun key(name: String, batch: String?, invoice: String?) =
            "${name.trim().lowercase()}|${(batch ?: "").trim().lowercase()}|${(invoice ?: "").trim().lowercase()}"

        val existing = repo.findAllByOrderByNameAsc()
        val existingByKey = existing.associateBy { key(it.name, it.batch, it.invoiceNo) }

        var created = 0
        var updated = 0
        var skipped = 0
        for (req in requests) {
            if (req.name.isBlank()) { skipped++; continue }
            val k = key(req.name, req.batch, req.invoiceNo)
            val match = existingByKey[k]
            if (match != null) {
                applyRequest(match, req)
                repo.save(match)
                updated++
            } else {
                val row = PharmacyStock(createdAt = now, updatedAt = now)
                applyRequest(row, req)
                repo.save(row)
                created++
            }
        }
        return BulkResult(created = created, updated = updated, skipped = skipped)
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    @Transactional
    fun update(@PathVariable id: UUID, @RequestBody request: PharmacyStockRequest): ResponseEntity<PharmacyStockDTO> {
        val existing = repo.findById(id).orElse(null) ?: return ResponseEntity.notFound().build()
        applyRequest(existing, request)
        val saved = repo.save(existing)
        auditService.log(AuditAction.INVENTORY_UPDATED, entityType = "PharmacyStock", entityId = id,
            metadata = mapOf("name" to saved.name))
        return ResponseEntity.ok(toDto(saved))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    @Transactional
    fun delete(@PathVariable id: UUID): ResponseEntity<Void> {
        val existing = repo.findById(id).orElse(null) ?: return ResponseEntity.notFound().build()
        auditService.log(AuditAction.INVENTORY_DELETED, entityType = "PharmacyStock", entityId = id,
            metadata = mapOf("name" to existing.name))
        repo.delete(existing)
        return ResponseEntity.noContent().build()
    }

    /**
     * Bulk deduction triggered by the Bill Medicines flow. For each item in
     * the request, finds matching pharmacy_stock rows (case-insensitive name
     * match, this clinic only) and decrements units across batches in
     * earliest-expiry-first order. Batches are never overdrawn — if the
     * caller requested more units than the clinic has, only what's
     * available is deducted and the row's resulting count is reported.
     */
    @PostMapping("/deduct")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    @Transactional
    fun deduct(@RequestBody items: List<DeductItem>): DeductResult {
        val all = repo.findAllByOrderByNameAsc()
        // Group by lowercase name so multiple batches of the same med are
        // bundled. Earliest-expiry-first dispensing rotates stock naturally
        // and avoids leaving short-dated batches behind.
        val byName = all.groupBy { it.name.trim().lowercase() }
        val applied = mutableListOf<DeductedItem>()
        val missing = mutableListOf<String>()
        for (it in items) {
            val key = it.name.trim().lowercase()
            if (key.isEmpty() || it.qty <= 0) continue
            val batches = byName[key]?.sortedBy { b -> b.expiry } ?: emptyList()
            if (batches.isEmpty()) { missing += it.name; continue }
            var remaining = it.qty
            var deducted = 0
            for (b in batches) {
                if (remaining <= 0) break
                val take = minOf(b.unitsInStock, remaining)
                if (take <= 0) continue
                b.unitsInStock -= take
                b.updatedAt = Instant.now()
                repo.save(b)
                remaining -= take
                deducted += take
            }
            applied += DeductedItem(name = it.name, requested = it.qty, deducted = deducted)
        }
        auditService.log(AuditAction.INVENTORY_DEDUCTED,
            metadata = mapOf("items" to items.size, "missing" to missing))
        return DeductResult(applied = applied, missing = missing)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> {
        return ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }
}

data class PharmacyStockDTO(
    val id: UUID,
    val name: String,
    val category: String,
    val form: String,
    val invoiceNo: String?,
    val batch: String?,
    val packPrice: BigDecimal,
    val packMrp: BigDecimal,
    val unitsPerPack: Int,
    val unitPrice: BigDecimal,
    val unitsInStock: Int,
    val expiry: String,
    val discountPct: BigDecimal,
    val gstPct: BigDecimal,
)

data class PharmacyStockRequest(
    val name: String = "",
    val category: String = "Tablets",
    val form: String = "tablet",
    val invoiceNo: String? = null,
    val batch: String? = null,
    val packPrice: BigDecimal = BigDecimal.ZERO,
    val packMrp: BigDecimal = BigDecimal.ZERO,
    val unitsPerPack: Int = 1,
    val unitPrice: BigDecimal = BigDecimal.ZERO,
    val unitsInStock: Int = 0,
    val expiry: String = "",
    val discountPct: BigDecimal = BigDecimal.ZERO,
    val gstPct: BigDecimal = BigDecimal.ZERO,
)

data class BulkResult(val created: Int, val updated: Int, val skipped: Int)

data class DeductItem(val name: String = "", val qty: Int = 0)

data class DeductedItem(val name: String, val requested: Int, val deducted: Int)

data class DeductResult(val applied: List<DeductedItem>, val missing: List<String>)
