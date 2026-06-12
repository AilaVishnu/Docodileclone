import React, { useState } from "react";
import { Modal } from "../Modal/Modal";
import { Select } from "../Input/Select/Select";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";
import { styles as bill } from "./BillCard.styles";
import { tableHeadCell, tableDivider } from "../../styles/tableStyles";
import { pickAvatar } from "../../utils/avatar";
import { ReactComponent as PrinterIcon } from "../../assets/icons/printer.svg";
import { ReactComponent as ShareIcon } from "../../assets/icons/share.svg";
import { ReactComponent as VerifiedBadgeIcon } from "../../assets/icons/verified-badge.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash.svg";
import { ReactComponent as CalendarIcon } from "../../assets/calendar.svg";
import { PlusIcon } from "../../iconsUtil";

// BillModal — the full-invoice editor that opens from the bill card's expand
// icon (advanced booking). Reuses the design system: Modal, Select, Button,
// IconButton, BillCard styles, the shared table header look, pickAvatar and the
// shared icons. Mock state for now; the real version takes the bill + patient.
type Line = { id: number; name: string; qty: number; unit: number; gst: number; disc: number; custom?: boolean };

type Patient = { code: string; name: string; meta: string; gender?: string; ageYears?: number };

const SERVICE_OPTIONS = [
  { label: "Ear lobe repair · ₹6,000", value: "Ear lobe repair|6000" },
  { label: "Consultation · ₹500", value: "Consultation|500" },
  { label: "Dressing · ₹400", value: "Dressing|400" },
  { label: "Suture removal · ₹300", value: "Suture removal|300" },
];

const inr = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;

