# Prescription Pad Module — Complete Gap Analysis

*Analysis Date: 2026-03-20*

> Source: Docodile Research Study (FigJam) — UX Page, Prescription Pad Section
> Compared against: Competitor Analysis (Competitor 1 + Doctecq)

---

## Research Findings (Competitor Analysis)

### Features Competitors Have
- Digital prescription writing pad
- Medicine name suggestions from a publicly available database (auto-complete while typing)
- Dosage, frequency, and duration fields per medicine
- Clinical notes / diagnosis section
- Chief complaint capture
- Prescription sharing via WhatsApp
- Prescription print with clinic letterhead / customizable cover
- Image and file upload on prescription
- Language translation of prescription
- Built-in calculators (dosage, BMI, etc.)
- Prescription history per patient (previous visits)
- HIPAA-compliant data handling

### User Pain Points from Reviews
- Medicine database suggestions are outdated or missing Indian brand names
- Printing prescription requires too many steps / poor formatting
- Cannot share prescription directly to patient WhatsApp from the pad
- No way to add lab investigations on the same pad
- Prescription duplication for follow-up patients is manual and slow

---

## Research UX (Docodile FigJam — Prescription Pad Flow)

### What the UX Covers
- Prescription pad as core doctor-facing module
- Medicine entry with suggestions
- WhatsApp sharing of prescription post-consultation
- Prescription cover customization for printing
- Image/file uploading on prescription
- Language translation of prescription content
- Calculators integration
- Publicly available medicine suggestion database while typing

### UX Flows Mapped
- [ ] Write new prescription
- [ ] Medicine search and add
- [ ] Share to WhatsApp
- [ ] Print with custom cover
- [ ] Upload image/file

---

## ⚠️ IMPORTANT: No Final Screens Exist Yet!

The Figma Design System only has:
- **Mod 0:** Login ✅
- **Mod 1:** Build Your Clinic ✅
- **Mod 2:** Book Appointment 🟡

**Prescription Pad (Mod 3) hasn't been designed yet.** This analysis tells you what the final screens MUST include.

---

## ✅ WHAT YOUR UX WIREFRAMES GOT RIGHT

| Feature | Research Says | UX Has |
|---------|--------------|--------|
| Vitals capture | "Compact vitals row at top — 10 seconds to fill" | ✅ BP, Temp, Pulse, SpO2, Weight, Height, BMI modal |
| Chief Complaint | "Voice-to-text for symptoms" | ✅ Complaint field with tags |
| Medicine table | "Drug name, Dosage, Frequency, Duration, Instructions" | ✅ Full table with all columns |
| Frequency shortcuts | "1-0-1, 0-0-1 as quick-tap chips" | ✅ Morning/Afternoon/Evening/Night checkboxes |
| Print & WhatsApp | "WhatsApp share is one-tap action" | ✅ Both shown in flow |
| Previous Rx sidebar | "Last 3 prescriptions visible" | ⚠️ Partially shown |
| Billing prompt | "After saving → billing prompt appears" | ✅ "Create Bill" branch shown |
| Customization | "Prescription cover customization" | ✅ Settings panel shown |
| Private notes | "Doctor's personal notes" | ✅ "Private Note" modal |
| Medical history | "Previous prescriptions accessible" | ✅ Medical History modal |

---

## 🔴 CRITICAL GAPS — Must Add to Final Screens

---

### GAP 1 — Medicine Auto-Suggest (2–3 Characters)

**What the Research Says:** "Auto-suggest must kick in after 2-3 characters. This alone can make or break the product."

**What the UX Shows:** Input field exists but no autocomplete dropdown is shown.

**What Should Change:** Medicine name field with a dropdown showing suggestions as the doctor types — brand names, generics, and dosage variants.

**What Happens If You Do This:**
Doctor types "Azith" → sees "Azithromycin 250mg, 500mg" instantly. Prescription writing time drops significantly. Indian brand name support makes this immediately usable in real clinics.

**What Happens If You Don't:**
Doctor must type full drug names manually. Slow. Spelling errors lead to pharmacist confusion. This is a deal-breaker — competitors have had this for years.

---

### GAP 2 — Favourite Templates / Saved Rx Combos

**What the Research Says:** "Doctors prescribe same combinations repeatedly. Save & reuse in one tap."

**What the UX Shows:** Not shown anywhere in the flow.

**What Should Change:** A "My Templates" button showing saved prescription sets (e.g., "Acne Standard" = 3 medicines + 2 instructions). One tap loads the full template onto the pad.

**What Happens If You Do This:**
A dermatologist prescribing the same 5-drug acne combo 20 times a day does it in one tap instead of 5 entries. Doctor fatigue drops. Consultation speed increases noticeably.

