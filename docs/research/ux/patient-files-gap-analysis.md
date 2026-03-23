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

## Gap Analysis — What Research Has, UX May Be Missing

| # | Feature from Research | In UX Flow? | Gap / Notes |
|---|---|---|---|
| 1 | Allergy & chronic condition banner | ❌ | Research focuses on demographics only — no clinical alerts |
| 2 | Visit timeline view | ❓ | Past visits as flat list — no chronological timeline with expand/collapse |
| 3 | Document/file upload | ❌ | FigJam mentions as future idea under Prescription Pad — not in Patient Files |
| 4 | Advanced search + filters | ❓ | Search by mobile/name/ID exists — no filters for date range, doctor, payment status |
| 5 | Vitals tracking | ❌ | Not mentioned in Patient Files research |
| 6 | Role-based views | ❌ | Roles defined (Owner/Doctor/Front Desk) but Patient Files shows same screen to all |
| 7 | Communication trail | ❌ | WhatsApp sends planned but not logged in patient file |
| 8 | Empty states for new patients | ❌ | No design for empty patient records |

---

## Recommendations

### P0 — Do This Now

**1. Add Allergy & Chronic Condition Banner**
- Persistent banner at top of every patient file
- Shows: allergies (with severity), chronic conditions, active medications
- Always visible, even when scrolling

*What Happens If You Do:* Doctors prescribe safely without tab-switching. Positions Docodile as clinically serious.

*What Happens If You Don't:* Medication error risk. Medico-legal liability. Doctors will feel the product is shallow vs. Elation.

**2. Add Visit Timeline View**
- Chronological timeline of all past visits
- Shows: date, doctor, complaint, case type
- Expandable per visit to show full details
- Filter by: date range, doctor, case type

*What Happens If You Do:* Doctor sees clinical context in 2 seconds. Repeat complaints visible = clinical red flag detection.

*What Happens If You Don't:* Doctors waste time hunting through records. Feels like appointment log, not EMR.

**3. Add Document Upload**
- Documents tab on patient file
- Upload: PDF, JPG/PNG
- Tag by type: Lab Report, X-Ray, Consent, Insurance, Other
- Download + delete capability

*What Happens If You Do:* Clinics stop using WhatsApp for files. Complete patient record inside Docodile. Opens premium storage tier.

*What Happens If You Don't:* Docodile + WhatsApp + Google Drive = fragmented workflow. Trust drops.

### P1 — Next Sprint

**4. Enhance Search & Filter**
- Filters: last visit date range, doctor, case type, payment status
- Sort by: last visit (default), name A-Z, registration date
- Show result count: "Showing 24 of 138 patients"

*What Happens If You Do:* Front desk pulls "all pending payments" instantly. No manual cross-checking.

*What Happens If You Don't:* Staff scroll 500+ patients. #1 frustration in every EMR usability study.

**5. Add Role-Based Views**
- Front Desk: demographics + appointments + payment status only
- Doctor: full clinical record (allergy banner, vitals, visits, prescriptions, documents)
- Owner: full record + financial summary

*What Happens If You Do:* HIPAA/DPDP compliance. Front desk not overwhelmed by clinical data.

*What Happens If You Don't:* Front desk seeing diagnoses = compliance violation. Clinic owners will push back.

**6. Add Vitals Tracking**
- Vitals section per patient: BP, weight, BMI, sugar, SpO2, temperature
- Logged per visit
- Trend graph for repeat patients (Phase 2)

*What Happens If You Do:* GPs, dermatologists, diabetic clinics find immediate value. Creates longitudinal data.

*What Happens If You Don't:* Docodile stays "booking + prescription" tool. Clinics wanting vitals go elsewhere.

### P2 — Soon

**7. Design Empty States**
- "No visits yet — Book their first appointment"
- "No documents — Upload a file"
- "No vitals recorded — Add vitals"
- Each with clear CTA

*What Happens If You Don't:* Staff see blank screens, think something's broken.

**8. Add Communication Trail**
- Activity/Comms tab logging: reminders sent, prescriptions shared, notes added
- Shows: timestamp, sent by, channel, status

*What Happens If You Don't:* "Did you remind them?" "I thought you did." + zero audit trail.

---

## Summary

**Current state:** Patient Files = patient list with appointment history

**Target state:** Patient Files = complete longitudinal patient record with:
- Demographics + allergy banner + vitals
- Visit timeline + prescriptions + documents
- Communication log + role-based access

This shift from "appointment history" to "complete patient record" separates a scheduling tool from a real EMR.

---

## Status
- [ ] Gap analysis reviewed by product team
- [ ] Gaps prioritized for design
- [ ] UX updated to reflect missing flows
