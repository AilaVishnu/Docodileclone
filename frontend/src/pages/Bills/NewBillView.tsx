import React, { useEffect, useRef, useState, CSSProperties } from "react";
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
import { MedicineAutocomplete } from "../../components/MedicineAutocomplete/MedicineAutocomplete";
import { listServices } from "../../api/services";
import { listPharmacyStock } from "../../api/pharmacy";
import { createBill } from "../../api/bills";
import { createPatient } from "../../api/patients";
import { Toast } from "../../components/Toast";
import { resolveToastIcon } from "../../components/Toast/toastIcon";
import { pickAvatar } from "../../utils/avatar";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";
import { usePatients, type Patient } from "../../hooks/usePatients";

/**
 * NewBillView — the "New Bill" page (mock). Lays out like New Appointment:
 *   row 1 → [patient ID card] [details/name card] [bill summary]
 *   row 2 → [bill date]       [services (editable)] [payment]
 * Composes the appointment patient block + the BillModal bill content (editable
 * line items, summary + total band, split payment), all from existing
 * components — same card radius (radii.m) and modal styling throughout.
 */
type Line = { id: number; name: string; qty: number; unit: number; gst: number; disc: number; discUnit: "%" | "₹" };
const lineTotal = (l: Line) => Math.round(l.qty * l.unit * (1 - (l.discUnit === "%" ? l.disc / 100 : l.disc / Math.max(1, l.qty * l.unit))) * (1 + l.gst / 100));
const inr = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;

const blankLine = (id: number): Line => ({ id, name: "", qty: 1, unit: 0, gst: 0, disc: 0, discUnit: "₹" });

// Cream-box input for the item picker so it matches the grid's Qty/Unit Fields
// (mirrors BillModal's BILL_ITEM_INPUT_STYLE).
const ITEM_INPUT_STYLE: CSSProperties = {
  border: "none", outline: "none", padding: "0 8px", height: 32, width: "100%",
  boxSizing: "border-box", fontSize: fonts.size.s, fontFamily: fonts.family.primary,
  color: colors.neutral900, backgroundColor: colors.primary100, borderRadius: radii.m, minWidth: 0,
};

