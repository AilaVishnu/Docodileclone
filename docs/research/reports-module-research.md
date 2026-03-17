# 🔍 Reports Module — Research & Recommendations

## 🔍 Observations

- The FigJam board shows **5 competitors** with varying reporting depth — from basic (Competitor 2) to enterprise-grade analytics (Competitors 3 & 5)
- Most competitors use a combination of **KPI summary cards at the top** with detailed charts/tables below
- **Donut/ring charts** are the most common visualization type (4 out of 5 competitors use them)
- Competitors 3 and 5 have the deepest reporting hierarchies with 8-12 screens of drill-down
- Report categories identified: Appointments, Patients, Prescriptions, Drugs, Billing/Revenue, Diagnosis, Procedures
- Sticky notes specify exact metrics the team wants to track
- Role-based dashboards visible in Competitor 5 — different views for clinic admin vs doctor vs billing staff

---

## ❓ Questions / Gaps

1. **Role-based views** — Should doctors see revenue reports? Or only clinic admins?
2. **Date range flexibility** — Today/Week/Month/Custom? What's the default view?
3. **Export formats** — PDF? Excel? Which reports need export capability?
4. **Real-time vs cached** — How fresh does the data need to be? Real-time or hourly refresh?
5. **Comparison periods** — "This week vs last week" — is period comparison needed?
6. **Multi-clinic aggregation** — For clinic chains, can admin see aggregated reports across clinics?
7. **Goal tracking** — "Target: 50 patients/day, Achieved: 42" — do we need goal setting?
8. **Scheduled reports** — Auto-email daily/weekly reports to clinic owner?
9. **Mobile dashboard** — Do doctors need reports on mobile or is web sufficient?
10. **Data retention** — How far back should reports go? 1 year? 3 years? Forever?

---

## 💡 UX Insights

1. **Summary first, details on demand** — Lead with KPI cards; let users drill down if they want more
2. **Donut charts for categorical data** — Payment mode, gender, case type — donuts are intuitive
3. **Bar charts for comparisons** — Daily/weekly/monthly trends — bars work best
4. **Line charts for trends** — Revenue over time, patient count over time — lines show trajectory
5. **Color coding for status** — Green (positive), Red (negative/alerts), Yellow (warning)
6. **Date picker always visible** — Users constantly change date ranges; don't bury it
7. **Quick presets** — Today | This Week | This Month | Custom — one-click access
8. **Print-friendly layout** — Clinic owners print reports for staff meetings
9. **Sparklines in tables** — Show mini trend lines inline with tabular data

---

## 📊 Competitor Feature Matrix

| Feature | Comp 1 | Comp 2 | Comp 3 | Comp 4 | Comp 5 |
|---------|--------|--------|--------|--------|--------|
| KPI summary cards | ✅ | ❌ | ✅ | ✅ | ✅ |
| Donut/ring charts | ✅ | ❌ | ✅ | ✅ | ✅ |
| Bar charts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Line charts | ✅ | ❌ | ✅ | ✅ | ✅ |
| Data tables | ✅ | ❌ | ✅ | ✅ | ✅ |
| Left sidebar nav | ✅ | ❌ | ✅ | ✅ | ✅ |
| Role-based dashboards | ❌ | ❌ | ❓ | ❌ | ✅ |
| Financial metrics | ✅ | ❓ | ✅ | ✅ | ✅ |
| Clinical metrics | ✅ | ❓ | ✅ | ❓ | ✅ |
| Drill-down depth | Medium | Low | High | Medium | High |

---

## 📈 Metrics from FigJam Sticky Notes

### Appointment Analytics
- Total Appointments
- Average Waiting Time (In Min)
- Channel distribution: Appointment vs Walk-in
- Daily wise appointment count

### Patient Analytics
- Average Consultation Time (In Min)
- Weekly unique number of patients
- Consultation vs Reviews ratio
- Patient ratio (Male vs Female)

### Clinical Analytics
- Top Drug Manufacturer Distribution
- Top Symptoms (with Age/Gender Distribution)
- Top Procedures (with Age/Gender Distribution)
- Most common complaints
- Top Diagnoses

### Billing Analytics
- Total Amount Billed
- Total Discount Amount
- Total Payment Collected
- Paymode Wise Payment (Cash, UPI)
- Doctor wise payments received vs refunds
- Patient Due Payment Report

### Referral Analytics
- Number of patients referred
- Total commission earned
- Comparison in fixed time period
- Age/Gender Distribution of referrals

---

## 🐊 Croc's MVP Recommendation

Reports are **nice-to-have for MVP** — clinics can survive without dashboards initially. But basic revenue tracking is critical for business confidence.

### ✅ Include in MVP (Tier 1 — Basic Dashboard)
- Total appointments today/week/month
- Total revenue collected today/week/month
- Payment mode breakdown (Cash vs UPI vs Card) — donut chart
- Daily collection summary — bar chart
- Quick date range selector (Today | Week | Month)
- Print dashboard

### ⏳ Defer to Phase 2 (Tier 2 — Clinical Insights)
- Top diagnoses
- Top drugs prescribed
- Patient demographics (age/gender distribution)
- Most common complaints
- Waiting time analytics

### ⏳ Defer to Phase 3 (Tier 3 — Advanced Analytics)
- Doctor performance (revenue, patient count, avg consultation time)
- Referral tracking with commission
- Appointment vs Walk-in distribution
- Goal tracking (target vs achieved)
- Scheduled email reports
- Multi-clinic aggregation

---

## 📋 Reports Information Architecture

```
Reports (main entry)
├── Dashboard (default view)
│   ├── KPI Cards: Appointments | Revenue | Patients
│   ├── Daily Collection Chart (bar)
│   └── Payment Mode Breakdown (donut)
│
├── Appointments
│   ├── Daily/Weekly/Monthly count
│   ├── Walk-in vs Booked
│   └── Waiting time analysis
│
├── Revenue
│   ├── Total Billed vs Collected
│   ├── Discounts given
│   ├── Outstanding dues
│   ├── Doctor-wise revenue
│   └── Payment mode breakdown
│
├── Patients
│   ├── New vs Returning
│   ├── Age/Gender distribution
│   └── Consultation vs Review ratio
│
├── Clinical (Phase 2)
│   ├── Top Diagnoses
│   ├── Top Drugs
│   ├── Top Procedures
│   └── Common Complaints
│
└── Referrals (Phase 3)
    ├── Patients referred
    ├── Commission earned
    └── Referral source breakdown
```

---

## 📊 Recommended Chart Types

| Metric | Chart Type | Why |
|--------|-----------|-----|
| Total Appointments/Revenue | KPI Card | Quick glance at headline number |
| Daily Collection | Bar Chart | Easy day-to-day comparison |
| Weekly Trend | Line Chart | Shows trajectory over time |
| Payment Mode | Donut Chart | Categorical breakdown |
| Gender Distribution | Donut Chart | Categorical breakdown |
| Top Diagnoses | Horizontal Bar | Ranked list comparison |
| Doctor Performance | Table with Sparklines | Multiple metrics per doctor |
| Age Distribution | Histogram | Continuous data |

---

*Last updated by Croc* 🐊 *on 2026-03-17*
