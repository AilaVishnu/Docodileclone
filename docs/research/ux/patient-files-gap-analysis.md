# Patient Files Module — UX Gap Analysis

> Source: Docodile Research Study (FigJam) — UX Page, Patient Files Section
> Compared against: Competitor Analysis, Nielsen Norman Group, Baymard Institute, HIMSS, Elation/Epic/Practice Fusion

---

## Research Findings (Competitor Analysis)

### Features Competitors Have
- Persistent allergy & chronic condition banner at top of patient file
- Chronological visit timeline with expandable details
- Document/file upload with tagging (Lab Report, X-Ray, Consent, Insurance)
- Advanced patient search with filters (date range, doctor, case type, payment status)
- Vitals tracking per visit with trend graphs for repeat patients
- Role-based views (front desk vs. doctor vs. owner)
- Communication/activity log showing reminders sent, prescriptions shared

### User Pain Points from Reviews
- Cannot see allergies without clicking into a separate tab
- No way to view all past visits at a glance
- Lab reports and documents stored outside EMR (WhatsApp, Google Drive)
- Searching 500+ patients without filters is frustrating
- Front desk sees clinical data they don't need

---

## Research UX (Docodile FigJam — Patient Files Flow)

### What the UX Covers
- Patient demographics (name, mobile, DOB, gender)
- Appointment history linked to patient
- Case type tracking (consultation, review)
- Payment status tracking
- Search by mobile, name, ID

### UX Flows Mapped
- [ ] New patient registration
- [ ] Existing patient lookup
- [ ] View patient details
- [ ] View appointment history

---

## Gap Analysis

---

### GAP 1 — No Allergy & Chronic Condition Banner (P0)

**What the Research Says:** Research focuses on demographics only — no clinical alerts are planned or designed.

**What Should Change:** Persistent banner at the top of every patient file showing: allergies with severity tags (mild/moderate/severe), active chronic conditions, and current active medications. Always visible, even when scrolling through tabs.

**What Happens If You Do This:**
Doctors prescribe safely without switching tabs to check allergies. Positions Docodile as clinically serious — not just a scheduling tool. Reduces medication error risk which is critical in any medico-legal context.

**What Happens If You Don't:**
Medication error risk is real. In India's growing medico-legal environment this is a liability. Doctors will feel the product is shallow compared to Elation, Practice Fusion, and even basic competitors.

---

### GAP 2 — No Visit Timeline View (P0)

**What the Research Says:** Past visits appear to be a flat list — no chronological timeline with expand/collapse.

**What Should Change:** Chronological timeline of all past visits showing: date, doctor name, complaint/reason, case type. Clicking a visit expands to show full consultation details and prescription. Filter by: date range, doctor, case type.

**What Happens If You Do This:**
Doctor sees clinical context in 2 seconds. Repeat complaints are immediately visible — a clinical red flag that enables better care. Feels like a proper EMR, not an appointment log.

**What Happens If You Don't:**
Doctors waste time hunting through records. The product feels like a patient list with some appointment history — not a real EMR. High churn risk for doctor-heavy users.

---

### GAP 3 — No Document / File Upload (P0)

**What the Research Says:** FigJam mentions file uploading as a future idea under Prescription Pad — not tied to Patient Files.

**What Should Change:** A "Documents" tab on the patient file. Upload: PDF, JPG/PNG. Tag by type: Lab Report, X-Ray, Prescription, Consent, Insurance, Other. Allow download and delete. Show file name, upload date, uploaded by.

**What Happens If You Do This:**
Clinics stop using WhatsApp to share patient files. The complete patient record lives inside Docodile — stickiness goes way up. Opens a premium storage tier as a paid feature.

**What Happens If You Don't:**
Clinics use Docodile + WhatsApp + Google Drive in parallel — a fragmented workflow. Patient files are incomplete. Trust in the product as a real EMR drops.

---

### GAP 4 — Search & Filter is Underspecified (P1)

**What the Research Says:** Search by mobile/name/ID is specified. No filters for date range, doctor, payment status, or case type.

**What Should Change:** Filter panel (collapsible): last visit date range, assigned doctor, case type, payment status. Sort by: last visit (default), name A-Z, registration date. Show result count: "Showing 24 of 138 patients."

