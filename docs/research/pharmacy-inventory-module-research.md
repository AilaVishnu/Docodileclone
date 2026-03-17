# 🔍 Pharmacy & Inventory Management Module — Research & Recommendations

## 🔍 Observations

- The research board shows **4 competitor products** with comprehensive pharmacy/inventory workflows
- All competitors structure their pharmacy module around **three pillars**: Billing, Inventory, and Invoice/Purchase Management
- **Dashboard-first approach** with KPI cards for quick status overview is common (Competitor 3)
- **Master-Detail pattern** is universal — every competitor uses tabular list views that drill into detail screens
- Batch-level inventory tracking with **expiry management** is a core requirement across all competitors
- None of the competitors prominently feature **drug interaction checking** or **barcode/QR scanning** — potential differentiation opportunity

### Competitor Flow Structure (from FigJam Board)

**Flow 1 — Drug/Medicine Management (labeled: Purchase, Stock, Reports, Masters)**
```
Purchase → Add new purchase
Stock → Stock verify → Stock loss/add → expiring soon
Reports → Medicine reports
Masters → Supplier master → Masters → New medicine
```

**Flow 2 — Supplier Management**
```
Supplier management → Add
```

**Flow 3 — Pharmacy Operations (labeled: Pharmacy, Billing, Inventory, Invoices)**
```
Pharmacy → Billing → All bills
         → Inventory → Opening stock
                    → view Inventory → view Inventory details
                    → Medicine master details
         → Invoices → Add invoice
```

**Flow 4 — Extended Pharmacy Operations**
```
Pharmacy stocks
Stock returns
Create purchase order
```

---

## ❓ Questions / Gaps

1. **Prescription Integration** — How does pharmacy billing tie to doctor prescriptions? Auto-populate items?
2. **Multi-location Support** — Should inventory sync across multiple clinic/pharmacy locations?
3. **Barcode/QR Scanning** — Is scanning integration required for stock intake and billing?
4. **Drug Interaction Alerts** — Should the system warn when dispensing contraindicated combinations?
5. **GST/Tax Handling** — How are HSN codes, GST rates, and tax invoices handled for Indian compliance?
6. **Controlled Substances** — What tracking/reporting is needed for Schedule H/H1/X drugs?
7. **Return Management** — How are customer returns and supplier returns handled differently?
8. **Credit Sales** — Do clinics need credit-based pharmacy sales to regular patients?
9. **Vendor Management** — Should we support multiple suppliers per drug with price comparison?
10. **Integration with e-Pharmacy** — Any future need to integrate with 1mg, Medlife, etc.?

---

## 💡 UX Insights

1. **Dashboard with KPI Cards** — Surface critical metrics at a glance: low stock count, expiring items, today's sales, pending orders
2. **Quick Stock Check** — Doctors should be able to check medicine availability without leaving the prescription pad
3. **Batch-first Display** — Show batch number and expiry prominently in all stock views — pharmacists need this constantly
4. **Smart Reorder Alerts** — Proactive notifications when stock hits reorder level, not just when it's empty
5. **Barcode Entry Option** — Allow stock entry via barcode scan OR manual search — speed matters
6. **Expiry Color Coding** — Red for expired, orange for 30-day warning, yellow for 90-day warning
7. **Tabbed Forms for Drug Master** — Complex drug data needs organized tabs (Basic, Pricing, Stock, Supplier) — but limit to 4-5 tabs max
8. **Supplier Quick-Add** — Allow adding new supplier inline during purchase entry, don't force navigation away
9. **Bill-to-Prescription Linking** — One-click access from pharmacy bill back to the originating prescription
10. **Dark Theme Option** — Pharmacy counters often have low lighting; offer dark mode

---

## 🐊 Croc's MVP Recommendation

Pharmacy is **revenue-critical** — clinics with in-house dispensing need this to monetize. But it's also the most **operationally complex** module. For MVP, focus on **dispensing from prescriptions** and **basic stock tracking**. Save advanced procurement and analytics for Phase 2.

### ✅ Include in MVP

- **Medicine Master**: Name, generic, brand, category, dosage form, strength, unit, MRP, purchase price
- **Basic Inventory**: Current stock, batch number, expiry date, reorder level
- **Dispensing/Billing**: Prescription → Pharmacy bill flow, item selection, quantity, pricing, discounts
- **Stock Alerts**: Low stock and expiry warnings on dashboard
- **Simple Purchase Entry**: Add new stock with batch, expiry, quantity, supplier, cost
- **Stock Adjustment**: Manual add/deduct for corrections and losses
- **Basic Reports**: Current stock list, expiry report, daily sales summary

