# Appointments Module Gap Analysis

*Research → UX → Final Screen Comparison*

Three sources compared:
- **Research Doc** = Competitor analysis insights
- **Research UX** = FigJam wireframes
- **Final Screen** = Figma Design System (Mod 2)

---

## 🔴 CRITICAL GAPS (Must Fix)

### 1. Walk-in Quick CTA

| Source | Status |
|--------|--------|
| Research | "Walk-in = single prominent CTA. Most common action." |
| UX | ✅ "Start walk-in consultation" button on dashboard |
| Final | ❌ Only "+ New Appointment" button exists |

**What to change:** Add "Start Walk-in" button next to "+ New Appointment"

**Why it's better:** Walk-ins are 60-70% of Indian clinic visits. One-click access saves 5-10 seconds per patient.

**If not done:** Receptionist must click "New Appointment" → then figure out walk-in vs scheduled. Slower, confusing.

---

### 2. Dashboard KPI Summary Cards

| Source | Status |
|--------|--------|
| Research | "Appointment list shows total, pending, completed in one row" |
| UX | ✅ Three cards: Total (100), Pending (80), Completed (20) |
| Final | ❌ No summary cards on queue screen |

**What to change:** Add 3 stat cards above doctor tabs: "Today: X | Waiting: Y | Done: Z"

**Why it's better:** At-a-glance workload visibility. Doctor can see "12 more patients" without counting rows.

**If not done:** Staff must mentally count rows or scroll to estimate remaining work. Cognitive load.

---

### 3. Inline Status Updates

| Source | Status |
|--------|--------|
| Research | "Mark 'Waiting → In Consultation → Done' without leaving queue view" |
| UX | ❌ Not shown in wireframes |
| Final | ❌ Status badges exist but not clickable |

**What to change:** Make status badges clickable → dropdown to change status inline

**Why it's better:** Receptionist stays on queue screen. No navigation. Sub-second updates.

**If not done:** Must open patient detail → change status → go back. 3 clicks instead of 1.

---

### 4. Post-Consultation Prompt

| Source | Status |
|--------|--------|
| Research | "Done — add billing / next appointment? Reduces drop-off in billing" |
| UX | ❌ Not shown |
| Final | ❌ No prompt after marking "Completed" |

**What to change:** When status → Completed, show modal: "Bill generated? Book follow-up?"

**Why it's better:** Captures revenue. Ensures billing isn't skipped. Prompts return visits.

**If not done:** Billing gets forgotten. Follow-ups not booked. Lost revenue + patient churn.

---

### 5. Fees Auto-Fill from Case Type

| Source | Status |
|--------|--------|
| Research | "Case type drives fees automatically. Review should auto-fill fee from clinic settings" |
| UX | ✅ Consultation/Review captured |
| Final | ⚠️ Case type exists, but fees appear manual |

**What to change:** Selecting "Review" should auto-fill fee (e.g., ₹100) from Build Your Clinic settings

**Why it's better:** Consistency. No manual entry errors. Faster booking.

**If not done:** Receptionist must remember prices. Different staff may charge differently. Chaos.

---

## 🟡 IMPORTANT GAPS (Should Fix)

### 6. WhatsApp Reminder Toggle

| Source | Status |
|--------|--------|
| Research | "WhatsApp is dominant notification channel. Opt-out, not opt-in." |
| UX | ❌ Not shown |
| Final | ❌ No notification setting in booking form |

**What to change:** Add checkbox "📱 Send WhatsApp reminder" (default: checked)

**Why it's better:** Reduces no-shows by 20-30%. Patient gets automated reminder.

**If not done:** Manual reminders needed. Higher no-show rate. Wasted slots.

---

### 7. Patient Search by Mobile Number FIRST

| Source | Status |
|--------|--------|
| Research | "Mobile number = Patient ID. Primary search field. Auto-suggest as they type." |
| UX | ✅ "Search existing patient" button shown |
| Final | ⚠️ Search exists but searches by name (shows "v" → Vinay results) |

**What to change:** Search should prioritize mobile number. Typing "888" should show all patients with that number prefix.

**Why it's better:** Mobile is unique. Names are ambiguous (multiple "Suresh"). Faster lookup.

**If not done:** Receptionist asks "Name?" instead of "Phone number?" — slower identification.

---

### 8. Cancellation & Reschedule Flow

| Source | Status |
|--------|--------|
| Research | "What happens when patient no-shows? Cancellation & reschedule needed" |
| UX | ❌ Not shown |
| Final | ❌ Status shows "Cancelled" but no reschedule screen |

**What to change:** Add reschedule action in row menu (⋮): "Reschedule" → date/time picker

**Why it's better:** Common scenario. Patient calls to move appointment. Should be 2 clicks.

**If not done:** Must cancel + create new appointment. Double work. Loses history link.

---

### 9. Patient Deduplication Alert

| Source | Status |
|--------|--------|
| Research | "Same mobile entered twice → new patient or alert?" |
| UX | ❌ Not addressed |
| Final | ❌ No visible duplicate check |

**What to change:** When entering mobile, if match found → "Patient exists! Select or create new?"

**Why it's better:** Prevents duplicate patient records. Cleaner data.

**If not done:** Same patient registered 5 times with slightly different names. Messy patient files.

---

## 🟢 NICE TO HAVE (Later)

### 10. Upcoming/Completed Tabs Filter

| Source | Status |
|--------|--------|
| Research | Competitors separate views |
| UX | ✅ Tabs: "Upcoming (que)" and "Completed" |
| Final | ❌ Single list with visual grouping (numbered vs dashed) |

**Assessment:** Final screen approach actually works! Visual grouping is sufficient. *No change needed.*

---

### 11. Empty State (Zero Patients)

| Source | Status |
|--------|--------|
| Research | Not mentioned |
| UX | ❌ Not shown |
| Final | ❌ Not shown |

**What to change:** Show friendly empty state: "No appointments yet! + Add your first patient"

**Why it's better:** First-time users aren't confused by blank screen.

**If not done:** New clinic sees blank table. Confusing.

---

## Summary Priority List

| Priority | Gap | Impact |
|----------|-----|--------|
| 🔴 P0 | Walk-in CTA | Speed |
| 🔴 P0 | KPI Summary Cards | Visibility |
| 🔴 P0 | Inline Status Updates | Speed |
| 🔴 P0 | Post-Consultation Prompt | Revenue |
| 🔴 P0 | Auto-Fill Fees | Consistency |
| 🟡 P1 | WhatsApp Toggle | No-shows |
| 🟡 P1 | Mobile-First Search | Speed |
| 🟡 P1 | Reschedule Flow | Workflow |
| 🟡 P1 | Duplicate Alert | Data Quality |
| 🟢 P2 | Empty State | Onboarding |

---

*Generated: 2026-03-18*
