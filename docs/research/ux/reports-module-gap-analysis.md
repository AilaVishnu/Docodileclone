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

## Gap Analysis — What Research Has, UX May Be Missing

| # | Feature from Research | In UX Flow? | Gap / Notes |
|---|---|---|---|
| 1 | Revenue breakdown by doctor | ❓ | Competitor analysis flags this as critical for multi-doctor clinics — not confirmed in UX |
| 2 | Revenue breakdown by service type | ❓ | Itemised service revenue not visible in UX flow |
| 3 | Revenue breakdown by payment mode (cash vs. digital) | ❓ | Needed for daily accounting — not mapped |
| 4 | Outstanding dues / pending payments list | ❌ | Top pain point in competitor reviews — not in UX scope |
| 5 | No-show and cancellation report | ❌ | Competitor analysis shows this as a frequently requested feature — missing from UX |
| 6 | Peak hours / busy slot heatmap | ❌ | Not in UX — helps clinics optimise scheduling |
| 7 | End-of-day collection summary | ❌ | Front desk reconciliation flow — not mapped in UX |
| 8 | Export to PDF | ❓ | WhatsApp sharing is mentioned but PDF export not explicitly mapped |
| 9 | Export to Excel / CSV | ❌ | Competitor table-stakes — not in UX |
| 10 | Month-on-month comparison | ❌ | "This month vs. last month" comparison — not in UX |
| 11 | Doctor performance metrics | ❌ | Relevant for multi-doctor clinics — not in UX |
| 12 | Patient retention / drop-off trend | ❓ | New vs. returning is noted but drop-off tracking not mapped |

---

## Recommendations

### Do This (MVP)
- Add outstanding dues list — patients with pending payments, amount, and since when
- Add end-of-day collection summary for front desk (total cash + digital collected today)
- Add date range filter as a persistent, always-visible control — not buried in settings
- Add revenue breakdown by payment mode (cash vs. digital) — simplest split to implement
- Add PDF export — one-tap, covers the accountant sharing use case

### Do This (Post-MVP)
- Revenue breakdown by doctor (critical for multi-doctor clinics)
- Revenue breakdown by service type
- No-show and cancellation report (pull from appointments data)
- Month-on-month comparison on the revenue card
- Export to Excel / CSV

### Do This (Future / Moat)
- Peak hours heatmap
- Patient retention and drop-off analytics
- Doctor performance dashboard
- Aggregated anonymised insights (referenced in research monetisation sticky)

---

## What Happens If You Do

- *Outstanding dues + end-of-day summary* → Front desk has a complete daily workflow inside Docodile. No parallel Excel needed.
- *Revenue breakdown by mode* → Clinic owners can reconcile cash vs. UPI instantly — saves 30 min every evening.
- *PDF export + WhatsApp share* → Doctor shares monthly report with accountant in 2 taps. Docodile becomes part of their finance routine.
- *Date range filter* → Every report becomes sliceable — users self-serve without calling support.

## What Happens If You Don't

- *No outstanding dues* → Clinics leak revenue silently. When they realise Docodile can't show this, they look for an alternative.
- *No export* → Data is trapped inside the app. Doctors screenshot reports. Docodile feels unfinished.
- *No date filter* → Reports screen is a static snapshot. Nobody uses it after the first week.
- *No breakdown by doctor* → Multi-doctor clinics (growth segment) feel the product is built for solo practitioners only. Churn risk.

---

## Priority Order for Final Screen Design

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| P0 | Revenue KPI strip (today / month / year) | Low | Very High |
| P0 | Date range filter — always visible | Low | Very High |
| P0 | Outstanding dues list | Low | Very High |
| P1 | Revenue breakdown by payment mode | Low | High |
| P1 | End-of-day collection summary | Medium | High |
| P1 | PDF export + WhatsApp share | Medium | High |
| P2 | Revenue breakdown by doctor / service | Medium | High |
| P2 | Patient analytics (new vs. returning + drop-off) | Medium | High |
| P2 | Appointment no-shows + cancellations | Medium | Medium |
| P3 | Month-on-month comparison | Medium | Medium |
| P3 | Peak hours heatmap | High | Medium |
| P3 | Doctor performance dashboard | High | Medium |

---

## Status
- [ ] Gap analysis reviewed by product team
- [ ] Gaps prioritized for design
- [ ] UX updated to reflect missing flows
- [ ] Final screen design started
