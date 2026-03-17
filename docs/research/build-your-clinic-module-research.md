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
| **Various login flows** | Role-based tabs (Doctor/Coordinator), mobile app badges, traditional email+password |

---

## ❓ Questions / Gaps

1. **Entity type distinction** — Do we need different flows for solo practitioner vs. multi-doctor clinic vs. hospital?
2. **Workspace URL** — Should clinics get their own subdomain (docodile.app/clinicname or clinicname.docodile.app)?
3. **Credential verification** — How do we verify doctors' medical registration (MCI/State Council)?
4. **Multi-location support** — Can one admin manage multiple clinic branches?
5. **Billing during setup** — Do we collect payment info during onboarding or defer to later?
6. **Staff invitation flow** — How do invited staff members complete their setup?
7. **Data migration** — Do we support importing from existing systems (HealthPlix, Practo, etc.)?
8. **Compliance checkboxes** — Should setup include HIPAA/DPDP Act acknowledgment?
9. **Feature gating** — Can clinics choose which modules to activate (appointments, billing, pharmacy)?
10. **Setup completion rate** — What happens if setup is abandoned mid-way?

---

## 💡 UX Insights

### From Competitor Analysis

1. **Start with role/entity selection** — "Are you a solo practitioner or setting up a clinic?" fundamentally changes the flow
2. **Progress indicators are essential** — Dots, steps, or percentage showing where user is in setup
3. **Personalized welcome screens** — "Welcome, Dr. Sharma!" increases engagement
4. **Profile photo upload** should be a dedicated step (not buried in a form)
5. **Workspace URL creates ownership** — Even if technical, users feel their clinic has a "home"
6. **Dark theme for onboarding** — Some competitors use dark theme during setup to differentiate from main app
7. **Role-based login tabs** — Login screen adapts: "Login as Doctor" vs "Login as Admin"
8. **Mobile-first mindset** — App store badges during web setup push mobile adoption

### Indian Market Considerations

9. **WhatsApp as primary channel** — Collect WhatsApp number, not just phone
10. **Hindi/regional language support** — Consider multi-language setup for Tier 2/3 cities
11. **GST/billing integration** — Collect GSTIN during clinic setup for invoicing
12. **OTP-first authentication** — Indian users expect OTP over email verification
13. **Simple is better** — Many clinics are not tech-savvy; minimize jargon

---

## 🐊 Croc's MVP Recommendation

"Build Your Clinic" is the **first impression** of Docodile. A smooth setup flow = higher activation. A confusing one = immediate churn.

### ✅ Include in MVP

**Setup Wizard (5 Steps):**
1. **Role Selection** — Solo Doctor / Clinic Admin / Hospital
2. **Personal Info** — Name, email, mobile (WhatsApp), profile photo
3. **Professional Details** — Specialty, registration number, experience
4. **Clinic Details** — Clinic name, address, contact, logo, timings
5. **Team Setup** — Invite staff (optional, can skip)

**Authorization:**
- Email + OTP login (Indian standard)
- Role-based login tabs (Doctor / Admin / Staff)
- Password reset via OTP
- First-login password change for invited staff

**Admin Management:**
- Staff list view (tabular)
- Role assignment (Doctor, Receptionist, Admin)
- Basic permissions (can view patients, can edit, can bill)
- Invite via mobile number

### ⏳ Defer to Phase 2

- Workspace URL/subdomain for clinics
- Multi-location/branch support
- Advanced permission granularity (per-module access)
- Credential verification integration (MCI API)
- Data import from other EMRs
- Feature/module selection during setup
- GSTIN collection and invoice customization
- Dark theme onboarding
- Multi-language setup flow

---

## 📋 Build Your Clinic Flow

