import React, { useState } from "react";
import { styles } from "./BillCard.styles";

type BillCardProps = {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
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
}: BillCardProps) {
  const [taxMode, setTaxMode] = useState<"%" | "₹">("%");
  const [discountMode, setDiscountMode] = useState<"%" | "₹">("₹");

  const handleTaxMode = (mode: "%" | "₹") => {
    setTaxMode(mode);
    onTaxModeChange?.(mode);
  };

  const handleDiscountMode = (mode: "%" | "₹") => {
    setDiscountMode(mode);
    onDiscountModeChange?.(mode);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h3 style={styles.title}>Bill</h3>

        <div style={styles.methodRow}>
          {["Cash", "Card", "UPI", "No Bill"].map((m) => (
            <label key={m} style={styles.radioLabel}>
              <input
                type="radio"
                name="billPayment"
                checked={paymentMethod === m}
                onChange={() => onPaymentMethodChange(m)}
                style={styles.radioInput}
              />
              {m}
            </label>
          ))}
        </div>

        <div style={styles.fieldRow}>
          <label style={styles.label}>Note</label>
          <input
            style={styles.noteInput}
            placeholder="gave 200, 250 due"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
          />
        </div>

        <div style={styles.fieldRow}>
          <label style={styles.label}>Subtotal</label>
          <input
            style={styles.input}
            type="number"
            value={subtotal || ""}
            onChange={(e) => onSubtotalChange(Number(e.target.value))}
          />
        </div>

        <div style={styles.fieldRow}>
          <label style={styles.label}>Tax</label>
          <input
            style={styles.input}
            type="number"
            placeholder="0"
            value={tax}
            onChange={(e) => onTaxChange(e.target.value)}
          />
          <div style={styles.toggleGroup}>
            <button
              style={taxMode === "%" ? styles.toggleActive : styles.toggleInactive}
              onClick={() => handleTaxMode("%")}
            >%</button>
            <button
              style={taxMode === "₹" ? styles.toggleActive : styles.toggleInactive}
              onClick={() => handleTaxMode("₹")}
            >₹</button>
          </div>
        </div>

        <div style={styles.fieldRow}>
          <label style={styles.label}>Discount</label>
          <input
            style={styles.input}
            type="number"
            placeholder="0"
            value={discount || ""}
            onChange={(e) => onDiscountChange(Number(e.target.value))}
          />
          <div style={styles.toggleGroup}>
            <button
              style={discountMode === "%" ? styles.toggleActive : styles.toggleInactive}
              onClick={() => handleDiscountMode("%")}
            >%</button>
            <button
              style={discountMode === "₹" ? styles.toggleActive : styles.toggleInactive}
              onClick={() => handleDiscountMode("₹")}
            >₹</button>
          </div>
        </div>

        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total</span>
          <span style={styles.totalValue}>{total}</span>
        </div>
      </div>

      {/* Zigzag torn receipt edge */}
      <div style={styles.zigzag} />
    </div>
  );
}
