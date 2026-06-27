import React from "react";
import { BillLayout } from "../../components/BillLayout/BillLayout";
import { BillStatusBadge, billStatusOf } from "../../components/BillStatusBadge";
import { DataGrid, GridColumn } from "../../components/DataGrid/DataGrid";
import { MeasureField } from "../../components/MeasureField";
import { Field } from "../../components/Field";
import { Select } from "../../components/Input/Select/Select";
import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
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
type GLine = Line & { _new?: boolean };

// "Advance / credit" draws from the patient's standing advance — applying credit
// is just another payment mode (it replaced the old standalone Deposit field).
const PAY_MODES = ["Cash", "Card", "UPI", "Advance / credit", "Waive"];

const inr = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;
const ORD = (d: number) => (d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return y && m && d ? `${d}${ORD(d)} ${MONTHS[m - 1]} ${y}` : iso; };

const discAmt = (l: Line) => (l.discUnit === "%" ? (l.qty * l.unit * (l.disc || 0)) / 100 : (l.disc || 0));
const lineTotal = (l: Line) => l.qty * l.unit - discAmt(l);
const emptyNew = (): GLine => ({ name: "", qty: 1, unit: 0, gst: 0, disc: 0, discUnit: "₹", _new: true });

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
  /** Collect the outstanding balance on a Due bill. */
  onRecordPayment?: (bill: ClinicBill) => void;
  /** Refund a paid bill. */
  onRefund?: (bill: ClinicBill) => void;
  /** Open the patient's full bill history (header link). */
  onViewBills?: (bill: ClinicBill) => void;
  onPrint?: (bill: ClinicBill) => void;
}

