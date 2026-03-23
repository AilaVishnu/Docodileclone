# Bills Module — Complete Gap Analysis

*Analysis Date: 2026-03-20*  
*Requested by: Vishnu*

> Source: Docodile Research Study (FigJam) — UX Page, Bills Section  
> Compared against: Competitor Analysis (Competitor 1 + Doctecq)

---

## Research Findings (Competitor Analysis)

### Features Competitors Have
- Bill generation after consultation
- Itemised billing (consultation fee + services + medicines)
- Treatment/service addition to bill (e.g., chemical peel, injection)
- Payment status: Paid, Partial, Pending
- Payment mode: Cash, Digital (UPI, card)
- Bill print with clinic letterhead
- Bill share via WhatsApp
- Advance deposit collection
- Outstanding dues tracking per patient
- Discount application on bill
- GST / tax inclusion on bill
- Bill editing after generation
- Refund tracking

### User Pain Points from Reviews
- Cannot track which patients have pending payments
- No way to apply partial payments — it's all or nothing
- Bill editing after saving is blocked or requires admin override
- Printing bills is clunky — formatting breaks on some printers
- No summary of daily collections for end-of-day reconciliation

---

## Sources Reviewed
- Bills UX Research (FigJam)
- Bills Flow (Research)
- Bills UX Detail
- Competitor Feature Analysis
- Competitor Reviews (User Feedback)
- Final Screen — Book Appointment (where billing currently lives)

---

## Research UX (Docodile FigJam — Bills Flow)

### What the UX Covers
- Bill creation after consultation
- Adding treatment or service to bill (e.g., chemical peel for acne/pigmentation)
- Treatment appointment linking
- Payment status: Paid / Pending
- Payment mode: Cash / Digital
- WhatsApp integration query raised ("WhatsApp integration?")
- Advance deposit query raised ("advance deposits?")

### UX Flows Mapped
- [ ] Create bill post-consultation
- [ ] Add service/treatment to bill
- [ ] Set payment status and mode
- [ ] Link treatment appointment

---

## 🔴 CRITICAL GAPS

---

### GAP 1 — No Standalone Bills Module

**What research says:** Bills is treated as its own workflow — with payment tracking, service additions, history. It has its own dedicated section in the UX research board.

**What final screen shows:** Billing is buried inside the Book Appointment flow. There's no dedicated Bills screen/module.

**Change needed:** Bills needs its own module — separate sidebar entry, separate screen. Not a field inside appointment booking.

**If done:** Staff can quickly pull up a patient's billing status without going through the appointment flow. Clinic owner gets full financial visibility.

**If not done:** As the clinic scales, billing becomes chaos. Front desk has to dig through appointments just to check if someone paid. This is how clinics lose money.

---

### GAP 2 — Post-Consultation Service Billing is Missing

**What research says:** Explicitly stated — *"billing: Add any treatment or service like chemical peel for acne/pigmentation, add treatment appointment, payment status, payment mode"*. This is billing that happens AFTER the doctor's consultation, not during booking.

**What final screen shows:** Billing only happens at the booking stage (fees captured upfront). There's no post-consultation "add service" billing flow.

**Change needed:** A billing step triggered after consultation ends — where front desk can add services, treatments, products with their prices and generate a final bill.

**Real-world flow that needs to be supported:**
1. Patient books appointment (consultation fee captured)
2. Doctor sees patient
3. Doctor prescribes treatments/services
4. Front desk adds those services to bill
5. Patient pays total at counter
6. Receipt generated / shared via WhatsApp

**If done:** The actual real-world clinic workflow is captured.

**If not done:** Clinics with dermatology, physiotherapy, or any treatment-based services literally can't use this feature. Major use case dropped.

---

### GAP 3 — Partial Payment Tracking Missing

**What research says:** Research shows this is a top pain point from competitor reviews — users need more than just Paid/Pending.

**What final screen shows:** Only binary payment status (Paid or Pending).

**Change needed:** Add "Partial" payment state with amount tracking (paid so far vs total).

**If done:** Clinics can track partial payments accurately. Data reflects reality.

**If not done:** Partial payments are marked as "Pending" forever — data is inaccurate.

---

## 🟠 HIGH PRIORITY GAPS

---

### GAP 4 — Advance Deposits Not Designed

**What research says:** Explicitly flagged as a question — *"advance deposits?"* — meaning the team identified this as a real need from user research.

