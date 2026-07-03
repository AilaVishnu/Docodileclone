import React from "react";
import { BillStatusBadge, billStatusOf } from "../../components/BillStatusBadge";
import type { ClinicBill } from "./BillsView";
import { colors } from "../../styles/theme";
import { styles } from "./BillTile.styles";

const inr = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;
const ORD = (d: number) => (d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return y && m && d ? `${d}${ORD(d)} ${MONTHS[m - 1]} ${y}` : iso; };

export interface BillTileProps {
  bill: ClinicBill;
  onClick?: (bill: ClinicBill) => void;
}

/**
 * One bill in the Bills grid view — a read-only receipt card (BillCard look:
 * white top-rounded card + grey total band + torn zigzag foot). The headline
 * figure is the outstanding Balance for a due bill, the Refund for a refunded
 * one, else the Total. Clicking opens the bill (same routing as the list row).
 */
export function BillTile({ bill, onClick }: BillTileProps) {
  const status = billStatusOf(bill);
  const focal =
    bill.due > 0 ? { label: "Balance", value: bill.due, tone: colors.red200 }
    : bill.refund > 0 ? { label: "Refunded", value: bill.refund, tone: colors.neutral900 }
    : { label: "Total", value: bill.billed, tone: colors.neutral900 };

  return (
    <div
      style={styles.wrapper}
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(bill)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(bill); } }}
    >
      <div style={styles.card}>
        <div style={styles.head}>
          <div style={styles.idCol}>
            <span style={styles.name}>{bill.patientName}</span>
            <span style={styles.sub}>{bill.invoiceNo}</span>
          </div>
          <BillStatusBadge status={status} />
        </div>

        <div style={styles.rows}>
          <div style={styles.row}><span style={styles.rowLabel}>Billed</span><span style={styles.rowValue}>{inr(bill.billed)}</span></div>
          <div style={styles.row}><span style={styles.rowLabel}>Paid</span><span style={styles.rowValue}>{inr(bill.paid)}</span></div>
        </div>

        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>{focal.label}</span>
          <span style={{ ...styles.totalValue, color: focal.tone }}>{inr(focal.value)}</span>
        </div>

        <div style={styles.foot}>{fmtDate(bill.billDate)}{bill.paymentMethod && bill.paymentMethod !== "Waive" ? ` · ${bill.paymentMethod}` : ""}</div>
      </div>
      <div style={styles.zigzag} />
    </div>
  );
}
