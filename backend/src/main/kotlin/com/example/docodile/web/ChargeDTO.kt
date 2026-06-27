package com.example.docodile.web

import java.math.BigDecimal
import java.time.LocalDate

// Charge & Bill request. The client sends ONLY the line items + payment method;
// the server recomputes every money figure (fee, pharmacy, totals) from these
// lines — it does not trust client-sent totals. One atomic call replaces the
// old payment + bill + stock-deduction round trips.
data class ChargeRequest(
    val method: String = "Cash",          // "Waive" => waived (₹0 collected)
    val discountAmount: BigDecimal? = null, // optional bill-level discount
    val billDate: LocalDate? = null,
    val items: List<ChargeLine> = emptyList(),
)

data class ChargeLine(
    val name: String = "",
    val qty: Int = 1,
    val unit: BigDecimal = BigDecimal.ZERO,   // unit price
    val gst: BigDecimal = BigDecimal.ZERO,    // percent
    val disc: BigDecimal = BigDecimal.ZERO,   // value or percent (see discUnit)
    val discUnit: String = "₹",               // "%" or "₹"
    val kind: String = "medicine",            // "service" (consultation bucket) | "medicine"
    val inStock: Boolean = true,              // medicine lines: deduct stock only when true
)

data class ChargeResult(
    val bill: BillDTO,                 // the invoice snapshot just created
    val depositApplied: BigDecimal,    // advance drawn down for this bill
    val patientDeposit: BigDecimal,    // patient's remaining advance after the draw
    val stock: DeductResult,           // what was deducted / short
)