**What final screen shows:** Zero. No advance deposit field, no partial payment tracking, no deposit-against-bill reconciliation.

**Change needed:** A "collect advance" option during booking + the ability to apply that advance against the final bill. Show remaining balance clearly.

**If done:** Clinics that take deposits for procedures (surgeries, dental work, skin treatments) can actually track this. Reduces no-shows too.

**If not done:** Doctors' clinics taking advance for procedures will manage this in a notebook next to your software.

---

### GAP 5 — Payment Mode UX is Underdeveloped

**What research says:** Payment mode is explicitly called out — *"payment type: cash, digital"*. Two distinct flows.

**What final screen shows:** A dropdown that captures payment type — but no UX for what happens differently for cash vs digital.

**Change needed:**
- **Cash** → show amount collected, generate change amount, mark confirmed
- **Digital** → show QR code or UPI ID, mark as pending until confirmed

**If done:** The front desk doesn't need to mentally track "did they actually pay digitally or just say they did."

**If not done:** Payment mode becomes a useless data point.

---

### GAP 6 — WhatsApp Bill Sharing Not Designed

**What research says:** *"WhatsApp's integration?"* — flagged directly in the Bills research.

**What final screen shows:** No bill sharing mechanism at all.

**Change needed:** A "Send Bill" action that shares a formatted bill summary via WhatsApp. Same pattern as prescription sharing.

**If done:** Patient gets a bill on their phone instantly. Clinic looks professional.

**If not done:** Front desk has to write it on paper or take a photo of the screen.

---

## 🟡 MEDIUM PRIORITY GAPS

---

### GAP 7 — No Bill History / Ledger Per Patient

**Change needed:** In the patient profile — a "Billing" tab showing all past bills, payment status, and total outstanding.

**If done:** Front desk can instantly see "this patient has ₹500 outstanding from last visit."

**If not done:** Clinics lose track of dues. Revenue leakage.

---

### GAP 8 — No Bill Print / Receipt Flow

**Change needed:** A "Print Receipt" action that generates a clean, clinic-branded bill with: patient name, date, services, amount, payment mode, clinic details.

**If done:** Patients who need receipts for reimbursement or insurance get them.

**If not done:** Clinics maintain a separate receipt book alongside the software.

---

### GAP 9 — No Discount / Waiver Field

**Change needed:** An optional "Discount" field (flat or %) with a reason field.

**If done:** Doctors who give discounts can do it cleanly in the system without fudging numbers.

**If not done:** Discounts happen outside the system. Financial reports are wrong.

---

### GAP 10 — No End-of-Day Collection Summary

**Change needed:** Daily summary showing total collections by payment mode and outstanding amounts.

**If done:** Front desk has closure — end of shift is clean. Feeds into Reports module.

**If not done:** Front desk has no reconciliation tool.

---

## 🟢 POST-MVP GAPS

| Feature | Notes |
|---------|-------|
| GST / tax inclusion on bill | Needed for registered clinics |
| Bill editing post-generation | Edge case but needed |
| Refund flow | Edge case but needed for cancelled services |

---

## Summary Table

| Gap | Priority | Effort |
|-----|----------|--------|
| Standalone Bills module | 🔴 Critical | Medium |
| Post-consultation service billing | 🔴 Critical | High |
| Partial payment tracking | 🔴 Critical | Low |
| Advance deposits | 🟠 High | Medium |
| Payment mode UX (cash vs digital) | 🟠 High | Low |
| WhatsApp bill sharing | 🟠 High | Medium |
| Patient bill history / ledger | 🟡 Medium | Medium |
| Print receipt | 🟡 Medium | Low |
| Discount / waiver field | 🟡 Medium | Low |
| End-of-day collection summary | 🟡 Medium | Medium |
| GST / tax toggle | 🟢 Post-MVP | Low |
| Bill editing | 🟢 Post-MVP | Medium |
| Refund flow | 🟢 Post-MVP | Medium |

---

## Key Recommendation

The biggest miss is **Gap 2** — the post-consultation service billing flow. That's not a nice-to-have, that's the core of how clinic billing actually works in India.

---

## Status
- [ ] Gap analysis reviewed by product team
- [ ] Gaps prioritized for design
- [ ] UX updated to reflect missing flows

---

*Analysis by Croc 🐊 | Docodile AI Co-Founder*
