import React from "react";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Icon } from "../Icon";
import { DataGrid, GridColumn } from "../DataGrid/DataGrid";
import type { Bill } from "../../api/bills";
import { colors, fonts, spacing } from "../../styles/theme";

// RecentBills — the patient's invoice history, shown when the queue's kebab is
// "View Bills" (a bill already exists today). A row per invoice with its totals
// and per-row actions; "Create New Bill" opens the bill editor for another one.
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const inr2 = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ORD = (d: number) => (d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(iso: string): string {
  // iso = "yyyy-mm-dd" → "23rd Jun 2026"
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d}${ORD(d)} ${MONTHS[m - 1]} ${y}`;
}

export function RecentBills({ isOpen, onClose, patientName, bills, loading = false, onCreateNew, onView, onPrint }: {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  bills: Bill[];
  loading?: boolean;
  /** Open the bill editor for a new invoice. */
  onCreateNew: () => void;
  /** Re-open a past bill (pencil / invoice no). */
  onView?: (bill: Bill) => void;
  /** Print a past bill. */
  onPrint?: (bill: Bill) => void;
}) {
  const columns: GridColumn<Bill>[] = [
    { key: "no", header: "#", width: 56, align: "left", render: (_b, i) => <span style={styles.muted}>{i + 1}</span> },
    {
      key: "inv", header: "BILL NO & DATE", align: "left", render: (b) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button type="button" style={styles.invLink} onClick={() => onView?.(b)}>{b.invoiceNo}</button>
          <span style={styles.muted}>{fmtDate(b.billDate)}</span>
        </div>
      ),
    },
    { key: "billed", header: "BILLED", align: "left", render: (b) => inr(b.billed) },
    { key: "paid", header: "PAID", align: "left", render: (b) => inr2(b.paid) },
    { key: "due", header: "DUE", align: "left", render: (b) => inr(b.due) },
    { key: "refund", header: "REFUND", align: "left", render: (b) => (b.refund > 0 ? inr(b.refund) : <span style={styles.muted}>–</span>) },
    {
      key: "action", header: "ACTION", width: 120, align: "left", render: (b) => (
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
          <IconButton ariaLabel="Print bill" onClick={() => onPrint?.(b)} color={colors.neutral900}>
            <Icon name="printer" size={20} tone="inherit" />
          </IconButton>
          <IconButton ariaLabel="View bill" onClick={() => onView?.(b)} color={colors.neutral900}>
            <Icon name="edit-pencil" size={20} tone="inherit" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} surface="transparent" shadow="none" width={1000} padding={0} radius={16}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <IconButton ariaLabel="Close" onClick={onClose} />
            <span style={styles.title}>{patientName}'s Recent Bills</span>
          </div>
          <Button variant="dark" size="md" onClick={onCreateNew} iconLeft={<Icon name="plus" size={20} tone="inverse" />}>
            Create New Bill
          </Button>
        </div>

        <div style={styles.body}>
          {loading ? (
            <div style={styles.empty}>Loading bills…</div>
          ) : bills.length === 0 ? (
            <div style={styles.empty}>No bills yet.</div>
          ) : (
            <DataGrid columns={columns} rows={bills} rowKey={(b) => b.id} size="m" tdPadding="14px 12px" thPadding="12px 12px" />
          )}
        </div>
      </div>
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: colors.neutral100,
    borderRadius: 16,
    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
    overflow: "hidden",
    fontFamily: fonts.family.primary,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.m,
    padding: `${spacing.m} ${spacing.xl}`,
    borderBottom: `1px solid ${colors.neutral200}`,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: spacing.s, minWidth: 0 },
  title: { fontSize: fonts.size.l, fontWeight: fonts.weight.semibold, color: colors.neutral900 },
  body: { padding: spacing.l, maxHeight: "70vh", overflowY: "auto" },
  empty: { padding: "48px 8px", textAlign: "center", color: colors.neutral500, fontSize: fonts.size.s },
  muted: { color: colors.neutral500 },
  invLink: {
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    color: colors.active.shade700,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.medium,
    textAlign: "left",
  },
};