export function BillModal({ isOpen, onClose, patient, initialServices }: {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  initialServices?: { name: string; price: number }[];
}) {
  const pt: Patient = patient ?? { code: "T001", name: "Ramesh", meta: "M 12", gender: "Male", ageYears: 12 };
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
  const addCustom = () =>
    setLines((ls) => [...ls, { id: nextId.current++, name: "", qty: 1, unit: 0, gst: 0, disc: 0, custom: true }]);

  const totalBilled = lines.reduce((s, l) => s + l.qty * l.unit, 0);
  const discount = lines.reduce((s, l) => s + (l.disc || 0), 0);
  const tax = lines.reduce((s, l) => s + (l.qty * l.unit * (l.gst || 0)) / 100, 0);
  const finalAmt = totalBilled - discount + tax + (addDue ? PAST_DUE : 0);
  const recv = Number(received) || 0;
  const balance = Math.max(0, finalAmt - recv);
  const refund = Math.max(0, recv - finalAmt);

  // Catalog-style table header + cells (shared tableHeadCell look, size-m,
  // non-name columns centred), but at a modal-friendly density.
  const th = (align: "left" | "center" = "center"): React.CSSProperties => ({ ...tableHeadCell, fontSize: fonts.size.s, fontWeight: fonts.weight.regular, padding: "10px 6px", whiteSpace: "nowrap", textAlign: align });
  const td = (align: "left" | "center" = "center"): React.CSSProperties => ({ fontSize: fonts.size.s, color: colors.neutral900, padding: "6px", borderBottom: tableDivider, verticalAlign: "middle", textAlign: align });
  const cellInput: React.CSSProperties = { border: "none", outline: "none", background: "transparent", fontFamily: fonts.family.primary, fontSize: fonts.size.s, color: colors.neutral900, width: "100%", padding: 0, textAlign: "center" };
  const nameInput: React.CSSProperties = { ...cellInput, textAlign: "left", borderBottom: `${strokes.xs} solid ${colors.neutral300}`, fontWeight: fonts.weight.medium };

  const sumRow = (label: string, value: string, strong = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: fonts.size.m, fontFamily: fonts.family.primary }}>
      <span style={{ color: strong ? colors.neutral900 : colors.neutral600 }}>{label}</span>
      <span style={{ color: colors.neutral900 }}>{value}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} surface={colors.neutral100} width={960} padding={0} radius={16}>
      <div style={{ display: "flex", minHeight: 480, fontFamily: fonts.family.primary }}>
        {/* ── Left ─────────────────────────────────────────────────── */}
        <div style={{ flex: "1.7 1 0", minWidth: 0, padding: spacing.xl, display: "flex", flexDirection: "column", gap: spacing.m }}>
          {/* Section 1 — patient (cream) */}
          <div style={{ display: "flex", alignItems: "center", gap: spacing.m, backgroundColor: colors.primary100, borderRadius: radii.m, padding: `${spacing.s} ${spacing.m}` }}>
            <img src={pickAvatar({ gender: pt.gender, ageYears: pt.ageYears })} alt="" width={40} height={40} style={{ objectFit: "contain", display: "block" }} />
            <div>
              <div style={{ fontSize: fonts.size.m, fontWeight: fonts.weight.medium, color: colors.neutral900 }}>{pt.name} - {pt.meta}</div>
              <div style={{ fontSize: fonts.size.xs, color: colors.neutral600 }}>{pt.code}</div>
            </div>
          </div>

          {/* Section 2 — bill date / deposit + services table */}
          <div style={{ display: "flex", alignItems: "center", gap: spacing.m, flexWrap: "wrap" }}>
            <span style={{ fontSize: fonts.size.m, color: colors.neutral900 }}>Bill date</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs, border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m, padding: "6px 12px", color: colors.neutral900 }}>
              <CalendarIcon width={18} height={18} style={{ color: colors.neutral700 }} /> 30 Jan 2026
            </span>
            <Button variant="light" size="sm" onClick={() => {}}>Today</Button>
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: spacing.xs, color: colors.neutral900 }}>
              Deposit <span style={{ display: "inline-flex", alignItems: "center", gap: 4, border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m, padding: "6px 10px" }}>₹ 0 <PlusIcon style={{ width: 16, height: 16 }} /></span>
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "26px" }} /><col /><col style={{ width: "48px" }} /><col style={{ width: "78px" }} />
              <col style={{ width: "48px" }} /><col style={{ width: "64px" }} /><col style={{ width: "84px" }} /><col style={{ width: "32px" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={th("center")}>#</th><th style={th("left")}>Service</th><th style={th()}>Qty</th>
                <th style={th()}>Unit ₹</th><th style={th()}>GST%</th><th style={th()}>Disc</th><th style={th()}>Total</th><th style={th()} />
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={l.id}>
                  <td style={{ ...td("center"), color: colors.neutral500 }}>{i + 1}</td>
                  <td style={td("left")}>
                    {l.custom
                      ? <input style={nameInput} placeholder="Custom service" value={l.name} onChange={(e) => setLine(l.id, { name: e.target.value })} />
                      : <span style={{ fontWeight: fonts.weight.medium, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{l.name}</span>}
                  </td>
                  <td style={td()}><input style={cellInput} type="number" min={1} value={l.qty} onChange={(e) => setLine(l.id, { qty: Math.max(1, Number(e.target.value)) })} /></td>
                  <td style={td()}><input style={cellInput} type="number" value={l.unit} onChange={(e) => setLine(l.id, { unit: Number(e.target.value) })} /></td>
                  <td style={td()}><input style={cellInput} type="number" value={l.gst} onChange={(e) => setLine(l.id, { gst: Number(e.target.value) })} /></td>
                  <td style={td()}><input style={cellInput} type="number" value={l.disc} onChange={(e) => setLine(l.id, { disc: Number(e.target.value) })} /></td>
                  <td style={{ ...td("center"), fontWeight: fonts.weight.medium }}>{inr(l.qty * l.unit - l.disc)}</td>
                  <td style={td()}>
                    <button onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))} aria-label="Remove" style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.neutral900, display: "flex", justifyContent: "center" }}>
                      <TrashIcon width={18} height={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", alignItems: "center", gap: spacing.s }}>
            <div style={{ width: 230 }}>
              <Select options={[{ label: "+ Add service", value: "" }, ...SERVICE_OPTIONS]} value="" onChange={addService} placeholder="+ Add service" />
            </div>
            <Button variant="light" size="sm" iconLeft={<PlusIcon style={{ width: 14, height: 14 }} />} onClick={addCustom}>Custom service</Button>
          </div>
        </div>

        {/* ── Right: summary + pay (BillCard styling) ──────────────── */}
        <div style={{ flex: "1 1 0", minWidth: 0, borderLeft: `${strokes.xs} solid ${colors.neutral200}`, padding: spacing.xl, display: "flex", flexDirection: "column", gap: spacing.s }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: spacing.xs }}>
            <h3 style={bill.title}>Bill</h3>
            <div style={{ position: "absolute", right: 0 }}><IconButton ariaLabel="Close" onClick={onClose} /></div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.yellowAlpha10, color: colors.yellow200, borderRadius: radii.m, padding: "8px 12px", fontSize: fonts.size.s }}>
            <span>Past due: {inr(PAST_DUE)}</span>
            <button onClick={() => setAddDue((v) => !v)} style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.secondary700, fontSize: fonts.size.s, textDecoration: "underline" }}>{addDue ? "Added" : "Add to bill"}</button>
          </div>

          {sumRow("Total billed", inr(totalBilled))}
          {sumRow("Discount", `− ${inr(discount)}`)}
          {sumRow("Tax", inr(tax))}
          {sumRow("Final amount", inr(finalAmt), true)}
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
              <input style={{ ...cellInput, textAlign: "left" }} type="number" placeholder={String(balance)} value={received} onChange={(e) => setReceived(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
          <button onClick={() => {}} style={{ border: "none", background: "transparent", color: colors.secondary700, cursor: "pointer", fontSize: fonts.size.s, display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start" }}>
            <PlusIcon style={{ width: 14, height: 14 }} /> Payment mode (split)
          </button>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: spacing.s }}>
            <Button variant="dark" size="md" onClick={onClose} style={{ width: "100%" }}
              iconLeft={<VerifiedBadgeIcon width={18} height={18} style={{ color: colors.neutral100 }} />}>
              {balance > 0 ? `Pay ${inr(balance)}` : "Mark paid"}
            </Button>
            <div style={{ display: "flex", gap: spacing.s }}>
              <Button variant="light" size="sm" onClick={() => {}} style={{ flex: 1 }} iconLeft={<PrinterIcon width={16} height={16} />}>Print</Button>
              <Button variant="light" size="sm" onClick={() => {}} style={{ flex: 1 }} iconLeft={<ShareIcon width={16} height={16} />}>Share</Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
