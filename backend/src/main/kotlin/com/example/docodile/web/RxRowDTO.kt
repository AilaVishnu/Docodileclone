package com.example.docodile.web

import jakarta.validation.constraints.Size
import java.util.UUID

// One prescribed medicine row inside a visit. Fields mirror the columns
// the doctor fills in the Rx table on the Prescription page.
data class RxRowDTO(
    val id: UUID? = null,         // null when client is creating a fresh row
    val position: Short,
    @field:Size(max = 500) val medicine: String? = null,
    @field:Size(max = 500) val medicineNote: String? = null,
    @field:Size(max = 500) val dosage: String? = null,
    @field:Size(max = 500) val whenToTake: String? = null,
    @field:Size(max = 500) val frequency: String? = null,
    @field:Size(max = 500) val frequencyInterval: String? = null,
    @field:Size(max = 500) val duration: String? = null,
    @field:Size(max = 500) val notes: String? = null
)
