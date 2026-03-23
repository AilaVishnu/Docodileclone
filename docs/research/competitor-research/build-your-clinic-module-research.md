# 🔍 Build Your Clinic Module — Research & Recommendations

## 🔍 Observations

Based on analysis of 40+ competitor screenshots across 8 different EMR/clinic management platforms:

- **Multi-step wizard onboarding** is the industry standard — typically 4-7 steps
- **Role-based entry points** are critical — users identify as Doctor, Admin, Coordinator, or Hospital/Clinic before proceeding
- The setup flow follows a consistent hierarchy: **Personal → Professional → Clinic → Team → Configuration**
- **Workspace URLs/subdomains** (e.g., `clinicname.platform.com`) create ownership and brand identity
- Authorization patterns prefer **role-based login** over social login in healthcare
- Staff/team management uses **tabular layouts** with permission toggles
- **Identity verification** ("Did you mean this?") prevents duplicate records
- Mobile app integration is pushed early during onboarding

### Competitors Analyzed

| Competitor | Key Strengths |
|------------|---------------|
| **Klara** | Clean welcome screen, wizard-based setup, plan selection during onboarding |
| **Eka Care** | Most comprehensive flow (12+ screens), workspace URL creation, role selection first, identity matching |
| **eRxPad** | Marketing-oriented welcome, feature highlights during onboarding |
| **DrChrono/Athenahealth-style** | Enterprise layout, top nav + sidebar, granular permissions |
| **AI Clinical Decision Support** | Step indicators, personalized welcome, AI features highlighted early |

---

## ❓ Questions / Gaps

1. **Entity type distinction** — Different flows for solo practitioner vs. multi-doctor clinic vs. hospital?
2. **Workspace URL** — Should clinics get their own subdomain?
3. **Credential verification** — How do we verify doctors' medical registration (MCI/State Council)?
4. **Multi-location support** — Can one admin manage multiple clinic branches?
5. **Billing during setup** — Do we collect payment info during onboarding or defer?
6. **Staff invitation flow** — How do invited staff members complete their setup?
7. **Data migration** — Do we support importing from existing systems (HealthPlix, Practo, etc.)?
8. **Compliance checkboxes** — Should setup include HIPAA/DPDP Act acknowledgment?
9. **Feature gating** — Can clinics choose which modules to activate?
10. **Setup completion rate** — What happens if setup is abandoned mid-way?

---

## 💡 UX Insights

1. **Start with role/entity selection** — "Are you a solo practitioner or setting up a clinic?" fundamentally changes the flow
2. **Progress indicators are essential** — Dots, steps, or percentage showing where user is in setup
3. **Personalized welcome screens** — "Welcome, Dr. Sharma!" increases engagement
4. **Workspace URL creates ownership** — Users feel their clinic has a "home"
5. **OTP-first authentication** — Indian users expect OTP over email verification
6. **Simple is better** — Many clinics are not tech-savvy; minimize jargon

---

## 🐊 Croc's MVP Recommendation

### ✅ Include in MVP — Setup Wizard (5 Steps)
1. **Role Selection** — Solo Doctor / Clinic Admin / Hospital
2. **Personal Info** — Name, email, mobile (WhatsApp), profile photo
3. **Professional Details** — Specialty, registration number, experience
4. **Clinic Details** — Clinic name, address, contact, logo, timings
5. **Team Setup** — Invite staff (optional, can skip)

### ✅ Authorization
- Email + OTP login
- Role-based login tabs (Doctor / Admin / Staff)
- Password reset via OTP
- First-login password change for invited staff

### ⏳ Defer to Phase 2
- Workspace URL/subdomain for clinics
- Multi-location/branch support
- Advanced permission granularity
- Credential verification integration (MCI API)
- Data import from other EMRs
- GSTIN collection and invoice customization
- Multi-language setup flow

---

## 📋 Build Your Clinic Flow

```
User lands on Docodile
    ↓
Role Selection → Solo Doctor / Clinic Admin / Joining existing clinic
    ↓
Step 1: Personal Information (Name, Email, Mobile + OTP, Photo, Password)
    ↓
Step 2: Professional Details (Specialty, Reg No., Experience)
    ↓
Step 3: Clinic Details (Name, Type, Address, Contact, Logo, Hours)
    ↓
Step 4: Team Setup — optional (Add staff, Send Invite)
    ↓
Step 5: Confirmation → Welcome Dashboard
```

---

## 🔐 Roles & Default Permissions

| Role | View Patients | Edit Patients | Create Appointments | Create Bills | Manage Staff | Clinic Settings |
|------|---------------|---------------|---------------------|--------------|--------------|------------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Doctor** | ✅ | ✅ (own) | ✅ | ✅ | ❌ | ❌ |
| **Receptionist** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Billing Staff** | ✅ (limited) | ❌ | ❌ | ✅ | ❌ | ❌ |

---

*Last updated by Croc 🐊 on 2026-03-17*
