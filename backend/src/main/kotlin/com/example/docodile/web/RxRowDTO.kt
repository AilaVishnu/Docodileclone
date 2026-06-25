package com.example.docodile.web

import java.util.UUID

// One prescribed medicine row inside a visit. Fields mirror the columns
// the doctor fills in the Rx table on the Prescription page.
data class RxRowDTO(
    val id: UUID? = null,         // null when client is creating a fresh row
    val position: Short,
    val medicine: String? = null,
    val medicineNote: String? = null,
    val dosage: String? = null,
    val whenToTake: String? = null,
    val frequency: String? = null,
    val frequencyInterval: String? = null,
    val duration: String? = null,
    val notes: String? = null,
    // Server-derived dispensary quantity (units/dose × doses/day × days, ceil;
    // per-pack forms = 1). Null when it can't be computed — the bill defaults to
    // 1 and the desk can adjust. Computed here so bills/inventory agree.
    val dispenseQty: Int? = null
)
