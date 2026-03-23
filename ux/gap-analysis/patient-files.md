# UX Gap Analysis — Patient Files Module
**Docodile EMR | Croc AI Co-founder**
**Date:** 2026-03-23

---

## How This Was Made

Cross-referenced:
- Docodile's own FigJam research (Competitor Analysis, UX flows, sticky notes)
- Current Docodile Design System screens
- EMR UX best practices: Nielsen Norman Group, Baymard Institute, HIMSS usability guidelines
- Real-world EMR benchmarks: Elation Health, Practice Fusion, Epic, Zoho Health

---

## Module Scope: Patient Files

The Patient Files module is where a doctor or staff member views everything about a patient — their history, past visits, prescriptions, uploaded documents, vitals, and payment/case records. It is the **single source of truth for a patient**.

---

## GAP 1 — No Visible Allergy & Chronic Condition Banner

### What the Research Says
Your FigJam notes focus on collecting: name, mobile, DOB, gender, case type, fees, payment. No mention of allergy or chronic condition tagging.

### What Best Practice Says
Nielsen's "Recognition over Recall" + HIMSS patient safety guidelines:
> Critical patient info (allergies, chronic conditions, active medications) must be **always visible** at the top of the patient file — not buried in a tab.

Epic, Elation, and Practice Fusion all have a persistent "alert banner" at the top of every patient file showing allergies and chronic flags.

### The Gap
No allergy or chronic condition banner is planned or visible in the current research/design.

### What Should Change
- Add a persistent top banner on the patient file showing:
  - Known allergies (with severity tag: mild / moderate / severe)
  - Active chronic conditions (e.g., Diabetic, Hypertensive)
  - Current active medications
- This banner should always be visible, even when scrolling through tabs.

### If We Do This
- Doctors can prescribe safely without switching tabs.
- Reduces medication error risk — critical in any medico-legal context.
- Positions Docodile as a clinically serious product, not just a scheduling tool.

### If We Don't Do This
- Prescription errors are possible when a doctor doesn't recall allergies.
- In India's growing medico-legal environment, this is a liability.
- Doctors will find the product feels "shallow" vs. competitors like Elation.

---

## GAP 2 — Patient Visit History Has No Timeline View

### What the Research Says
The research notes capture appointment booking flows and prescription pads, but the "Patient Files" section doesn't specify how past visits are displayed. The current pattern seems to be a list.

### What Best Practice Says
Baymard and NN/g research on medical record UX:
> A chronological **timeline view** significantly reduces cognitive load when scanning past visits. Doctors can instantly see "last 3 visits were for the same complaint" — a clinical red flag.

### The Gap
No timeline view exists. Past visits are likely a flat list (based on the design pattern visible in the UX research images).

### What Should Change
- Add a visit timeline on the patient file sidebar or main content area.
- Each timeline entry shows: date, doctor name, complaint/reason, case type.
- Clicking expands to show full consultation details / prescription.
- Filter by: date range, doctor, case type.

### If We Do This
- Doctors get clinical context in 2 seconds instead of scrolling through records.
- Repeat complaints become immediately visible — enabling better care.
- Feels like a proper EMR, not just an appointment log.

### If We Don't Do This
- Doctors waste time hunting for previous consultation details.
- The product feels like a patient list, not a patient record system.
- Higher churn risk for doctor-heavy users (the primary target).

---

## GAP 3 — No Document / File Upload on Patient Profile

### What the Research Says
FigJam sticky: "image or files uploading" — mentioned under Prescription Pad as a future idea. Not explicitly tied to Patient Files.

### What Best Practice Says
Healthcare UX research (KLAS, HIMSS):
> Clinics routinely attach: lab reports, X-rays, referral letters, consent forms, insurance docs to patient files. If they can't do it inside the EMR, they use WhatsApp — breaking the audit trail.

### The Gap
No file upload / document management is designed for the Patient Files module.

