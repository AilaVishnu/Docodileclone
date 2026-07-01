import React from "react";
import { BillLayout } from "../../components/BillLayout/BillLayout";
import { BillStatusBadge, billStatusOf } from "../../components/BillStatusBadge";
import { DataGrid, GridColumn } from "../../components/DataGrid/DataGrid";
import { MeasureField } from "../../components/MeasureField";
import { Select } from "../../components/Input/Select/Select";
import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { ConfirmDialog } from "../../components/ConfirmDialog/ConfirmDialog";
import { refundBill } from "../../api/bills";
import type { ClinicBill } from "./BillsView";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// BillReadModal — the row-click modal for a SETTLED bill (Paid / Partial /
// Refunded / Waived). The editable create flow stays `BillModal`; this is its
// read twin: the same BillLayout frame, but committed line items are frozen
// (grey fill, full-colour text). A part-paid (Due) bill additionally lets the
// desk append NEW services and collect the outstanding balance.
//
// Line items come from the stored `Bill.items` JSON snapshot; the payment line
// is derived from the recorded method + amount paid (the bill record keeps a
// single method, not a per-mode split).
// ─────────────────────────────────────────────────────────────────────────────

type Line = { name: string; qty: number; unit: number; gst: number; disc: number; discUnit: "%" | "₹" };

// "Advance / credit" draws from the patient's standing advance — applying credit
// is just another payment mode (it replaced the old standalone Deposit field).
const PAY_MODES = ["Cash", "Card", "UPI", "Advance / credit", "Waive"];

const inr = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;
const ORD = (d: number) => (d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return y && m && d ? `${d}${ORD(d)} ${MONTHS[m - 1]} ${y}` : iso; };

const discAmt = (l: Line) => (l.discUnit === "%" ? (l.qty * l.unit * (l.disc || 0)) / 100 : (l.disc || 0));
const lineTotal = (l: Line) => l.qty * l.unit - discAmt(l);

/** Parse the stored line-item snapshot (`Bill.items`) into typed rows. */
export function parseLines(items: string | null): Line[] {
  if (!items) return [];
  try {
    const arr = JSON.parse(items);
    if (!Array.isArray(arr)) return [];
    return arr.map((l: { name?: unknown; qty?: unknown; unit?: unknown; gst?: unknown; disc?: unknown; discUnit?: unknown }) => ({
      name: String(l.name ?? ""),
      qty: Number(l.qty) || 1,
      unit: Number(l.unit) || 0,
      gst: Number(l.gst) || 0,
      disc: Number(l.disc) || 0,
      discUnit: l.discUnit === "%" ? "%" : "₹",
    }));
  } catch {
    return [];
  }
}

// Each state tints the header with its pale badge fill, composited over white —
// a light, even wash. The badge flips to a white fill (`onTint`) so it stays
// visible against the matching header.
const HEADER_TINT: Record<string, string> = {
  paid: colors.greenAlpha20,
  due: colors.yellowAlpha20,
  refunded: colors.maroonAlpha20,
  waived: colors.blueAlpha20,
};
const tintBg = (status: string) => `linear-gradient(0deg, ${HEADER_TINT[status]}, ${HEADER_TINT[status]}), ${colors.neutral100}`;

// Frozen cell — the committed-line look: soft grey fill (matches the Balance
// band), muted full-colour text (no opacity dimming).
const Frozen = ({ children, center }: { children: React.ReactNode; center?: boolean }) => (
  <div style={{ ...st.box, ...(center ? { justifyContent: "center" } : {}) }}>{children}</div>
);

const sumRow = (label: string, value: string, strong = false) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: fonts.size.m, fontFamily: fonts.family.primary }}>
    <span style={{ color: strong ? colors.neutral900 : colors.neutral600 }}>{label}</span>
    <span style={{ color: colors.neutral900 }}>{value}</span>
  </div>
);

