import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { colors, fonts, spacing, radii } from "../../styles/theme";
import { Button } from "../Button";
import { Select } from "../Input/Select/Select";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash.svg";

type Medicine = {
  id: string;
  name: string;
  dosage?: string;
  unitPrice: number;
  qty: number;
  // True if this medicine is in the clinic's pharmacy stock. When false
  // the row is highlighted as "not in inventory" and the unit price is
  // editable so the dispensary can charge a one-off rate.
  inStock?: boolean;
};

type CatalogItem = {
  id: string;
  name: string;
  unitPrice: number;
};

const DEFAULT_CATALOG: CatalogItem[] = [
  { id: "c-paracetamol", name: "Paracetamol 500mg", unitPrice: 12 },
  { id: "c-amoxicillin", name: "Amoxicillin 500mg", unitPrice: 18 },
  { id: "c-cetirizine", name: "Cetirizine 10mg", unitPrice: 8 },
  { id: "c-pantoprazole", name: "Pantoprazole 40mg", unitPrice: 22 },
  { id: "c-vitamind3", name: "Vitamin D3 60K", unitPrice: 45 },
  { id: "c-azithromycin", name: "Azithromycin 250mg", unitPrice: 35 },
  { id: "c-ibuprofen", name: "Ibuprofen 400mg", unitPrice: 14 },
  { id: "c-metformin", name: "Metformin 500mg", unitPrice: 9 },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // Called when "Charge & Bill" / "Mark Waived" is clicked. The third
  // arg lists every billed medicine (name + qty) so the host can deduct
  // them from the clinic's pharmacy inventory in one round-trip.
  onBilled?: (paymentMethod: string, total: number, items: { name: string; qty: number; inStock: boolean }[]) => void;
  patientName: string;
  medicines: Medicine[];
  loading?: boolean;
  /** Catalog the user can pick from when adding a new medicine. */
  catalog?: CatalogItem[];
  /** Outstanding amount from the consultation (or other un-paid items) carried into this bill. */
  pendingDue?: number;
  /** Short label shown next to the pending-due amount (e.g. "Consultation"). */
  pendingDueLabel?: string;
};

