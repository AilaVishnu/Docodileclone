package com.example.docodile.web

import com.example.docodile.repo.RxRowRepository
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

// Slim shape for the per-medicine autofill — just the schedule fields the
// prescription pad needs, no row id / position.
data class RxLatestDTO(
    val medicine: String?,
    val medicineNote: String?,
    val dosage: String?,
    val whenToTake: String?,
    val frequency: String?,
    val frequencyInterval: String?,
    val duration: String?,
    val notes: String?,
)

@RestController
@RequestMapping("/api/tenant/rx-history")
class RxHistoryController(
    private val rxRowRepository: RxRowRepository,
) {
    /**
     * Latest prescription of a given medicine across the clinic — used by the
     * pad's autofill to pre-fill a row from the most recent time anyone in
     * this clinic prescribed it. 204 when no past prescription exists.
     */
    @GetMapping("/latest")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun latest(
        @RequestParam medicine: String,
        @RequestParam(required = false) excludeVisitId: UUID?,
    ): ResponseEntity<RxLatestDTO> {
        val name = medicine.trim()
        if (name.isBlank()) return ResponseEntity.noContent().build()
        val rows = rxRowRepository.findLatestByMedicine(
            name, excludeVisitId, PageRequest.of(0, 1),
        )
        val r = rows.firstOrNull() ?: return ResponseEntity.noContent().build()
        return ResponseEntity.ok(
            RxLatestDTO(
                medicine = r.medicine,
                medicineNote = r.medicineNote,
                dosage = r.dosage,
                whenToTake = r.whenToTake,
                frequency = r.frequency,
                frequencyInterval = r.frequencyInterval,
                duration = r.duration,
                notes = r.notes,
            )
        )
    }
}
