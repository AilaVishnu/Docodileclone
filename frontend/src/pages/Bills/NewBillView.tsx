import React, { useRef, useState, CSSProperties } from "react";
import { styles as appt } from "../../components/AppointmentQueue/BookAppointment.styles";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { Card } from "../../components/Card";
import { PatientDetailsForm } from "../../components/PatientDetailsForm";
import { DataGrid, GridColumn } from "../../components/DataGrid/DataGrid";
import { Select } from "../../components/Input/Select/Select";
import { Field } from "../../components/Field";
import { MeasureField } from "../../components/MeasureField";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Icon } from "../../components/Icon";
import { pickAvatar } from "../../utils/avatar";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";
import type { Patient } from "../../hooks/usePatients";

/**
 * NewBillView — the "New Bill" page (mock). Lays out like New Appointment:
 *   row 1 → [patient ID card] [details/name card] [bill summary]
 *   row 2 → [bill date]       [services (editable)] [payment]
 * Composes the appointment patient block + the BillModal bill content (editable
 * line items, summary + total band, split payment), all from existing
 * components — same card radius (radii.m) and modal styling throughout.
 */
const MOCK_PATIENTS = [
  { id: "p1", name: "Aarav Sharma", phone: "+91 98765 43210", gender: "Male", age: 384, dob: "1994-02-10", email: "aarav@example.com" },
  { id: "p2", name: "Meera Reddy", phone: "+91 90000 11111", gender: "Female", age: 336, dob: "1998-06-01", email: "meera@example.com" },
] as unknown as Patient[];

type Line = { id: number; name: string; qty: number; unit: number; gst: number; disc: number; discUnit: "%" | "₹" };
const lineTotal = (l: Line) => Math.round(l.qty * l.unit * (1 - (l.discUnit === "%" ? l.disc / 100 : l.disc / Math.max(1, l.qty * l.unit))) * (1 + l.gst / 100));
const inr = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;

const blankLine = (id: number): Line => ({ id, name: "", qty: 1, unit: 0, gst: 0, disc: 0, discUnit: "₹" });