**What Happens If You Don't:**
Repetitive data entry every single consultation. Doctor fatigue is real. They'll switch to a competitor that offers templates — this is a top-requested feature across all EMR reviews.

---

### GAP 3 — Follow-Up Date → Auto-Create Appointment

**What the Research Says:** "Follow-up date set here auto-creates the next appointment."

**What the UX Shows:** "Follow Up" header exists but the auto-booking link is not shown.

**What Should Change:** Date picker on the prescription → "Book follow-up appointment?" toggle. On confirm, auto-creates the next appointment for the same patient with case type set to "Review."

**What Happens If You Do This:**
Doctor says "come back in 2 weeks" → appointment auto-created. No receptionist needed. Follow-up rates improve. Clinic revenue from review consultations increases.

**What Happens If You Don't:**
Follow-up instructions stay verbal. Patient forgets. Clinic misses the next consultation. For chronic patients this is lost recurring revenue.

---

### GAP 4 — Previous Prescriptions Sidebar (Always Visible)

**What the Research Says:** "Side panel showing last 3 prescriptions. Doctors constantly refer to previous Rx."

**What the UX Shows:** Medical History modal exists but it's not an always-visible sidebar.

**What Should Change:** Right sidebar showing last 3 visits with medications — always visible while writing a new prescription. No modal, no tab-switching.

**What Happens If You Do This:**
Doctor can glance at last prescription without closing or switching context. Clinical continuity is preserved. Prescription writing is faster and more accurate for returning patients.

**What Happens If You Don't:**
Doctor clicks History → reads it → closes → writes Rx → forgets what they saw. The broken flow leads to re-prescribing errors or having to open History multiple times per consultation.

---

### GAP 5 — Doctor Registration Number on Print

**What the Research Says:** "Doctor reg. number — legally required on prescriptions in India."

**What the UX Shows:** Print preview is shown but the registration number is not visible on the template.

**What Should Change:** Print template must include: Clinic header + Doctor name + MCI/State registration number + degree + signature line.

**What Happens If You Do This:**
Prescriptions are legally valid. Pharmacists accept them without question. Docodile-printed prescriptions are indistinguishable from a traditional printed pad — which is the benchmark.

**What Happens If You Don't:**
Invalid prescription. Pharmacist rejects it. Patient goes back to the clinic frustrated. Legal liability for the doctor. Clinics will stop printing from Docodile.

---

### GAP 6 — Lab Investigation Orders on Same Pad

**What the Research Says:** Competitor analysis shows this is a top-requested feature — doctors order labs at the same time as prescribing.

**What the UX Shows:** Not in current UX scope.

**What Should Change:** Lab investigation section on the prescription pad (a simple text field or searchable list is fine for v1). Prints alongside the prescription.

**What Happens If You Do This:**
Doctor orders "CBC, LFT, KFT" along with medicines in one place. One prescription printout covers both — what the patient takes to the pharmacy and the lab. Complete clinical record.

**What Happens If You Don't:**
Lab orders happen outside the system on a separate paper. Data is lost. The prescription record in Docodile is incomplete — a partial clinical record is worse than no record.

---

### GAP 7 — Prescription Duplication for Follow-Ups (Copy Last Rx)

**What the Research Says:** High-frequency use case for chronic patients — the top pain point in competitor reviews.

**What the UX Shows:** Missing from the flow entirely.

**What Should Change:** "Copy last prescription" quick action for follow-up consultations. Load last Rx onto the pad, allow edits, save as new.

**What Happens If You Do This:**
A diabetic patient on the same 5 medicines for 2 years — one tap vs. retyping every visit. Follow-up consultations are significantly faster. Doctors love this feature.

**What Happens If You Don't:**
Every follow-up consultation requires full re-entry. Slow. Error-prone. Doctors of chronic patients — a huge segment — feel the product is not built for them.

---

## 🟠 HIGH PRIORITY GAPS — Should Add

---

### GAP 8 — Vital Signs Capture Before Rx

**What Should Change:** Vitals capture as a pre-pad step — BP, weight, temperature, SpO2 — filled by the nurse before the doctor opens the prescription pad.

**What Happens If You Do This:**
Vitals are captured digitally, tied to the visit, and visible to the doctor when writing the prescription. Complete visit record.

**What Happens If You Don't:**
Doctors use separate paper or WhatsApp to note vitals. EMR record is incomplete. The prescription exists without the clinical context that led to it.

---

### GAP 9 — Stock Availability While Prescribing

**What Should Change:** Green/Red indicator next to each medicine showing "In Stock" / "Out of Stock" based on the clinic's pharmacy inventory.

**What Happens If You Do This:**
Doctor prescribes what's actually available in-house. Patient gets medicines at the counter. Clinic pharmacy revenue is preserved.

**What Happens If You Don't:**
Pharmacy says "we don't have this" → patient goes to an outside pharmacy. Clinic loses the pharmacy revenue. Doctor looks uninformed.

