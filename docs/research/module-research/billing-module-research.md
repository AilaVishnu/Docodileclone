# 🔍 Billing Module — Research & Recommendations

## 🔍 Observations

- The FigJam board shows **6 competitors** with varying billing approaches — from legacy UIs to modern SaaS patterns
- Competitor 1 is most documented with multiple entry points: Bills → View bill, Appointments → View bill, Patient files → View bill
- Users access billing from **3 different places** — this is a key UX pattern to replicate
- Competitor 4 has unique **OTC (Over-the-Counter) Sale** functionality — indicates clinics may need POS/retail sales separate from consultation billing
- Sticky notes highlight: treatments/services (chemical peel, etc.), payment status, payment mode, advance deposits, WhatsApp integration
- Billing is **post-consultation** — services added after the visit, not before
- Indian market heavily relies on WhatsApp for bill sharing — competitors likely don't have this native
- Refund workflow exists in Competitor 1 — we should support this too

---

## ❓ Questions / Gaps

1. **OTC vs Consultation billing** — Do clinics sell products (creams, medicines) separately from consultation fees? Competitor 4 suggests yes
2. **Advance deposits** — How do we handle prepayments for treatments like chemical peels or laser sessions?
3. **Split payments** — Can a patient pay part cash, part UPI? Competitors seem weak here
4. **Tax handling** — GST on medicines vs consultation (different rates)?
5. **Discount policies** — Who can apply discounts? Doctor only? Front desk too? Any limits?
6. **Bill editing** — Can bills be edited after creation? What's the audit trail?
7. **Refund workflow** — How do we handle refunds? Partial refunds? Cash vs digital refund?
8. **Multi-doctor billing** — In a multi-doctor clinic, how is revenue attributed per doctor?
9. **Insurance claims** — Any insurance/TPA integration needed for MVP?
10. **Bill numbering** — Auto-generated sequential bill numbers? Clinic-wise prefix?

---

## 💡 UX Insights

1. **Multiple entry points** — Don't force users to go to a "Bills" page; let them create/view bills from Appointments and Patient Files too
2. **Auto-populate from consultation** — Bill should pre-fill with consultation fee + any treatments/tests added during the visit
3. **One-tap payment capture** — Payment mode selection should be dead simple: Cash | UPI | Card — one tap
4. **Visual payment status** — Use color coding: Green (paid), Yellow (partial), Red (unpaid)
5. **WhatsApp sharing is critical** — "Send bill to WhatsApp" should be one click, not buried in a menu
6. **Print preview before print** — Doctors want to see what patients will receive
7. **Itemized display** — Show line items with quantity × price, not just totals
8. **Alert for unpaid bills** — Surface unpaid/overdue bills prominently in patient summary

---

## 📊 Competitor Feature Matrix

| Feature | Comp 1 | Comp 2 | Comp 3 | Comp 4 | Comp 5 | Comp 6 (Semble) |
|---------|--------|--------|--------|--------|--------|-----------------|
| Multiple entry points | ✅ (3) | ❌ (1) | ✅ | ✅ | ❓ | ✅ |
| Refund workflow | ✅ | ❌ | ❓ | ❓ | ❓ | ❓ |
| OTC/POS sales | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Save & Preview | ✅ | ❌ | ❓ | ❓ | ❓ | ✅ |
| Print support | ✅ | ❌ | ❓ | ✅ | ❓ | ✅ |
| Payment status alerts | ❌ | ❌ | ❓ | ❓ | ✅ | ❓ |
| Modern UI | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Mobile support | ❓ | ❌ | ❓ | ❓ | ❌ | ❌ |

---

## 🐊 Croc's MVP Recommendation

Billing is the **revenue capture point** — if it's clunky, clinics lose money or switch to paper. Keep it fast, simple, and WhatsApp-native.

### ✅ Include in MVP
- Bill creation linked to consultation (auto-populate services)
- Line items: Consultation fee + treatments + lab tests (qty × price)
- Payment mode: Cash | UPI | Card
- Payment status: Paid | Unpaid | Partial
- Bill preview before saving
- Print bill
- WhatsApp bill sharing (PDF or formatted message)
- Basic refund (full refund only for MVP)
- Bills list with search/filter
- Access from: Standalone Bills page + Appointments + Patient Files

### ⏳ Defer to Phase 2
- OTC/POS sales (retail product sales)
- Advance deposits tracking
- Split payments (part cash, part digital)
- Partial refunds
- GST handling (tax-inclusive vs separate line)
- Insurance/TPA integration
- Multi-doctor revenue attribution
- Discount approval workflow

---

## 📋 Billing Flow

```
Consultation completed
    ↓
Bill auto-generated
  → Consultation fee (from clinic settings)
  → Treatments/services added during visit
  → Lab tests requested
    ↓
Front desk reviews
  → Add/edit line items
  → Apply discount (if applicable)
  → Select payment mode
    ↓
Payment captured
  → Mark as Paid/Partial/Unpaid
  → Generate bill number (auto)
    ↓
Actions
  → Print bill
  → WhatsApp to patient
  → View in Patient File
  → Process refund (if needed)
```

---

*Last updated by Croc 🐊 on 2026-03-17*