export function NewBillView({ onBack }: { onBack?: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", dob: "", age: "", gender: "Male" });
  const [dobDigits, setDobDigits] = useState("");
  const [locked, setLocked] = useState(false);
  const [patientId, setPatientId] = useState("—");
  const idRef = useRef(2);
  const [lines, setLines] = useState<Line[]>([blankLine(1)]);
  const [method, setMethod] = useState("Cash");
  const [amount, setAmount] = useState("");
  // The picked patient's real id — required to POST the bill (a bill belongs to
  // a patient). Null until an existing patient is selected from the picker.
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [charging, setCharging] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean; dob?: boolean }>({});
  // Real clinic patients for the name/phone autocomplete (same source as the
  // appointment booking form).
  const { data: patients } = usePatients();

  // Item autocomplete + auto-pricing sources — the medicines come from the
  // MedicineAutocomplete's own inventory fetch; services are passed in. `priceOf`
  // fills a line's unit price when its name matches a service or stocked medicine.
  const [serviceCatalog, setServiceCatalog] = useState<{ name: string; price: number }[]>([]);
  const [medCatalog, setMedCatalog] = useState<{ name: string; price: number }[]>([]);
  useEffect(() => {
    listServices().then((svcs) => setServiceCatalog(svcs.map((s) => ({ name: s.name, price: Number(s.price) || 0 })))).catch(() => {});
    listPharmacyStock().then((meds) => setMedCatalog(meds.map((m) => ({ name: m.name, price: m.unitPrice })))).catch(() => {});
  }, []);
  const priceOf = (name: string): number | undefined => {
    const q = name.trim().toLowerCase();
    return [...serviceCatalog, ...medCatalog].find((c) => c.name.toLowerCase() === q)?.price;
  };

  const isTrailing = (l: Line) => l.id === lines[lines.length - 1].id && l.name.trim() === "";
  const setLine = (id: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const setName = (id: number, name: string) => setLines((ls) => {
    const next = ls.map((l) => (l.id === id ? { ...l, name, unit: priceOf(name) ?? l.unit } : l));
    if (next[next.length - 1].name.trim() !== "") next.push(blankLine(idRef.current++));
    return next;
  });
  // Picking a service from the autocomplete's Services section sets the row's
  // name + unit price in one go.
  const pickService = (id: number, name: string, price: number) => setLines((ls) => {
    const next = ls.map((l) => (l.id === id ? { ...l, name, unit: price } : l));
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

  // Autofill every identity field from the picked patient (mirrors the booking
  // form): formatted phone, ISO dob → dd-mm-yyyy + digit buffer, age, and the
  // T### code. Fields lock until "Clear" so a stray keystroke can't drift them.
  const fillFromPatient = (p: Patient) => {
    const clean = (p.phone ?? "").replace(/\D/g, "").slice(-10);
    const phone = clean.length === 10 ? `+91 ${clean.slice(0, 5)} ${clean.slice(5)}` : (p.phone ?? "");
    const [y, m, d] = (p.dob ?? "").split("-"); // ISO yyyy-MM-dd
    const hasDob = Boolean(y && m && d);
    const age = p.age ?? 0;
    setForm((prev) => ({
      ...prev,
      name: p.name,
      phone,
      email: p.email ?? "",
      gender: p.gender ?? "Male",
      dob: hasDob ? `${d}-${m}-${y}` : prev.dob,
      age: `${Math.floor(age / 12)} / ${age % 12}`,
    }));
    if (hasDob) setDobDigits(`${d}${m}${y}`);
    setLocked(true);
    setSelectedPatientId(p.id);
    setErrors({});
    setPatientId(p.displayNo != null ? `T${String(p.displayNo).padStart(3, "0")}` : "T—");
  };
  const clearLocked = () => { setLocked(false); setPatientId("—"); setSelectedPatientId(null); setForm((p) => ({ ...p, name: "", phone: "", email: "", age: "", dob: "" })); };

  // Persist the bill. createBill records an invoice snapshot for the selected
  // patient (billed = final net amount; paid/due from the received amount). It
  // does NOT deduct pharmacy stock or touch the deposit ledger — that's the
  // appointment-driven charge flow. A bill needs a patient row, so a typed-only
  // (unsaved) patient can't be billed here yet.
  const handleCharge = async () => {
    // Validate before submitting; surface the first problem as a toast + field
    // highlight (same rules + pattern as the New Appointment form).
    const phoneDigits = form.phone.replace(/\D/g, "");
    const newErrors = {
      name: !form.name.trim(),
      phone: phoneDigits.length < 10,
      dob: !form.dob && !form.age,
    };
    setErrors(newErrors);
    const firstError =
      newErrors.name ? "Please enter patient name" :
      newErrors.phone ? "Please enter a valid phone number" :
      newErrors.dob ? "Please enter date of birth or age" :
      real.length === 0 ? "Please add at least one item to bill" :
      null;
    if (firstError) { setToastMessage(firstError); return; }

    const isWaive = method === "Waive";
    setCharging(true);
    try {
      // Use the selected existing patient, or find-or-create one from the typed
      // details (same as booking an appointment), then bill that patient.
      let patientId = selectedPatientId;
      if (!patientId) {
        const dobIso = dobDigits.length === 8 ? `${dobDigits.slice(4, 8)}-${dobDigits.slice(2, 4)}-${dobDigits.slice(0, 2)}` : null;
        const ageMonths = form.age
          ? (parseInt(form.age.split("/")[0]?.trim() || "0", 10) || 0) * 12 + (parseInt(form.age.split("/")[1]?.trim() || "0", 10) || 0)
          : null;
        const created = await createPatient({
          name: form.name.trim(),
          phone: form.phone || null,
          email: form.email || null,
          gender: form.gender || null,
          dob: dobIso,
          age: ageMonths,
        });
        patientId = created.id;
      }
      await createBill(patientId, {
        billed: final,
        paid: isWaive ? 0 : received,
        due: isWaive ? 0 : balance,
        payStatus: isWaive ? "WAIVED" : balance > 0 ? "DUE" : "PAID",
        paymentMethod: method,
        items: JSON.stringify(real.map((l) => ({ name: l.name, qty: l.qty, unit: l.unit, gst: l.gst, disc: l.disc, discUnit: l.discUnit }))),
      });
      onBack?.(); // back to the Bills list, which refetches and shows the new invoice
    } catch (e) {
      setToastMessage((e as Error).message || "Couldn't create the bill");
    } finally {
      setCharging(false);
    }
  };

  // Editable line-item cells (mirrors BillModal).
  const numFill = (l: Line, key: "qty" | "unit") => isTrailing(l) ? null : (
    <Field variant="box" fill="filled" align="center" inputMode="decimal" placeholder={key === "qty" ? "1" : "0"} ariaLabel={key} style={{ padding: "0 6px" }}
      value={l[key] ? String(l[key]) : ""} onChange={(v) => setLine(l.id, { [key]: key === "qty" ? Math.max(1, Math.floor(Number(v)) || 1) : Number(v) || 0 } as Partial<Line>)} />
  );
  const mid = (n: React.ReactNode) => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 32 }}>{n}</div>;

  const columns: GridColumn<Line>[] = [
    { key: "n", header: "#", width: 24, align: "center", render: (l, i) => isTrailing(l) ? "" : mid(<span style={{ color: colors.neutral500 }}>{i + 1}</span>) },
    { key: "item", header: "Item", align: "left", render: (l) => (
      <MedicineAutocomplete
        value={l.name}
        onChange={(v) => setName(l.id, v)}
        placeholder="Type here"
        inputStyle={ITEM_INPUT_STYLE}
        dropdownPortal
        inventoryOnly
        services={serviceCatalog}
        onPickService={(name, price) => pickService(l.id, name, price)}
      />
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
          errors={{ name: errors.name, phone: errors.phone, dob: errors.dob }}
          patients={patients} onSelectExisting={fillFromPatient}
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
          <Button variant="dark" size="md" iconLeft={<Icon name="verified-badge" size={18} tone="inverse" />} onClick={handleCharge} disabled={charging}>
            {charging ? "Billing…" : "Charge & Bill"}
          </Button>
        </div>
      </div>

      <Toast
        message={toastMessage}
        {...resolveToastIcon(toastMessage)}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />
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
