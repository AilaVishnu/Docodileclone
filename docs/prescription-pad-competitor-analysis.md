# Prescription Pad Module — Competitor Research & UX Insights

> Studied from FigJam board: [Docodile Research Study](https://www.figma.com/board/x3MXMqnwuNMNXHiYFEWxoL/Docodile-Research-Study?node-id=300-1233)
> Section: **Prescription Pad**
> Date: 2026-03-13

> ⚠️ Board note: *"Prescription pad: can we put this in MVP?"* — decision pending

---

## 🔍 Observations

### Structure of the Prescription Pad
- Competitors split the pad into clear zones: **Patient info header → Vitals → Chief Complaint/Symptoms → Diagnosis → Medicines → Advice/Instructions → Follow-up date**
- Medicine entry is the most complex part — Drug name, Dosage, Frequency (1-0-1), Duration, Instructions (before/after food) all in a single row
- Auto-suggest for medicine names as the doctor types — pulls from a public/internal drug database
- Vitals (BP, weight, temp, SpO2) captured at the top before the prescription begins
- Previous prescriptions accessible in a sidebar — doctor can refer to history without leaving the current pad

### Print & Share
- Every competitor has a *Print* button generating a branded prescription PDF with clinic header, doctor reg. number, and patient details
- WhatsApp sharing of the prescription PDF is a one-tap action — standard feature
- Prescription cover/letterhead customization (logo, clinic address, doctor details) done during clinic setup

### Medicine Database
- Competitors use publicly available drug databases (CIMS, 1mg) for auto-suggestions
- Generic vs. Brand name toggle present in some tools
- Dosage templates (e.g. "500mg, 1-0-1, 5 days, after food") can be saved as favourites

### Workflow Integration
- Prescription pad launched directly from the appointment/queue — not a standalone module
- After saving a prescription: billing prompt appears automatically
- Follow-up date set here auto-creates the next appointment

### Language & Accessibility
- Some competitors offer prescription language translation (English → regional language)
- Voice-to-text for symptom notes present in premium tiers

---

## ❓ Questions / Gaps

1. **MVP scope?** — Board explicitly asks *"can we put this in MVP?"* — needs a clear yes/no decision
2. **Who writes the prescription?** — Doctor only, or can front desk initiate a draft?
3. **Medicine database source** — CIMS, 1mg API, or our own curated list? Licensing costs?
4. **Prescription cover customization** — Part of "Build Your Clinic" setup or a separate settings page?
5. **Digital signature / doctor reg. number** — Legally required on prescriptions in India. How do we capture and display this?
6. **Prescription history** — How many past prescriptions to show? Searchable by date or medicine?
7. **Controlled substances** — Special handling/flags for Schedule H drugs?
8. **Follow-up auto-booking** — If doctor sets a follow-up date in the pad, does it auto-create an appointment?
9. **Image/file uploads** — Lab reports, scans attached to consultation — MVP or Phase 2?
10. **Offline mode** — Does the pad work offline and sync later for clinics with poor connectivity?

---

## 💡 UX Insights

1. **Medicine entry is the #1 pain point** — Auto-suggest must kick in after 2–3 characters. This alone can make or break the product for doctors.
2. **Frequency shortcuts** — "1-0-1", "0-0-1", "1-1-1" as quick-tap chips, not free text fields.
3. **Favourite templates** — Doctors prescribe the same combinations repeatedly. Save & reuse in one tap.
4. **Print = trust signal** — A well-formatted, branded prescription printout is how patients judge clinic professionalism. Invest in the print layout.
5. **WhatsApp share > everything** — Patients rarely carry printed prescriptions. WhatsApp PDF is the real delivery mechanism.
6. **Don't interrupt the doctor's flow** — Billing, follow-up prompts come *after* prescription is saved, not during.
7. **Vitals as a quick capture** — Compact vitals row at the top (BP / Weight / Temp / SpO2) — 10 seconds to fill, not a separate form.
8. **Previous Rx always visible** — Side panel showing last 3 prescriptions. Doctors constantly refer to previous Rx.
9. **Language translation as delight feature** — Patient-facing WhatsApp message in their regional language builds trust.
10. **Voice input for symptoms/notes** — Doctors are fast talkers, slow typers. Voice-to-text for chief complaint and notes.

---

## 🐊 Croc's MVP Recommendation

The prescription pad is the **heart of the product for doctors** — it's what they touch most. The appointment module brings patients in; the pad is where the doctor lives.

### ✅ Include in MVP
- Basic pad: symptoms → diagnosis → medicines (with auto-suggest) → advice → follow-up date
- Print PDF with clinic branding
- WhatsApp share (one-tap)
- Vitals capture row
- Last 3 prescriptions sidebar

### ⏳ Defer to Phase 2
- Language translation
- Voice input
- Image/file uploads (lab reports)
- Drug calculators
- Generic vs. brand name toggle

---

## 📋 Prescription Pad Flow

```
Appointment marked "In Consultation"
    ↓
Prescription Pad opens
    ↓
Vitals captured (BP / Weight / Temp / SpO2)
    ↓
Chief Complaint / Symptoms (text / voice)
    ↓
Diagnosis
    ↓
Medicines
  → Type drug name (auto-suggest after 2 chars)
  → Dosage | Frequency (1-0-1 chips) | Duration | Instructions
  → Add more medicines
    ↓
Advice / Instructions
    ↓
Follow-up date (auto-creates next appointment)
    ↓
Save → Print PDF / WhatsApp Share
    ↓
Billing prompt
```

---

*Last updated by Croc 🐊 on 2026-03-13*
