import React, { useState, useEffect } from "react";
import { BillLayout } from "../BillLayout";
import { Select } from "../Input/Select/Select";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { DataGrid, GridColumn } from "../DataGrid/DataGrid";
import { DatePicker } from "../DatePicker/DatePicker";
import { Field } from "../Field";
import { MeasureField } from "../MeasureField";
import { MedicineAutocomplete } from "../MedicineAutocomplete/MedicineAutocomplete";
import { listServices } from "../../api/services";
import { listBills } from "../../api/bills";
import { getBillFooter, type BillFooter } from "../../api/patientSearch";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";
import { Icon } from "../Icon";

// BillModal — the one full-invoice editor. Two modes share the same frame:
//   • services / mock — opened with `patient` / `initialServices` (the story +
//     the legacy services invoice).
//   • wired bill — opened with `onBilled` (+ `medicines`, `catalog`,
//     `pendingDue`, `loading`). Seeds the prescribed medicines as line items
//     (carrying each row's in-stock flag), rolls the pending consultation due
//     into the total, supports split payments + Waive, and on "Charge & Bill"
//     calls `onBilled(method, total, items)` so the host records the payment and
//     deducts pharmacy inventory.
type Line = { id: number; name: string; qty: number; unit: number; gst: number; disc: number; discUnit: "%" | "₹"; inStock?: boolean; kind?: "service" | "medicine" | "pastdue" };
type Patient = { code: string; name: string; meta: string };
type BillMedicine = { id?: string; name: string; dosage?: string; unitPrice: number; qty: number; inStock?: boolean };
type BillCatalogItem = { id: string; name: string; unitPrice: number };

const SERVICE_CATALOG: { name: string; price: number }[] = [
  { name: "Ear lobe repair", price: 6000 },
  { name: "Consultation", price: 500 },
  { name: "Dressing", price: 400 },
  { name: "Suture removal", price: 300 },
];

const inr = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (d: Date) => `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

// Footer date helpers: "6 days ago" for the last payment, "13 Dec 25 at 1:02 PM"
// for the registration.
const daysAgo = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
};
const fmtRegistered = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)} at ${time}`;
};

const trailing = (id: number): Line => ({ id, name: "", qty: 1, unit: 0, gst: 0, disc: 0, discUnit: "₹" });

// "Past Due Amount: ₹X  Add to Bill" callout, shown atop the Bill summary when
// the patient carries an outstanding balance from earlier invoices.
const PAST_DUE_BOX: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center", gap: spacing.s,
  padding: `${spacing.xs} ${spacing.s}`, marginBottom: spacing.xs,
  backgroundColor: colors.yellowAlpha20, borderRadius: radii.m,
};
const PAST_DUE_LINK: React.CSSProperties = {
  border: "none", background: "transparent", cursor: "pointer", whiteSpace: "nowrap",
  color: colors.active.shade700, fontSize: fonts.size.s, fontWeight: fonts.weight.medium, textDecoration: "underline",
};

// Cream-box style for the medicine picker's input so it matches the grid's
// other Field cells (Qty / Unit). Mirrors the Rx pad's rxMedicineInput.
const BILL_ITEM_INPUT_STYLE: React.CSSProperties = {
  border: "none",
  outline: "none",
  padding: "0 8px",
  height: 32,
  width: "100%",
  boxSizing: "border-box",
  fontSize: fonts.size.s,
  fontFamily: fonts.family.primary,
  color: colors.neutral900,
  backgroundColor: colors.primary100,
  borderRadius: radii.m,
  minWidth: 0,
};