### What Should Change
- Add a "Documents" tab on the patient file.
- Allow upload of: PDF, JPG/PNG, DICOM (future).
- Show file name, upload date, uploaded by.
- Allow download + delete.
- Add a "type" tag: Lab Report, X-Ray, Prescription, Consent, Insurance, Other.

### If We Do This
- Clinics stop using WhatsApp to share patient files.
- Complete patient record is inside Docodile — stickiness goes way up.
- Opens a paid tier opportunity: "unlimited file storage" as a premium feature.

### If We Don't Do This
- Clinics use a mix of Docodile + WhatsApp + Google Drive — fragmented workflow.
- Patient files are incomplete. Trust in the product drops.
- Missed major differentiator vs. paper-based clinics they're replacing.

---

## GAP 4 — Search & Filter on Patient List is Underspecified

### What the Research Says
FigJam note: "Search existing patient through mobile no, name or ID." Good start.

### What Best Practice Says
NN/g and Baymard on search UX in clinical tools:
> Healthcare workers search patients under time pressure (busy OPD). Search must support fuzzy matching, partial inputs, and return results in < 200ms. Filtering by last visit date, doctor, and case type is equally important for administrative staff.

### The Gap
Search is specified but filters are missing. No mention of:
- Filter by last visit date range
- Filter by assigned doctor
- Filter by case type (new/review)
- Filter by payment status (pending/paid)
- Sort options

### What Should Change
- Search bar with: name, mobile, patient ID (fuzzy match).
- Filter panel (collapsible): last visit date range, doctor, case type, payment status.
- Sort by: last visit (default), name A-Z, registration date.
- Show result count: "Showing 24 of 138 patients".

### If We Do This
- Front desk staff can instantly pull up "all patients with pending payments" or "all patients seen by Dr. X this month."
- Reduces manual cross-checking significantly.
- Makes admin reporting easy without a separate "reports" module.

### If We Don't Do This
- Staff scroll through 500+ patient cards to find someone.
- Common complaint in all EMR usability studies — a top frustration driver.
- Leads to staff abandoning the module and using WhatsApp groups to track patients.

---

## GAP 5 — No Vitals Tracking / History

### What the Research Says
No mention of vitals in the Patient Files research or FigJam notes.

### What Best Practice Says
Clinical UX research (KLAS 2024, HIMSS):
> Vitals (BP, weight, sugar, SpO2, temperature) are captured at nearly every consultation. Showing a trend graph for repeat patients (e.g., BP over 6 months) is a high-value, low-effort feature. Dermatology clinics use weight/BMI trends.

### The Gap
Vitals are not planned for Patient Files at all.

### What Should Change
- Add a "Vitals" section on the patient file (below the allergy banner or in a tab).
- Allow staff to log vitals per visit: BP, weight, height, BMI, temperature, SpO2, sugar.
- Show the last recorded values prominently.
- Show a mini trend graph for key vitals for repeat patients (Phase 2).

### If We Do This
- Dermatology / GP / diabetic clinics find immediate value.
- Creates longitudinal data per patient — a core EMR value prop.
- Doctors don't need a separate vitals notebook or Excel sheet.

### If We Don't Do This
- Docodile is only a "booking + prescription" tool, not a real EMR.
- Clinics that want vitals (majority of GPs, dermatologists) will look elsewhere.
- Missed positioning: "Complete patient record" vs. "just a scheduling app."

---

## GAP 6 — No Empty State / Onboarding State for New Patients

### What the Research Says
Not addressed in the research.

### What Best Practice Says
NN/g Empty States research:
> An empty patient file (new patient) must guide the doctor/staff on what to do next. "No records yet" with no action is a dead end. Empty states should always include a primary CTA.

### The Gap
No empty state design for when a patient has no visit history, no files, no vitals.

### What Should Change
- Design a clear empty state for new patient files showing:
  - "No visits yet — Book their first appointment"
  - "No documents — Upload a file"
  - "No vitals recorded — Add vitals"
- Each empty state section has a clear CTA.