const inr = (n: number) =>
  `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function BillMedicinesModal({ isOpen, onClose, onBilled, patientName, medicines: initial, loading = false, catalog = DEFAULT_CATALOG, pendingDue = 0, pendingDueLabel = "Consultation due" }: Props) {
  const [items, setItems] = useState<Medicine[]>(initial);
  const [discount, setDiscount] = useState<number>(0);
  const [discountMode, setDiscountMode] = useState<"%" | "₹">("%");
  const [gst, setGst] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItems(initial);
      setDiscount(0);
      setDiscountMode("%");
      setGst(0);
      setPaymentMethod("Cash");
      setIsAdding(false);
    }
  }, [isOpen, initial]);

  const handleCatalogPick = (catalogId: string) => {
    const picked = catalog.find((c) => c.id === catalogId);
    if (!picked) return;
    setItems((prev) => {
      const existing = prev.find((m) => m.name === picked.name);
      if (existing) {
        return prev.map((m) => (m.id === existing.id ? { ...m, qty: m.qty + 1 } : m));
      }
      return [...prev, { id: `add-${Date.now()}`, name: picked.name, unitPrice: picked.unitPrice, qty: 1, inStock: true }];
    });
    setIsAdding(false);
  };

  const pickedNames = new Set(items.map((m) => m.name));
  const availableCatalog = catalog.filter((c) => !pickedNames.has(c.name));

  const subtotal = useMemo(
    () => items.reduce((acc, m) => acc + m.unitPrice * m.qty, 0),
    [items]
  );
  const due = Math.max(0, pendingDue);
  const discountAmt = discountMode === "%" ? (subtotal * discount) / 100 : discount;
  const afterDiscount = Math.max(0, subtotal - discountAmt);
  const gstAmt = (afterDiscount * gst) / 100;
  const total = afterDiscount + gstAmt + due;

  const setQty = (id: string, qty: number) => {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, qty: Math.max(0, qty) } : m)));
  };

  const setUnitPrice = (id: string, unitPrice: number) => {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, unitPrice: Math.max(0, unitPrice) } : m)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
  };

  if (!isOpen) return null;

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.body} onClick={(e) => e.stopPropagation()}>
        {/* ── Left card: medicines list ─────────────────────────────── */}
        <div style={styles.leftCard}>
          <div style={styles.leftHeader}>
            <h3 style={styles.title}>Medicines</h3>
            <div style={styles.subtitle}>For {patientName}</div>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <colgroup>
                <col style={{ width: "auto" }} />
                <col style={{ width: "70px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "80px" }} />
                <col style={{ width: "36px" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={styles.th}>Medicine</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Unit ₹</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Qty</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
                  <th style={styles.th} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} style={{ ...styles.td, textAlign: "center", color: colors.neutral500, borderBottom: "none" }}>
                      Loading prescription…
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && !isAdding && (
                  <tr>
                    <td colSpan={5} style={{ ...styles.td, textAlign: "center", color: colors.neutral500, borderBottom: "none" }}>
                      No medicines prescribed yet.
                    </td>
                  </tr>
                )}
                {items.map((m, idx) => {
                  const isLast = idx === items.length - 1 && !isAdding;
                  const cellStyle = isLast ? { ...styles.td, borderBottom: "none" } : styles.td;
                  // Rows for meds the clinic doesn't stock get a soft red
                  // background and an editable price field — the dispensary
                  // can charge a one-off rate without leaving the modal.
                  const notInStock = m.inStock === false;
                  const rowStyle = notInStock ? { backgroundColor: colors.redAlpha10 } : undefined;
                  return (
                    <tr key={m.id} style={rowStyle}>
                      <td style={cellStyle}>
                        {m.name}
                        {notInStock && (
                          <span style={styles.notInStockBadge} title="Not in pharmacy inventory">Not in stock</span>
                        )}
                      </td>
                      <td style={{ ...cellStyle, textAlign: "right" }}>
                        {notInStock ? (
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={m.unitPrice || ""}
                            placeholder="0"
                            onChange={(e) => setUnitPrice(m.id, Number(e.target.value))}
                            style={styles.priceInput}
                          />
                        ) : (
                          m.unitPrice.toLocaleString("en-IN")
                        )}
                      </td>
                      <td style={{ ...cellStyle, textAlign: "center" }}>
                        <div style={styles.qtyWrap}>
                          <button style={styles.stepper} onClick={() => setQty(m.id, m.qty - 1)} disabled={m.qty <= 0}>−</button>
                          <span style={styles.qtyValue}>{m.qty}</span>
                          <button style={styles.stepper} onClick={() => setQty(m.id, m.qty + 1)}>+</button>
                        </div>
                      </td>
                      <td style={{ ...cellStyle, textAlign: "right", fontWeight: 500 }}>{(m.unitPrice * m.qty).toLocaleString("en-IN")}</td>
                      <td style={{ ...cellStyle, textAlign: "center", padding: "10px 4px" }}>
                        <button
                          type="button"
                          style={styles.deleteBtn}
                          onClick={() => removeItem(m.id)}
                          aria-label={`Remove ${m.name}`}
                          title="Remove from bill"
                        >
                          <TrashIcon width={16} height={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {isAdding && (
                  <tr>
                    <td colSpan={5} style={{ ...styles.td, borderBottom: "none", padding: "10px 8px" }}>
                      <Select
                        value=""
                        onChange={(value) => {
                          if (value) handleCatalogPick(value);
                          else setIsAdding(false);
                        }}
                        options={availableCatalog.map((c) => ({
                          label: `${c.name} — ₹${c.unitPrice}`,
                          value: c.id,
                        }))}
                        placeholder={availableCatalog.length === 0
                          ? "All catalog items already added"
                          : "Select a medicine…"}
                        disabled={availableCatalog.length === 0}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button
            style={styles.addMedicineBtn}
            onClick={() => setIsAdding(true)}
            disabled={isAdding || availableCatalog.length === 0}
          >
            + Add medicine
          </button>
        </div>

        {/* ── Right side: receipt with zigzag tear ──────────────────── */}
        <div style={styles.rightWrap}>
          <div style={styles.rightCard}>
            <div style={styles.rightHeader}>
              <h3 style={styles.billTitle}>Bill</h3>
              <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div style={styles.fieldsContainer}>
              <div style={styles.fieldRow}>
                <label style={styles.label}>Subtotal</label>
                <div style={styles.fieldValueReadOnly}>{inr(subtotal)}</div>
              </div>

              {due > 0 && (
                <div style={styles.fieldRow}>
                  <label style={styles.label}>Pending</label>
                  <div style={styles.fieldValueReadOnly}>
                    <span style={styles.duePill}>{pendingDueLabel}</span>
                    <span style={styles.dueAmount}>{inr(due)}</span>
                  </div>
                </div>
              )}

              <div style={styles.fieldRow}>
                <label style={styles.label}>Discount</label>
                <div style={styles.fieldValue}>
                  <input
                    style={{ ...styles.input, textAlign: "right" }}
                    type="number"
                    min={0}
                    placeholder="0"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                  <div style={styles.toggleGroup}>
                    <button style={discountMode === "%" ? styles.toggleActive : styles.toggleInactive} onClick={() => setDiscountMode("%")}>%</button>
                    <button style={discountMode === "₹" ? styles.toggleActive : styles.toggleInactive} onClick={() => setDiscountMode("₹")}>₹</button>
                  </div>
                </div>
              </div>

              <div style={styles.fieldRow}>
                <label style={styles.label}>GST</label>
                <div style={styles.fieldValue}>
                  <input
                    style={{ ...styles.input, textAlign: "right" }}
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0"
                    value={gst || ""}
                    onChange={(e) => setGst(Number(e.target.value))}
                  />
                  <span style={styles.fieldSuffix}>%</span>
                </div>
              </div>
            </div>

            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalValue}>{inr(total)}</span>
            </div>

            <div style={styles.methodRow}>
              {["Cash", "Card", "UPI", "Waive"].map((m) => (
                <label key={m} style={{ ...styles.radioLabel, color: m === "Waive" ? colors.red200 : colors.neutral900 }}>
                  <input
                    type="radio"
                    name="medBillPayment"
                    checked={paymentMethod === m}
                    onChange={() => setPaymentMethod(m)}
                    style={styles.radioInput}
                  />
                  {m}
                </label>
              ))}
            </div>

            <div style={styles.footer}>
              <Button
                variant="dark"
                size="sm"
                style={{ height: "40px", fontSize: fonts.size.s, padding: "0 20px" }}
                disabled={items.length === 0 || total <= 0}
                onClick={() => {
                  const billedItems = items
                    .filter((m) => m.qty > 0)
                    .map((m) => ({ name: m.name, qty: m.qty, inStock: m.inStock !== false }));
                  onBilled?.(paymentMethod, total, billedItems);
                  onClose();
                }}
              >
                {paymentMethod === "Waive" ? "Mark Waived" : "Charge & Bill"}
              </Button>
            </div>
          </div>

          <div style={styles.zigzag} />
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const CARD_RADIUS = 16;

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1500,
    padding: spacing.m,
  },
  body: {
    width: "min(1000px, calc(100vw - 32px))",
    maxHeight: "calc(100vh - 64px)",
    display: "flex",
    alignItems: "stretch",
    gap: 20,
    fontFamily: fonts.family.primary,
  },

  // ─── Left card (medicines) ────────────────────────────────────────────
  leftCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.neutral100,
    borderRadius: CARD_RADIUS,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    overflowY: "auto",
  },
  leftHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  title: {
    margin: 0,
    fontSize: fonts.size.h5,
    fontWeight: fonts.weight.regular,
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
    lineHeight: fonts.lineHeight.h5,
  },
  subtitle: {
    fontSize: fonts.size.xs,
    color: colors.neutral500,
  },

  empty: {
    padding: spacing.xl,
    textAlign: "center",
    fontSize: fonts.size.s,
    color: colors.neutral500,
    border: `1px dashed ${colors.neutral200}`,
    borderRadius: radii.m,
  },

  tableContainer: {
    backgroundColor: colors.primary100,
    borderRadius: 12,
    padding: "12px 16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    tableLayout: "fixed",
  },
  th: {
    padding: "8px",
    borderBottom: `1px solid ${colors.primary300}`,
    color: colors.alphaBlack3,
    fontWeight: 400,
    fontSize: fonts.size.s,
    lineHeight: "20px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 8px",
    fontSize: fonts.size.s,
    color: colors.neutral900,
    verticalAlign: "middle",
    fontWeight: 400,
    borderBottom: `1px solid ${colors.primary300}`,
  },
  tdMeta: {
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    marginTop: 2,
  },
  notInStockBadge: {
    display: "inline-block",
    marginLeft: 8,
    padding: "1px 8px",
    borderRadius: 999,
    fontSize: fonts.size.xs,
    color: colors.red200,
    backgroundColor: colors.redAlpha10,
    fontWeight: 500,
    verticalAlign: "middle",
  },
  priceInput: {
    width: 70,
    padding: "4px 8px",
    border: `1px solid ${colors.red200}`,
    borderRadius: 6,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    backgroundColor: colors.neutral100,
    textAlign: "right",
    fontFamily: "inherit",
    outline: "none",
  },
  deleteBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: colors.neutral500,
    width: 28,
    height: 28,
    borderRadius: radii.xs,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },

  qtyWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    border: `1px solid ${colors.primary300}`,
    borderRadius: 999,
    padding: "2px 4px",
    backgroundColor: colors.neutral100,
  },
  stepper: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    width: 22,
    height: 22,
    borderRadius: "50%",
    color: colors.neutral700,
    fontSize: fonts.size.s,
    lineHeight: 1,
  },
  qtyValue: {
    minWidth: 16,
    textAlign: "center",
    fontSize: fonts.size.s,
    fontWeight: 500,
  },

  catalogSelect: {
    width: "100%",
    padding: "6px 10px",
    borderRadius: 8,
    border: `1px solid ${colors.primary300}`,
    background: colors.neutral100,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
  },
  addMedicineBtn: {
    alignSelf: "flex-start",
    border: `1px dashed ${colors.neutral300}`,
    background: "transparent",
    color: colors.neutral700,
    padding: "8px 14px",
    borderRadius: 999,
    fontSize: fonts.size.s,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // ─── Right side: receipt + zigzag ────────────────────────────────────
  rightWrap: {
    width: 360,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
  },
  rightCard: {
    backgroundColor: colors.neutral100,
    borderRadius: `${CARD_RADIUS}px ${CARD_RADIUS}px 0 0`,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  rightHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  billTitle: {
    margin: 0,
    fontSize: fonts.size.h5,
    fontWeight: fonts.weight.regular,
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
    lineHeight: fonts.lineHeight.h5,
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: colors.neutral500,
    padding: 0,
    width: 28,
    height: 28,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  zigzag: {
    width: "100%",
    height: 20,
    flexShrink: 0,
    backgroundImage: `linear-gradient(135deg, ${colors.neutral100} 50%, transparent 50%), linear-gradient(225deg, ${colors.neutral100} 50%, transparent 50%)`,
    backgroundSize: "20px 20px",
    backgroundRepeat: "repeat-x",
  },

  // ─── Bill fields ─────────────────────────────────────────────────────
  fieldsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 40,
  },
  label: {
    fontSize: fonts.size.m,
    fontWeight: 400,
    color: colors.neutral900,
    width: 80,
    flexShrink: 0,
    lineHeight: "22px",
  },
  fieldValue: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderBottom: `1px solid ${colors.neutral300}`,
    padding: 8,
    fontSize: fonts.size.m,
    color: colors.neutral900,
    lineHeight: "22px",
  },
  fieldSuffix: {
    color: colors.neutral500,
    fontSize: fonts.size.m,
    flexShrink: 0,
  },
  fieldValueReadOnly: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs,
    textAlign: "right",
    padding: 8,
    fontSize: fonts.size.m,
    color: colors.neutral900,
    lineHeight: "22px",
    borderBottom: `1px solid ${colors.neutral300}`,
    fontVariantNumeric: "tabular-nums",
  },
  duePill: {
    marginRight: "auto",
    fontSize: fonts.size.xs,
    color: colors.red200,
    backgroundColor: colors.redAlpha10,
    border: `1px solid ${colors.redAlpha10}`,
    borderRadius: 999,
    padding: "2px 8px",
    fontWeight: 500,
  },
  dueAmount: {
    color: colors.red200,
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    fontSize: fonts.size.m,
    color: colors.neutral900,
    backgroundColor: "transparent",
    padding: 0,
    lineHeight: "22px",
    fontFamily: "inherit",
  },

  totalRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: colors.primary100,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: fonts.size.m,
    fontWeight: 600,
    color: colors.neutral900,
    lineHeight: 1,
  },
  totalValue: {
    fontSize: fonts.size.h4,
    fontWeight: fonts.weight.regular,
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
    lineHeight: 1,
  },

  methodRow: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: fonts.size.s,
    cursor: "pointer",
  },
  radioInput: {
    margin: 0,
    cursor: "pointer",
  },

  toggleGroup: {
    display: "flex",
    border: `1px solid ${colors.neutral300}`,
    borderRadius: 6,
    overflow: "hidden",
    flexShrink: 0,
  },
  toggleActive: {
    padding: "4px 10px",
    border: "none",
    backgroundColor: colors.active.shade100,
    color: colors.neutral900,
    fontSize: fonts.size.s,
    fontWeight: 600,
    cursor: "pointer",
  },
  toggleInactive: {
    padding: "4px 10px",
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral700,
    fontSize: fonts.size.s,
    fontWeight: 500,
    cursor: "pointer",
  },

  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xs,
  },
};