export function NewBillView({ onBack }: { onBack?: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", dob: "", age: "", gender: "Male" });
  const [dobDigits, setDobDigits] = useState("");
  const [locked, setLocked] = useState(false);
  const [patientId, setPatientId] = useState("T013");
  const idRef = useRef(5);
  const [lines, setLines] = useState<Line[]>([
    { id: 1, name: "Consultation", qty: 1, unit: 500, gst: 0, disc: 0, discUnit: "₹" },
    { id: 2, name: "Pantoprazole 40mg", qty: 10, unit: 4.2, gst: 12, disc: 0, discUnit: "₹" },
    { id: 3, name: "Acne scar laser", qty: 1, unit: 3500, gst: 18, disc: 10, discUnit: "%" },
    blankLine(4),
  ]);
  const [method, setMethod] = useState("Cash");
  const [amount, setAmount] = useState("");

  const isTrailing = (l: Line) => l.id === lines[lines.length - 1].id && l.name.trim() === "";
  const setLine = (id: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const setName = (id: number, name: string) => setLines((ls) => {
    const next = ls.map((l) => (l.id === id ? { ...l, name } : l));
    if (next[next.length - 1].name.trim() !== "") next.push(blankLine(idRef.current++));
    return next;
  });
  const removeLine = (id: number) => setLines((ls) => ls.filter((l) => l.id !== id));

  const real = lines.filter((l) => l.name.trim() !== "");
  const subtotal = real.reduce((s, l) => s + l.qty * l.unit, 0);
  const discAmt = real.reduce((s, l) => s + (l.discUnit === "%" ? l.qty * l.unit * (l.disc / 100) : l.disc), 0);
  const gstAmt = real.reduce((s, l) => s + (l.qty * l.unit - (l.discUnit === "%" ? l.qty * l.unit * (l.disc / 100) : l.disc)) * (l.gst / 100), 0);
  const final = Math.round(subtotal - discAmt + gstAmt);
  const received = Number(amount) || 0;
  const balance = Math.max(0, final - received);

  const fillFromPatient = (p: Patient) => {
    const age = (p as { age?: number }).age ?? 0;
    setForm((prev) => ({ ...prev, name: p.name, phone: (p as { phone?: string | null }).phone ?? "", gender: (p as { gender?: string | null }).gender ?? "Male", age: `${Math.floor(age / 12)} / ${age % 12}`, email: (p as { email?: string | null }).email ?? "" }));
    setLocked(true);
    setPatientId((p as { displayNo?: number }).displayNo != null ? `T${String((p as { displayNo?: number }).displayNo).padStart(3, "0")}` : "T—");
  };
  const clearLocked = () => { setLocked(false); setPatientId("T013"); setForm((p) => ({ ...p, name: "", phone: "", email: "", age: "", dob: "" })); };

  // Editable line-item cells (mirrors BillModal).
  const numFill = (l: Line, key: "qty" | "unit") => isTrailing(l) ? null : (
    <Field variant="box" fill="filled" align="center" inputMode="decimal" placeholder={key === "qty" ? "1" : "0"} ariaLabel={key} style={{ padding: "0 6px" }}
      value={l[key] ? String(l[key]) : ""} onChange={(v) => setLine(l.id, { [key]: key === "qty" ? Math.max(1, Math.floor(Number(v)) || 1) : Number(v) || 0 } as Partial<Line>)} />
  );
  const mid = (n: React.ReactNode) => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 32 }}>{n}</div>;

  const columns: GridColumn<Line>[] = [
    { key: "n", header: "#", width: 24, align: "center", render: (l, i) => isTrailing(l) ? "" : mid(<span style={{ color: colors.neutral500 }}>{i + 1}</span>) },
    { key: "item", header: "Item", align: "left", render: (l) => (
      <Field variant="box" fill="filled" placeholder="Type here" ariaLabel="Item" style={{ padding: "0 8px" }} value={l.name} onChange={(v) => setName(l.id, v)} />
    ) },
    { key: "qty", header: "Qty", width: 52, render: (l) => numFill(l, "qty") },
    { key: "unit", header: "Unit ₹", width: 76, render: (l) => numFill(l, "unit") },
    { key: "gst", header: "GST", width: 78, render: (l) => isTrailing(l) ? null : (
      <MeasureField unit="%" unitWidth={28} inputMode="decimal" ariaLabel="GST" value={l.gst ? String(l.gst) : ""} onChange={(v) => setLine(l.id, { gst: Number(v) || 0 })} />
    ) },
    { key: "disc", header: "Disc", width: 92, render: (l) => isTrailing(l) ? null : (
      <MeasureField unit={l.discUnit} unitWidth={28} inputMode="decimal" ariaLabel="Discount" onToggleUnit={() => setLine(l.id, { discUnit: l.discUnit === "%" ? "₹" : "%" })} value={l.disc ? String(l.disc) : ""} onChange={(v) => setLine(l.id, { disc: Number(v) || 0 })} />
    ) },
    { key: "tot", header: "Total", width: 88, align: "right", render: (l) => isTrailing(l) ? "" : <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", height: 32 }}><span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{inr(lineTotal(l))}</span></div> },
    { key: "x", header: "", width: 30, align: "center", cellPadding: "8px 2px", render: (l) => isTrailing(l) ? "" : mid(<button onClick={() => removeLine(l.id)} aria-label="Remove" style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.neutral900, display: "flex" }}><Icon name="trash" size={18} tone="inherit" /></button>) },
  ];

  return (
    <div style={appt.overlay}>
      <PageHeader
        onBack={onBack}
        backLabel="Back to Bills"
        innerStyle={{ maxWidth: "none", paddingRight: spacing.xl }}
        title={<span style={{ display: "inline-flex", alignItems: "baseline", gap: spacing.s }}>New Bill <span style={{ fontSize: fonts.size.s, color: colors.neutral500 }}>INV-2026-0042</span></span>}
        actions={<><IconButton ariaLabel="Print"><Icon name="printer" tone="inherit" size={22} /></IconButton><IconButton ariaLabel="Share"><Icon name="share" tone="inherit" size={22} /></IconButton></>}
      />

      <div style={appt.grid}>
        {/* Row 1 — avatar | name card | bill */}
        <Card style={{ ...appt.card, ...appt.patientIdCard, alignSelf: "start" }}>
          <img src={pickAvatar({ gender: form.gender, ageYears: form.age ? parseInt(form.age.split("/")[0]?.trim() || "", 10) : null })} alt="" style={appt.patientAvatar} />
          <h1 style={appt.patientIdText}>{patientId}</h1>
        </Card>

        <PatientDetailsForm
          style={{ gridColumn: "2", gridRow: "1", alignSelf: "start" }}
          value={{ name: form.name, email: form.email, phone: form.phone, dob: form.dob, age: form.age, gender: form.gender }}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          dobDigits={dobDigits} setDobDigits={setDobDigits}
          patients={MOCK_PATIENTS} onSelectExisting={fillFromPatient}
          locked={locked} showClearLink={locked} onClearLocked={clearLocked}
        />

        {/* Right column — Bill + Payment, spans both rows so the left side
            (avatar/name then services) flows tight with no gap under it. */}
        <div style={{ gridColumn: "3", gridRow: "1 / span 2", display: "flex", flexDirection: "column", gap: spacing.m, alignSelf: "start" }}>
          <div style={sx.summaryCard}>
            <h3 style={sx.cardTitle}>Bill</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Sum k="Total billed" v={inr(subtotal)} />
              <Sum k="Discount" v={`− ${inr(discAmt)}`} />
              <Sum k="Tax" v={inr(gstAmt)} />
              <Sum k="Final amount" v={inr(final)} strong />
              <Sum k="Received" v={inr(received)} />
              <Sum k="Refund" v={`− ${inr(0)}`} />
            </div>
            <div style={sx.totalBand}>
              <span style={sx.totalLabel}>Balance</span>
              <span style={sx.totalValue}>₹ {balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div style={sx.paymentCard}>
            <h3 style={sx.cardTitle}>Payment</h3>
            <div style={{ display: "flex", alignItems: "center", gap: spacing.s }}>
              <div style={{ flex: 1, minWidth: 0 }}><Select options={["Cash", "Card", "UPI", "Advance / credit", "Waive"]} value={method} onChange={setMethod} /></div>
              <div style={{ flex: 1, minWidth: 0 }}><MeasureField box prefix="₹" placeholder={String(final)} inputMode="decimal" ariaLabel="Amount" value={amount} onChange={setAmount} /></div>
              <IconButton ariaLabel="Add payment mode (split)" size={32}><Icon name="plus" tone="inherit" size={18} /></IconButton>
            </div>
          </div>
        </div>

        {/* Services — left, spans cols 1-2, sits directly under avatar/name */}
        <div style={{ backgroundColor: colors.neutral100, borderRadius: radii.m, gridColumn: "1 / span 2", gridRow: "2", padding: spacing.s, boxSizing: "border-box", alignSelf: "start", "--input-h": "32px" } as CSSProperties}>
          <DataGrid columns={columns} rows={lines} rowKey={(l) => l.id} size="m" tdPadding="8px 6px" thPadding="8px 6px" tdVerticalAlign="top" />
        </div>

        {/* CTA — out of the cards, centered under the page */}
        <div style={appt.footerButtonGroup}>
          <Button variant="dark" size="md" iconLeft={<Icon name="verified-badge" size={18} tone="inverse" />} onClick={onBack}>Charge &amp; Bill</Button>
        </div>
      </div>
    </div>
  );
}

