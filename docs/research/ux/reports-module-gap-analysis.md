# Reports Module — UX Gap Analysis

> Source: Docodile Research Study (FigJam) — UX Page, Reports Section (586:3244, 569:2905, 569:2906)
> Compared against: Competitor Analysis (Competitor 1 + Doctecq)

---

## Research Findings (Competitor Analysis)

### Features Competitors Have
- Revenue dashboard — daily, weekly, monthly, yearly
- Revenue breakdown by doctor, by service, by payment mode (cash vs. digital)
- Outstanding dues / pending payments per patient
- New vs. returning patient count
- Patient demographics (age, gender distribution)
- Appointment volume reports (daily/weekly/monthly)
- No-show and cancellation tracking
- Peak hours / busy slot heatmap
- Doctor performance metrics
- Collection efficiency rate
- Export to PDF
- Export to Excel / CSV
- Date range filter (Today / This Week / This Month / Custom)
- Bill-wise report with itemised view
- Pharmacy / inventory consumption report

### User Pain Points from Reviews
- Cannot see which patients have outstanding dues — tracked in a separate Excel
- No daily end-of-day collection summary for front desk reconciliation
- Reports are static — no date filtering or comparison with previous periods
- Export is broken or missing in most competitors — doctors take screenshots
- Multi-doctor clinics can't split revenue per doctor — everything is lumped together
- No way to see patient retention or drop-off trends
- Appointment no-show data is not reported anywhere

---

## Research UX (Docodile FigJam — Reports Section)

### What the UX Covers
- Revenue summary view (financial overview for clinic)
- Patient-level reporting (new vs. returning)
- Appointment analytics overview
- Bills and collections flow tied into reports
- WhatsApp sharing as a distribution channel for reports
- Date-based filtering as a core interaction
- Role-based access — Admin/Owner sees full reports, Doctor sees limited view

### UX Flows Mapped
- [ ] View revenue summary
- [ ] Filter reports by date range
- [ ] View patient analytics
- [ ] View appointment analytics
- [ ] Export / share report

---

## Gap Analysis

---

### GAP 1 — No Outstanding Dues List (P0)

**What the Research Says:** Top pain point from competitor reviews — clinics track outstanding dues in a separate Excel sheet because the EMR doesn't surface this.

**What Should Change:** A dedicated "Outstanding Dues" view in the Reports module listing patients with pending balances — patient name, amount due, and since when. Filterable by date range and doctor.

**What Happens If You Do This:**
Front desk has a complete daily workflow inside Docodile. No parallel Excel needed. Clinic owner can see revenue leakage at a glance. Collections calls are data-driven, not from memory.

**What Happens If You Don't:**
Clinics leak revenue silently. When they realise Docodile can't show outstanding dues, they keep their Excel sheet as the source of truth — and Docodile becomes the secondary system.

---

### GAP 2 — No End-of-Day Collection Summary (P0)

**What the Research Says:** Front desk reconciliation is a daily pain point — there's no summary of what was collected today, in what mode, and what's still outstanding.

**What Should Change:** End-of-day summary view showing: total collected today (cash + digital separately), total outstanding for the day, and a per-payment-mode breakdown.

**What Happens If You Do This:**
Front desk has a clean end-of-shift tool inside Docodile. No separate cash counting sheet. Saves 20–30 minutes every evening. Closes the daily workflow loop inside the product.

**What Happens If You Don't:**
Front desk maintains a WhatsApp message or notebook for daily collections. Docodile is not part of their end-of-day routine — and they'll eventually stop opening it after hours.

---

### GAP 3 — Date Range Filter Not Explicitly Mapped (P0)

**What the Research Says:** Reports are described as static in competitor reviews — no date filtering or period comparison. Date-based filtering is called out in the FigJam as a core interaction.

**What Should Change:** Date range filter as a persistent, always-visible control on every reports view — not buried in settings. Quick options: Today, This Week, This Month, Custom Range.

**What Happens If You Do This:**
Every report becomes sliceable. Users self-serve date comparisons without calling support. The reports screen is actually used regularly, not just once when set up.

**What Happens If You Don't:**
Reports are a static snapshot. Nobody opens a static screen more than once. The Reports module becomes a dead feature after the first week.

---

### GAP 4 — No Revenue Breakdown by Doctor (P1)

**What the Research Says:** Competitor analysis flags this as critical for multi-doctor clinics — revenue lumped together is useless for per-doctor performance tracking.

**What Should Change:** Revenue breakdown card or tab showing total collections per doctor for the selected period. Filterable by date range.

**What Happens If You Do This:**
Multi-doctor clinic owners can see each doctor's contribution instantly. Payroll calculations, incentive tracking, and performance reviews become data-driven inside Docodile.

**What Happens If You Don't:**
Multi-doctor clinics — a major growth segment — feel the product is built for solo practitioners only. They'll manage doctor-level revenue in Excel. Churn risk for the clinics Docodile wants most.

---

### GAP 5 — No Revenue Breakdown by Service Type (P1)

**What the Research Says:** Itemised service revenue is not visible in the current UX flow — flagged in competitor analysis.

**What Should Change:** Revenue breakdown showing collections by service category: consultation fees, treatments, procedures, pharmacy. Helps clinics understand where their money comes from.

**What Happens If You Do This:**
Clinic owner sees "60% of revenue is from treatments, 30% consultation, 10% pharmacy" — and makes business decisions accordingly. Feeds into pricing and capacity planning.

**What Happens If You Don't:**
Revenue is a single number. No business insight. Clinic owners who want this data will pull it manually from bills — slow, error-prone, and not something they'll do in Docodile.

