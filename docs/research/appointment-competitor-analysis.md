# Appointment Module — Competitor Research & UX Insights

> Studied from FigJam board: [Docodile Research Study](https://www.figma.com/board/x3MXMqnwuNMNXHiYFEWxoL/Docodile-Research-Study?node-id=192-937)
> Section: **Front Desk (Adding Patients, Appointment, Dashboard)**
> Date: 2026-03-13

---

## 🔍 Observations

### Dashboard & Queue View
- Competitors show a **daily queue/list view** as the default — not a calendar
- Appointment status is color-coded: waiting → in-consultation → done
- Patient token numbers are prominently displayed
- Appointment list shows: patient name, mobile, case type, fees, payment status in one row
- Date filter always visible at top — staff jump between days constantly

### Booking Flow
- New vs. Existing patient is the **first decision point** in every competitor
- Existing patient lookup done by **mobile number first** — mobile is the de facto patient ID in India
- Walk-in consultation is a distinct, faster flow from scheduled appointments
- Date + time slot selection comes *after* patient identification

### Patient Info Collected at Booking
- Name, mobile, DOB/age, gender
- Case type: **Consultation vs. Review** — critical for fee calculation
- Payment status (Paid/Pending) and Payment mode (Cash/Digital) captured upfront
- Fees entered at booking time, not just at billing

### Post-Consultation
- Competitors prompt: add services/treatments, billing, and next appointment
- Treatment tagging (e.g. "chemical peel for acne") tied to billing

### Notifications
- WhatsApp is the dominant notification channel — SMS is secondary
- Reminders before appointment; prescription shared via WhatsApp after

---

## ❓ Questions / Gaps

1. **Dynamic Queue vs. Fixed Slots** — Walk-in queue or time-slot booking? Big architectural decision.
2. **Who books appointments?** — Front desk only, or doctors/admins too?
3. **Review vs. Consultation fees** — Fixed per case type (set in Build Your Clinic) or manual each time?
4. **Payment capture timing** — At booking (upfront) or end of visit? Need a "pending" payment state?
5. **WhatsApp integration** — In MVP scope? Data model must be WhatsApp-ready regardless.
6. **Patient deduplication** — Same mobile entered twice → new patient or alert?
7. **Token/queue number** — Do we need a physical token number for waiting patients?
8. **Multi-doctor clinics** — Select which doctor at booking? Does `Appointment` model have a doctor FK?
9. **Cancellation & reschedule** — What happens when a patient no-shows?
10. **Services tab** — Part of appointment booking or separate setup step? (Admin only per board notes)

---

## 💡 UX Insights

1. **Speed is everything** — Booking flow must be completable in **under 60 seconds** for an existing patient.
2. **Mobile number = Patient ID** — Primary search field. Auto-suggest as they type.
3. **Walk-in = single prominent CTA** — Most common action. Big button on main screen.
4. **Queue view > Calendar view** — For MVP, lead with today's queue list. Calendar is a nice-to-have.
5. **Inline status updates** — Mark "Called In → In Consultation → Done" without leaving the queue view.
6. **Payment status as visual indicator** — Unpaid appointments visually distinct (red/orange tag).
7. **Case type drives fees automatically** — Selecting "Review" should auto-fill fee from clinic settings.
8. **WhatsApp confirmation as default** — Opt-out, not opt-in.
9. **Avoid modal hell** — Slide-in panel or inline form feels faster than full-page modals.
10. **Post-consultation prompt** — "Done — add billing / next appointment?" reduces drop-off in billing.

---

## 🐊 Croc's MVP Take

Competitors are functionally complete but UX-heavy — built for enterprise clinics with IT support.
**Our opportunity: a front desk receptionist with zero training can use Docodile on Day 1.**

Core loop to nail for MVP:
```
Walk-in CTA → Mobile lookup → Quick patient form → Case type + fees → Done
```
Everything else (calendar, tokens, multi-doctor) layers on top.

---

## 📋 Appointment Flow (from FigJam)

```
Add New Appointment
    ↓
Select date and time slot
    ↓
New Patient?                    Existing Patient?
    ↓                                 ↓
Collect:                        Search by:
- Name                          - Mobile no
- Mobile no                     - Name / ID
- DOB / Age / Gender
    ↓                                 ↓
Case type: Consultation / Review
Fees | Payment status | Payment mode (Cash / Digital)
    ↓
After Consultation
    → Add billing / Add new service / Next appointment

--- OR ---

Start Walk-in Consultation  ← separate fast-track flow
```

---

*Last updated by Croc 🐊 on 2026-03-13*