export function BillReadModal({ isOpen, onClose, bill, onRecordPayment, onRefund, onViewBills, onPrint }: BillReadModalProps) {
  const committed = React.useMemo(() => parseLines(bill.items), [bill.items]);

  // A part-paid bill isn't closed: committed lines stay frozen, but the desk can
  // append NEW services. A trailing empty row is always present — typing into it
  // appends a fresh one. New lines push up Total billed + Balance. (Local only
  // for now — persistence lands with the clinic bills API.)
  const [extra, setExtra] = React.useState<GLine[]>([emptyNew()]);
  React.useEffect(() => { setExtra([emptyNew()]); }, [bill.id]);
  const setExtraName = (i: number, v: string) => setExtra((xs) => {
    const next = xs.map((l, idx) => (idx === i ? { ...l, name: v } : l));
    return [...next.filter((l) => l.name.trim() !== ""), emptyNew()];
  });
  const setExtraField = (i: number, patch: Partial<GLine>) => setExtra((xs) => xs.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const isWaived = bill.payStatus === "WAIVED";
  const allLines = [...committed, ...extra.filter((l) => l.name.trim() !== "")];
  const billed = allLines.reduce((s, l) => s + l.qty * l.unit, 0);
  const discount = allLines.reduce((s, l) => s + discAmt(l), 0);
  const tax = allLines.reduce((s, l) => s + (l.qty * l.unit * (l.gst || 0)) / 100, 0);
  const finalAmt = billed - discount + tax;
  const balance = isWaived ? 0 : Math.max(0, finalAmt - bill.paid);
  const status = billStatusOf({ payStatus: bill.payStatus, refund: bill.refund, due: balance, paid: bill.paid });

  // The bill record keeps one method + amount, not a per-mode split.
  const payments = bill.paid > 0 ? [{ mode: bill.paymentMethod || "—", amount: bill.paid }] : [];
  const addable = status === "due";

  const n = committed.length;
  const gridRows: GLine[] = addable ? [...committed, ...extra] : committed;
  const isDraft = (l: GLine) => !!l._new && !l.name.trim();

  const columns: GridColumn<GLine>[] = [
    { key: "n", header: "#", width: 24, align: "center", render: (l, i) => <div style={st.midCell}><span style={{ color: isDraft(l) ? colors.neutral400 : colors.neutral500 }}>{isDraft(l) ? "+" : i + 1}</span></div> },
    { key: "item", header: "Item", align: "left", render: (l, i) => l._new
      ? <Field variant="box" fill="filled" placeholder="Add service…" ariaLabel="New service" style={{ padding: "0 8px" }} value={l.name} onChange={(v) => setExtraName(i - n, v)} />
      : <Frozen>{l.name}</Frozen> },
    { key: "qty", header: "Qty", width: 52, render: (l, i) => l._new
      ? (l.name.trim() ? <Field variant="box" fill="filled" align="center" inputMode="decimal" placeholder="1" ariaLabel="Qty" style={{ padding: "0 8px" }} value={l.qty ? String(l.qty) : ""} onChange={(v) => setExtraField(i - n, { qty: Math.max(1, Math.floor(Number(v)) || 1) })} /> : <span />)
      : <Frozen center>{l.qty}</Frozen> },
    { key: "unit", header: "Unit ₹", width: 80, render: (l, i) => l._new
      ? (l.name.trim() ? <Field variant="box" fill="filled" align="center" inputMode="decimal" placeholder="0" ariaLabel="Unit price" style={{ padding: "0 8px" }} value={l.unit ? String(l.unit) : ""} onChange={(v) => setExtraField(i - n, { unit: Number(v) || 0 })} /> : <span />)
      : <Frozen center>{l.unit}</Frozen> },
    { key: "gst", header: "GST", width: 72, render: (l, i) => l._new
      ? (l.name.trim() ? <MeasureField unit="%" unitWidth={28} inputMode="decimal" ariaLabel="GST percent" value={l.gst ? String(l.gst) : ""} onChange={(v) => setExtraField(i - n, { gst: Number(v) || 0 })} /> : <span />)
      : <Frozen center>{l.gst ? `${l.gst}%` : "–"}</Frozen> },
    { key: "disc", header: "Disc", width: 86, render: (l, i) => l._new
      ? (l.name.trim() ? <MeasureField unit={l.discUnit} unitWidth={28} inputMode="decimal" ariaLabel="Discount" onToggleUnit={() => setExtraField(i - n, { discUnit: l.discUnit === "%" ? "₹" : "%" })} value={l.disc ? String(l.disc) : ""} onChange={(v) => setExtraField(i - n, { disc: Number(v) || 0 })} /> : <span />)
      : <Frozen center>{l.disc ? (l.discUnit === "%" ? `${l.disc}%` : `₹${l.disc}`) : "–"}</Frozen> },
    { key: "tot", header: "Total", width: 84, align: "right", render: (l) => isDraft(l) ? <span /> : <div style={st.endCell}><span style={{ fontSize: fonts.size.m, color: colors.neutral900, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{inr(lineTotal(l))}</span></div> },
  ];

  return (
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
          <Icon name="share" size={24} tone="inherit" style={{ color: colors.neutral900, cursor: "pointer" }} />
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
          <DataGrid columns={columns} rows={gridRows} rowKey={(_l, i) => i} size="m" tdPadding="8px 6px" thPadding="8px 6px" />
        </div>
      }
      summary={
        <>
          {sumRow("Total billed", inr(billed))}
          {sumRow("Discount", `− ${inr(discount)}`)}
          {sumRow("Tax", inr(tax))}
          {sumRow("Final amount", inr(finalAmt), true)}
          {sumRow("Received", inr(bill.paid))}
          {sumRow("Refund", `− ${inr(bill.refund)}`)}
        </>
      }
      payment={
        isWaived ? (
          <span style={st.muted}>This bill was waived — no charge.</span>
        ) : (
          <div style={{ ...st.payWrap, "--input-h": "32px" } as React.CSSProperties}>
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
                  <div style={{ flex: 1, minWidth: 0 }}><Select options={PAY_MODES} value="Cash" onChange={() => {}} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}><MeasureField box prefix="₹" ariaLabel="Balance amount" value={String(Math.round(balance))} onChange={() => {}} /></div>
                </div>
              </>
            )}
          </div>
        )
      }
      action={
        // Payment-only CTA: collect the balance, or refund a paid bill. Print
        // lives in the header. Refunded / Waived have no action.
        balance > 0 ? (
          <Button variant="dark" size="md" style={{ flex: 1 }} onClick={() => onRecordPayment?.(bill)} iconLeft={<Icon name="bill-check" size={18} tone="inverse" />}>Record payment</Button>
        ) : bill.refund === 0 && status !== "waived" ? (
          <Button variant="light" size="md" style={{ flex: 1 }} onClick={() => onRefund?.(bill)}>Refund</Button>
        ) : null
      }
    />
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
