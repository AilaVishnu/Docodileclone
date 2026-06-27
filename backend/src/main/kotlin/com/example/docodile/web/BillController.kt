package com.example.docodile.web

import com.example.docodile.service.BillService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate
import java.util.UUID

// Clinic-wide bills for the Bills page (sidebar "Billing"). Per-patient bill
// history lives on PatientController; this is the cross-patient list with an
// optional date range (the page's period filter).
@RestController
@RequestMapping("/api/tenant/bills")
class BillController(
    private val billService: BillService,
) {
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun list(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate?,
    ): List<ClinicBillDTO> = billService.listClinicBills(from, to)

    // Refund a settled bill: the full received amount is returned and the
    // invoice flips to REFUNDED. Returns the updated bill.
    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun refund(@PathVariable id: UUID): ClinicBillDTO = billService.refundBill(id)

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
}
