import React, { useState } from "react";
import { Modal } from "../Modal/Modal";
import { Select } from "../Input/Select/Select";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { DataGrid, GridColumn } from "../DataGrid/DataGrid";
import { DatePicker } from "../DatePicker/DatePicker";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";
import { styles as bill } from "./BillCard.styles";
import { ReactComponent as PrinterIcon } from "../../assets/icons/printer.svg";
import { ReactComponent as ShareIcon } from "../../assets/icons/share.svg";
import { ReactComponent as VerifiedBadgeIcon } from "../../assets/icons/verified-badge.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash.svg";
import { ReactComponent as CalendarIcon } from "../../assets/calendar.svg";
import { PlusIcon } from "../../iconsUtil";

// BillModal — the full-invoice editor that opens from the bill card's expand
// icon. Reuses Modal, Select, Button, IconButton, DataGrid, DatePicker, the
// BillCard styles and shared icons. Mock state for now.
type Line = { id: number; name: string; qty: number; unit: number; gst: number; disc: number };
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
    ? initialServices.map((s, i) => ({ id: i, name: s.name, qty: 1, unit: s.price, gst: 0, disc: 0 }))
    : [{ id: 0, name: "Ear lobe repair", qty: 1, unit: 6000, gst: 0, disc: 0 }]);
  const nextId = React.useRef(seedFilled.length + 1);
  const emptyLine = (): Line => ({ id: nextId.current++, name: "", qty: 1, unit: 0, gst: 0, disc: 0 });

  // Always one trailing empty row — typing into it fills the row and a fresh
  // empty appears below (same pattern as the New Appointment services list).
  const [lines, setLines] = useState<Line[]>([...seedFilled, { id: seedFilled.length, name: "", qty: 1, unit: 0, gst: 0, disc: 0 }]);
  const [billDate, setBillDate] = useState(new Date(2026, 0, 30));
  const [showCal, setShowCal] = useState(false);
  const [addDue, setAddDue] = useState(false);
  const [payMode, setPayMode] = useState("Cash");
  const [received, setReceived] = useState<number | "">("");
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

  const billed = lines.reduce((s, l) => s + l.qty * l.unit, 0);
  const discount = lines.reduce((s, l) => s + (l.disc || 0), 0);
  const tax = lines.reduce((s, l) => s + (l.qty * l.unit * (l.gst || 0)) / 100, 0);
  const finalAmt = billed - discount + tax + (addDue ? PAST_DUE : 0);
  const recv = Number(received) || 0;
  const balance = Math.max(0, finalAmt - recv);
  const refund = Math.max(0, recv - finalAmt);

  const cell: React.CSSProperties = { border: "none", outline: "none", background: "transparent", fontFamily: fonts.family.primary, fontSize: fonts.size.s, color: colors.neutral900, width: "100%", padding: 0, textAlign: "center" };
  const numCell = (l: Line, key: keyof Line, align: "center" | "right" = "center") =>
    isTrailing(l) ? null : <input style={{ ...cell, textAlign: align }} type="number" value={l[key] as number} onChange={(e) => setLine(l.id, { [key]: key === "qty" ? Math.max(1, Number(e.target.value)) : Number(e.target.value) } as Partial<Line>)} />;

  const columns: GridColumn<Line>[] = [
    { key: "n", header: "#", width: 26, align: "center", render: (l, i) => (isTrailing(l) ? "" : <span style={{ color: colors.neutral500 }}>{i + 1}</span>) },
    { key: "svc", header: "Service", align: "left", render: (l) => (
      <input list="bm-svc-list" placeholder="Type or pick a service" value={l.name} onChange={(e) => setName(l.id, e.target.value)}
        style={{ ...cell, textAlign: "left", borderBottom: `${strokes.xs} solid ${colors.neutral300}`, fontWeight: l.name ? fonts.weight.medium : fonts.weight.regular, padding: "2px 0" }} />
    ) },
    { key: "qty", header: "Qty", width: 50, render: (l) => numCell(l, "qty") },
    { key: "unit", header: "Unit ₹", width: 84, render: (l) => numCell(l, "unit", "right") },
    { key: "gst", header: "GST%", width: 50, render: (l) => numCell(l, "gst") },
    { key: "disc", header: "Disc", width: 62, render: (l) => numCell(l, "disc", "right") },
    { key: "tot", header: "Total", width: 84, align: "right", render: (l) => (isTrailing(l) ? "" : <span style={{ fontWeight: fonts.weight.medium }}>{inr(l.qty * l.unit - l.disc)}</span>) },
    { key: "x", header: "", width: 30, render: (l) => (isTrailing(l) ? "" : (
      <button onClick={() => removeLine(l.id)} aria-label="Remove" style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.neutral900, display: "flex", justifyContent: "center", width: "100%" }}><TrashIcon width={18} height={18} /></button>
    )) },
  ];

  const sumRow = (label: string, value: string, strong = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", fontSize: fonts.size.m, fontFamily: fonts.family.primary }}>
      <span style={{ color: strong ? colors.neutral900 : colors.neutral600 }}>{label}</span>
      <span style={{ color: colors.neutral900 }}>{value}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} surface={colors.neutral100} width={960} padding={0} radius={16}>
      <datalist id="bm-svc-list">{SERVICE_CATALOG.map((s) => <option key={s.name} value={s.name} />)}</datalist>
      <div style={{ display: "flex", minHeight: 460, fontFamily: fonts.family.primary }}>
        {/* ── Left ─────────────────────────────────────────────────── */}
        <div style={{ flex: "1.7 1 0", minWidth: 0, padding: spacing.xl, display: "flex", flexDirection: "column", gap: spacing.m }}>
          {/* Patient (cream) */}
          <div style={{ backgroundColor: colors.primary100, borderRadius: radii.m, padding: `10px ${spacing.m}`, fontSize: fonts.size.m, fontWeight: fonts.weight.medium, color: colors.neutral900 }}>
            {pt.code} : {pt.name} - {pt.meta}
          </div>

          {/* Bill date / deposit */}
          <div style={{ display: "flex", alignItems: "center", gap: spacing.m, flexWrap: "wrap" }}>
            <span style={{ fontSize: fonts.size.m, color: colors.neutral900 }}>Bill date</span>
            <span onClick={() => setShowCal(true)} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: spacing.xs, border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m, padding: "6px 12px", color: colors.neutral900, cursor: "pointer" }}>
              <CalendarIcon width={24} height={24} style={{ color: colors.neutral900 }} /> {fmtDate(billDate)}
              {showCal && (
                <DatePicker selectedDate={billDate} showDoneButton onSelect={(d) => { setBillDate(d); setShowCal(false); }} onClose={() => setShowCal(false)} />
              )}
            </span>
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: spacing.xs, color: colors.neutral900 }}>
              Deposit <span style={{ display: "inline-flex", alignItems: "center", gap: 4, border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m, padding: "6px 10px" }}>₹ 0 <PlusIcon style={{ width: 16, height: 16 }} /></span>
            </span>
          </div>

          <DataGrid columns={columns} rows={lines} rowKey={(l) => l.id} size="s" />
        </div>

        {/* ── Right: summary + pay (compact, BillCard styling) ─────── */}
        <div style={{ flex: "1 1 0", minWidth: 0, borderLeft: `${strokes.xs} solid ${colors.neutral200}`, padding: spacing.l, display: "flex", flexDirection: "column", gap: 6 }}>
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
          <div style={{ ...bill.totalRow, borderRadius: radii.m }}>
            <span style={bill.totalLabel}>Balance</span>
            <span style={bill.totalValue}>₹ {balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div style={{ display: "flex", gap: spacing.s, alignItems: "center" }}>
            <div style={{ width: 110 }}>
              <Select options={["Cash", "Card", "UPI", "Waive"]} value={payMode} onChange={setPayMode} />
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m, padding: "0 10px", height: "var(--input-h, 40px)" }}>
              <span style={{ color: colors.neutral500 }}>₹</span>
              <input style={{ ...cell, textAlign: "left" }} type="number" placeholder={String(balance)} value={received} onChange={(e) => setReceived(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
          <button onClick={() => {}} style={{ border: "none", background: "transparent", color: colors.secondary700, cursor: "pointer", fontSize: fonts.size.s, display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start" }}>
            <PlusIcon style={{ width: 14, height: 14 }} /> Payment mode (split)
          </button>

          {/* Pay + print/share icons (saves vertical space) */}
          <div style={{ marginTop: "auto", display: "flex", gap: spacing.s, alignItems: "center" }}>
            <Button variant="dark" size="md" onClick={onClose} style={{ flex: 1 }} iconLeft={<VerifiedBadgeIcon width={18} height={18} style={{ color: colors.neutral100 }} />}>
              {balance > 0 ? `Pay ${inr(balance)}` : "Mark paid"}
            </Button>
            <IconButton ariaLabel="Print" onClick={() => {}}><PrinterIcon width={18} height={18} /></IconButton>
            <IconButton ariaLabel="Share" onClick={() => {}}><ShareIcon width={18} height={18} /></IconButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
