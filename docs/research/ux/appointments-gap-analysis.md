# Appointments Module — UX Gap Analysis

> Source: Docodile Research Study (FigJam) — UX Page, Appointments Section  
> Compared against: Competitor Analysis (Competitor 1 + Doctecq)

---

## Research Findings (Competitor Analysis)

### Features Competitors Have
- Walk-in consultation flow (start immediately, no pre-booking needed)
- New patient vs. existing patient split at appointment creation
- Date + time slot selection
- Case type selection: Consultation, Review
- Fees + payment status at booking
- Payment mode: Cash, Digital
- Search existing patient by mobile number, name, or ID
- Appointment reminders via WhatsApp / SMS
- Dynamic queue management
- After-consultation billing (add treatment, service)
- Prescription send to WhatsApp after consultation

### User Pain Points from Reviews
- No way to differentiate walk-in vs. scheduled patients in the queue
- Appointment creation requires too many steps
- No reminder system — patients forget appointments
- Cannot update fees or payment status after booking is confirmed
- Queue reordering is not possible on mobile

---

## Research UX (Docodile FigJam — Appointments Flow)

### What the UX Covers
- New patient registration form (name, mobile, DOB/age, gender, case type, fees, payment status, payment mode)
- Existing patient search (by mobile, name, ID)
- Add new appointment → select date and time slot
- Start walk-in consultation directly
- After-consultation: add service/treatment, billing, payment status, payment mode
- WhatsApp reminder + prescription sharing post-consultation

### UX Flows Mapped
- [ ] Walk-in flow
- [ ] New appointment (new patient)
- [ ] New appointment (existing patient)
- [ ] Post-consultation billing
- [ ] Reminder trigger

---

## Gap Analysis — What Research Has, UX May Be Missing

| # | Feature from Research | In UX Flow? | Gap / Notes |
|---|---|---|---|
| 1 | Dynamic queue reordering | ❓ | Research sticky explicitly calls this out — UX flow unclear if drag-to-reorder is covered |
| 2 | Appointment cancellation + no-show marking | ❓ | Not visible in flow — common in competitor analysis |
| 3 | Advance deposit / partial payment at booking | ❓ | Research sticky says "advance deposits?" — not mapped in UX |
| 4 | Payment status update post-booking | ❓ | Competitors allow editing fees after appointment creation |
| 5 | Multi-doctor slot visibility | ❓ | For multi-doctor clinics — which doctor's slot is being booked? |
| 6 | Repeat appointment booking (for chronic patients) | ❌ | Not in research UX — important for review case types |
| 7 | Block/unblock time slots | ❌ | Competitor feature — doctor can block lunch hours, leave days |

---

## Recommendations

### Do This
- Map cancellation and no-show states explicitly in the flow
- Add queue reordering interaction to UX
- Include payment status edit after booking (not just at creation)
- Design multi-doctor slot view for clinics with more than one doctor

### What Happens If You Do
- Front desk can manage real-world edge cases without workarounds
- Queue management becomes a daily power feature
- Payment tracking improves cash collection for the clinic

### What Happens If You Don't
- Front desk creates duplicate entries to "fix" cancelled appointments
- Queue management is rigid — doesn't reflect real clinic chaos
- Docodile feels incomplete compared to competitors for multi-doctor clinics

---

## Status
- [ ] Gap analysis reviewed by product team
- [ ] Gaps prioritized for design
- [ ] UX updated to reflect missing flows
