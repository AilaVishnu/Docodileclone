# 🔍 Billing Module — Research & Recommendations

## 🔍 Observations

- Billing is positioned as a **post-consultation action** — it is triggered after the doctor finishes the visit, not as a standalone module
- Research board contains two dedicated billing sections: one in the UX flows page and one in a dedicated Page 3 deep-dive
- Competitor screenshots show billing tied directly to the appointment/consultation — bill auto-populates with the consultation fee and any services added during the visit
- Services are multi-type: consultation fee, treatment charges (e.g. chemical peel, acne/pigmentation), lab tests — all on one bill
- Payment status (paid / unpaid / partial) and payment mode (cash / digital) are core fields tracked on every bill
- WhatsApp receipt sharing is a recurring theme — competitors largely do not support this natively, making it a Docodile opportunity
- Advance deposits are an open question flagged in the research — prepayment flows are underserved across competitors
- Billing is closely linked to patient files — invoices must be tied to a patient's UHID for history tracking

---

## ❓ Questions / Gaps

1. **Bill trigger** — Is billing initiated by the doctor, the front desk, or both? Who "owns" the bill?
2. **Advance deposits** — Do we support collecting a deposit at appointment booking and adjusting it at billing time?
3. **Partial payments** — Can a patient pay part now, part later? How is the outstanding balance tracked?
4. **Split payment modes** — Can a single bill be settled with part cash and part digital?
5. **Bill editing** — Can a bill be edited after it's marked paid? Who has permission to edit/void a bill?
6. **GST / Tax** — Do we need to support GST on services for clinics that are GST-registered?
7. **Insurance billing** — Is third-party insurance billing in scope, or are we cash/self-pay only for MVP?
8. **Refunds** — What happens when a service is cancelled — how are refunds handled?
9. **Bill templates** — Should clinics be able to configure default services and prices (a "rate card") for quick billing?
10. **Multi-doctor clinics** — In a clinic with multiple doctors, can a bill include services from different doctors?
11. **WhatsApp receipt** — Send bill/receipt via WhatsApp — how does this interact with payment confirmation?
12. **Reports tie-in** — Billing data feeds into the revenue/business dashboard — what fields are needed for reporting?

---

## 💡 UX Insights

1. **One-tap billing from consultation** — After the doctor closes a visit, the front desk should be one tap away from a pre-filled bill — no re-entering data
2. **Rate card / service picker** — Don't make staff type service names and prices every time; a configurable rate card with quick-add makes billing fast and error-free
3. **Payment status at a glance** — The bill list view must show paid / unpaid / partial with clear color-coded badges — front desks need to chase dues quickly
4. **Print + WhatsApp** — Two primary bill sharing actions: print a receipt and send via WhatsApp — both should be one tap from the bill view
5. **Cash vs digital toggle** — Payment mode should be a prominent, easy toggle — most Indian clinic front desks handle a mix of both daily
6. **Bill history on patient file** — All bills for a patient should be surfaced in their patient file timeline — the billing module and patient file must be tightly linked
7. **Pending dues dashboard widget** — A daily "pending dues" count on the front desk dashboard is high-value — helps close the loop on unpaid visits
8. **Mobile-friendly billing** — Front desk staff in smaller clinics often use tablets or phones; billing UI must work well on smaller screens

---

## 🐊 Croc's MVP Recommendation

Billing is the **revenue nerve of the clinic**. Get it wrong and front desk staff will work around it with pen and paper — which kills adoption. It needs to be fast, obvious, and flexible on payment modes.

### ✅ Include in MVP
- Bill creation linked to a consultation (auto-populated with consultation fee)
- Add multiple services / line items per bill (from a configurable rate card)
- Payment status: paid / unpaid / partial
- Payment mode: cash, digital (UPI / card)
- Print receipt
- WhatsApp receipt sharing
- Bill history on patient file timeline
- Pending dues view for front desk

### ⏳ Defer to Phase 2
- Advance deposit / prepayment flow
- Split payment across multiple modes on one bill
- GST / tax configuration
- Insurance / TPA billing
- Refund and void workflows
- Multi-doctor bill splitting
- Revenue analytics and business reports (beyond basic dashboard)
- Bill template customization (branded receipt, clinic logo)

---

## 📋 Billing Flow

```
Consultation ends (doctor closes visit)
    ↓
Front desk opens Bill screen
  → Patient name + UHID auto-linked
  → Consultation fee pre-filled from appointment
    ↓
Add services (optional)
  → Pick from rate card (treatments, lab tests, etc.)
  → Each line item: name | qty | unit price | total
    ↓
Bill summary
  → Subtotal | Tax (if applicable) | Grand Total
  → Payment status: Paid / Unpaid / Partial
  → Payment mode: Cash | Digital
    ↓
Settle bill
  → Mark as Paid
  → Generate receipt
    ↓
Share receipt
  → Print
  → Send via WhatsApp
    ↓
Bill saved to patient file timeline
  → Visible in patient history
  → Reflected in front desk pending dues dashboard
```

---

## 🔗 Figma Research Source
- **FigJam Board:** [Docodile Research Study](https://www.figma.com/board/x3MXMqnwuNMNXHiYFEWxoL/Docodile-Research-Study)
- **Bills — UX flows section:** node `526-2432`
- **Bills — Deep dive (Page 3):** node `748-3688`

---

*Last updated by Croc* 🐊 *on 2026-03-17*