### ⏳ Defer to Phase 2

- Full procurement workflow (purchase orders, GRN, supplier invoices)
- Multiple location/store inventory
- Barcode/QR scanning integration
- Drug interaction checking
- Advanced analytics and trend charts
- Supplier management with price comparison
- Controlled substance tracking and registers
- Customer returns processing
- Credit sales and accounts receivable

---

## 📋 Core Pharmacy Flows

### Flow 1: Dispensing from Prescription
```
Doctor writes prescription
    ↓
Patient goes to pharmacy counter
    ↓
Pharmacist opens prescription
    ↓
System auto-suggests items from prescription
  → Pharmacist selects batch (FEFO — First Expiry First Out)
  → Adjusts quantity if partial fill
    ↓
Bill generated
  → Patient name | Prescription ref | Items | Qty | Price | Discount | Tax | Total
    ↓
Payment captured
    ↓
Stock auto-deducted (batch-wise)
    ↓
Print/WhatsApp bill to patient
```

### Flow 2: Stock Purchase Entry
```
Stock arrives from supplier
    ↓
Pharmacist opens "Add Purchase"
    ↓
Enter/select supplier
    ↓
Add items:
  → Search medicine | Qty | Batch | Expiry | Cost price | MRP
    ↓
Save purchase entry
    ↓
Stock levels updated
    ↓
(Optional) Record supplier invoice number for accounting
```

### Flow 3: Stock Adjustment
```
Physical count differs from system
    ↓
Pharmacist opens "Stock Adjust"
    ↓
Search medicine → Select batch
    ↓
Enter adjustment: +/- quantity
    ↓
Select reason: Damaged | Expired | Theft | Count correction
    ↓
Save with notes
    ↓
Stock updated, adjustment logged
```

---

## 📊 Data Fields Reference

### Medicine Master
| Field | Required | Notes |
|-------|----------|-------|
| Medicine Name | Yes | Brand name (e.g., Crocin 500mg) |
| Generic Name | No | Active ingredient (e.g., Paracetamol) |
| Category | Yes | Analgesic, Antibiotic, etc. |
| Dosage Form | Yes | Tablet, Capsule, Syrup, Injection |
| Strength | Yes | 500mg, 10ml, etc. |
| Unit | Yes | Strip, Bottle, Vial, Box |
| MRP | Yes | Maximum Retail Price |
| Purchase Price | Yes | Cost price for margin calculation |
| HSN Code | No | For GST compliance |
| Manufacturer | No | Pharma company name |
| Schedule | No | H, H1, X, OTC |
| Reorder Level | No | Alert threshold |

### Inventory (Stock)
| Field | Required | Notes |
|-------|----------|-------|
| Medicine | Yes | Link to medicine master |
| Batch Number | Yes | Supplier's batch ID |
| Expiry Date | Yes | Critical for FEFO |
| Quantity | Yes | Current stock count |
| Purchase Price | Yes | Cost at time of purchase |
| Supplier | No | Who supplied this batch |
| Purchase Date | Yes | When stock was received |
| Location | No | Store/counter (Phase 2) |

### Pharmacy Bill
| Field | Required | Notes |
|-------|----------|-------|
| Bill Number | Yes | Auto-generated |
| Bill Date | Yes | Timestamp |
| Patient Name | Yes | Link to patient record |
| Prescription Ref | No | Link to source prescription |
| Items | Yes | Medicine, batch, qty, price |
| Subtotal | Yes | Before discount/tax |
| Discount | No | Flat or % |
| Tax/GST | No | Calculated from HSN |
| Total | Yes | Final payable |
| Payment Mode | Yes | Cash/UPI/Card |
| Payment Status | Yes | Paid/Pending |

---

## 🎯 Competitor Patterns Summary

| Pattern | Used By | Docodile Approach |
|---------|---------|-------------------|
| Dashboard KPIs | Competitor 3 | ✅ Adopt — essential for quick status |
| Left sidebar nav | Competitors 2, 3 | ✅ Adopt — consistent with rest of EMR |
| Tabbed forms | Competitor 1 | ✅ Adopt (but limit to 4 tabs max) |
| Master-Detail tables | All | ✅ Adopt — universal pattern |
| Modal confirmations | Competitors 1, 3 | ✅ Adopt for critical actions |
| Dark theme | Competitor 3 | ⏳ Phase 2 — nice to have |
| 3+ navigation depth | Competitor 4 | ❌ Avoid — keep flows shallow |

---

*Last updated by Croc 🐊 on 2026-03-17*
