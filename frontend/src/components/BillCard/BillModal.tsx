import React, { useState } from "react";
import { Modal } from "../Modal/Modal";
import { Select } from "../Input/Select/Select";
import { Button } from "../Button";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";
import { styles as bill } from "./BillCard.styles";
import { ReactComponent as PrinterIcon } from "../../assets/icons/printer.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash.svg";
import { ReactComponent as CalendarIcon } from "../../assets/calendar.svg";
import { PlusIcon } from "../../iconsUtil";

// BillModal — the full-invoice editor that opens from the bill card's expand
// icon (advanced booking). Reuses the design system: Modal, Select, Button,
// the BillCard cream "Total" band + payment radios + %/₹ toggle, and the shared
// icons. Mock state for now; the real version takes the bill + patient dues.
type Line = { id: number; name: string; qty: number; unit: number; gst: number; disc: number };

const SERVICE_OPTIONS = [
  { label: "Ear lobe repair · ₹6,000", value: "Ear lobe repair|6000" },
  { label: "Consultation · ₹500", value: "Consultation|500" },
  { label: "Dressing · ₹400", value: "Dressing|400" },
  { label: "Suture removal · ₹300", value: "Suture removal|300" },
];

const inr = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;

export function BillModal({ isOpen, onClose, initialServices }: {
  isOpen: boolean;
  onClose: () => void;
  initialServices?: { name: string; price: number }[];
}) {
  const seed: Line[] = (initialServices && initialServices.length
    ? initialServices.map((s, i) => ({ id: i, name: s.name, qty: 1, unit: s.price, gst: 0, disc: 0 }))
    : [{ id: 0, name: "Ear lobe repair", qty: 1, unit: 6000, gst: 0, disc: 0 }]);

  const [lines, setLines] = useState<Line[]>(seed);
  const [addDue, setAddDue] = useState(false);
  const [payMode, setPayMode] = useState("Cash");
  const [received, setReceived] = useState<number | "">("");
  const nextId = React.useRef(seed.length);
  const PAST_DUE = 2500;

  const setLine = (id: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const addService = (value: string) => {
    if (!value) return;
    const [name, price] = value.split("|");
    setLines((ls) => [...ls, { id: nextId.current++, name, qty: 1, unit: Number(price), gst: 0, disc: 0 }]);
  };

  const totalBilled = lines.reduce((s, l) => s + l.qty * l.unit, 0);
  const discount = lines.reduce((s, l) => s + (l.disc || 0), 0);
  const tax = lines.reduce((s, l) => s + (l.qty * l.unit * (l.gst || 0)) / 100, 0);
  const finalAmt = totalBilled - discount + tax + (addDue ? PAST_DUE : 0);
  const recv = Number(received) || 0;
  const balance = Math.max(0, finalAmt - recv);
  const refund = Math.max(0, recv - finalAmt);

  const cell: React.CSSProperties = { border: "none", outline: "none", background: "transparent", fontFamily: fonts.family.primary, fontSize: fonts.size.s, color: colors.neutral900, width: "100%", padding: "4px 0", textAlign: "right" };
  const sumRow = (label: string, value: string, muted = true) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: fonts.size.m, fontFamily: fonts.family.primary }}>
      <span style={{ color: muted ? colors.neutral600 : colors.neutral900 }}>{label}</span>
      <span style={{ color: colors.neutral900 }}>{value}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} surface={colors.neutral100} width={960} padding={0} radius={16}>
      <div style={{ display: "flex", minHeight: 460, fontFamily: fonts.family.primary }}>
        {/* ── Left: items ─────────────────────────────────────────── */}
        <div style={{ flex: "1.7 1 0", minWidth: 0, padding: spacing.xl, display: "flex", flexDirection: "column", gap: spacing.m }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.m }}>
            <span style={{ fontSize: fonts.size.m, color: colors.neutral900 }}>Bill date</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs, border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m, padding: "6px 12px", color: colors.neutral900 }}>
              <CalendarIcon width={18} height={18} style={{ color: colors.neutral700 }} /> 30 Jan 2026
            </span>
            <Button variant="light" size="sm" onClick={() => {}}>Today</Button>
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: spacing.xs, color: colors.neutral900 }}>
              Deposit <span style={{ display: "inline-flex", alignItems: "center", gap: 4, border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m, padding: "6px 10px" }}>₹ 0 <PlusIcon style={{ width: 16, height: 16 }} /></span>
            </span>
          </div>

          <div style={{ border: `${strokes.xs} solid ${colors.neutral200}`, borderRadius: radii.m, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "24px minmax(110px,1fr) 46px 76px 46px 60px 80px 24px", gap: 8, padding: "10px 12px", backgroundColor: colors.neutral150, fontSize: fonts.size.xs, color: colors.neutral600 }}>
              <span>#</span><span>Service</span><span style={{ textAlign: "center" }}>Qty</span><span style={{ textAlign: "right" }}>Unit ₹</span><span style={{ textAlign: "center" }}>GST%</span><span style={{ textAlign: "right" }}>Disc</span><span style={{ textAlign: "right" }}>Total</span><span />
            </div>
            {lines.map((l, i) => (
              <div key={l.id} style={{ display: "grid", gridTemplateColumns: "24px minmax(110px,1fr) 46px 76px 46px 60px 80px 24px", gap: 8, padding: "8px 12px", alignItems: "center", borderTop: `${strokes.xs} solid ${colors.neutral150}`, fontSize: fonts.size.s, color: colors.neutral900 }}>
                <span style={{ color: colors.neutral500 }}>{i + 1}</span>
                <span style={{ fontWeight: fonts.weight.medium, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</span>
                <input style={{ ...cell, textAlign: "center" }} type="number" min={1} value={l.qty} onChange={(e) => setLine(l.id, { qty: Math.max(1, Number(e.target.value)) })} />
                <input style={cell} type="number" value={l.unit} onChange={(e) => setLine(l.id, { unit: Number(e.target.value) })} />
                <input style={{ ...cell, textAlign: "center" }} type="number" value={l.gst} onChange={(e) => setLine(l.id, { gst: Number(e.target.value) })} />
                <input style={cell} type="number" value={l.disc} onChange={(e) => setLine(l.id, { disc: Number(e.target.value) })} />
                <span style={{ textAlign: "right", fontWeight: fonts.weight.medium }}>{inr(l.qty * l.unit - l.disc)}</span>
                <button onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))} aria-label="Remove" style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.neutral900, display: "flex", justifyContent: "center" }}>
                  <TrashIcon width={18} height={18} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ width: 240 }}>
            <Select options={[{ label: "+ Add service", value: "" }, ...SERVICE_OPTIONS]} value="" onChange={addService} placeholder="+ Add service" />
          </div>
        </div>

        {/* ── Right: summary + pay (BillCard styling) ──────────────── */}
        <div style={{ flex: "1 1 0", minWidth: 0, borderLeft: `${strokes.xs} solid ${colors.neutral200}`, padding: spacing.xl, display: "flex", flexDirection: "column", gap: spacing.s }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: spacing.xs }}>
            <h3 style={bill.title}>Bill</h3>
            <PrinterIcon width={20} height={20} style={{ position: "absolute", right: 0, cursor: "pointer", color: colors.neutral900 }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.yellowAlpha10, color: colors.yellow200, borderRadius: radii.m, padding: "8px 12px", fontSize: fonts.size.s }}>
            <span>Past due: {inr(PAST_DUE)}</span>
            <button onClick={() => setAddDue((v) => !v)} style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.secondary700, fontSize: fonts.size.s, textDecoration: "underline" }}>{addDue ? "Added" : "Add to bill"}</button>
          </div>

          {sumRow("Total billed", inr(totalBilled))}
          {sumRow("Discount", `− ${inr(discount)}`)}
          {sumRow("Tax", inr(tax))}
          {sumRow("Final amount", inr(finalAmt), false)}
          {sumRow("Received", inr(recv))}
          {sumRow("Refund", `− ${inr(refund)}`)}

          {/* Balance — same treatment as the BillCard "Total" band */}
          <div style={{ ...bill.totalRow, borderRadius: radii.m, marginTop: spacing.xs }}>
            <span style={bill.totalLabel}>Balance</span>
            <span style={bill.totalValue}>₹ {balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div style={{ display: "flex", gap: spacing.s, alignItems: "center", marginTop: spacing.xs }}>
            <div style={{ width: 120 }}>
              <Select options={["Cash", "Card", "UPI", "Waive"]} value={payMode} onChange={setPayMode} />
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m, padding: "0 10px", height: "var(--input-h, 40px)" }}>
              <span style={{ color: colors.neutral500 }}>₹</span>
              <input style={{ ...cell, textAlign: "left", padding: 0 }} type="number" placeholder={String(balance)} value={received} onChange={(e) => setReceived(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
          <button onClick={() => {}} style={{ border: "none", background: "transparent", color: colors.secondary700, cursor: "pointer", fontSize: fonts.size.s, display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start" }}>
            <PlusIcon style={{ width: 14, height: 14 }} /> Payment mode (split)
          </button>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: spacing.s }}>
            <Button variant="dark" size="md" onClick={onClose} style={{ width: "100%" }}>
              {balance > 0 ? `Pay ${inr(balance)}` : "Mark paid"}
            </Button>
            <div style={{ display: "flex", gap: spacing.s }}>
              <Button variant="light" size="sm" onClick={() => {}} style={{ flex: 1 }}>Print</Button>
              <Button variant="light" size="sm" onClick={() => {}} style={{ flex: 1 }}>Share</Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
