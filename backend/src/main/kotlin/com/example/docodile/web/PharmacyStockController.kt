package com.example.docodile.web

import com.example.docodile.domain.PharmacyStock
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.PharmacyStockRepository
import com.example.docodile.security.CurrentUser
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
    private val clinicEntityRepository: ClinicEntityRepository,
    private val currentUser: CurrentUser,
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
        repo.findAllByClinicIdOrderByNameAsc(currentUser.clinicId()).map(::toDto)

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    @Transactional
    fun create(@RequestBody request: PharmacyStockRequest): ResponseEntity<PharmacyStockDTO> {
        if (request.name.isBlank()) throw IllegalArgumentException("Medicine name is required")
        val clinicId = currentUser.clinicId()
        val clinic = clinicEntityRepository.findById(clinicId)
            .orElseThrow { IllegalArgumentException("Clinic not found") }
        val row = PharmacyStock(clinic = clinic).also { applyRequest(it, request) }
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(repo.save(row)))
    }

    /**
     * Bulk insert for CSV imports. Skips rows with blank names. Returns the
     * count actually saved so the frontend can surface "Imported N items".
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    @Transactional
    fun bulkCreate(@RequestBody requests: List<PharmacyStockRequest>): BulkResult {
        val clinicId = currentUser.clinicId()
        val clinic = clinicEntityRepository.findById(clinicId)
            .orElseThrow { IllegalArgumentException("Clinic not found") }
        val now = Instant.now()
        var saved = 0
        for (req in requests) {
            if (req.name.isBlank()) continue
            val row = PharmacyStock(clinic = clinic, createdAt = now, updatedAt = now)
            applyRequest(row, req)
            repo.save(row)
            saved++
        }
        return BulkResult(imported = saved, skipped = requests.size - saved)
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    @Transactional
    fun update(@PathVariable id: UUID, @RequestBody request: PharmacyStockRequest): ResponseEntity<PharmacyStockDTO> {
        val clinicId = currentUser.clinicId()
        val existing = repo.findByIdAndClinicId(id, clinicId) ?: return ResponseEntity.notFound().build()
        applyRequest(existing, request)
        return ResponseEntity.ok(toDto(repo.save(existing)))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY')")
    @Transactional
    fun delete(@PathVariable id: UUID): ResponseEntity<Void> {
        val clinicId = currentUser.clinicId()
        val existing = repo.findByIdAndClinicId(id, clinicId) ?: return ResponseEntity.notFound().build()
        repo.delete(existing)
        return ResponseEntity.noContent().build()
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

data class BulkResult(val imported: Int, val skipped: Int)
