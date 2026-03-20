# Prescription Pad Module — UX Gap Analysis

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

## Gap Analysis — What Research Has, UX May Be Missing

| # | Feature from Research | In UX Flow? | Gap / Notes |
|---|---|---|---|
| 1 | Lab investigation orders on the same pad | ❌ | Competitor analysis shows this is a top request — currently not in UX scope |
| 2 | Prescription duplication for follow-up (copy last Rx) | ❌ | High-frequency use case for chronic patients — missing from flow |
| 3 | Diagnosis / ICD code entry | ❓ | Not explicitly mapped in UX — competitors include diagnosis field |
| 4 | Prescription history view during consultation | ❓ | Doctor should see last 3 prescriptions while writing a new one |
| 5 | Vital signs capture (BP, weight, temperature) before Rx | ❌ | Common pre-prescription step — not in UX flow |
| 6 | Drug interaction warnings | ❌ | Advanced but critical for patient safety — not in UX |
| 7 | Follow-up date setting from the pad | ❓ | Should auto-create next appointment — not visible in flow |
| 8 | Prescription templates per condition | ❌ | Doctor saves a template for common conditions — time saver |

---

## Recommendations

### Do This (MVP+)
- Add lab investigation section to the prescription pad (simple text field is fine for v1)
- Add "Copy last prescription" quick action for follow-up consultations
- Include vital signs capture as a pre-pad step
- Show last 2–3 prescriptions in a side panel while writing

### Do This (Future)
- Drug interaction warnings (needs external API)
- Prescription templates per condition
- ICD code linking

### What Happens If You Do
- Prescription pad becomes a full consultation tool, not just a Rx writer
- Doctor speed improves significantly for follow-up patients
- Docodile is the only EMR in this segment with vitals + Rx in one flow

### What Happens If You Don't
- Doctors use a separate paper or WhatsApp to note vitals — defeats the EMR purpose
- Follow-up consultations are slow — doctors retype the same medicines every visit
- Lab orders happen outside the system — data is lost

---

## Status
- [ ] Gap analysis reviewed by product team
- [ ] Gaps prioritized for design
- [ ] UX updated to reflect missing flows