**What Happens If You Do This:**
Front desk pulls "all patients with pending payments" or "all patients seen by Dr. X this month" instantly. No manual cross-checking. Admin reporting works without a separate reports module.

**What Happens If You Don't:**
Staff scroll through 500+ patient cards to find someone. This is the #1 frustration in every EMR usability study. Leads to staff abandoning the module and reverting to WhatsApp groups.

---

### GAP 5 — No Vitals Tracking (P1)

**What the Research Says:** Not mentioned anywhere in Patient Files research or FigJam.

**What Should Change:** A "Vitals" section on the patient file. Log per visit: BP, weight, height, BMI, temperature, SpO2, blood sugar. Show last recorded values prominently. Trend graph for key vitals for repeat patients (Phase 2).

**What Happens If You Do This:**
GPs, dermatologists, and diabetic clinics find immediate value. Creates longitudinal data per patient — a core EMR value proposition. Doctors don't need a separate vitals notebook or Excel sheet.

**What Happens If You Don't:**
Docodile stays a "booking + prescription" tool. Clinics that need vitals — the majority of GPs and dermatologists — will look elsewhere. Missed positioning: "Complete patient record" vs. "just a scheduling app."

---

### GAP 6 — No Empty States for New Patients (P2)

**What the Research Says:** Not addressed in the research.

**What Should Change:** Designed empty states for each section of a new patient file — "No visits yet — Book their first appointment", "No documents — Upload a file", "No vitals recorded — Add vitals" — each with a clear CTA button.

**What Happens If You Do This:**
New patient onboarding feels guided, not abandoned. Reduces confusion for front desk staff adding patients for the first time. Reduces support tickets on "why is this blank?"

**What Happens If You Don't:**
Staff see blank screens and assume something is broken. Perceived product quality drops. Increases support overhead.

---

### GAP 7 — No Role-Based View (P1)

**What the Research Says:** Roles are defined (Owner, Doctor, Front Desk) but Patient Files shows the same screen to everyone.

**What Should Change:**
- Front Desk view: demographics, appointment history, payment status, document upload only
- Doctor view: full patient file — allergy banner, vitals, visit history with clinical notes, prescriptions, documents
- Owner view: same as doctor + financial summary per patient

**What Happens If You Do This:**
HIPAA and DPDP Act compliance from day one. Front desk staff are not overwhelmed by clinical data they can't use. Doctors feel their clinical notes are protected.

**What Happens If You Don't:**
Front desk seeing diagnoses and clinical notes is a compliance violation. In India's DPDP Act environment, data minimization is becoming mandatory. Clinic owners will push back the moment they realize staff can see patient diagnoses.

---

### GAP 8 — No Communication Trail (P2)

**What the Research Says:** WhatsApp sends and reminders are planned but not logged anywhere in the patient file.

**What Should Change:** A "Communications" tab on the patient file logging: appointment reminders sent, prescriptions shared via WhatsApp, notes added by staff. Show timestamp, sent by, channel, and delivery status.

**What Happens If You Do This:**
Staff coordination improves — no double-sending reminders. Clinic has proof of communication for medico-legal purposes. Feels like a complete practice management system.

**What Happens If You Don't:**
"Did you remind them?" "I thought you did." Zero audit trail for communications — a real risk in dispute situations. Staff communication overhead stays high.

---

## Priority Matrix

| Gap | Priority | Effort |
|-----|----------|--------|
| Allergy Banner | 🔴 P0 | Low |
| Visit Timeline | 🔴 P0 | Medium |
| Document Upload | 🔴 P0 | Medium |
| Search & Filter | 🟠 P1 | Low |
| Role-Based Views | 🟠 P1 | Medium |
| Vitals Tracking | 🟠 P1 | Medium |
| Empty States | 🟡 P2 | Low |
| Communication Trail | 🟡 P2 | Medium |

---

## Summary

**Current state:** Patient Files = patient list with appointment history

**Target state:** Patient Files = complete longitudinal patient record — demographics + allergy banner + vitals + visit timeline + documents + communication log + role-based access

This shift is what separates a scheduling tool from a real EMR.

---

## Status
- [ ] Gap analysis reviewed by product team
- [ ] Gaps prioritized for design
- [ ] UX updated to reflect missing flows

---

*Analysis by Croc 🐊 | Docodile AI Co-Founder*