```
User lands on Docodile
    ↓
Role Selection
  → "I'm a Doctor (solo practice)"
  → "I'm setting up a Clinic"
  → "I'm joining an existing clinic" (invite flow)
    ↓
[If Solo Doctor or Clinic Admin]
    ↓
Step 1: Personal Information
  → Full Name
  → Email
  → Mobile (WhatsApp) + OTP verification
  → Profile Photo upload
  → Create Password
    ↓
Step 2: Professional Details
  → Medical Specialty (dropdown)
  → Registration Number (MCI/State Council)
  → Years of Experience
    ↓
Step 3: Clinic Details
  → Clinic Name
  → Clinic Type (solo/group/hospital)
  → Address (with pin code)
  → Contact Number
  → Clinic Logo (optional)
  → Working Hours
    ↓
Step 4: Team Setup (Optional)
  → Add Staff Members
    → Name, Mobile, Role (Doctor/Receptionist/Admin)
    → Send Invite (SMS/WhatsApp)
  → "Skip for now" option
    ↓
Step 5: Confirmation
  → Summary of setup
  → "Complete Setup" button
    ↓
Welcome Dashboard
  → "Setup Complete! Start taking appointments"
  → Quick actions: Add first appointment, Explore features
```

### Invited Staff Flow

```
Staff receives invite (SMS/WhatsApp)
    ↓
Click link → Landing page
  → "You've been invited to join [Clinic Name]"
    ↓
Create Account
  → Name (pre-filled)
  → Mobile (pre-filled)
  → OTP Verification
  → Create Password
    ↓
Welcome to [Clinic Name]
  → Role: [Receptionist/Doctor/etc.]
  → "Start Working" → Dashboard
```

---

## 🔐 Authorization & Role Management

### Roles & Default Permissions

| Role | View Patients | Edit Patients | Create Appointments | Create Bills | Manage Staff | Clinic Settings |
|------|---------------|---------------|---------------------|--------------|--------------|-----------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Doctor** | ✅ | ✅ (own patients) | ✅ | ✅ | ❌ | ❌ |
| **Receptionist** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Billing Staff** | ✅ (limited) | ❌ | ❌ | ✅ | ❌ | ❌ |

### Login Flow

```
Login Page
    ↓
Role Selection (tabs)
  → "Doctor" | "Staff" | "Admin"
    ↓
Enter Mobile/Email + Password
  → OR "Login with OTP"
    ↓
OTP Verification (if OTP login)
    ↓
Dashboard (role-specific)
```

### First-Time Staff Login

```
Invited staff clicks login
    ↓
System detects first login
    ↓
"Set Your Password"
  → Create new password
  → Confirm password
    ↓
Password updated → Dashboard
```

---

## 📊 Key Metrics to Track

1. **Setup Completion Rate** — % of users who finish all 5 steps
2. **Drop-off by Step** — Which step has highest abandonment?
3. **Time to Complete Setup** — Average minutes to finish
4. **Staff Invitation Rate** — % of clinics that add at least 1 staff member
5. **Mobile vs Desktop Setup** — Which device is more common?
6. **OTP vs Password Login** — Which auth method is preferred?

---

## 🎨 Design Recommendations

### Visual Hierarchy
- Clean, minimal design with ample whitespace
- One primary action per screen
- Progress bar always visible
- Mobile-responsive from day one

### Copy/Microcopy
- Conversational, not clinical ("Let's set up your clinic!" not "Clinic Configuration")
- Help text for every field that might confuse
- Success messages after each step ("Great! Now let's add your clinic details")

### Accessibility
- Minimum 14px font size
- Color contrast WCAG 2.1 AA compliant
- Form labels always visible (no placeholder-only labels)
- Keyboard navigation support
- Screen reader compatible

---

## 🔗 Related Modules

- **Login Module** — Handles authentication after setup
- **Appointments** — First action after setup completion
- **Patient Files** — Created when patients are added via appointments
- **Billing** — Tied to clinic settings (GST, pricing)

---

*Last updated by Croc* 🐊 *on 2026-03-17*
