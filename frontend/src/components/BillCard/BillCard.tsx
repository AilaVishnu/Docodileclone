import React, { useState } from "react";
import { styles } from "./BillCard.styles";
import { colors } from "../../styles/theme";
import { ReactComponent as PrinterIcon } from "../../assets/icons/printer.svg";
import { ReactComponent as ScaleIcon } from "../../assets/icons/scale.svg";
import { ReactComponent as PaidStamp } from "../../assets/icons/paid-stamp.svg";

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
        <PaidStamp
          width={80}
          height={80}
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
          <div style={{ position: "absolute", right: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <PrinterIcon width={15} height={15} style={{ cursor: "pointer" }} />
            <ScaleIcon width={15} height={15} style={{ cursor: "pointer" }} />
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
              />
            </div>
          </div>

          <div style={styles.fieldRow}>
            <label style={styles.label}>Discount</label>
            <div style={styles.fieldValue}>
              <input
                style={{ ...styles.input, width: "40px", flex: "none" }}
                type="number"
                placeholder="0"
                value={discount || ""}
                onChange={(e) => onDiscountChange(Number(e.target.value))}
              />
              <div style={{ marginLeft: "auto" }}>
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
            </div>
          </div>
        </div>

        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total</span>
          <span style={styles.totalValue}>₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div style={styles.methodRow}>
          {["Cash", "Card", "UPI", "No Bill"].map((m) => (
            <label key={m} style={{
              ...styles.radioLabel,
              color: m === "No Bill" ? colors.secondary600 : styles.radioLabel.color,
            }}>
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
      </div>

      {/* Zigzag torn receipt edge */}
      <div style={styles.zigzag} />
    </div>
  );
}