### If We Do This
- New patient onboarding flow feels guided, not abandoned.
- Reduces confusion for front desk staff adding patients manually.

### If We Don't Do This
- Staff see blank screens and assume something is broken.
- Increases support tickets and perceived product quality drops.

---

## GAP 7 — No Role-Based View of Patient Files

### What the Research Says
FigJam clearly defines roles: Owner, Doctor, Front Desk. Each has different module access. But Patient Files UX is not differentiated by role.

### What Best Practice Says
HIPAA Minimum Necessary Standard + role-based EMR UX:
> Front desk staff should NOT see clinical notes or prescription details. They should see: name, contact, appointment history, payment status. Doctors see everything. Role-based views reduce cognitive overload AND ensure compliance.

### The Gap
The current Patient Files design does not account for role-based views. A front desk staff member likely sees the same screen as a doctor.

### What Should Change
- Doctor view: Full patient file — allergy banner, vitals, visit history with clinical notes, prescriptions, documents.
- Front desk view: Patient demographics, appointment history, payment status, document upload only.
- Owner view: Same as doctor + financial summary per patient.

### If We Do This
- HIPAA/data minimization compliance from day one.
- Front desk staff are not overwhelmed by clinical data they can't use.
- Doctors feel their clinical notes are protected.

### If We Don't Do This
- HIPAA violation risk — front desk seeing clinical notes is a compliance problem.
- Even in India (DPDP Act compliance) — patient data minimization is becoming mandatory.
- Clinic owners will push back when they realize staff see patient diagnoses.

---

## GAP 8 — No Patient Communication Trail

### What the Research Says
FigJam mentions: "WhatsApp notification, Prescription: Send to WhatsApp." Communication is planned but not tied to the patient file.

### What Best Practice Says
NN/g Communication Visibility:
> Every WhatsApp message, appointment reminder, or prescription sent to a patient should be logged in their file. Staff need to know "was this patient notified?" without asking each other.

### The Gap
Communication (WhatsApp sends, reminders) is not logged or visible in the Patient Files module.

### What Should Change
- Add a "Communications" or "Activity" tab on the patient file.
- Log: appointment reminders sent, prescriptions sent via WhatsApp, any notes added by staff.
- Show: timestamp, sent by, channel (WhatsApp/SMS), status (delivered/read if possible).

### If We Do This
- Staff coordination improves — no double-sending reminders.
- Clinic has proof of communication for medico-legal purposes.
- Feels like a complete practice management system.

### If We Don't Do This
- Staff call patients twice by mistake ("did you send the reminder?" "I thought you did").
- No audit trail for communications — a risk in dispute situations.

---

## PRIORITY MATRIX

| Gap | Impact | Effort | Priority |
|-----|--------|--------|----------|
| GAP 1 — Allergy Banner | 🔴 Critical | Low | P0 |
| GAP 2 — Timeline View | 🔴 High | Medium | P0 |
| GAP 3 — Document Upload | 🔴 High | Medium | P0 |
| GAP 4 — Search & Filter | 🟠 High | Low | P1 |
| GAP 7 — Role-Based View | 🔴 Critical | Medium | P1 |
| GAP 5 — Vitals Tracking | 🟠 Medium | Medium | P1 |
| GAP 6 — Empty States | 🟡 Medium | Low | P2 |
| GAP 8 — Communication Trail | 🟡 Medium | Medium | P2 |

---

## Summary: What This Module Needs to Become

Right now the Patient Files module is a **patient list with appointment history**.

To be a real EMR patient file, it needs to become:
> A complete longitudinal patient record — demographics + allergy banner + vitals + visit timeline + documents + communication log — with role-based access control.

That shift from "appointment history" to "complete patient record" is what separates a scheduling tool from a real EMR — and it's what Docodile's positioning promises.

---

*Saved by Croc — AI Co-founder, Docodile*
*Based on: Docodile FigJam Research + Nielsen Norman Group + Baymard Institute + HIMSS EMR Usability Guidelines + KLAS 2024 Research*
