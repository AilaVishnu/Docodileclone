# 🔍 Patient File Module — Research & Recommendations

## 🔍 Observations

- The patient file is positioned as the **central record hub** — it connects appointments, prescriptions, bills, and reports together
- Research board shows a dedicated *flow* + *UX* section for patient files (same structure as appointment and prescription pad)
- Patient identity data is already being collected at appointment creation — name, mobile, DOB, gender, case type — but this isn't clearly linked to a persistent patient file yet
- The module sits between appointment intake and prescription/billing, making it a **critical handoff point** in the consultation flow
- No clear distinction yet between *patient profile* (static demographics) vs *patient record* (dynamic, per-visit data)
- Existing research mentions "image or file uploading" in the prescription pad context — patient files likely inherits this need
- WhatsApp is a recurring theme across all modules — patient file sharing via WhatsApp is a natural extension

---

## ❓ Questions / Gaps

1. **Role-based views** — What does "patient file" mean to the doctor vs the front desk? Are the views different?
2. **Multi-clinic scope** — Should a patient file show *all* visits across clinics or only the current clinic's history?
3. **Edit permissions** — Who can edit a patient file after it's created? Doctor only? Front desk too?
4. **File/report storage** — What happens to uploaded files/reports — where do they live and who can access them?
5. **Patient consent** — Is there a concept of patient consent for data sharing (HIPAA / DPDP Act relevance)?
6. **Data import** — Do we support importing an existing patient's history from another system or paper records?
7. **Family accounts** — How do we handle family accounts — e.g., a mother managing records for her child?
8. **Patient lifecycle** — What's the patient file lifecycle? Is there a concept of archiving or deactivating a patient?
9. **Vitals over time** — Should vitals (BP, weight, sugar) be tracked over time with trend graphs?
10. **ABHA integration** — Any ABHA (Ayushman Bharat Health Account) ID integration planned?

---

## 💡 UX Insights

1. **Quick summary card at the top** — Doctors don't have time to scroll; surface last visit date, active conditions, current medications, and allergies in one glance
2. **Timeline view > list view** — A chronological visit timeline is far more intuitive for reviewing patient history than a flat list
3. **Search within a patient's own record** — If a patient has 50+ visits, doctors need to search by symptom, drug, or date
4. **Sticky vitals section** — Weight, BP, sugar levels should persist across the screen when scrolling through history
5. **Offline-first consideration** — In lower-connectivity clinics, patient file should be readable/writable offline and sync when back online
6. **WhatsApp export** — "Share patient summary to patient's WhatsApp" is a high-value, low-effort feature for Indian clinics
7. **Photo/document upload UX** — Drag-and-drop or camera capture (for tablet/mobile) — doctors often photograph reports
8. **Red flags / alerts** — Surface allergies and critical conditions prominently, never buried in history

---

## 🐊 Croc's MVP Recommendation

The patient file is the **spine of the EMR** — without it, every other module is a silo. Appointments need it to show patient history, the prescription pad needs it to reference past Rx, and billing needs it to tie invoices to a person.

### ✅ Include in MVP
- Patient profile: name, mobile, DOB, gender, UHID (unique ID)
- Visit history (read-only timeline — linked to appointments + prescriptions)
- Allergies & critical conditions (flagged prominently)
- Basic document upload (photos/reports attached to a visit)
- Quick summary card (last visit, active meds, allergies)

### ⏳ Defer to Phase 2
- Vitals trend graphs over time
- Family / dependent account linking
- ABHA ID integration
- Data import from external systems / paper records
- Patient consent management (DPDP Act)
- Role-based view differentiation (doctor vs front desk)

---

## 📋 Patient File Flow

```
Patient created (at appointment booking)
    ↓
Patient Profile generated
  → Name | Mobile | DOB | Gender | UHID
  → Allergies | Blood Group | Critical flags
    ↓
Visit added (linked from Appointment)
  → Consultation date | Doctor | Chief complaint
  → Prescription (linked from Pad)
  → Bills (linked from Billing)
  → Uploaded reports / images
    ↓
Patient File view
  → Summary card (top)
  → Visit timeline (chronological)
  → Search within record
    ↓
Actions
  → WhatsApp share (patient summary)
  → Print summary
  → Upload new report
```

---

*Last updated by Croc* 🐊 *on 2026-03-14*
