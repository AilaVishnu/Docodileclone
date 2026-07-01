import React, { useState } from "react";
import { styles } from "./BillCard.styles";
import { colors, spacing } from "../../styles/theme";
import { RadioGroup } from "../Radio";
import { Icon } from "../Icon";
import { printBill, type PrintPatientMeta } from "../../pages/Bills/printBill";
import type { Bill } from "../../api/bills";

type BillCardProps = {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  isPaid?: boolean;
  note: string;
  onNoteChange: (note: string) => void;
  subtotal: number;
  onSubtotalChange: (val: number) => void;
  tax: string;
  onTaxChange: (val: string) => void;
  discount: number;
  onDiscountChange: (val: number) => void;
  total: number;
  onTaxModeChange?: (mode: "%" | "₹") => void;
  onDiscountModeChange?: (mode: "%" | "₹") => void;
  services?: { name: string; price: number }[];
  /** Print context — the patient the receipt is for. */
  patientName?: string;
  patientMeta?: PrintPatientMeta;
  invoiceNo?: string;
};

export function BillCard({
  paymentMethod,
  onPaymentMethodChange,
  note,
  onNoteChange,
  subtotal,
  onSubtotalChange,
  tax,
  onTaxChange,
  discount,
  onDiscountChange,
  total,
  onTaxModeChange,
  onDiscountModeChange,
  services = [],
  isPaid = false,
  patientName,
  patientMeta,
  invoiceNo,
}: BillCardProps) {
  const [taxMode, setTaxMode] = useState<"%" | "₹">("%");
  const [discountMode, setDiscountMode] = useState<"%" | "₹">("₹");

  // Print this bill card as the standard "Bill cum Receipt" (same renderer as
  // the Bills page / queue). Builds a synthetic bill from the card's live
  // numbers: services become line items; a bill-level discount is folded onto a
  // single subtotal line so the printed total matches what the card shows.
  const printReceipt = () => {
    const discountAmt = discountMode === "%" ? Math.round((subtotal * discount) / 100) : discount;
    const isWaive = paymentMethod === "Waive";
    const lineItems = (discountAmt > 0 || services.length === 0)
      ? [{ name: services.length ? services.map((s) => s.name).join(", ") : "Consultation", qty: 1, unit: subtotal, gst: 0, disc: discountAmt, discUnit: "₹" }]
      : services.map((s) => ({ name: s.name, qty: 1, unit: s.price, gst: 0, disc: 0, discUnit: "₹" }));
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const draft: Bill & { patientName: string } = {
      id: "", invoiceNo: invoiceNo ?? "", billDate: iso,
      billed: subtotal, paid: isWaive ? 0 : total, due: 0, refund: 0, depositApplied: null,
      payStatus: isWaive ? "WAIVED" : "PAID",
      paymentMethod: isWaive ? "Waive" : paymentMethod,
      items: JSON.stringify(lineItems), note: note.trim() || null,
      appointmentId: null, createdAt: "",
      patientName: patientName?.trim() || "Patient",
    };
    Promise.resolve(printBill(draft, patientMeta)).catch(() => {});
  };

  const handleTaxMode = (mode: "%" | "₹") => {
    setTaxMode(mode);
    onTaxModeChange?.(mode);
  };

  const handleDiscountMode = (mode: "%" | "₹") => {
    setDiscountMode(mode);
    onDiscountModeChange?.(mode);
  };

  return (
    <div style={{ ...styles.wrapper, position: "relative" }}>
      {isPaid && (
        <Icon
          name="paid-stamp"
          size={80}
          style={{
            position: "absolute",
            right: "-35px",
            bottom: "-30px",
            zIndex: 10,
          }}
        />
      )}
      <div style={styles.card}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <h3 style={styles.title}>Bill</h3>
          <div style={{ position: "absolute", right: 0, display: "flex", alignItems: "center", gap: spacing.s }}>
            <Icon name="printer" size={20} tone="inherit" style={{ cursor: "pointer" }} onClick={printReceipt} />
            <Icon name="scale" size={20} tone="inherit" style={{ cursor: "pointer" }} />
          </div>
        </div>

        {/* Service Items */}
        {services.length > 0 && (
          <div style={styles.servicesContainer}>
            {services.map((svc, i) => (
              <div key={i} style={styles.serviceItem}>
                <span>{svc.name}</span>
                <span>₹ {svc.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <div style={styles.fieldsContainer}>
          <div style={styles.fieldRow}>
            <label style={styles.label}>Subtotal</label>
            <div style={styles.fieldValue}>
              <span style={{ flexShrink: 0 }}>₹&nbsp;</span>
              <input
                style={{ ...styles.input, minWidth: 0 }}
                type="number"
                value={subtotal || ""}
                onChange={(e) => onSubtotalChange(Number(e.target.value))}
                disabled={isPaid}
                readOnly={isPaid}
              />
            </div>
          </div>

          <div style={styles.fieldRow}>
            <label style={styles.label}>Discount</label>
            <div style={styles.fieldValue}>
              <input
                style={{ ...styles.input, minWidth: 0 }}
                type="number"
                placeholder="0"
                value={discount || ""}
                onChange={(e) => onDiscountChange(Number(e.target.value))}
                disabled={isPaid}
                readOnly={isPaid}
              />
              <div style={{ marginLeft: "auto" }}>
                <div style={styles.toggleGroup}>
                  <button
                    style={discountMode === "%" ? styles.toggleActive : styles.toggleInactive}
                    onClick={() => handleDiscountMode("%")}
                    disabled={isPaid}
                  >%</button>
                  <button
                    style={discountMode === "₹" ? styles.toggleActive : styles.toggleInactive}
                    onClick={() => handleDiscountMode("₹")}
                    disabled={isPaid}
                  >₹</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total</span>
          <span style={styles.totalValue}>₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div style={styles.methodRow}>
          <RadioGroup
            name="billPayment"
            value={paymentMethod}
            onChange={onPaymentMethodChange}
            disabled={isPaid}
            options={["Cash", "Card", "UPI", { label: "Waive", value: "Waive", color: colors.red200 }]}
          />
        </div>
      </div>

      {/* Zigzag torn receipt edge */}
      <div style={styles.zigzag} />
    </div>
  );
}