export function BillModal({
  isOpen, onClose, patient, initialServices,
  patientName, invoiceNo, onViewBills, medicines, onBilled, onPaid,
  serviceName, serviceFee = 0, catalog, loading = false, patientId,
}: {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  initialServices?: { name: string; price: number }[];
  /** Wired-bill mode: patient label shown in the header. */
  patientName?: string;
  /** Existing-bill: invoice no, shown muted beside the patient in the header. */
  invoiceNo?: string;
  /** Open the patient's bill history (the header "View bills" link). Omit to
   *  hide the link — e.g. a first bill, with no prior invoices to view. */
  onViewBills?: () => void;
  /** Reopened-bill mode: record a payment against an existing bill ("Mark paid"
   *  / "Pay ₹X"). Given the amount collected now + the method. */
  onPaid?: (amount: number, method: string) => void;
  /** Wired-bill mode: prescribed medicines seeded as line items. */
  medicines?: BillMedicine[];
  /** Wired-bill mode: called on Charge & Bill / Mark Waived. Buckets stay
   *  separate — serviceAmount → the appointment fee (consultation), pharmacyAmount
   *  → pharmacy; `items` carries the in-stock flag for inventory deduction. */
  onBilled?: (payment: {
    method: string;
    pharmacyAmount: number;
    serviceAmount: number;
    items: { name: string; qty: number; inStock: boolean }[];
    // Snapshot for the Recent Bills record (additive history).
    billed: number;
    paid: number;
    due: number;
    refund: number;
    depositApplied: number;
    payStatus: string;
    lineItems: { name: string; qty: number; unit: number; gst: number; disc: number; discUnit: string; kind: string; inStock: boolean }[];
    note?: string;
  }) => void;
  /** Pending consultation/service for this appointment — seeded as the first
   *  line item (its total bills the consultation fee, kept out of pharmacy). */
  serviceName?: string;
  serviceFee?: number;
  /** Catalog the Item field autocompletes from + prices against. */
  catalog?: BillCatalogItem[];
  loading?: boolean;
  /** Patient id — used to load the bottom footer (last payment / registered on). */
  patientId?: string;
  /** @deprecated The standalone deposit field was removed — an advance is now
   *  applied as an "Advance / credit" payment mode. Still accepted so existing
   *  callers compile; ignored until the credit-mode wiring lands. */
  initialDeposit?: number;
  /** @deprecated See `initialDeposit`. */
  onDeposit?: (amount: number, type: "DEPOSIT" | "REFUND", mode?: string, details?: string) => Promise<number>;
}) {
  const wired = onBilled != null || medicines != null || serviceFee > 0;
  const pt: Patient = patient ?? { code: "T001", name: "Ramesh", meta: "M 12" };

  // The Item field autocompletes + auto-prices from this catalog: the medicines
  // catalog in wired mode, the services catalog otherwise.
  const activeCatalog: { name: string; price: number }[] = catalog
    ? catalog.map((c) => ({ name: c.name, price: c.unitPrice }))
    : SERVICE_CATALOG;
  const priceOf = (name: string) =>
    activeCatalog.find((s) => s.name.toLowerCase() === name.trim().toLowerCase())?.price;

  // Seed the filled rows from medicines (wired), initialServices, or — for the
  // pure mock — a single sample service. A wired bill with no medicines seeds
  // nothing (just the trailing empty row).
  const buildSeed = React.useCallback((): Line[] => {
    const seed: Line[] = [];
    // The pending consultation/service bills first — its own line, kind
    // "service" so it feeds the consultation bucket (fee), never pharmacy /
    // inventory. Re-id'd at the end so ids stay unique + sequential.
    if (serviceFee > 0) {
      seed.push({ id: 0, name: serviceName?.trim() || "Consultation", qty: 1, unit: serviceFee, gst: 0, disc: 0, discUnit: "₹", kind: "service" });
    }
    if (medicines != null) {
      medicines.forEach((m) => seed.push({ id: 0, name: m.name, qty: m.qty, unit: m.unitPrice, gst: 0, disc: 0, discUnit: "₹", inStock: m.inStock, kind: "medicine" }));
    } else if (initialServices && initialServices.length) {
      initialServices.forEach((s) => seed.push({ id: 0, name: s.name, qty: 1, unit: s.price, gst: 0, disc: 0, discUnit: "₹" }));
    } else if (!wired) {
      seed.push({ id: 0, name: "Ear lobe repair", qty: 1, unit: 6000, gst: 0, disc: 0, discUnit: "₹" });
    }
    return seed.map((l, i) => ({ ...l, id: i }));
  }, [medicines, initialServices, wired, serviceFee, serviceName]);

  const seedFilled = buildSeed();
  const nextId = React.useRef(seedFilled.length + 1);
  const emptyLine = (): Line => trailing(nextId.current++);

  // Always one trailing empty row — typing into it fills the row and a fresh
  // empty appears below (same pattern as the New Appointment services list).
  const [lines, setLines] = useState<Line[]>([...seedFilled, trailing(seedFilled.length)]);
  const [billDate, setBillDate] = useState(new Date(2026, 0, 30));
  const [showCal, setShowCal] = useState(false);
  // One payment line by default; "+" splits the bill across modes (Cash + UPI…).
  const [payments, setPayments] = useState<{ mode: string; amount: number | "" }[]>([{ mode: "Cash", amount: "" }]);
  // Once the desk types in / clears the amount themselves, stop auto-filling it.
  const [amountTouched, setAmountTouched] = useState(false);
  // Free-text "Add Details" note — saved on the bill (via onBilled → charge) and
  // shown again when the invoice is reopened (BillReadModal).
  const [billNote, setBillNote] = useState("");

  // Reset the desk's collection inputs ONLY when the modal opens — never on the
  // async prescription arrival below — so an in-flight payment edit isn't wiped
  // when the medicines load in.
  useEffect(() => {
    if (!isOpen) return;
    setPayments([{ mode: "Cash", amount: "" }]);
    setAmountTouched(false);
    setBillNote("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Re-seed the line items when (re)opened or when the prescribed medicines /
  // consultation arrive (the modal is reused across patients). Kept separate
  // from the reset above so a late prescription updates the rows without
  // clobbering payment.
  useEffect(() => {
    if (!isOpen) return;
    const seed = buildSeed();
    nextId.current = seed.length + 1;
    setLines([...seed, trailing(seed.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, medicines, serviceFee, serviceName]);

  // Clinic services catalog — offered in the item picker's "Services" section so
  // the desk can add a service line (Consultation, Dressing, …) as well as meds.
  const [serviceCatalog, setServiceCatalog] = useState<{ name: string; price: number }[]>([]);
  useEffect(() => {
    if (!isOpen || !wired) return;
    listServices()
      .then((svcs) => setServiceCatalog(svcs.map((s) => ({ name: s.name, price: s.price }))))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Bottom footer — the patient's registration date + most recent payment.
  const [footer, setFooter] = useState<BillFooter | null>(null);
  useEffect(() => {
    if (!isOpen || !patientId) { setFooter(null); return; }
    getBillFooter(patientId).then(setFooter).catch(() => setFooter(null));
  }, [isOpen, patientId]);

  // Carry-forward due: the patient's outstanding balance across earlier bills.
  // The "Add to Bill" callout rolls it into this invoice as a `pastdue` line; on
  // Charge the server clears those old dues so the balance isn't counted twice.
  const [pastDue, setPastDue] = useState(0);
  const [pastDueAdded, setPastDueAdded] = useState(false);
  useEffect(() => {
    if (!isOpen || !patientId) { setPastDue(0); setPastDueAdded(false); return; }
    setPastDueAdded(false);
    listBills(patientId)
      .then((bs) => setPastDue(bs.reduce((s, b) => s + (b.due || 0), 0)))
      .catch(() => setPastDue(0));
  }, [isOpen, patientId]);

  const setPayment = (i: number, patch: Partial<{ mode: string; amount: number | "" }>) => {
    if ("amount" in patch) setAmountTouched(true);
    setPayments((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  };
  const addPayment = () => setPayments((ps) => [...ps, { mode: "Cash", amount: "" }]);
  const removePayment = (i: number) => setPayments((ps) => (ps.length === 1 ? ps : ps.filter((_, idx) => idx !== i)));

  const isTrailing = (l: Line) => l.name.trim() === "";
  const setLine = (id: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const setName = (id: number, value: string) => setLines((ls) => {
    const mapped = ls.map((l) => (l.id === id ? { ...l, name: value, unit: priceOf(value) ?? l.unit } : l));
    const filled = mapped.filter((l) => l.name.trim() !== "");
    const existingEmpty = mapped.find((l) => l.name.trim() === "");
    return [...filled, existingEmpty ?? emptyLine()];
  });
  // Picking a SERVICE (from the picker's Services section) turns the row into a
  // service-kind line at the service's price — so it bills the consultation
  // bucket, not pharmacy, and is excluded from inventory.
  const pickService = (id: number, name: string, price: number) => setLines((ls) => {
    const mapped = ls.map((l) => (l.id === id ? { ...l, name, unit: price, kind: "service" as const } : l));
    const filled = mapped.filter((l) => l.name.trim() !== "");
    const existingEmpty = mapped.find((l) => l.name.trim() === "");
    return [...filled, existingEmpty ?? emptyLine()];
  });
  const removeLine = (id: number) => setLines((ls) => {
    const next = ls.filter((l) => l.id !== id);
    return next.some(isTrailing) ? next : [...next, emptyLine()];
  });

  // Roll the patient's outstanding past due into this bill — shown as a Bill
  // summary line (not an editable item); on Charge it rides along as a `pastdue`
  // line so the server folds it into the total and clears the old dues.
  const addPastDue = () => setPastDueAdded(true);

  // Discount per line is either a flat ₹ amount or a % of that line's subtotal.
  const discAmt = (l: Line) => (l.discUnit === "%" ? (l.qty * l.unit * (l.disc || 0)) / 100 : (l.disc || 0));
  const lineTotal = (l: Line) => l.qty * l.unit - discAmt(l);
  // Per-line net INCLUDING its tax — the actual charged amount for that line.
  const lineNet = (l: Line) => lineTotal(l) + (l.qty * l.unit * (l.gst || 0)) / 100;
  const isService = (l: Line) => l.kind === "service";
  const billed = lines.reduce((s, l) => s + l.qty * l.unit, 0);
  const discount = lines.reduce((s, l) => s + discAmt(l), 0);
  const tax = lines.reduce((s, l) => s + (l.qty * l.unit * (l.gst || 0)) / 100, 0);
  // Separate finance buckets: the consultation/service line(s) bill the
  // appointment fee, everything else bills the pharmacy. Each is the NET charged
  // amount (its discount + tax baked in), so fee + pharmacy = the bill total with
  // no double-count.
  const serviceTotal = lines.filter((l) => isService(l) && !isTrailing(l)).reduce((s, l) => s + lineNet(l), 0);
  const pharmacyTotal = lines.filter((l) => !isService(l) && !isTrailing(l)).reduce((s, l) => s + lineNet(l), 0);
  const finalAmt = serviceTotal + pharmacyTotal;

  // Payment: the primary line decides Waive (free dispense → ₹0). The recorded
  // method is the distinct modes joined ("Cash", or "Cash + UPI" for a split).
  const primaryMode = payments[0]?.mode ?? "Cash";
  const isWaived = primaryMode === "Waive";
  const methodLabel = isWaived ? "Waive" : Array.from(new Set(payments.map((p) => p.mode))).join(" + ");

  const displayFinal = isWaived ? 0 : finalAmt;
  // What the desk is collecting now (sum of the payment lines). Whatever the
  // bill total exceeds it becomes due — Received + Balance update live as the
  // amount is typed. Explicit refunds aren't part of creating a bill.
  const paidEntered = isWaived ? 0 : payments.reduce((s, p) => s + (p.amount === "" ? 0 : Number(p.amount)), 0);
  // Current bill + any carried past due = the full amount owed this visit.
  const dueTotal = finalAmt + (pastDueAdded ? pastDue : 0);
  const received = isWaived ? 0 : Math.min(paidEntered, dueTotal);
  const balance = isWaived ? 0 : Math.max(0, dueTotal - paidEntered);
  const refund = 0;

  // Auto-fill the single payment line with the full amount to collect, so the
  // desk can Charge & Bill in one click. Stops as soon as they type/clear the
  // amount, split the payment, or Waive — and tracks the total until then.
  useEffect(() => {
    if (!isOpen || amountTouched || isWaived || payments.length !== 1) return;
    const target = Math.max(0, Math.round(finalAmt));
    setPayments((ps) => {
      const next: number | "" = target > 0 ? target : "";
      return ps[0]?.amount === next ? ps : [{ ...ps[0], amount: next }];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, amountTouched, isWaived, finalAmt, payments.length]);

  // Numeric line-item field → cream FillInput. Stored as a number; blank shows
  // the placeholder rather than a literal 0.
  const numFill = (l: Line, key: "qty" | "unit", placeholder: string) => isTrailing(l) ? null : (
    <Field variant="box" fill="filled" align="center" inputMode="decimal" placeholder={placeholder} ariaLabel={key}
      style={{ padding: "0 8px" }}
      value={(l[key] as number) ? String(l[key]) : ""}
      onChange={(v) => setLine(l.id, { [key]: key === "qty" ? Math.max(1, Math.floor(Number(v)) || 1) : Number(v) || 0 } as Partial<Line>)} />
  );

  // Cells are top-aligned (so a "Not in stock" label can hang below the Item
  // input without dropping the other inputs). Text/icon cells therefore need a
  // 32px box — the input height — centered, so they line up with the input rows.
  const midCell = (node: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 32 }}>{node}</div>
  );

  const columns: GridColumn<Line>[] = [
    { key: "n", header: "#", width: 24, align: "center", render: (l, i) => midCell(<span style={{ color: colors.neutral500 }}>{i + 1}</span>) },
    { key: "svc", header: "Item", align: "left", render: (l) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* The consultation/service line is a plain field (it's not a stocked
            medicine). Medicine rows use the design-system inventory picker (same
            as the Rx pad) — no native datalist; the unit price auto-fills from
            the catalog via setName. */}
        {wired && !isService(l) ? (
          <MedicineAutocomplete
            value={l.name}
            onChange={(v) => setName(l.id, v)}
            placeholder="Type here"
            inputStyle={BILL_ITEM_INPUT_STYLE}
            dropdownPortal
            inventoryOnly
            services={serviceCatalog}
            onPickService={(name, price) => pickService(l.id, name, price)}
          />
        ) : (
          <Field variant="box" fill="filled" placeholder="Type here" ariaLabel="Item"
            style={{ padding: "0 8px" }}
            value={l.name} onChange={(v) => setName(l.id, v)} />
        )}
        {/* Meds not in the clinic's stock: flag the row; its price is editable
            (one-off rate) and the host skips it for inventory deduction. */}
        {!isTrailing(l) && l.inStock === false && (
          <span style={{ fontSize: fonts.size.xs, color: colors.red200, paddingLeft: 4 }}>Not in stock</span>
        )}
      </div>
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
    { key: "tot", header: "Total", width: 84, align: "right", render: (l) => (isTrailing(l) ? "" : (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", height: 32 }}>
        <span style={{ fontSize: fonts.size.m, color: colors.neutral900, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{inr(lineTotal(l))}</span>
      </div>
    )) },
    { key: "x", header: "", width: 38, headerPadding: "8px 4px", cellPadding: "8px 4px", render: (l) => (isTrailing(l) ? "" : midCell(
      <button onClick={() => removeLine(l.id)} aria-label="Remove" style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.neutral900, display: "flex", justifyContent: "center" }}><Icon name="trash" size={20} tone="inherit" style={{ flexShrink: 0 }} /></button>
    )) },
  ];

  const sumRow = (label: string, value: string, strong = false, extra?: React.CSSProperties) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: fonts.size.m, fontFamily: fonts.family.primary, ...extra }}>
      <span style={{ color: strong ? colors.neutral900 : colors.neutral600 }}>{label}</span>
      <span style={{ color: colors.neutral900 }}>{value}</span>
    </div>
  );

  const handleCharge = () => {
    // Only medicine lines hit pharmacy inventory — the consultation/service line
    // is excluded.
    const items = lines
      .filter((l) => !isService(l) && l.name.trim() !== "" && l.qty > 0)
      .map((l) => ({ name: l.name, qty: l.qty, inStock: l.inStock !== false }));
    // Full line snapshot for the bill/invoice record (carries prices, kind).
    const lineItems = lines
      .filter((l) => !isTrailing(l))
      .map((l) => ({ name: l.name, qty: l.qty, unit: l.unit, gst: l.gst, disc: l.disc, discUnit: l.discUnit, kind: l.kind ?? "medicine", inStock: l.inStock !== false }));
    // The carried past due rides along as a `pastdue` line (not an editable row)
    // so the server folds it into the total + clears the patient's old dues.
    if (pastDueAdded && pastDue > 0) {
      lineItems.push({ name: "Previous due", qty: 1, unit: pastDue, gst: 0, disc: 0, discUnit: "₹", kind: "pastdue", inStock: false });
    }
    onBilled?.({
      method: methodLabel,
      pharmacyAmount: isWaived ? 0 : pharmacyTotal,
      serviceAmount: isWaived ? 0 : serviceTotal,
      items,
      billed: finalAmt,
      paid: received,
      due: balance,
      refund: 0,
      depositApplied: 0,
      payStatus: isWaived ? "WAIVED" : balance > 0 ? "DUE" : "PAID",
      lineItems,
      note: billNote.trim() || undefined,
    });
    onClose();
  };
  const hasBillableLine = lines.some((l) => !isTrailing(l) && l.qty > 0);

  // Bottom strip: last payment (left) + registered-on (right). Rendered only
  // once the footer data has loaded for this patient.
  const footerNode = footer && (footer.registeredAt || footer.lastPaymentAt) ? (
    <>
      <span>Last Payment: {footer.lastPaymentAt ? daysAgo(footer.lastPaymentAt) : "—"}</span>
      {footer.registeredAt && <span>Registered on: {fmtRegistered(footer.registeredAt)}</span>}
    </>
  ) : undefined;

  return (
    <BillLayout
      isOpen={isOpen}
      onClose={onClose}
      header={
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: spacing.s, minWidth: 0 }}>
          <span style={{ fontSize: fonts.size.m, fontWeight: fonts.weight.medium, color: colors.neutral900 }}>{patientName ?? `${pt.code} : ${pt.name} - ${pt.meta}`}</span>
          {invoiceNo && <span style={{ fontSize: fonts.size.s, fontWeight: fonts.weight.regular, color: colors.neutral500 }}>{invoiceNo}</span>}
        </span>
      }
      headerActions={
        <>
          {onViewBills && <button onClick={onViewBills} style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.neutral900, fontSize: fonts.size.s, textDecoration: "underline", whiteSpace: "nowrap" }}>View bills</button>}
          <IconButton ariaLabel="Print" onClick={() => {}} color={colors.neutral900}><Icon name="printer" size={24} tone="inherit" /></IconButton>
          <IconButton ariaLabel="Share" onClick={() => {}} color={colors.neutral900}><Icon name="share" size={24} tone="inherit" /></IconButton>
        </>
      }
      billTitle="Bill"
      totalLabel="Balance"
      total={`₹ ${balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      left={
        <>
          {/* Bill date */}
          <div style={{ display: "flex", alignItems: "center", gap: spacing.m, flexWrap: "wrap" }}>
            <span style={{ fontSize: fonts.size.m, color: colors.neutral900 }}>Bill date</span>
            <span onClick={() => setShowCal(true)} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: spacing.xs, height: 30, boxSizing: "border-box", border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m, padding: "0 10px", color: colors.neutral900, cursor: "pointer" }}>
              <Icon name="calendar" size={20} color={colors.neutral900} /> {fmtDate(billDate)}
              {showCal && (
                <DatePicker selectedDate={billDate} showDoneButton onSelect={(d) => { setBillDate(d); setShowCal(false); }} onClose={() => setShowCal(false)} />
              )}
            </span>
          </div>

          <div style={{ "--input-h": "32px" } as React.CSSProperties}>
            {loading ? (
              <div style={{ padding: "20px 8px", textAlign: "center", color: colors.neutral500, fontSize: fonts.size.s }}>Loading prescription…</div>
            ) : (
              <DataGrid columns={columns} rows={lines} rowKey={(l) => l.id} size="m" tdPadding="8px 6px" thPadding="8px 6px"
                tdVerticalAlign="top"
                rowStyle={(l) => (!isTrailing(l) && l.inStock === false ? { backgroundColor: colors.redAlpha10 } : undefined)} />
            )}
          </div>
        </>
      }
      summary={
        <>
          {pastDue > 0 && !pastDueAdded && (
            <div style={PAST_DUE_BOX}>
              <span style={{ fontSize: fonts.size.s, color: colors.neutral700, whiteSpace: "nowrap" }}>
                Past Due: <strong style={{ color: colors.red200 }}>{inr(pastDue)}</strong>
              </span>
              <button type="button" onClick={addPastDue} style={PAST_DUE_LINK}>Add to Bill</button>
            </div>
          )}
          {sumRow("Total billed", inr(billed))}
          {/* A waive is a full write-off → show it as a 100% discount so the
              Final amount drops cleanly to ₹0 (Total − 100% = 0). */}
          {sumRow(isWaived ? "Discount (100%)" : "Discount", `− ${inr(isWaived ? billed : discount)}`)}
          {sumRow("Tax", inr(isWaived ? 0 : tax))}
          {sumRow("Final amount", inr(displayFinal), true)}
          {sumRow("Received", inr(received))}
          {sumRow("Refund", `− ${inr(refund)}`)}
          {pastDueAdded && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: fonts.size.m, fontFamily: fonts.family.primary }}>
              <span style={{ color: colors.neutral600 }}>Past Due Amount</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs, color: colors.neutral900 }}>
                {inr(pastDue)}
                <button type="button" onClick={() => setPastDueAdded(false)} aria-label="Remove past due"
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: colors.neutral500, fontSize: fonts.size.m, lineHeight: 1, padding: 0 }}>✕</button>
              </span>
            </div>
          )}
        </>
      }
      payment={
        <>
          {payments.map((p, i) => {
            const last = i === payments.length - 1;
            return (
              <div key={i} style={{ display: "flex", gap: spacing.s, alignItems: "center", "--input-h": "32px" } as React.CSSProperties}>
                {/* Mode + amount split the row evenly (50/50). */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Select options={["Cash", "Card", "UPI", "Advance / credit", "Waive"]} value={p.mode} onChange={(m) => setPayment(i, { mode: m })} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <MeasureField box prefix="₹" placeholder={i === 0 ? String(Math.round(balance)) : "0"} inputMode="decimal" ariaLabel="Amount"
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

          {/* Partial collection → the rest is recorded as due on the bill. */}
          {!isWaived && balance > 0 && (
            <span style={{ fontSize: fonts.size.s, color: colors.neutral600 }}>
              <strong style={{ color: colors.neutral900 }}>{inr(balance)}</strong> will be added to due
            </span>
          )}

          {/* Free-text note for this payment. */}
          <div style={{ "--input-h": "40px" } as React.CSSProperties}>
            <Field variant="box" ariaLabel="Bill details" placeholder="Add Details" value={billNote} onChange={setBillNote} />
          </div>
        </>
      }
      action={
        onBilled ? (
          <Button variant="dark" size="md" onClick={handleCharge} style={{ flex: 1 }}
            disabled={!hasBillableLine || (!isWaived && finalAmt <= 0)}
            iconLeft={<Icon name="verified-badge" size={20} tone="inverse" />}>
            {isWaived ? "Mark Waived" : "Charge & Bill"}
          </Button>
        ) : (
          <Button variant="dark" size="md" onClick={() => { if (onPaid) onPaid(paidEntered, methodLabel); else onClose(); }} style={{ flex: 1 }}
            disabled={!!onPaid && paidEntered <= 0}
            iconLeft={<Icon name="verified-badge" size={20} tone="inverse" />}>
            {balance > 0 ? `Pay ${inr(balance)}` : "Mark paid"}
          </Button>
        )
      }
      footer={footerNode}
    />
  );
}
