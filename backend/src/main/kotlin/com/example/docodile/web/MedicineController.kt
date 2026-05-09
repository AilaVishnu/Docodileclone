package com.example.docodile.web

import com.example.docodile.repo.RxRowRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.service.DrugInteractionWarning
import com.example.docodile.service.EkaCareClient
import com.example.docodile.service.EkaDrugResult
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/medicines")
class MedicineController(
    private val eka: EkaCareClient,
    private val rxRowRepo: RxRowRepository,
    private val currentUser: CurrentUser,
) {

    @GetMapping("/search")
    fun search(
        @RequestParam(defaultValue = "") q: String,
        @RequestParam(defaultValue = "10") limit: Int,
    ): List<EkaDrugResult> {
        if (q.isBlank()) return emptyList()
        return eka.searchDrugs(q, limit.coerceIn(1, 20))
    }

    @GetMapping("/frequent")
    fun frequent(@RequestParam(defaultValue = "10") limit: Int): List<EkaDrugResult> {
        val clinicId = currentUser.clinicIdOrNull() ?: return emptyList()
        val names = rxRowRepo.findFrequentMedicines(clinicId, PageRequest.of(0, limit.coerceIn(1, 30)))
        return names.map { name ->
            val hit = eka.searchDrugs(name, limit = 1).firstOrNull()
            EkaDrugResult(name = name, id = hit?.id ?: "", genericName = hit?.genericName ?: "")
        }
    }

    // Accepts comma-separated medicine names (brand or generic).
    // The backend resolves each to a generic via Eka drug search.
    @GetMapping("/interactions")
    fun interactions(
        @RequestParam(defaultValue = "") medicines: String,
    ): List<DrugInteractionWarning> {
        val list = medicines.split(",").map { it.trim() }.filter { it.isNotBlank() }
        if (list.size < 2) return emptyList()
        return eka.checkInteractionsByName(list)
    }
}
