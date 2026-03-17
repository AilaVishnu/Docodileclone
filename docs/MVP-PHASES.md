# 🎯 Docodile MVP — Priority Phases

*Recommended development order based on research, dependencies, and TSkin pilot needs*

*Created by Croc 🐊 on 2026-03-17*

---

## 🧠 Prioritization Logic

### Key Considerations
1. **TSkin Pilot Goal:** Replace HealthPlix with Appointment + Prescription minimum
2. **User Flow:** Patient books → Consultation → Prescription → Billing
3. **Dependencies:** Each module builds on the previous
4. **Revenue:** Billing enables monetization tracking
5. **Data Foundation:** Patient File is the spine connecting everything

### The Core Patient Journey
```
Login → Book Appointment → Patient File Created → Doctor Consultation 
     → Prescription Written → Bill Generated → (Optional: Pharmacy Dispense)
```

---

## 📦 Phase 1: Foundation (Current — ~60% done)

**Goal:** Basic clinic setup and authentication

| Module | Status | Priority | Why |
|--------|--------|----------|-----|
| Login + Auth | 🟡 60% | P0 | Can't do anything without auth |
| Build Your Clinic | ✅ 100% | P0 | Clinic must exist before patients |
| Staff Password Reset | 🟡 15% | P0 | Security requirement |

**Deliverable:** Admin can set up clinic, add staff, staff can login

**Est. Remaining:** ~3-4 dev days

---

## 📦 Phase 2: Appointment Flow (Next — Critical for Pilot)

**Goal:** Patients can book and doctors can see queue

| Module | Status | Priority | Why |
|--------|--------|----------|-----|
| Appointments CRUD | 🟡 8% | P0 | Entry point for all patient interactions |
| Patient File (Basic) | ❌ 0% | P0 | Auto-created when patient books; stores identity |

**Deliverable:** Front desk books appointment → Patient file created → Doctor sees queue

**Dependencies:** 
- Appointments creates Patient File automatically
- Patient File links all future data (prescriptions, bills)

**Est. Effort:** ~8-10 dev days

---

## 📦 Phase 3: Prescription (Pilot-Ready)

**Goal:** Doctor can write and share prescriptions

| Module | Status | Priority | Why |
|--------|--------|----------|-----|
| Prescription Pad | ❌ 0% | P0 | Core doctor workflow; TSkin's #1 need |

**Deliverable:** Doctor opens patient → Writes prescription → WhatsApp share to patient

**Dependencies:**
- Needs Patient File to attach prescription
- Needs Appointment context (chief complaint, vitals)

**Features (from research):**
- Drug search with autocomplete
- Dosage/frequency/duration inputs
- Diagnosis and advice fields
- Print + WhatsApp sharing
- Prescription history view

**Est. Effort:** ~10-12 dev days

---

## 🚀 PILOT CHECKPOINT

After Phase 3, we have **Minimum Viable Pilot**:
```
✅ Clinic setup
✅ Staff login
✅ Book appointments
✅ Patient records
✅ Write prescriptions
✅ WhatsApp sharing
```

**This replaces HealthPlix for TSkin!**

---

## 📦 Phase 4: Billing (Revenue Tracking)

**Goal:** Track consultation fees and payments

| Module | Status | Priority | Why |
|--------|--------|----------|-----|
| Billing | ❌ 0% | P1 | Revenue tracking; required for business |

**Deliverable:** Post-consultation → Generate bill → Payment captured → Receipt shared

**Dependencies:**
- Needs Patient File for bill attachment
- Triggered after prescription (consultation flow)

**Features (from research):**
- Itemized billing (consultation fee, procedures, medicines)
- Discount handling
- Payment mode (Cash/UPI/Card)
- WhatsApp receipt sharing
- Bill history per patient

**Est. Effort:** ~6-8 dev days

---

## 📦 Phase 5: Reports (Analytics)

**Goal:** Insights on clinic operations

| Module | Status | Priority | Why |
|--------|--------|----------|-----|
| Reports | ❌ 0% | P2 | Data-driven decisions; not critical for launch |

**Deliverable:** Daily/weekly/monthly reports on appointments, revenue, patients

**Dependencies:**
- Needs data from Appointments, Billing, Patient Files
- Best built after core modules have real data

**Features (from research):**
- Appointment reports (by doctor, status, date range)
- Revenue reports (collections, outstanding)
- Patient reports (new vs returning)
- Export to PDF/Excel

**Est. Effort:** ~5-6 dev days

---

## 📦 Phase 6: Pharmacy & Inventory (Optional)

**Goal:** In-house medicine dispensing

| Module | Status | Priority | Why |
|--------|--------|----------|-----|
| Pharmacy & Inventory | ❌ 0% | P3 | Only for clinics with pharmacy; not all need it |

**Deliverable:** Stock management → Dispense from prescription → Auto-deduct inventory

**Dependencies:**
- Needs Prescription Pad integration
- Needs Patient File for billing

**Features (from research):**
- Medicine master
- Batch-level stock with expiry
- Dispense from prescription
- Stock alerts
- Purchase entry

**Est. Effort:** ~12-15 dev days (most complex module)

---

## 📦 Phase 7: Dashboard (Polish)

**Goal:** At-a-glance clinic overview

| Module | Status | Priority | Why |
|--------|--------|----------|-----|
| Dashboard | ❌ 0% | P3 | Nice-to-have; not critical for MVP |

**Deliverable:** KPI cards, today's appointments, alerts, quick actions

**Dependencies:**
- Needs all other modules for meaningful data
- Build last when patterns are clear

**Est. Effort:** ~4-5 dev days

---

## 📊 Summary: Phase Timeline

| Phase | Modules | Priority | Est. Days | Cumulative |
|-------|---------|----------|-----------|------------|
| Phase 1 | Login, Build Clinic, Password Reset | P0 | ~4 days | 4 days |
| Phase 2 | Appointments, Patient File (Basic) | P0 | ~10 days | 14 days |
| Phase 3 | Prescription Pad | P0 | ~12 days | 26 days |
| **🚀 PILOT** | *TSkin can go live* | — | — | **~5 weeks** |
| Phase 4 | Billing | P1 | ~7 days | 33 days |
| Phase 5 | Reports | P2 | ~6 days | 39 days |
| Phase 6 | Pharmacy & Inventory | P3 | ~14 days | 53 days |
| Phase 7 | Dashboard | P3 | ~5 days | 58 days |

**Total to Full Product:** ~12 weeks (3 months)
**Total to Pilot-Ready:** ~5 weeks

---

## 🎯 Croc's Recommendation

### For TSkin Pilot (Fastest Path)
```
Phase 1 (finish) → Phase 2 → Phase 3 → 🚀 PILOT
```
~5 weeks to replace HealthPlix

### For Full MVP
```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
```
~8 weeks for complete EMR without pharmacy

### For Clinics with Pharmacy
```
All phases including Phase 6
```
~12 weeks for full product

---

*This is my recommendation based on competitor research, TSkin's needs, and logical dependencies. Adjust based on team capacity and feedback!* 🐊
