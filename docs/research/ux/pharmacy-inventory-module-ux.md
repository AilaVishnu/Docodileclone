# Pharmacy Inventory Module — UX Research

## Overview
This document captures UX research, user flows, pain points, and design decisions for the Pharmacy Inventory Module within the Docodile EMR system.

---

## Goals
- Help pharmacy staff manage drug stock efficiently
- Reduce medication errors caused by stock mismanagement
- Provide real-time visibility into inventory levels
- Enable timely reordering before stock runs out

---

## Target Users
| User | Role | Primary Need |
|------|------|--------------|
| Pharmacist | Manages stock, dispenses medication | Quick stock lookup, low-stock alerts |
| Pharmacy Technician | Assists with stocking and dispensing | Simple reorder flow, batch updates |
| Hospital Admin | Oversees procurement | Reports, usage trends, cost tracking |

---

## Key User Flows

### 1. Check Inventory
1. User navigates to Pharmacy → Inventory
2. Search or browse drug list
3. View current stock level, expiry dates, and reorder threshold
4. Take action: reorder, adjust stock, or flag for review

### 2. Reorder Drugs
1. Low-stock alert triggers (manual or automated)
2. User reviews the suggested reorder quantity
3. Confirms and submits purchase order
4. Order status tracked in the system

### 3. Receive Stock
1. User opens pending orders
2. Scans or manually enters received quantities
3. System updates inventory levels
4. Discrepancies flagged for review

### 4. Dispense Medication
1. Prescription linked to patient record
2. Pharmacist verifies drug, dose, and patient details
3. Stock decremented on dispensing
4. Dispense record logged for audit trail

---

## Pain Points (Research Findings)
- **Manual stock counting** is time-consuming and error-prone
- **Expiry tracking** is often missed, leading to waste
- **Low-stock alerts** come too late in existing systems
- **No visibility** into which wards are consuming most stock
- **Reordering** involves too many steps / separate systems

---

## Design Principles for This Module
1. **Speed first** — Pharmacists are busy. Every action should be ≤ 3 clicks.
2. **Alert-driven** — Surface critical info (low stock, expiry) proactively.
3. **Error prevention** — Confirm destructive actions, validate inputs.
4. **Audit-ready** — Every action must be logged with user + timestamp.
5. **Accessible** — Meet WCAG 2.1 AA standards (medical software requirement).

---

## Key UI Components Needed
- Inventory table with search, filter, and sort
- Low stock / expiry warning badges
- Reorder form with quantity suggestions
- Stock receive form with discrepancy handling
- Dashboard widget: stock health summary
- Audit log view

---

## Open Questions
- [ ] Should reordering be integrated with a supplier API or manual?
- [ ] What is the reorder threshold logic — fixed or dynamic based on usage?
- [ ] Do we need barcode/QR scanning support for receiving stock?
- [ ] Should expiry alerts be configurable per drug category?

---

## Next Steps
- [ ] Wireframe key flows in Figma
- [ ] Validate flows with a pharmacist user interview
- [ ] Define data model for inventory items
- [ ] Align with backend team on API design

---

*Last updated: 2026-03-23 | Author: Croc (AI Co-founder, Docodile)*
