# Bills Module Gap Analysis

*Analysis Date: 2026-03-20*
*Requested by: Vishnu*

## Sources Reviewed
- Bills UX Research (FigJam)
- Bills Flow (Research)
- Bills UX Detail
- Competitor Feature Analysis
- Competitor Reviews (User Feedback)
- Final Screen — Book Appointment (where billing currently lives)

---

## 🔴 GAP 1 — No Standalone Bills Module

**What research says:** Bills is treated as its own workflow — with payment tracking, service additions, history. It has its own dedicated section in the UX research board.

**What final screen shows:** Billing is buried inside the Book Appointment flow. There's no dedicated Bills screen/module.

**Change needed:** Bills needs its own module — separate sidebar entry, separate screen. Not a field inside appointment booking.

**If done:** Staff can quickly pull up a patient's billing status without going through the appointment flow. Clinic owner gets full financial visibility.

**If not done:** As the clinic scales, billing becomes chaos. Front desk has to dig through appointments just to check if someone paid. This is how clinics lose money.

---

## 🔴 GAP 2 — Post-Consultation Service Billing is Missing

**What research says:** Explicitly stated — *"billing: Add any treatment or service like chemical peel for acne/pigmentation, add treatment appointment, payment status, payment mode"*. This is billing that happens AFTER the doctor's consultation, not during booking.

**What final screen shows:** Billing only happens at the booking stage (fees captured upfront). There's no post-consultation "add service" billing flow.

**Change needed:** A billing step triggered after consultation ends — where front desk can add services, treatments, products with their prices and generate a final bill.

**If done:** The actual real-world clinic workflow is captured. Doctor sees patient → prescribes treatment → front desk adds those services to the bill → patient pays at counter. That's the flow.

**If not done:** Clinics with dermatology, physiotherapy, or any treatment-based services literally can't use this feature. Major use case dropped.

---

## 🟠 GAP 3 — Advance Deposits Not Designed

**What research says:** Explicitly flagged as a question — *"advance deposits?"* — meaning the team identified this as a real need from user research.

**What final screen shows:** Zero. No advance deposit field, no partial payment tracking, no deposit-against-bill reconciliation.

**Change needed:** A "collect advance" option during booking + the ability to apply that advance against the final bill. Show remaining balance clearly.

**If done:** Clinics that take deposits for procedures (surgeries, dental work, skin treatments) can actually track this. Reduces no-shows too.

**If not done:** Doctors' clinics taking advance for procedures will manage this in a notebook next to your software. That's embarrassing.

---

## 🟠 GAP 4 — Payment Mode UX is Underdeveloped

**What research says:** Payment mode is explicitly called out — *"payment type: cash, digital"*. Two distinct flows.

**What final screen shows:** A dropdown or field that captures payment type — but no UX for what happens differently for cash vs digital. Just a label.

**Change needed:**
- **Cash** → show amount collected, generate change amount, mark confirmed
- **Digital** → show QR code or UPI ID, mark as pending until confirmed, or auto-verify

**If done:** The front desk doesn't need to mentally track "did they actually pay digitally or just say they did." The system guides the collection.

**If not done:** Payment mode becomes a useless data point. Nobody trusts it because there's no verification step.

---

## 🟠 GAP 5 — WhatsApp Bill Sharing Not Designed

**What research says:** *"WhatsApp's integration?"* — flagged directly in the Bills research. And given that prescription WhatsApp sharing is already mentioned elsewhere in the research, bills are a natural next step.

**What final screen shows:** No bill sharing mechanism at all. No print, no share, no send.

**Change needed:** A "Send Bill" action that shares a formatted bill summary via WhatsApp (or at minimum generates a shareable link/PDF).

**If done:** Patient gets a bill on their phone instantly. Clinic looks professional. Also reduces "I didn't know I had to pay" disputes.

**If not done:** Patients ask for bills, front desk has to write it on paper or take a photo of the screen. This is a real thing that happens.

---

## 🟡 GAP 6 — No Bill History / Ledger Per Patient

**What research says:** The research flow has bills connected to the patient record. Implies a per-patient billing history should exist.

**What final screen shows:** No patient-level billing history. No "outstanding dues" view. No record of past payments.

**Change needed:** In the patient profile — a "Billing" tab showing all past bills, payment status (paid/partial/unpaid), and total outstanding.

**If done:** When a patient comes in again, front desk can instantly see "this patient has ₹500 outstanding from last visit." Collections become systematic.

**If not done:** Clinics lose track of dues. Patients conveniently forget. Revenue leakage.

---

## 🟡 GAP 7 — No Bill Print / Receipt Flow

**What research says:** Prescription printing is mentioned. Same logic applies to bills — clinics need to print receipts for patients, especially for insurance claims.

**What final screen shows:** No print bill option.

**Change needed:** A "Print Receipt" action that generates a clean, clinic-branded bill with: patient name, date, services, amount, payment mode, clinic details.

**If done:** Patients who need receipts for reimbursement or insurance get them. Clinic looks legit.

**If not done:** You're forcing clinics to maintain a separate receipt book. Defeats the purpose of an EMR.

---

## 🟡 GAP 8 — No Discount / Waiver Field

**What research says:** Competitor analysis (especially established EMRs) consistently shows discount fields as a standard billing feature.

**What final screen shows:** No discount, waiver, or concession field.

**Change needed:** An optional "Discount" field (flat or %) with a reason field (doctor's discretion, staff family, etc.)

**If done:** Doctors who give discounts to poor patients or family members can do it cleanly in the system without fudging numbers.

**If not done:** Discounts happen outside the system. Financial reports are wrong. Owner can't see true revenue picture.

---

## Summary Table

| Gap | Priority | Effort |
|-----|----------|--------|
| Standalone Bills module | 🔴 Critical | Medium |
| Post-consultation service billing | 🔴 Critical | High |
| Advance deposits | 🟠 High | Medium |
| Payment mode UX (cash vs digital) | 🟠 High | Low |
| WhatsApp bill sharing | 🟠 High | Medium |
| Patient bill history / ledger | 🟡 Medium | Medium |
| Print receipt | 🟡 Medium | Low |
| Discount / waiver field | 🟡 Medium | Low |

---

## Key Recommendation

The biggest miss is **Gap 2** — the post-consultation service billing flow. That's not a nice-to-have, that's the core of how clinic billing actually works in India. Everything else builds on top of that workflow existing.

**Real-world flow that needs to be supported:**
1. Patient books appointment (consultation fee captured)
2. Doctor sees patient
3. Doctor prescribes treatments/services
4. Front desk adds those services to bill
5. Patient pays total at counter
6. Receipt generated / shared via WhatsApp

---

*Analysis by Croc 🐊 | Docodile AI Co-Founder*
