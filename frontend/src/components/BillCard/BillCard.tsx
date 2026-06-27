import React, { useState } from "react";
import { styles } from "./BillCard.styles";
import { colors, spacing } from "../../styles/theme";
import { RadioGroup } from "../Radio";
import { Icon } from "../Icon";

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
            <Icon name="printer" size={20} tone="inherit" style={{ cursor: "pointer" }} />
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
