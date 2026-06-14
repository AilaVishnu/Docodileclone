import React, { useState } from "react";
import { Modal } from "../Modal/Modal";
import { Select } from "../Input/Select/Select";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { DataGrid, GridColumn } from "../DataGrid/DataGrid";
import { DatePicker } from "../DatePicker/DatePicker";
import { Field } from "../Field";
import { MeasureField } from "../MeasureField";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";
import { styles as bill } from "./BillCard.styles";
import { Icon } from "../Icon";

// BillModal — the full-invoice editor that opens from the bill card's expand
// icon. Reuses Modal, Select, Button, IconButton, DataGrid, DatePicker, the
// BillCard styles and shared icons. Mock state for now.
type Line = { id: number; name: string; qty: number; unit: number; gst: number; disc: number; discUnit: "%" | "₹" };
type Patient = { code: string; name: string; meta: string };

const SERVICE_CATALOG: { name: string; price: number }[] = [
  { name: "Ear lobe repair", price: 6000 },
  { name: "Consultation", price: 500 },
  { name: "Dressing", price: 400 },
  { name: "Suture removal", price: 300 },
];
const PRICE_OF = (name: string) => SERVICE_CATALOG.find((s) => s.name.toLowerCase() === name.trim().toLowerCase())?.price;

const inr = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (d: Date) => `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export function BillModal({ isOpen, onClose, patient, initialServices }: {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  initialServices?: { name: string; price: number }[];
}) {
  const pt: Patient = patient ?? { code: "T001", name: "Ramesh", meta: "M 12" };
  const seedFilled: Line[] = (initialServices && initialServices.length
    ? initialServices.map((s, i) => ({ id: i, name: s.name, qty: 1, unit: s.price, gst: 0, disc: 0, discUnit: "₹" as const }))
    : [{ id: 0, name: "Ear lobe repair", qty: 1, unit: 6000, gst: 0, disc: 0, discUnit: "₹" as const }]);
  const nextId = React.useRef(seedFilled.length + 1);
  const emptyLine = (): Line => ({ id: nextId.current++, name: "", qty: 1, unit: 0, gst: 0, disc: 0, discUnit: "₹" });

  // Always one trailing empty row — typing into it fills the row and a fresh
  // empty appears below (same pattern as the New Appointment services list).
  const [lines, setLines] = useState<Line[]>([...seedFilled, { id: seedFilled.length, name: "", qty: 1, unit: 0, gst: 0, disc: 0, discUnit: "₹" }]);
  const [billDate, setBillDate] = useState(new Date(2026, 0, 30));
  const [showCal, setShowCal] = useState(false);
  const [addDue, setAddDue] = useState(false);
  // One payment line by default; "+" splits the bill across modes (Cash + UPI…).
  const [payments, setPayments] = useState<{ mode: string; amount: number | "" }[]>([{ mode: "Cash", amount: "" }]);
  const [deposit, setDeposit] = useState<number | "">("");
  const setPayment = (i: number, patch: Partial<{ mode: string; amount: number | "" }>) =>
    setPayments((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const addPayment = () => setPayments((ps) => [...ps, { mode: "Cash", amount: "" }]);
  const removePayment = (i: number) => setPayments((ps) => (ps.length === 1 ? ps : ps.filter((_, idx) => idx !== i)));
  const PAST_DUE = 2500;

  const isTrailing = (l: Line) => l.name.trim() === "";
  const setLine = (id: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const setName = (id: number, value: string) => setLines((ls) => {
    const mapped = ls.map((l) => (l.id === id ? { ...l, name: value, unit: PRICE_OF(value) ?? l.unit } : l));
    const filled = mapped.filter((l) => l.name.trim() !== "");
    const existingEmpty = mapped.find((l) => l.name.trim() === "");
    return [...filled, existingEmpty ?? emptyLine()];
  });
  const removeLine = (id: number) => setLines((ls) => {
    const next = ls.filter((l) => l.id !== id);
    return next.some(isTrailing) ? next : [...next, emptyLine()];
  });

  // Discount per line is either a flat ₹ amount or a % of that line's subtotal.
  const discAmt = (l: Line) => (l.discUnit === "%" ? (l.qty * l.unit * (l.disc || 0)) / 100 : (l.disc || 0));
  const lineTotal = (l: Line) => l.qty * l.unit - discAmt(l);
  const billed = lines.reduce((s, l) => s + l.qty * l.unit, 0);
  const discount = lines.reduce((s, l) => s + discAmt(l), 0);
  const tax = lines.reduce((s, l) => s + (l.qty * l.unit * (l.gst || 0)) / 100, 0);
  const finalAmt = billed - discount + tax + (addDue ? PAST_DUE : 0);
  const recv = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const dep = Number(deposit) || 0;
  const balance = Math.max(0, finalAmt - dep - recv);
  const refund = Math.max(0, dep + recv - finalAmt);

  // Numeric line-item field → cream FillInput. Stored as a number; blank shows
  // the placeholder rather than a literal 0.
  const numFill = (l: Line, key: "qty" | "unit", placeholder: string) => isTrailing(l) ? null : (
    <Field variant="box" fill="filled" align="center" inputMode="decimal" placeholder={placeholder} ariaLabel={key}
      style={{ padding: "0 8px" }}
      value={(l[key] as number) ? String(l[key]) : ""}
      onChange={(v) => setLine(l.id, { [key]: key === "qty" ? Math.max(1, Math.floor(Number(v)) || 1) : Number(v) || 0 } as Partial<Line>)} />
  );

  const columns: GridColumn<Line>[] = [
    { key: "n", header: "#", width: 24, align: "center", render: (l, i) => <span style={{ color: colors.neutral500 }}>{i + 1}</span> },
    { key: "svc", header: "Service", align: "left", render: (l) => (
      <Field variant="box" fill="filled" list="bm-svc-list" placeholder="Type here" ariaLabel="Service"
        style={{ padding: "0 8px" }}
        value={l.name} onChange={(v) => setName(l.id, v)} />
    ) },
    { key: "qty", header: "Qty", width: 52, render: (l) => numFill(l, "qty", "1") },
    { key: "unit", header: "Unit ₹", width: 76, render: (l) => numFill(l, "unit", "0") },
    { key: "gst", header: "GST", width: 72, render: (l) => isTrailing(l) ? null : (
      <MeasureField unit="%" unitWidth={28} inputMode="decimal" ariaLabel="GST percent"
        value={l.gst ? String(l.gst) : ""} onChange={(v) => setLine(l.id, { gst: Number(v) || 0 })} />
    ) },
    { key: "disc", header: "Disc", width: 86, render: (l) => isTrailing(l) ? null : (
      <MeasureField unit={l.discUnit} unitWidth={28} inputMode="decimal" ariaLabel="Discount"
        onToggleUnit={() => setLine(l.id, { discUnit: l.discUnit === "%" ? "₹" : "%" })}
        value={l.disc ? String(l.disc) : ""} onChange={(v) => setLine(l.id, { disc: Number(v) || 0 })} />
    ) },
    { key: "tot", header: "Total", width: 80, align: "center", render: (l) => (isTrailing(l) ? "" : <span style={{ fontWeight: fonts.weight.medium }}>{inr(lineTotal(l))}</span>) },
    { key: "x", header: "", width: 38, headerPadding: "8px 4px", cellPadding: "8px 4px", render: (l) => (isTrailing(l) ? "" : (
      <button onClick={() => removeLine(l.id)} aria-label="Remove" style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.neutral900, display: "flex", justifyContent: "center", width: "100%" }}><Icon name="trash" size={20} tone="inherit" style={{ flexShrink: 0 }} /></button>
    )) },
  ];

  const sumRow = (label: string, value: string, strong = false, extra?: React.CSSProperties) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: fonts.size.m, fontFamily: fonts.family.primary, ...extra }}>
      <span style={{ color: strong ? colors.neutral900 : colors.neutral600 }}>{label}</span>
      <span style={{ color: colors.neutral900 }}>{value}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} surface={colors.neutral100} width={1040} padding={0} radius={16}>
      <datalist id="bm-svc-list">{SERVICE_CATALOG.map((s) => <option key={s.name} value={s.name} />)}</datalist>
      <div style={{ display: "flex", minHeight: 460, fontFamily: fonts.family.primary }}>
        {/* ── Left ─────────────────────────────────────────────────── */}
        <div style={{ flex: "2.1 1 0", minWidth: 0, padding: spacing.xl, display: "flex", flexDirection: "column", gap: spacing.m }}>
          {/* Patient */}
          <div style={{ backgroundColor: colors.primary300, borderRadius: radii.m, padding: `10px ${spacing.m}`, fontSize: fonts.size.m, fontWeight: fonts.weight.medium, color: colors.neutral900 }}>
            {pt.code} : {pt.name} - {pt.meta}
          </div>

          {/* Bill date / deposit */}
          <div style={{ display: "flex", alignItems: "center", gap: spacing.m, flexWrap: "wrap" }}>
            <span style={{ fontSize: fonts.size.m, color: colors.neutral900 }}>Bill date</span>
            <span onClick={() => setShowCal(true)} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: spacing.xs, height: 30, boxSizing: "border-box", border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m, padding: "0 10px", color: colors.neutral900, cursor: "pointer" }}>
              <Icon name="calendar" size={20} color={colors.neutral900} /> {fmtDate(billDate)}
              {showCal && (
                <DatePicker selectedDate={billDate} showDoneButton onSelect={(d) => { setBillDate(d); setShowCal(false); }} onClose={() => setShowCal(false)} />
              )}
            </span>
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: spacing.xs, color: colors.neutral900 }}>
              Deposit
              <div style={{ width: 120, "--input-h": "32px" } as React.CSSProperties}>
                <MeasureField box prefix="₹" placeholder="0" inputMode="decimal" ariaLabel="Deposit amount"
                  value={deposit === "" ? "" : String(deposit)} onChange={(v) => setDeposit(v === "" ? "" : Number(v))} />
              </div>
            </span>
          </div>

          <div style={{ "--input-h": "32px" } as React.CSSProperties}>
            <DataGrid columns={columns} rows={lines} rowKey={(l) => l.id} size="m" tdPadding="8px 6px" thPadding="8px 6px" />
          </div>
        </div>

        {/* ── Right: summary + pay (compact, BillCard styling) ─────── */}
        <div style={{ flex: "1 1 0", minWidth: 0, borderLeft: `${strokes.xs} solid ${colors.neutral200}`, padding: spacing.xl, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <h3 style={{ ...bill.title, fontSize: fonts.size.h6 }}>Bill</h3>
            <div style={{ position: "absolute", right: 0 }}><IconButton ariaLabel="Close" onClick={onClose} /></div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.active.shade50, color: colors.active.shade700, borderRadius: radii.m, padding: "6px 12px", fontSize: fonts.size.s }}>
            <span>Past due: {inr(PAST_DUE)}</span>
            <button onClick={() => setAddDue((v) => !v)} style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.active.shade700, fontSize: fonts.size.s, textDecoration: "underline" }}>{addDue ? "Added" : "Add to bill"}</button>
          </div>

          {sumRow("Total billed", inr(billed))}
          {sumRow("Discount", `− ${inr(discount)}`)}
          {sumRow("Tax", inr(tax))}
          {sumRow("Final amount", inr(finalAmt), true)}
          {sumRow("Received", inr(recv))}
          {sumRow("Refund", `− ${inr(refund)}`)}

          {/* Balance — same treatment as the BillCard "Total" band */}
          <div style={{ ...bill.totalRow, borderRadius: radii.m, marginBottom: spacing.s }}>
            <span style={bill.totalLabel}>Balance</span>
            <span style={bill.totalValue}>₹ {balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {/* ── Payment — its own section (mirrors the "Bill" header above) ── */}
          <div style={{ borderTop: `${strokes.xs} solid ${colors.neutral200}`, margin: `0 -${spacing.xl}` }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <h3 style={{ ...bill.title, fontSize: fonts.size.h6 }}>Payment</h3>
          </div>

          {payments.map((p, i) => {
            const last = i === payments.length - 1;
            return (
              <div key={i} style={{ display: "flex", gap: spacing.s, alignItems: "center", "--input-h": "32px" } as React.CSSProperties}>
                <div style={{ width: 110 }}>
                  <Select options={["Cash", "Card", "UPI", "Waive"]} value={p.mode} onChange={(m) => setPayment(i, { mode: m })} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <MeasureField box prefix="₹" placeholder={i === 0 ? String(balance) : "0"} inputMode="decimal" ariaLabel="Amount"
                    value={p.amount === "" ? "" : String(p.amount)} onChange={(v) => setPayment(i, { amount: v === "" ? "" : Number(v) })} />
                </div>
                {last ? (
                  <IconButton ariaLabel="Add payment mode (split)" onClick={addPayment} color={colors.neutral900}>
                    <Icon name="plus" size={20} tone="inherit" />
                  </IconButton>
                ) : (
                  <IconButton ariaLabel="Remove payment mode" onClick={() => removePayment(i)} color={colors.neutral900}>
                    <Icon name="trash" size={20} tone="inherit" />
                  </IconButton>
                )}
              </div>
            );
          })}

          {/* Pay + print/share icons (saves vertical space) */}
          <div style={{ marginTop: "auto", display: "flex", gap: spacing.s, alignItems: "center" }}>
            <Button variant="dark" size="md" onClick={onClose} style={{ flex: 1 }} iconLeft={<Icon name="verified-badge" size={20} tone="inverse" />}>
              {balance > 0 ? `Pay ${inr(balance)}` : "Mark paid"}
            </Button>
            <IconButton ariaLabel="Print" onClick={() => {}} color={colors.neutral900}><Icon name="printer" size={24} tone="inherit" /></IconButton>
            <IconButton ariaLabel="Share" onClick={() => {}} color={colors.neutral900}><Icon name="share" size={24} tone="inherit" /></IconButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
