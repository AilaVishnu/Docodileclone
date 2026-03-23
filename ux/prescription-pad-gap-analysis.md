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

**Prescription Pad (Mod 3) hasn't been designed yet.** So this analysis tells you what the final screens MUST include based on Research + UX.

---

## ✅ WHAT YOUR UX WIREFRAMES GOT RIGHT

Based on research doc, your UX covers these correctly:

| Feature | Research Says | UX Has |
|---------|--------------|--------|
| Vitals capture | "Compact vitals row at top — 10 seconds to fill" | ✅ BP, Temp, Pulse, SpO2, Weight, Height, BMI modal |
| Chief Complaint | "Voice-to-text for symptoms" | ✅ Complaint field with tags |
| Medicine table | "Drug name, Dosage, Frequency, Duration, Instructions" | ✅ Full table with all columns |
| Frequency shortcuts | "1-0-1, 0-0-1 as quick-tap chips" | ✅ Morning/Afternoon/Evening/Night checkboxes |
| Print & WhatsApp | "WhatsApp share is one-tap action" | ✅ Both shown in flow |
| Previous Rx sidebar | "Last 3 prescriptions visible" | ⚠️ Partially shown |
| Billing prompt | "After saving → billing prompt appears" | ✅ "Create Bill" branch shown |
| Customization | "Prescription cover customization" | ✅ "Customization of pad" settings panel |
| Private notes | "Doctor's personal notes" | ✅ "Private Note" modal |
| Medical history | "Previous prescriptions accessible" | ✅ Medical History modal |

---

## 🔴 CRITICAL GAPS — Must Add to Final Screens

---

### GAP 1 — Medicine Auto-Suggest (2-3 Characters)

| Source | Status |
|--------|--------|
| Research | "Auto-suggest must kick in after 2-3 characters. This alone can make or break the product." |
| UX | ❌ Shows input field, but no autocomplete dropdown |
| Final | ❌ Doesn't exist yet |

**What to design:** Medicine name field with dropdown showing suggestions as doctor types
**Why it matters:** Doctors type "Azith" → see "Azithromycin 250mg, 500mg" instantly
**If not done:** Doctor must type full drug names manually. Slow. Spelling errors. Deal-breaker for doctors.

---

### GAP 2 — Favourite Templates / Saved Rx Combos

| Source | Status |
|--------|--------|
| Research | "Doctors prescribe same combinations repeatedly. Save & reuse in one tap." |
| UX | ❌ Not shown |
| Final | ❌ Doesn't exist |

**What to design:** "My Templates" button → shows saved prescription sets (e.g., "Acne Standard" = 3 medicines)
**Why it matters:** Dermatologist prescribes same 5-drug combo 20x/day. One tap vs 5 entries.
**If not done:** Repetitive data entry. Doctor fatigue. They'll switch to competitor with templates.

---

### GAP 3 — Follow-Up Date → Auto-Create Appointment

| Source | Status |
|--------|--------|
| Research | "Follow-up date set here auto-creates the next appointment" |
| UX | ⚠️ Shows "Follow Up" header but not the auto-booking |
| Final | ❌ Doesn't exist |

**What to design:** Date picker in prescription → "Book follow-up appointment?" toggle
**Why it matters:** Doctor says "come back in 2 weeks" → appointment auto-created. No receptionist needed.
**If not done:** Follow-ups lost. Patient forgets. Doctor says one thing, receptionist books differently.

---

### GAP 4 — Previous Prescriptions Sidebar

| Source | Status |
|--------|--------|
| Research | "Side panel showing last 3 prescriptions. Doctors constantly refer to previous Rx." |
| UX | ⚠️ Medical History modal exists, but not always-visible sidebar |
| Final | ❌ Doesn't exist |

**What to design:** Right sidebar showing last 3 visits with medications. Always visible while writing new Rx.
**Why it matters:** Doctor needs to see what was prescribed last time without opening another screen.
**If not done:** Doctor must click Medical History → close → write Rx → forget what they saw. Broken flow.

---

### GAP 5 — Doctor Registration Number on Print

| Source | Status |
|--------|--------|
| Research | "Doctor reg. number — legally required on prescriptions in India" |
| UX | ⚠️ Print preview shown but reg number not visible |
| Final | ❌ Doesn't exist |

**What to design:** Print template with: Clinic header + Doctor name + MCI/State reg number + signature
**Why it matters:** Legal requirement. Pharmacist may reject prescription without reg number.
**If not done:** Invalid prescription. Legal liability. Pharmacist won't dispense.

---

### GAP 6 — Lab Investigation Orders on Same Pad

| Source | Status |
|--------|--------|
| Research | Competitor analysis shows this is a top request |
| UX | ❌ Not in UX scope currently |
| Final | ❌ Doesn't exist |

**What to design:** Lab investigation section on the prescription pad (simple text field is fine for v1)
**Why it matters:** Doctor orders "CBC, LFT, KFT" along with medicines — one place for all orders
**If not done:** Lab orders happen outside the system — data is lost

---

### GAP 7 — Prescription Duplication for Follow-ups (Copy Last Rx)

| Source | Status |
|--------|--------|
| Research | High-frequency use case for chronic patients — competitor pain point |
| UX | ❌ Missing from flow |
| Final | ❌ Doesn't exist |

