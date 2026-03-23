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

**What the Research Says:** Bills is treated as its own workflow — with payment tracking, service additions, history. It has its own dedicated section in the UX research board.

**What the Final Screen Shows:** Billing is buried inside the Book Appointment flow. There's no dedicated Bills screen or module.

**What Should Change:** Bills needs its own module — separate sidebar entry, separate screen. Not a field inside appointment booking.

**What Happens If You Do This:**
Staff can quickly pull up a patient's billing status without navigating through the appointment flow. Clinic owner gets full financial visibility from one dedicated place. Scales cleanly as the clinic grows.

**What Happens If You Don't:**
As the clinic scales, billing becomes chaos. Front desk has to dig through appointments just to check if someone paid. This is how clinics lose money and start keeping parallel Excel sheets.

---

### GAP 2 — Post-Consultation Service Billing is Missing

**What the Research Says:** Explicitly stated — *"billing: Add any treatment or service like chemical peel for acne/pigmentation, add treatment appointment, payment status, payment mode."* This is billing that happens AFTER the doctor's consultation, not during booking.

**What the Final Screen Shows:** Billing only happens at the booking stage (fees captured upfront). There's no post-consultation "add service" billing flow.

**What Should Change:** A billing step triggered after consultation ends — where front desk can add services, treatments, products with their prices and generate a final bill.

Real-world flow that needs to be supported:
1. Patient books appointment (consultation fee captured)
2. Doctor sees patient
3. Doctor prescribes treatments/services
4. Front desk adds those services to bill
5. Patient pays total at counter
6. Receipt generated / shared via WhatsApp

**What Happens If You Do This:**
The actual real-world clinic workflow is captured end-to-end inside Docodile. Dermatology, physiotherapy, and treatment-based clinics can actually use the billing module.

**What Happens If You Don't:**
Clinics with treatment-based services literally can't use this feature. Major use case dropped. These clinics will manage billing outside Docodile — and eventually leave for a tool that handles it.

---

### GAP 3 — Partial Payment Tracking Missing

**What the Research Says:** Research shows this is a top pain point from competitor reviews — users need more than just Paid/Pending.

**What the Final Screen Shows:** Only binary payment status (Paid or Pending).

**What Should Change:** Add a "Partial" payment state with amount tracking — how much has been paid so far vs. the total.

**What Happens If You Do This:**
Clinics can track partial payments accurately. The outstanding balance is always visible. Financial data reflects reality, not a binary guess.

**What Happens If You Don't:**
Partial payments get marked as "Pending" forever. Outstanding dues are impossible to track. Revenue leakage becomes invisible.

---

## 🟠 HIGH PRIORITY GAPS

---

### GAP 4 — Advance Deposits Not Designed

**What the Research Says:** Explicitly flagged — *"advance deposits?"* — meaning the team identified this as a real need from user research.

**What the Final Screen Shows:** Zero. No advance deposit field, no partial payment tracking, no deposit-against-bill reconciliation.

**What Should Change:** A "Collect Advance" option during booking + the ability to apply that advance against the final bill. Show remaining balance clearly at billing time.

**What Happens If You Do This:**
Clinics taking deposits for procedures (surgeries, dental, skin treatments) can track this properly. Reduces no-shows. Advance vs. balance is always clear.

**What Happens If You Don't:**
Doctors taking advances for procedures will manage this in a notebook next to your software. Docodile is only used for the easy parts — it's not the system of record.

---

### GAP 5 — Payment Mode UX is Underdeveloped

**What the Research Says:** Payment mode is explicitly called out — *"payment type: cash, digital."* Two distinct flows with different verification needs.

**What the Final Screen Shows:** A dropdown that captures payment type — but no UX differentiation between cash and digital.

**What Should Change:**
- Cash → show amount collected, calculate change, mark confirmed
- Digital → show QR code or UPI ID, mark as pending until confirmed

**What Happens If You Do This:**
Front desk doesn't need to mentally track "did they actually pay digitally or just say they did." Cash reconciliation is automatic. Digital payments have a clear pending → confirmed flow.

**What Happens If You Don't:**
Payment mode becomes a useless data point — just a label that nobody trusts. Cash vs. digital reconciliation happens outside the app.

---

### GAP 6 — WhatsApp Bill Sharing Not Designed

**What the Research Says:** *"WhatsApp's integration?"* — flagged directly in the Bills research.

**What the Final Screen Shows:** No bill sharing mechanism at all.

**What Should Change:** A "Send Bill" action that shares a formatted bill summary via WhatsApp. Same pattern as prescription sharing.

**What Happens If You Do This:**
Patient gets a bill on their phone instantly. Clinic looks professional. Sharing happens inside the app — no copying numbers, no WhatsApp-switching.

**What Happens If You Don't:**
Front desk has to write the bill on paper or take a photo of the screen. Docodile is not part of the patient communication loop.

---

## 🟡 MEDIUM PRIORITY GAPS

---

### GAP 7 — No Bill History / Ledger Per Patient

**What Should Change:** In the patient profile — a "Billing" tab showing all past bills, payment status, and total outstanding.

**What Happens If You Do This:**
Front desk can instantly see "this patient has ₹500 outstanding from last visit" without searching through old appointments. Outstanding dues are always one click away.

**What Happens If You Don't:**
Clinics lose track of dues. Revenue leakage is silent and accumulates. Patients with long outstanding balances continue to be served without anyone knowing.

---

### GAP 8 — No Bill Print / Receipt Flow

**What Should Change:** A "Print Receipt" action generating a clean, clinic-branded bill with: patient name, date, services, amount, payment mode, and clinic details.

**What Happens If You Do This:**
Patients who need receipts for insurance reimbursement or corporate claims get them instantly. Clinic looks professional.

**What Happens If You Don't:**
Clinics maintain a separate receipt book alongside the software. Docodile is not the full system of record.

---

### GAP 9 — No Discount / Waiver Field

**What Should Change:** An optional "Discount" field (flat or %) with a reason field (e.g., "staff discount", "charity case").

**What Happens If You Do This:**
Doctors who give discounts can do it cleanly inside the system. Financial reports stay accurate. Discounts are trackable and auditable.

**What Happens If You Don't:**
Discounts happen outside the system — the number in Docodile doesn't match what was actually collected. Financial reports are wrong.

---

### GAP 10 — No End-of-Day Collection Summary

**What Should Change:** Daily summary showing total collections by payment mode and total outstanding for the day.

**What Happens If You Do This:**
Front desk has a clean end-of-shift reconciliation tool built into Docodile. No separate cash counting sheet needed. Feeds into the Reports module automatically.

**What Happens If You Don't:**
Front desk has no reconciliation tool inside the app. They'll maintain a WhatsApp message or Excel sheet for daily collections — Docodile is not their end-of-day tool.

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

The biggest miss is **GAP 2** — the post-consultation service billing flow. That's not a nice-to-have, that's the core of how clinic billing actually works in India.

---

## Status
- [ ] Gap analysis reviewed by product team
- [ ] Gaps prioritized for design
- [ ] UX updated to reflect missing flows

---

*Analysis by Croc 🐊 | Docodile AI Co-Founder*