function Sum({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: fonts.size.m, fontFamily: fonts.family.primary }}><span style={{ color: strong ? colors.neutral900 : colors.neutral600 }}>{k}</span><span style={{ color: colors.neutral900 }}>{v}</span></div>;
}

// Bill / payment card styling — mirrors BillLayout (white, radii.m, serif title,
// neutral-150 total band).
const sx: Record<string, CSSProperties> = {
  summaryCard: { backgroundColor: colors.neutral100, borderRadius: radii.m, padding: spacing.xl, display: "flex", flexDirection: "column", gap: 14, boxSizing: "border-box" },
  paymentCard: { backgroundColor: colors.neutral100, borderRadius: radii.m, padding: spacing.xl, display: "flex", flexDirection: "column", gap: 14, boxSizing: "border-box" },
  cardTitle: { margin: 0, fontFamily: fonts.family.secondary, fontSize: fonts.size.h5, lineHeight: fonts.lineHeight.h5, fontWeight: fonts.weight.regular, color: colors.neutral900 },
  totalBand: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: colors.neutral150, borderRadius: radii.m },
  totalLabel: { fontSize: fonts.size.m, fontWeight: 600, color: colors.neutral900 },
  totalValue: { fontSize: fonts.size.h4, fontFamily: fonts.family.secondary, color: colors.neutral900 },
};