---

### GAP 10 — Drug Interaction Warnings

**What Should Change:** Alert banner when a newly added medicine has a known interaction with another medicine already on the pad.

**What Happens If You Do This:**
Adverse drug events are flagged before the prescription is saved. Patient safety improves. Docodile differentiates itself from basic digital pads that have no safety layer.

**What Happens If You Don't:**
Potential adverse drug events go unchecked. No differentiation from competitors. A safety feature that clinics will eventually demand — better to have it early.

---

### GAP 11 — Examination Section

**What Should Change:** Free text or structured fields for clinical examination findings (e.g., "skin: dry, erythematous patches on cheeks").

**What Happens If You Do This:**
Complete clinical record per visit — Complaint → Examination → Diagnosis → Prescription. Medico-legal coverage for the doctor.

**What Happens If You Don't:**
Incomplete records. Medical-legal risk. Docodile records are unusable as evidence in a dispute because the clinical reasoning isn't captured.

---

### GAP 12 — Advice / Instructions Section

**What Should Change:** Text field for diet, activity, and precautions + common advice quick-picks (e.g., "Avoid direct sunlight", "Apply sunscreen SPF 50+").

**What Happens If You Do This:**
Doctor's advice is part of the digital record and appears on the printed prescription. Patient has written instructions to refer back to.

**What Happens If You Don't:**
Doctor writes advice on a separate paper or says it verbally. Incomplete digital record. Patient forgets verbal instructions.

---

### GAP 13 — Diagnosis / ICD Code Entry

**What Should Change:** Diagnosis field with suggestions, optional ICD-10 code linking for clinics that need it for insurance claims.

**What Happens If You Do This:**
Diagnosis is captured formally and consistently. ICD codes enable insurance claim filing directly from Docodile in future phases.

**What Happens If You Don't:**
Diagnosis captured informally or not at all. Insurance integrations become impossible without this data. Data quality for analytics is poor.

---

## 🟢 NICE TO HAVE — Phase 2

| Feature | Notes |
|---------|-------|
| Voice-to-text for symptoms | Defer to Phase 2 |
| Language translation | Defer to Phase 2 |
| Generic vs Brand toggle | Defer to Phase 2 |
| Image/Lab uploads | Defer to Phase 2 |
| Drug calculators | Defer to Phase 2 |
| Prescription templates per condition | Start simple, enhance later |
| ICD code linking | Defer to Phase 2 |

---

## 📋 FINAL SCREEN CHECKLIST FOR MOD 3

### Header
- [ ] Patient name, age, gender, file number
- [ ] Visit type (New/Follow-up)
- [ ] Date

### Vitals Section
- [ ] BP, Pulse, Temp, SpO2, Weight, Height, BMI

### Consultation Sections
- [ ] Chief Complaint (with quick tags)
- [ ] Examination findings
- [ ] Diagnosis (with suggestions)

### Prescription Table
- [ ] Medicine name *with autocomplete* ← CRITICAL
- [ ] Type (tablet/syrup/injection)
- [ ] Dosage
- [ ] Frequency (M/A/E/N chips)
- [ ] Duration (days)
- [ ] Instructions (before/after food)
- [ ] "Add Medicine" button

### Lab Investigations
- [ ] Lab test orders section ← CRITICAL

### Actions
- [ ] Favourite Templates button ← CRITICAL
- [ ] Copy Last Rx button ← CRITICAL
- [ ] Previous Rx sidebar (always visible) ← CRITICAL
- [ ] Private Note toggle
- [ ] Follow-up date with auto-book ← CRITICAL

### Outputs
- [ ] Print preview (with doc reg number) ← CRITICAL
- [ ] WhatsApp share
- [ ] Create Bill prompt

---

## Summary Table

| Gap | Priority | Effort |
|-----|----------|--------|
| Medicine auto-suggest | 🔴 Critical | Medium |
| Favourite templates | 🔴 Critical | Medium |
| Follow-up auto-book | 🔴 Critical | Low |
| Previous Rx sidebar | 🔴 Critical | Medium |
| Doctor reg number on print | 🔴 Critical | Low |
| Lab investigations section | 🔴 Critical | Low |
| Copy last Rx | 🔴 Critical | Low |
| Vitals capture | 🟠 High | Low |
| Stock availability | 🟠 High | Medium |
| Drug interaction warnings | 🟠 High | High (needs API) |
| Examination section | 🟠 High | Low |
| Advice/Instructions | 🟠 High | Low |
| Diagnosis/ICD entry | 🟠 High | Medium |

---

## Status
- [ ] Gap analysis reviewed by product team
- [ ] Gaps prioritized for design
- [ ] UX updated to reflect missing flows

---

*Analysis by Croc 🐊 | Docodile AI Co-Founder*
