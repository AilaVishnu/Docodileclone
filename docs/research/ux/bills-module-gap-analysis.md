# Bills Module — UX Gap Analysis

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

## Gap Analysis — What Research Has, UX May Be Missing

| # | Feature from Research | In UX Flow? | Gap / Notes |
|---|---|---|---|
| 1 | Advance deposit collection | ❓ | Raised as a question in research sticky — not resolved in UX flow |
| 2 | Partial payment tracking | ❌ | Research shows this is a top pain point — UX only shows Paid/Pending |
| 3 | WhatsApp bill sharing | ❓ | Raised as a question — not mapped in flow |
| 4 | Bill print with clinic header | ❌ | Not in UX flow — competitors have this as table-stakes |
| 5 | Discount field on bill | ❌ | Very common in clinic workflows — not visible in UX |
| 6 | GST / tax on bill | ❌ | Needed for registered clinics — not in UX scope |
| 7 | Bill editing post-generation | ❌ | Competitors allow edits — UX doesn't cover this state |
| 8 | Outstanding dues view per patient | ❌ | Not in UX — critical for collections |
| 9 | End-of-day collection summary | ❌ | Daily reconciliation is a front desk workflow — not mapped |
| 10 | Refund flow | ❌ | Edge case but needed — not in UX |

---

## Recommendations

### Do This (MVP)
- Resolve the advance deposit question — yes or no, decide and map the flow
- Add partial payment state (not just Paid/Pending — add "Partial")
- Add WhatsApp sharing to bill flow (same pattern as prescription sharing)
- Add bill print with clinic header
- Add discount field (simple % or flat amount)

### Do This (Post-MVP)
- GST toggle for registered clinics
- Outstanding dues view per patient
- End-of-day collection summary (feeds into Reports module)
- Refund flow

### What Happens If You Do
- Bills module covers real clinic workflows end-to-end
- Partial payment tracking reduces revenue leakage for clinics
- WhatsApp sharing makes bill delivery instant — no printing needed for most patients
- Daily summary gives front desk closure — end of shift is clean

### What Happens If You Don't
- Clinics track outstanding dues in a separate Excel — Docodile becomes partial
- Partial payments are marked as "Pending" forever — data is inaccurate
- No print = some patient demographics (older patients) are underserved
- Without daily summary, front desk has no reconciliation tool — they'll ask for it immediately

---

## Status
- [ ] Gap analysis reviewed by product team
- [ ] Gaps prioritized for design
- [ ] UX updated to reflect missing flows
