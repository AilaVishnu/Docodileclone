package com.example.docodile.service

import com.example.docodile.repo.PharmacyStockRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.web.DeductItem
import com.example.docodile.web.DeductResult
import com.example.docodile.web.DeductedItem
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

// Pharmacy stock mutations that need to participate in a larger transaction
// (e.g. Charge & Bill, which deducts stock alongside payment + bill in ONE tx).
// The deduction logic was lifted out of PharmacyStockController so both the
// /deduct endpoint and the atomic charge share one implementation.
@Service
class PharmacyStockService(
    private val repo: PharmacyStockRepository,
    private val currentUser: CurrentUser,
) {

    // Decrement units across batches (earliest-expiry-first, never overdrawn) for
    // each requested medicine. Names are matched case-insensitively within the
    // caller's clinic. Returns what was applied + any names with no stock row.
    @Transactional
    fun deduct(items: List<DeductItem>): DeductResult {
        val clinicId = currentUser.clinicId()
        val all = repo.findAllByClinicIdOrderByNameAsc(clinicId)
        val byName = all.groupBy { it.name.trim().lowercase() }
        val applied = mutableListOf<DeductedItem>()
        val missing = mutableListOf<String>()
        for (item in items) {
            val key = item.name.trim().lowercase()
            if (key.isEmpty() || item.qty <= 0) continue
            val batches = byName[key]?.sortedBy { b -> b.expiry } ?: emptyList()
            if (batches.isEmpty()) { missing += item.name; continue }
            var remaining = item.qty
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
            applied += DeductedItem(name = item.name, requested = item.qty, deducted = deducted)
        }
        return DeductResult(applied = applied, missing = missing)
    }
}
