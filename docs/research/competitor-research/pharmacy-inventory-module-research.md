# 🔍 Pharmacy & Inventory Management Module — Research & Recommendations

## 🔍 Observations

- The research board shows **4 competitor products** with comprehensive pharmacy/inventory workflows
- All competitors structure their pharmacy module around **three pillars**: Billing, Inventory, and Invoice/Purchase Management
- **Dashboard-first approach** with KPI cards for quick status overview is common (Competitor 3)
- **Master-Detail pattern** is universal — every competitor uses tabular list views that drill into detail screens
- Batch-level inventory tracking with **expiry management** is a core requirement across all competitors
- None of the competitors prominently feature **drug interaction checking** or **barcode/QR scanning** — potential differentiation opportunity

### Competitor Flow Structure (from FigJam Board)

**Flow 1 — Drug/Medicine Management**
```
Purchase → Add new purchase
Stock → Stock verify → Stock loss/add → expiring soon
Reports → Medicine reports
Masters → Supplier master → New medicine
```

**Flow 2 — Pharmacy Operations**
```
Pharmacy → Billing → All bills
         → Inventory → Opening stock → view Inventory details
                    → Medicine master details
         → Invoices → Add invoice
```

---

## ❓ Questions / Gaps

1. **Prescription Integration** — How does pharmacy billing tie to doctor prescriptions?
2. **Multi-location Support** — Should inventory sync across multiple clinic/pharmacy locations?
3. **Barcode/QR Scanning** — Is scanning integration required for stock intake and billing?
4. **Drug Interaction Alerts** — Should the system warn when dispensing contraindicated combinations?
5. **GST/Tax Handling** — How are HSN codes, GST rates, and tax invoices handled?
6. **Controlled Substances** — What tracking/reporting is needed for Schedule H/H1/X drugs?
7. **Return Management** — How are customer returns and supplier returns handled differently?
8. **Credit Sales** — Do clinics need credit-based pharmacy sales to regular patients?
9. **Vendor Management** — Should we support multiple suppliers per drug with price comparison?
10. **Integration with e-Pharmacy** — Any future need to integrate with 1mg, Medlife, etc.?

---

## 💡 UX Insights

1. **Dashboard with KPI Cards** — Surface critical metrics at a glance: low stock count, expiring items, today's sales
2. **Quick Stock Check** — Doctors should be able to check medicine availability without leaving the prescription pad
3. **Batch-first Display** — Show batch number and expiry prominently — pharmacists need this constantly
4. **Smart Reorder Alerts** — Proactive notifications when stock hits reorder level
5. **Expiry Color Coding** — Red for expired, orange for 30-day warning, yellow for 90-day warning
6. **Supplier Quick-Add** — Allow adding new supplier inline during purchase entry
7. **Bill-to-Prescription Linking** — One-click access from pharmacy bill back to the originating prescription

---

## 🐊 Croc's MVP Recommendation

### ✅ Include in MVP
- Medicine Master: Name, generic, brand, category, dosage form, strength, unit, MRP, purchase price
- Basic Inventory: Current stock, batch number, expiry date, reorder level
- Dispensing/Billing: Prescription → Pharmacy bill flow
- Stock Alerts: Low stock and expiry warnings on dashboard
- Simple Purchase Entry: Add new stock with batch, expiry, quantity, supplier, cost
- Stock Adjustment: Manual add/deduct for corrections and losses
- Basic Reports: Current stock list, expiry report, daily sales summary

### ⏳ Defer to Phase 2
- Full procurement workflow (purchase orders, GRN, supplier invoices)
- Multiple location/store inventory
- Barcode/QR scanning integration
- Drug interaction checking
- Controlled substance tracking and registers

---

*Last updated by Croc 🐊 on 2026-03-17*