**What to design:** "Copy last prescription" quick action for follow-up consultations
**Why it matters:** Diabetic patient on same 5 medicines for 2 years. One tap vs retyping every visit.
**If not done:** Follow-up consultations are slow — doctors retype the same medicines every visit

---

## 🟠 HIGH PRIORITY GAPS — Should Add

---

### GAP 8 — Vital Signs Capture Before Rx

| Source | Status |
|--------|--------|
| Research | Common pre-prescription step |
| UX | ⚠️ Partially covered in vitals modal |
| Final | ❌ Doesn't exist |

**What to design:** Vitals capture as a pre-pad step (BP, weight, temperature, SpO2)
**Why it matters:** Complete consultation flow in one place
**If not done:** Doctors use a separate paper or WhatsApp to note vitals — defeats the EMR purpose

---

### GAP 9 — Stock Availability While Prescribing

| Source | Status |
|--------|--------|
| Research (Differentiation) | "Real-time stock availability shown while prescribing" |
| UX | ❌ Not shown |
| Final | ❌ Doesn't exist |

**What to design:** Green/Red indicator next to medicine name showing "In Stock" / "Out of Stock"
**Why it matters:** Doctor prescribes → patient goes to pharmacy → "not available" → bad experience
**If not done:** Pharmacy says "we don't have this", patient goes elsewhere. Lost revenue.

---

### GAP 10 — Drug Interaction Warnings

| Source | Status |
|--------|--------|
| Research (Differentiation) | "AI for basic drug combination alerts" |
| UX | ❌ Not shown |
| Final | ❌ Doesn't exist |

**What to design:** Alert banner when incompatible drugs added (e.g., "Metformin + Alcohol warning")
**Why it matters:** Patient safety. Doctors appreciate the safety net.
**If not done:** Potential adverse drug events. No differentiation from competitors.

---

### GAP 11 — Examination Section

| Source | Status |
|--------|--------|
| Research | Competitors have it as a standard section |
| UX | ✅ "Examination" tab shown |
| Final | ❌ Doesn't exist |

**What to design:** Free text or structured fields for clinical findings
**Why it matters:** Complete medical record. Required for legal documentation.
**If not done:** Incomplete records. Medical-legal risk.

---

### GAP 12 — Advice/Instructions Section

| Source | Status |
|--------|--------|
| Research | "Advice/Instructions" is standard section |
| UX | ✅ Advice section shown |
| Final | ❌ Doesn't exist |

**What to design:** Text field for diet, activity, precautions + common advice quick-picks
**Why it matters:** "Drink plenty of water", "Avoid oily food" — standard patient instructions
**If not done:** Doctor must write advice on paper separately. Incomplete digital record.

---

### GAP 13 — Diagnosis / ICD Code Entry

| Source | Status |
|--------|--------|
| Research | Competitors include diagnosis field |
| UX | ❓ Not explicitly mapped |
| Final | ❌ Doesn't exist |

**What to design:** Diagnosis field with suggestions, optional ICD code linking
**Why it matters:** Complete medical record, required for insurance claims
**If not done:** Diagnosis captured informally or not at all

---

## 🟢 NICE TO HAVE — Phase 2

| Feature | Research Status | Notes |
|---------|----------------|-------|
| Voice-to-text for symptoms | "Doctors are fast talkers, slow typers" | Defer to Phase 2 |
| Language translation | "Patient-facing WhatsApp in regional language" | Defer to Phase 2 |
| Generic vs Brand toggle | "Present in some tools" | Defer to Phase 2 |
| Image/Lab uploads | "MVP or Phase 2?" | Defer to Phase 2 |
| Drug calculators | Complex dosing | Defer to Phase 2 |
| Prescription templates per condition | Time saver | Can start simple, enhance later |
| ICD code linking | For insurance | Defer to Phase 2 |

---

## 📋 FINAL SCREEN CHECKLIST FOR MOD 3

When building Prescription Pad final screens, include:

### Header:
- [ ] Patient name, age, gender, file number
- [ ] Visit type (New/Follow-up)
- [ ] Date

### Vitals Section:
- [ ] BP, Pulse, Temp, SpO2, Weight, Height, BMI

### Consultation Sections:
- [ ] Chief Complaint (with quick tags)
- [ ] Examination findings
- [ ] Diagnosis (with suggestions)
- [ ] Differential Diagnosis

### Prescription Table:
- [ ] Medicine name *with autocomplete* ← CRITICAL
- [ ] Type (tablet/syrup/injection)
- [ ] Dosage
- [ ] Frequency (M/A/E/N chips)
- [ ] Duration (days)
- [ ] Instructions (before/after food)
- [ ] "Add Medicine" button

### Lab Investigations:
- [ ] Lab test orders section ← CRITICAL

### Actions:
- [ ] Favourite Templates button ← CRITICAL
- [ ] Copy Last Rx button ← CRITICAL
- [ ] Previous Rx sidebar ← CRITICAL
- [ ] Private Note toggle
- [ ] Follow-up date with auto-book ← CRITICAL

### Outputs:
- [ ] Print preview (with doc reg number) ← CRITICAL
- [ ] WhatsApp share
- [ ] Email
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