export interface BillReadModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: ClinicBill;
  /** Collect against a Due bill's outstanding balance — the amount + mode the
   *  desk entered in the "Collect balance" row (a partial pay is allowed). */
  onRecordPayment?: (bill: ClinicBill, amount: number, method: string) => void;
  /** Called after a successful refund with the updated bill, so the caller can
   *  refresh its list. The confirm prompt + API call are handled in here. */
  onRefunded?: (updated: ClinicBill) => void;
  /** Open the patient's full bill history (header link). */
  onViewBills?: (bill: ClinicBill) => void;
  onPrint?: (bill: ClinicBill) => void;
  /** Share the receipt (downloads it as a PDF). */
  onShare?: (bill: ClinicBill) => void;
}

export function BillReadModal({ isOpen, onClose, bill, onRecordPayment, onRefunded, onViewBills, onPrint, onShare }: BillReadModalProps) {
  const committed = React.useMemo(() => parseLines(bill.items), [bill.items]);

  // Refund flow: Refund button → confirm → POST → reflect REFUNDED in place
  // (and hand the updated bill back so the caller refreshes its list). The
  // overlay carries the post-refund refund/status so the modal updates at once.
  const [confirmRefund, setConfirmRefund] = React.useState(false);
  const [refunding, setRefunding] = React.useState(false);
  const [refundErr, setRefundErr] = React.useState<string | null>(null);
  const [refundOverlay, setRefundOverlay] = React.useState<{ refund: number; payStatus: string } | null>(null);
  React.useEffect(() => { setRefundOverlay(null); setConfirmRefund(false); setRefundErr(null); }, [bill.id]);
  const doRefund = async () => {
    setRefunding(true);
    setRefundErr(null);
    try {
      const updated = await refundBill(bill.id);
      setRefundOverlay({ refund: Number(updated.refund), payStatus: updated.payStatus ?? "REFUNDED" });
      setConfirmRefund(false);
      onRefunded?.(updated);
    } catch {
      setRefundErr("Refund failed. Please try again.");
    } finally {
      setRefunding(false);
    }
  };
  const effRefund = refundOverlay?.refund ?? bill.refund;
  const effPayStatus = refundOverlay?.payStatus ?? bill.payStatus;

  // "Collect balance" inputs — the desk can pick the mode and edit the amount to
  // record a PARTIAL payment (blank = collect the whole balance). Reset per bill.
  const [collectMode, setCollectMode] = React.useState("Cash");
  const [collectAmt, setCollectAmt] = React.useState<number | "">("");
  React.useEffect(() => { setCollectMode("Cash"); setCollectAmt(""); }, [bill.id]);

  // A settled/part-paid bill's line items are frozen — the invoice is a snapshot.
  // More charges go through a NEW bill (which rolls up any past due), not by
  // editing this one; here the desk only collects the outstanding balance.
  const isWaived = bill.payStatus === "WAIVED";
  const billed = committed.reduce((s, l) => s + l.qty * l.unit, 0);
  const discount = committed.reduce((s, l) => s + discAmt(l), 0);
  const tax = committed.reduce((s, l) => s + (l.qty * l.unit * (l.gst || 0)) / 100, 0);
  const finalAmt = billed - discount + tax;
  const balance = isWaived ? 0 : Math.max(0, finalAmt - bill.paid);
  const status = billStatusOf({ payStatus: effPayStatus, refund: effRefund, due: balance, paid: bill.paid });

  // The bill record keeps one method + amount, not a per-mode split.
  const payments = bill.paid > 0 ? [{ mode: bill.paymentMethod || "—", amount: bill.paid }] : [];
  // Amount to record now: the typed figure, else the full balance; never more
  // than what's owed (the server caps too, but keep the UI honest).
  const collectNow = Math.min(collectAmt === "" ? balance : Number(collectAmt) || 0, balance);

  const columns: GridColumn<Line>[] = [
    { key: "n", header: "#", width: 24, align: "center", render: (_l, i) => <div style={st.midCell}><span style={{ color: colors.neutral500 }}>{i + 1}</span></div> },
    { key: "item", header: "Item", align: "left", render: (l) => <Frozen>{l.name}</Frozen> },
    { key: "qty", header: "Qty", width: 52, render: (l) => <Frozen center>{l.qty}</Frozen> },
    { key: "unit", header: "Unit ₹", width: 80, render: (l) => <Frozen center>{l.unit}</Frozen> },
    { key: "gst", header: "GST", width: 72, render: (l) => <Frozen center>{l.gst ? `${l.gst}%` : "–"}</Frozen> },
    { key: "disc", header: "Disc", width: 86, render: (l) => <Frozen center>{l.disc ? (l.discUnit === "%" ? `${l.disc}%` : `₹${l.disc}`) : "–"}</Frozen> },
    { key: "tot", header: "Total", width: 84, align: "right", render: (l) => <div style={st.endCell}><span style={{ fontSize: fonts.size.m, color: colors.neutral900, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{inr(lineTotal(l))}</span></div> },
  ];

  return (
    <>
    <BillLayout
      isOpen={isOpen}
      onClose={onClose}
      headerBg={tintBg(status)}
      header={
        <div style={st.header}>
          <span style={st.name}>{bill.patientName}</span>
          <span style={st.sub}>{bill.invoiceNo}</span>
          <BillStatusBadge status={status} onTint />
        </div>
      }
      headerActions={
        <>
          <button style={st.linkBtn} onClick={() => onViewBills?.(bill)}>View bills</button>
          <Icon name="printer" size={24} tone="inherit" style={{ color: colors.neutral900, cursor: "pointer" }} onClick={() => onPrint?.(bill)} />
          <Icon name="share" size={24} tone="inherit" style={{ color: colors.neutral900, cursor: "pointer" }} onClick={() => onShare?.(bill)} />
        </>
      }
      billTitle="Bill"
      totalLabel="Balance"
      total={`₹ ${balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      left={
        <div style={{ "--input-h": "32px" } as React.CSSProperties}>
          <div style={{ ...st.dateRow, marginBottom: spacing.m }}>
            <span style={{ fontSize: fonts.size.m, color: colors.neutral900 }}>Bill date</span>
            <span style={st.datePill}><Icon name="calendar" size={20} color={colors.neutral900} /> {fmtDate(bill.billDate)}</span>
          </div>
          <DataGrid columns={columns} rows={committed} rowKey={(_l, i) => i} size="m" tdPadding="8px 6px" thPadding="8px 6px" />
        </div>
      }
      summary={
        <>
          {sumRow("Total billed", inr(billed))}
          {/* A waive is a full write-off → 100% discount, Final ₹0. */}
          {sumRow(isWaived ? "Discount (100%)" : "Discount", `− ${inr(isWaived ? billed : discount)}`)}
          {sumRow("Tax", inr(isWaived ? 0 : tax))}
          {sumRow("Final amount", inr(isWaived ? 0 : finalAmt), true)}
          {sumRow("Received", inr(bill.paid))}
          {sumRow("Refund", `− ${inr(effRefund)}`)}
        </>
      }
      payment={
        <div style={{ ...st.payWrap, "--input-h": "32px" } as React.CSSProperties}>
          {isWaived ? (
            <span style={st.muted}>This bill was waived — no charge.</span>
          ) : (
            <>
              {payments.map((p, i) => (
                <div key={i} style={st.payLine}>
                  <div style={{ flex: 1, minWidth: 0 }}><Frozen>{p.mode}</Frozen></div>
                  <div style={{ flex: 1, minWidth: 0 }}><Frozen>₹ {p.amount.toLocaleString("en-IN")}</Frozen></div>
                </div>
              ))}
              {balance > 0 && (
                <>
                  <span style={st.collect}>Collect balance</span>
                  <div style={st.payLine}>
                    <div style={{ flex: 1, minWidth: 0 }}><Select options={PAY_MODES} value={collectMode} onChange={setCollectMode} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <MeasureField box prefix="₹" ariaLabel="Balance amount" inputMode="decimal"
                        placeholder={String(Math.round(balance))}
                        value={collectAmt === "" ? "" : String(collectAmt)}
                        onChange={(v) => setCollectAmt(v === "" ? "" : Number(v))} />
                    </div>
                  </div>
                  {/* Collecting less than the balance leaves the remainder due. */}
                  {collectNow < balance && (
                    <span style={{ fontSize: fonts.size.s, color: colors.neutral600 }}>
                      <strong style={{ color: colors.neutral900 }}>{inr(balance - collectNow)}</strong> stays on due
                    </span>
                  )}
                </>
              )}
            </>
          )}
          {/* Details note — shown for every status, waived included. */}
          {bill.note && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: spacing.xs }}>
              <span style={st.muted}>Details</span>
              <span style={{ color: colors.neutral900, fontSize: fonts.size.s, whiteSpace: "pre-wrap" }}>{bill.note}</span>
            </div>
          )}
        </div>
      }
      action={
        // Payment-only CTA: collect the balance, or refund a paid bill. Print
        // lives in the header. Refunded / Waived have no action.
        balance > 0 ? (
          <Button variant="dark" size="md" style={{ flex: 1 }} disabled={collectNow <= 0}
            onClick={() => { if (collectNow > 0) onRecordPayment?.(bill, collectNow, collectMode); }}
            iconLeft={<Icon name="bill-check" size={18} tone="inverse" />}>
            {collectNow < balance ? `Record ${inr(collectNow)}` : "Record payment"}
          </Button>
        ) : effRefund === 0 && status !== "waived" ? (
          <Button variant="light" size="md" style={{ flex: 1 }} onClick={() => setConfirmRefund(true)}>Refund</Button>
        ) : null
      }
    />
      <ConfirmDialog
        isOpen={confirmRefund}
        title="Refund this bill?"
        message={
          <>
            You're refunding <strong>{inr(bill.paid)}</strong> to {bill.patientName}. This can't be undone.
            {refundErr && <><br /><span style={{ color: colors.red200 }}>{refundErr}</span></>}
          </>
        }
        confirmLabel={refunding ? "Refunding…" : "Refund"}
        confirmDisabled={refunding}
        destructive
        onCancel={() => { if (!refunding) { setConfirmRefund(false); setRefundErr(null); } }}
        onConfirm={doRefund}
      />
    </>
  );
}

const st: Record<string, React.CSSProperties> = {
  header: { display: "flex", alignItems: "center", gap: spacing.s, minWidth: 0 },
  name: { fontSize: fonts.size.m, fontWeight: fonts.weight.semibold, color: colors.neutral900 },
  sub: { fontSize: fonts.size.s, color: colors.neutral500 },
  linkBtn: { border: "none", background: "transparent", cursor: "pointer", color: colors.neutral900, fontSize: fonts.size.s, textDecoration: "underline", whiteSpace: "nowrap" },
  dateRow: { display: "flex", alignItems: "center", gap: spacing.m },
  datePill: { display: "inline-flex", alignItems: "center", gap: spacing.xs, height: 30, boxSizing: "border-box", border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m, padding: "0 10px", color: colors.neutral900 },
  midCell: { display: "flex", alignItems: "center", justifyContent: "center", height: 32 },
  // Frozen field — soft fill (matches the Balance band), muted text (no opacity).
  box: { display: "flex", alignItems: "center", height: 32, padding: "0 8px", backgroundColor: colors.neutral150, borderRadius: radii.m, fontSize: fonts.control.sm, fontFamily: fonts.family.primary, color: colors.neutral600, boxSizing: "border-box", minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  // Right-aligned line-item cell (the Total column) — matches the bill block.
  endCell: { display: "flex", alignItems: "center", justifyContent: "flex-end", height: 32 },
  payWrap: { display: "flex", flexDirection: "column", gap: spacing.s },
  payLine: { display: "flex", gap: spacing.s, alignItems: "center" },
  collect: { fontSize: fonts.size.s, color: colors.neutral500, marginTop: spacing["2xs"] },
  muted: { color: colors.neutral500, fontSize: fonts.size.m },
};
