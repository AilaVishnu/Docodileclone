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

## Gap Analysis

---

### GAP 1 — No Cancellation or No-Show State

**What the Research Says:** Competitors explicitly handle cancellations and no-show marking as distinct states. Clinics currently mark no-shows in notebooks alongside the software.

**What Should Change:** Add cancellation and no-show states to every appointment. Allow front desk to mark a patient as "No-Show" after a missed slot and "Cancelled" with an optional reason field.

**What Happens If You Do This:**
Front desk handles real-world edge cases cleanly inside Docodile. No-show data feeds into the Reports module for analytics. Cancelled slots can be offered to walk-ins, keeping the queue accurate.

**What Happens If You Don't:**
Front desk creates duplicate entries or leaves appointments stuck as "Pending" forever. Appointment analytics are meaningless. The queue becomes unreliable during a busy OPD.

---

### GAP 2 — No Dynamic Queue Reordering

**What the Research Says:** FigJam sticky explicitly calls this out — "dynamic queue management." Competitors allow drag-to-reorder in the queue view.

**What Should Change:** Allow drag-to-reorder of patients in the current-day appointment queue. Useful when a patient arrives late, a priority case walks in, or a doctor requests a swap.

**What Happens If You Do This:**
Front desk manages real-world clinic chaos without workarounds. Queue reflects actual patient order at any point in the day. Doctors feel in control of their schedule.

**What Happens If You Don't:**
Queue is rigid and stops reflecting reality. Front desk resorts to calling names manually. The queue display becomes unreliable and stops being used after the first week.

---

### GAP 3 — No Advance Deposit at Booking

**What the Research Says:** FigJam sticky explicitly flags this — "advance deposits?" — meaning the team identified this from direct user research.

**What Should Change:** Add an "Advance Deposit" option at appointment booking. Link it to the patient's billing ledger and show the remaining balance at the time of billing.

**What Happens If You Do This:**
Clinics collecting deposits for procedures (surgeries, dental, skin treatments) can track this inside Docodile. Reduces no-show rates — patients who pay upfront show up. Revenue data is accurate.

**What Happens If You Don't:**
Deposits are managed in a notebook next to your software. Financial data is split across two systems. Revenue leakage on advance collections.

---

### GAP 4 — Payment Status Cannot Be Updated Post-Booking

**What the Research Says:** Top frustration from competitor reviews — users need to update fees and payment status after an appointment is already saved.

**What Should Change:** Allow front desk to update payment status and collected amount after the appointment has been booked, not just at creation time.

**What Happens If You Do This:**
Payment tracking reflects reality. A patient who pays at the end of their visit (not upfront) is marked correctly. Financial reports are accurate and trustworthy.

**What Happens If You Don't:**
Payments that happen post-booking get marked wrong or not at all. The pending payments list is unreliable. Clinic loses visibility into who has actually paid.

---

### GAP 5 — No Multi-Doctor Slot Visibility

**What the Research Says:** For multi-doctor clinics, competitors show which doctor's slot is being booked. Without this, appointments get assigned incorrectly.

**What Should Change:** When booking in a multi-doctor clinic, show available slots per doctor. Allow selection of a specific doctor at booking time.

**What Happens If You Do This:**
Multi-doctor clinics can use Docodile as their primary scheduling tool. Each doctor's queue is separate, accurate, and independently manageable.

**What Happens If You Don't:**
Multi-doctor clinics — a major growth segment — can't use the scheduling module properly. They'll manage doctor-specific queues on paper alongside Docodile. Churn risk.

---

### GAP 6 — No Repeat Appointment Booking for Chronic Patients

**What the Research Says:** Not in the current UX. Critical for review-type appointments — common in dermatology, physiotherapy, and chronic disease management.

**What Should Change:** A "Book Follow-up" shortcut on any completed appointment that pre-fills patient details, sets case type to "Review," and lets you pick the next available slot.

**What Happens If You Do This:**
Booking a repeat appointment is 2 taps instead of re-entering all patient details. Doctors and front desk love this for high-frequency review patients. Speeds up end-of-consultation flow.

**What Happens If You Don't:**
Every follow-up is booked from scratch. Slow, error-prone. Front desk manually searches and re-enters returning patient details every single time.

---

### GAP 7 — No Slot Blocking (Doctor Unavailability)

**What the Research Says:** Competitor feature — doctors can block lunch hours, leave days, and non-clinic hours so those slots don't appear as bookable.

**What Should Change:** Allow doctors or admins to block specific time slots or full days. Blocked slots should not appear as available during booking.

**What Happens If You Do This:**
No accidental bookings when the doctor is unavailable. Front desk doesn't need to manually reject or reschedule patients who booked wrong slots. Scheduling feels reliable.

**What Happens If You Don't:**
Appointments get booked during lunch or when the doctor is on leave. Front desk has to call patients and reschedule — a terrible experience that damages clinic trust.

---

## Priority Matrix

| Gap | Priority | Effort |
|-----|----------|--------|
| Cancellation / No-show state | 🔴 P0 | Low |
| Payment status post-booking edit | 🔴 P0 | Low |
| Multi-doctor slot visibility | 🔴 P0 | Medium |
| Dynamic queue reordering | 🟠 P1 | Medium |
| Advance deposit at booking | 🟠 P1 | Medium |
| Repeat appointment booking | 🟠 P1 | Low |
| Slot blocking | 🟠 P1 | Medium |

---

## Status
- [ ] Gap analysis reviewed by product team
- [ ] Gaps prioritized for design
- [ ] UX updated to reflect missing flows

---

*Analysis by Croc 🐊 | Docodile AI Co-Founder*
