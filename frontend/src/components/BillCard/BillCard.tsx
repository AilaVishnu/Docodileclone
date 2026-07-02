import React, { useState, useEffect } from "react";
import { styles } from "./BillCard.styles";
import { colors, spacing } from "../../styles/theme";
import { RadioGroup } from "../Radio";
import { Icon } from "../Icon";
import { printBill, type PrintPatientMeta } from "../../pages/Bills/printBill";
import { BillModal } from "./BillModal";
import { BillReadModal } from "../../pages/Bills/BillReadModal";
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
  /** Controls the discount unit toggle. When provided, the owner drives the
   *  mode (e.g. Waive forces "%"); omit it to let the card manage it locally. */
  discountMode?: "%" | "₹";
  services?: { name: string; price: number }[];
  /** Print context — the patient the receipt is for. */
  patientName?: string;
  patientMeta?: PrintPatientMeta;
  invoiceNo?: string;
  /** The appointment's actual saved bill. When present, the expand opens this
   *  real invoice in the read-only detail (with its real number + refund),
   *  instead of a bill rebuilt from the card. */
  paidBill?: Bill & { patientName: string; today: boolean };
  /** Lock the card's inputs without the "Paid" stamp — e.g. a refunded bill is
   *  settled (nothing to edit) but must not read as Paid. `isPaid` implies this. */
  locked?: boolean;
  /** The bill is settled (paid / waived / refunded). Expanding opens the
   *  read-only detail rather than the editable editor — even when not "Paid"
   *  (e.g. a waive shows the Waived read-only bill). */
  settled?: boolean;
  /** Called with the updated bill after a refund from the expanded detail, so
   *  the owner can refresh the card's paid/settled state. */
  onBillRefunded?: (updated: Bill & { patientName: string; today?: boolean }) => void;
  /** Surface a message (e.g. nothing to print yet) via the host's toast. */
  onToast?: (message: string) => void;
  /** When set, Print requires a real saved invoice (`paidBill`) — a draft that
   *  hasn't been booked/settled has no invoice, so Print toasts instead. Used by
   *  the booking card, where the invoice is only minted server-side on booking. */
  requireInvoiceToPrint?: boolean;
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
  discountMode: discountModeProp,
  services = [],
  isPaid = false,
  patientName,
  patientMeta,
  invoiceNo,
  paidBill,
  locked = false,
  settled = false,
  onBillRefunded,
  onToast,
  requireInvoiceToPrint = false,
}: BillCardProps) {
  const [taxMode, setTaxMode] = useState<"%" | "₹">("%");
  // Discount unit is controlled by the owner when `discountModeProp` is given
  // (so Waive can force "%"); otherwise the card owns it locally.
  const [discountModeLocal, setDiscountModeLocal] = useState<"%" | "₹">("₹");
  const discountMode = discountModeProp ?? discountModeLocal;
  // Keep the discount within range so the bill can never go negative: at most
  // 100% in "%" mode, or the subtotal in "₹" mode.
  const clampDiscount = (v: number) => {
    if (!Number.isFinite(v) || v <= 0) return 0;
    const max = discountMode === "%" ? 100 : subtotal;
    return Math.min(v, Math.max(0, max));
  };
  // Inputs are frozen when the bill is settled — paid (with stamp) or just
  // locked (e.g. refunded, no stamp).
  const inputsLocked = isPaid || locked;
  // The full bill editor, opened from the expand icon beside Print. Seeds the
  // same services this card shows.
  const [expanded, setExpanded] = useState(false);

  // clampDiscount only runs on keystroke / unit toggle; if the subtotal later
  // shrinks (e.g. a service is removed) an already-entered ₹ discount can end
  // up above it. Re-clamp so the stored discount never exceeds its ceiling —
  // otherwise the receipt could print a negative amount. Never touch a locked
  // (settled) bill.
  useEffect(() => {
    if (inputsLocked) return;
    const clamped = clampDiscount(discount);
    if (clamped !== discount) onDiscountChange(clamped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, discountMode]);

  // A synthetic bill from the card's live numbers — feeds both the receipt print
  // and the read-only detail. Services become line items; a bill-level discount
  // is folded onto a single subtotal line so the total matches the card.
  const buildDraftBill = (): Bill & { patientName: string; today: boolean } => {
    // Cap the discount at the billable amount so a stale/oversized discount can
    // never make a line item (or the receipt total) go negative.
    const discountAmt = Math.min(
      Math.max(0, discountMode === "%" ? Math.round((subtotal * discount) / 100) : discount),
      Math.max(0, subtotal),
    );
    const isWaive = paymentMethod === "Waive";
    const lineItems = (discountAmt > 0 || services.length === 0)
      ? [{ name: services.length ? services.map((s) => s.name).join(", ") : "Consultation", qty: 1, unit: subtotal, gst: 0, disc: discountAmt, discUnit: "₹" }]
      : services.map((s) => ({ name: s.name, qty: 1, unit: s.price, gst: 0, disc: 0, discUnit: "₹" }));
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return {
      id: "", invoiceNo: invoiceNo ?? "", billDate: iso,
      billed: subtotal, paid: isWaive ? 0 : total, due: 0, refund: 0, depositApplied: null,
      payStatus: isWaive ? "WAIVED" : "PAID",
      paymentMethod: isWaive ? "Waive" : paymentMethod,
      items: JSON.stringify(lineItems), note: note.trim() || null,
      appointmentId: null, createdAt: "",
      patientName: patientName?.trim() || "Patient",
      today: false,
    };
  };
  // Print the card as the standard "Bill cum Receipt" (same renderer as the
  // Bills page / queue).
  const printReceipt = () => {
    // A booking card prints only a real, saved invoice — a draft that hasn't
    // been booked/settled yet has no invoice to print.
    if (requireInvoiceToPrint && !paidBill) {
      onToast?.("No invoice yet — book the appointment to generate the bill, then print.");
      return;
    }
    // Nothing billed yet → nudge to fill the bill rather than print a ₹0 receipt.
    if (subtotal <= 0) { onToast?.("Add a service and bill it before you can print."); return; }
    // Prefer the real saved invoice when we have one; else the card's draft.
    Promise.resolve(printBill(paidBill ?? buildDraftBill(), patientMeta)).catch(() => {});
  };

  const handleTaxMode = (mode: "%" | "₹") => {
    setTaxMode(mode);
    onTaxModeChange?.(mode);
  };

  const handleDiscountMode = (mode: "%" | "₹") => {
    setDiscountModeLocal(mode);
    onDiscountModeChange?.(mode);
    // Re-clamp the existing amount to the new unit's ceiling (e.g. ₹500 → 100%).
    const max = mode === "%" ? 100 : subtotal;
    if (discount > max) onDiscountChange(Math.max(0, max));
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
            <Icon name="scale" size={20} tone="inherit" style={{ cursor: "pointer" }} onClick={() => setExpanded(true)} />
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
                disabled={inputsLocked}
                readOnly={inputsLocked}
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
                onChange={(e) => onDiscountChange(clampDiscount(Number(e.target.value)))}
                disabled={inputsLocked}
                readOnly={inputsLocked}
              />
              <div style={{ marginLeft: "auto" }}>
                <div style={styles.toggleGroup}>
                  <button
                    style={discountMode === "%" ? styles.toggleActive : styles.toggleInactive}
                    onClick={() => handleDiscountMode("%")}
                    disabled={inputsLocked}
                  >%</button>
                  <button
                    style={discountMode === "₹" ? styles.toggleActive : styles.toggleInactive}
                    onClick={() => handleDiscountMode("₹")}
                    disabled={inputsLocked}
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
            disabled={inputsLocked}
            options={["Cash", "Card", "UPI", { label: "Waive", value: "Waive", color: colors.red200 }]}
          />
        </div>
      </div>

      {/* Zigzag torn receipt edge */}
      <div style={styles.zigzag} />

      {/* Expand → the larger bill view. A paid bill opens the read-only detail:
          the real saved invoice when we have it (real number + refund), else a
          rebuilt preview. An unpaid one opens the editable BillModal workbench
          seeded with the same services. */}
      {expanded && (paidBill ? (
        <BillReadModal
          isOpen
          onClose={() => setExpanded(false)}
          bill={paidBill}
          onPrint={(b) => { void printBill(b, patientMeta); }}
          share={{ patient: patientMeta, phone: patientMeta?.mobile }}
          // Refunding here persists a real refund — bubble the updated bill up so
          // the card drops its Paid stamp/lock instead of going stale.
          onRefunded={onBillRefunded}
        />
      ) : (settled || isPaid) ? (
        <BillReadModal
          isOpen
          onClose={() => setExpanded(false)}
          bill={buildDraftBill()}
          allowRefund={false}
          onPrint={(b) => { void printBill(b, patientMeta); }}
          share={{ patient: patientMeta, phone: patientMeta?.mobile }}
        />
      ) : (
        <BillModal
          isOpen
          onClose={() => setExpanded(false)}
          patientName={patientName}
          initialServices={services}
        />
      ))}
    </div>
  );
}