---

### GAP 6 — No Revenue Breakdown by Payment Mode (P1)

**What the Research Says:** Needed for daily accounting — cash vs. UPI/digital reconciliation is a nightly task for every clinic.

**What Should Change:** Payment mode split on the revenue summary — Cash collected today: ₹X, Digital collected today: ₹Y. Breakable by day/week/month.

**What Happens If You Do This:**
Clinic owner reconciles cash vs. UPI instantly — saves 30 minutes every evening. Tax filing is easier when digital vs. cash is tracked separately.

**What Happens If You Don't:**
Reconciliation happens outside the app. Cash and digital are manually tallied. Docodile's financial data is trusted less because it doesn't match the manual count.

---

### GAP 7 — No No-Show and Cancellation Report (P1)

**What the Research Says:** Frequently requested in competitor analysis — no-show data is a top metric for clinic efficiency but is not reported anywhere.

**What Should Change:** Appointment analytics report showing: total scheduled vs. completed vs. no-show vs. cancelled. Per-doctor breakdown. Trend over time.

**What Happens If You Do This:**
Clinic owner sees "15% no-show rate on Mondays" and adjusts scheduling or reminder triggers. Actionable insight that directly affects revenue.

**What Happens If You Don't:**
No-show data is invisible. Clinics can't measure or improve it. Reminder systems are set up blindly without knowing if they're working.

---

### GAP 8 — No PDF Export (P1)

**What the Research Says:** Export is broken or missing across most competitors — doctors and accountants screenshot reports because there's no export.

**What Should Change:** A "Export PDF" action on every report view generating a clean, shareable PDF with clinic name, date range, and report data.

**What Happens If You Do This:**
Doctor shares monthly report with accountant in 2 taps. Docodile becomes part of their monthly finance routine — high stickiness. WhatsApp sharing of reports becomes a natural workflow.

**What Happens If You Don't:**
Data is trapped inside the app. Doctors screenshot reports. Docodile feels unfinished compared to basic spreadsheet tools. Accountants ignore it.

---

### GAP 9 — No Excel / CSV Export (P2)

**What the Research Says:** Table-stakes feature across all competitors. Accountants and clinic managers want raw data for their own analysis.

**What Should Change:** Export to Excel/CSV on all tabular report views (bills, outstanding dues, patient list).

**What Happens If You Do This:**
Accountants and clinic managers can do their own analysis outside Docodile. Docodile is trusted as the system of record because data can be extracted.

**What Happens If You Don't:**
Power users who need raw data will maintain parallel records. Docodile is not their primary data source.

---

### GAP 10 — No Month-on-Month Comparison (P2)

**What the Research Says:** "This month vs. last month" comparison is missing across competitor tools — users want to see growth or decline at a glance.

**What Should Change:** Revenue and patient count cards showing current period vs. previous period with a percentage change indicator (↑ 12% vs last month).

**What Happens If You Do This:**
Clinic owner gets a business health signal in one glance. No manual comparison needed. Docodile becomes the morning dashboard they open first.

**What Happens If You Don't:**
Reports are point-in-time snapshots with no context. A ₹50,000 month means nothing without knowing if last month was ₹40,000 or ₹70,000.

---

### GAP 11 — No Patient Retention / Drop-Off Analytics (P2)

**What the Research Says:** New vs. returning patient count is noted in the FigJam but drop-off tracking is not mapped.

**What Should Change:** Patient retention view showing: new patients this period, returning patients, patients who visited once and never returned (drop-off), and average visit frequency.

**What Happens If You Do This:**
Clinic owner sees "40% of new patients never come back" — and investigates why. Enables targeted re-engagement. Differentiated insight that competitors don't offer.

**What Happens If You Don't:**
Patient acquisition and retention are invisible as metrics. Clinic can't measure marketing effectiveness or identify drop-off causes.

---

### GAP 12 — No Peak Hours Heatmap (P3)

**What the Research Says:** Helps clinics optimise scheduling — not in current UX scope.

**What Should Change:** Visual heatmap of appointment volume by day-of-week and time-of-day over the selected period.

**What Happens If You Do This:**
Clinic manager sees "Tuesday 11am–1pm is always overloaded" and adds a doctor or adjusts slots. Capacity optimisation becomes data-driven.

**What Happens If You Don't:**
Scheduling decisions are made by gut feel. Overbooking and underbooking patterns persist.

---

## Priority Order for Final Screen Design

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| P0 | Revenue KPI strip (today / month / year) | Low | Very High |
| P0 | Date range filter — always visible | Low | Very High |
| P0 | Outstanding dues list | Low | Very High |
| P1 | Revenue breakdown by payment mode | Low | High |
| P1 | End-of-day collection summary | Medium | High |
| P1 | PDF export + WhatsApp share | Medium | High |
| P1 | No-show and cancellation report | Medium | High |
| P2 | Revenue breakdown by doctor / service | Medium | High |
| P2 | Patient analytics (new vs. returning + drop-off) | Medium | High |
| P2 | Month-on-month comparison | Medium | Medium |
| P2 | Excel / CSV export | Low | Medium |
| P3 | Peak hours heatmap | High | Medium |
| P3 | Doctor performance dashboard | High | Medium |

---

## Status
- [ ] Gap analysis reviewed by product team
- [ ] Gaps prioritized for design
- [ ] UX updated to reflect missing flows
- [ ] Final screen design started

---

*Analysis by Croc 🐊 | Docodile AI Co-Founder*
