import React from "react";
import type { BillStatus } from "../BillStatusBadge";
import { colors, fonts, spacing, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// BillPrint — a clean, print-ready "Bill cum Receipt" for a clinic bill. An
// A4-style white sheet: clinic letterhead, patient + bill meta, an itemized
// services table, and a totals block with the amount in words. Token-styled to
// match the app (serif display for the clinic name + money, Inter for body).
//
// Designed to render in Storybook for layout review; the same markup can later
// drive an off-screen print iframe (cf. PrintTemplate/buildPrintHtml).
// ─────────────────────────────────────────────────────────────────────────────

export type BillPrintItem = { name: string; qty: number; price: number; discount?: number; kind?: "service" | "medicine" };

// Bill status shown as plain coloured text (no pill).
const STATUS: Record<BillStatus, { label: string; color: string }> = {
  paid: { label: "Paid", color: colors.secondary600 },
  due: { label: "Due", color: colors.red200 },
  refunded: { label: "Refunded", color: colors.maroon200 },
  waived: { label: "Waived", color: colors.blue200 },
};

export interface BillPrintProps {
  clinic: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    instagram?: string;
    /** Optional logo node (kept generic — pass an <img>, monogram, etc.). */
    logo?: React.ReactNode;
  };
  patient: { name: string; age?: number; gender?: string; mobile?: string; id?: string; address?: string };
  invoiceNo: string;
  /** Already-formatted bill date string, e.g. "23 Jun 2026 · 1:41 PM". */
  billDate: string;
  status?: BillStatus;
  referredBy?: string;
  items: BillPrintItem[];
  /** Tax amount (already computed). */
  gstAmount?: number;
  /** A bill-level discount on top of any per-line discounts. */
  overallDiscount?: number;
  /** Amount collected. Defaults to the final amount (fully paid). */
  received?: number;
  paymentMode?: string;
  /** Paper width in px. Default 760 (≈ A4 on screen). */
  width?: number;

  // ── Template-driven options (all optional; defaults reproduce the original
  //    receipt so existing callers/stories are unaffected). ────────────────────
  /** Receipt heading. Default "Bill cum Receipt". */
  title?: string;
  /** Clinic GST registration number, printed under the letterhead. */
  gstin?: string;
  /** Accent colour for the title, rule and Final Amount. Falls back to tokens. */
  accentColor?: string;
  /** Footer terms / note printed under the totals. */
  termsText?: string;
  /** Authorised-signatory block. */
  signature?: { image?: string; heightMm?: number; text?: string; seal?: string };
  /** Override the paper font family. */
  fontFamily?: string;
  /** Skip the text letterhead (pre-printed paper, or an uploaded header image). */
  hideLetterhead?: boolean;
  showDiscountCol?: boolean;
  showGstRow?: boolean;
  showAmountInWords?: boolean;
  showPaymentMode?: boolean;
  showReferredBy?: boolean;
  showPatientId?: boolean;
  showPatientAddress?: boolean;
  showPatientMobile?: boolean;
  showReceivedRow?: boolean;
  showBalanceRow?: boolean;
}

const inr = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;

// Indian-system rupees → words ("Three thousand rupees only").
function rupeesInWords(value: number): string {
  let num = Math.round(Math.max(0, value));
  if (num === 0) return "Zero rupees only";
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const two = (n: number): string => (n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : ""));
  const three = (n: number): string => {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return (h ? ones[h] + " hundred" + (r ? " " : "") : "") + (r ? two(r) : "");
  };
  const crore = Math.floor(num / 10000000); num %= 10000000;
  const lakh = Math.floor(num / 100000); num %= 100000;
  const thousand = Math.floor(num / 1000); num %= 1000;
  let out = "";
  if (crore) out += three(crore) + " crore ";
  if (lakh) out += two(lakh) + " lakh ";
  if (thousand) out += two(thousand) + " thousand ";
  if (num) out += three(num);
  out = out.trim();
  return out.charAt(0).toUpperCase() + out.slice(1) + " rupees only";
}

const MetaRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div style={st.metaRow}>
    <span style={st.metaLabel}>{label}</span>
    <span style={st.metaColon}>:</span>
    <span style={st.metaValue}>{value}</span>
  </div>
);

export function BillPrint({
  clinic, patient, invoiceNo, billDate, status = "paid", referredBy,
  items, gstAmount = 0, overallDiscount = 0, received, paymentMode, width = 760,
  title = "Bill cum Receipt", gstin, accentColor, termsText, signature,
  showDiscountCol = true, showGstRow = true, showAmountInWords = true,
  showPaymentMode = true, showReferredBy = true, showPatientId = true,
  showPatientAddress = true, showPatientMobile = true, showReceivedRow = true,
  showBalanceRow = true, fontFamily, hideLetterhead = false,
}: BillPrintProps) {
  const lineNet = (it: BillPrintItem) => it.qty * it.price - (it.discount ?? 0);
  const billed = items.reduce((s, it) => s + it.qty * it.price, 0);
  const lineDiscount = items.reduce((s, it) => s + (it.discount ?? 0), 0);
  const totalDiscount = lineDiscount + overallDiscount;
  const finalAmount = billed - totalDiscount + gstAmount;
  const recd = received ?? (status === "waived" ? 0 : finalAmount);
  const balance = status === "waived" ? 0 : finalAmount - recd;

  const patientMeta = [patient.age && `${patient.age}y`, patient.gender].filter(Boolean).join(", ");

  // Group line items into Services / Medicines sections when the bill mixes
  // both; otherwise render one flat list (continuous numbering across groups).
  const services = items.filter((it) => (it.kind ?? "service") === "service");
  const medicines = items.filter((it) => it.kind === "medicine");
  const grouped = services.length > 0 && medicines.length > 0;
  type Row = { section: string } | { item: BillPrintItem; idx: number };
  const rows: Row[] = [];
  let idx = 0;
  const pushGroup = (label: string | null, list: BillPrintItem[]) => {
    if (list.length === 0) return;
    if (label) rows.push({ section: label });
    list.forEach((it) => { idx += 1; rows.push({ item: it, idx }); });
  };
  if (grouped) { pushGroup("Services", services); pushGroup("Medicines", medicines); }
  else pushGroup(null, items);

  return (
    <div style={{ ...st.paper, width, ...(fontFamily ? { fontFamily } : {}) }}>
      {/* Letterhead — skipped on pre-printed paper / when an uploaded header
          image already carries the clinic identity. */}
      {!hideLetterhead && (
        <>
          <div style={st.header}>
            {clinic.logo && <div style={st.logo}>{clinic.logo}</div>}
            <div style={st.identity}>
              <div style={st.clinicName}>{clinic.name}</div>
              <div style={st.clinicSub}>{clinic.address}</div>
              <div style={st.clinicSub}>
                {[clinic.phone && `Ph: ${clinic.phone}`, clinic.instagram, clinic.email].filter(Boolean).join("  ·  ")}
              </div>
              {gstin && <div style={st.clinicSub}>GSTIN: {gstin}</div>}
            </div>
          </div>
          <div style={{ ...st.rule, ...(accentColor ? { backgroundColor: accentColor } : {}) }} />
        </>
      )}

      <div style={{ ...st.title, ...(accentColor ? { color: accentColor } : {}) }}>{title}</div>

      {/* Patient + bill meta */}
      <div style={st.metaGrid}>
        <div style={st.metaCol}>
          <MetaRow label="Patient Name" value={patient.name + (patientMeta ? ` (${patientMeta})` : "")} />
          {showPatientMobile && patient.mobile && <MetaRow label="Mobile Number" value={patient.mobile} />}
          {showPatientId && patient.id && <MetaRow label="Patient Id" value={patient.id} />}
          {showPatientAddress && patient.address && <MetaRow label="Address" value={patient.address} />}
        </div>
        <div style={st.metaCol}>
          <MetaRow label="Bill Date" value={billDate} />
          <MetaRow label="Bill Number" value={invoiceNo} />
          <MetaRow label="Bill Status" value={<span style={{ color: STATUS[status].color, fontWeight: fonts.weight.semibold }}>{STATUS[status].label}</span>} />
          {showReferredBy && <MetaRow label="Referred By" value={referredBy || "—"} />}
        </div>
      </div>

      {/* Services table */}
      <table style={st.table}>
        <thead>
          <tr>
            <th style={{ ...st.th, ...st.colNum }}>#</th>
            <th style={{ ...st.th, textAlign: "left" }}>Particulars</th>
            <th style={{ ...st.th, ...st.colQty }}>Qty</th>
            <th style={{ ...st.th, ...st.colMoney }}>Price</th>
            {showDiscountCol && <th style={{ ...st.th, ...st.colMoney }}>Discount</th>}
            <th style={{ ...st.th, ...st.colMoney }}>Net Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) =>
            "section" in r ? (
              <tr key={`s${i}`}><td colSpan={showDiscountCol ? 6 : 5} style={st.sectionRow}>{r.section}</td></tr>
            ) : (
              <tr key={i}>
                <td style={{ ...st.td, ...st.colNum, color: colors.neutral500 }}>{r.idx}</td>
                <td style={{ ...st.td, textAlign: "left" }}>{r.item.name}</td>
                <td style={{ ...st.td, ...st.colQty }}>{r.item.qty}</td>
                <td style={{ ...st.td, ...st.colMoney }}>{r.item.price.toLocaleString("en-IN")}</td>
                {showDiscountCol && <td style={{ ...st.td, ...st.colMoney }}>{(r.item.discount ?? 0).toLocaleString("en-IN")}</td>}
                <td style={{ ...st.td, ...st.colMoney, fontWeight: fonts.weight.medium }}>{inr(lineNet(r.item))}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>

      {/* Payment + totals */}
      <div style={st.footer}>
        <div style={st.payCol}>
          {showPaymentMode && paymentMode && <MetaRow label="Payment Mode" value={paymentMode} />}
          {showAmountInWords && <div style={st.words}>{rupeesInWords(finalAmount)}</div>}
        </div>
        <div style={st.totals}>
          {totalRow("Billed Amount", inr(billed))}
          {showGstRow && totalRow("Total GST Amount", inr(gstAmount))}
          {showDiscountCol && totalRow("Overall Discount", `− ${inr(totalDiscount)}`)}
          {totalRow("Final Amount", inr(finalAmount), true, accentColor)}
          {showReceivedRow && totalRow("Received Amount", inr(recd))}
          {showBalanceRow && totalRow("Balance Amount", inr(balance), false, balance > 0 ? colors.red200 : undefined)}
        </div>
      </div>

      {/* Terms + authorised signatory */}
      {(termsText || signature?.image || signature?.text || signature?.seal) && (
        <div style={st.tailRow}>
          <div style={st.terms}>{termsText}</div>
          <div style={st.signCol}>
            {signature?.seal && <img src={signature.seal} alt="" style={st.seal} />}
            {signature?.image && (
              <img src={signature.image} alt="" style={{ height: `${signature.heightMm ?? 18}mm`, objectFit: "contain" }} />
            )}
            {signature?.text && <div style={st.signText}>{signature.text}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const totalRow = (label: string, value: string, strong = false, valueColor?: string) => (
  <div style={{ ...st.totalRow, ...(strong ? st.totalRowStrong : {}) }}>
    <span style={{ ...st.totalLabel, ...(strong ? { color: colors.neutral900, fontWeight: fonts.weight.semibold } : {}) }}>{label}</span>
    <span style={{ ...st.totalValue, ...(strong ? st.totalValueStrong : {}), ...(valueColor ? { color: valueColor } : {}) }}>{value}</span>
  </div>
);

const st: Record<string, React.CSSProperties> = {
  paper: {
    boxSizing: "border-box",
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
    fontFamily: fonts.family.primary,
    padding: "40px 44px",
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
  },
  header: { display: "flex", alignItems: "center", gap: spacing.l },
  logo: { flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  identity: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  clinicName: { fontFamily: fonts.family.secondary, fontSize: fonts.size.h3, color: colors.neutral900, lineHeight: 1.1 },
  clinicSub: { fontSize: fonts.size.s, color: colors.neutral600 },
  rule: { height: strokes.xs, backgroundColor: colors.neutral300 },
  title: { textAlign: "center", fontSize: fonts.size.s, fontWeight: fonts.weight.semibold, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.neutral500 },

  metaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: spacing.xl, rowGap: 0 },
  metaCol: { display: "flex", flexDirection: "column", gap: spacing.xs },
  metaRow: { display: "flex", alignItems: "baseline", gap: spacing.xs, fontSize: fonts.size.s },
  metaLabel: { color: colors.neutral600, fontWeight: fonts.weight.medium, width: 116, flexShrink: 0 },
  metaColon: { color: colors.neutral400 },
  metaValue: { color: colors.neutral900, minWidth: 0 },

  table: { width: "100%", borderCollapse: "collapse", fontSize: fonts.size.s },
  th: { textAlign: "right", padding: "10px 12px", fontSize: fonts.size.xs, fontWeight: fonts.weight.semibold, letterSpacing: "0.04em", textTransform: "uppercase", color: colors.neutral600, backgroundColor: colors.neutral150, borderBottom: `${strokes.s} solid ${colors.neutral300}` },
  td: { textAlign: "right", padding: "12px", color: colors.neutral900, borderBottom: `${strokes.xs} solid ${colors.neutral200}`, fontVariantNumeric: "tabular-nums" },
  colNum: { width: 36, textAlign: "center" },
  colQty: { width: 56, textAlign: "center" },
  colMoney: { width: 104, textAlign: "right", whiteSpace: "nowrap" },
  sectionRow: { textAlign: "left", padding: "8px 12px", fontSize: fonts.size.xs, fontWeight: fonts.weight.semibold, letterSpacing: "0.04em", textTransform: "uppercase", color: colors.neutral700, backgroundColor: colors.primary100, borderBottom: `${strokes.xs} solid ${colors.neutral200}` },

  footer: { display: "flex", justifyContent: "space-between", gap: spacing.xl, alignItems: "flex-start" },
  payCol: { display: "flex", flexDirection: "column", gap: spacing.s, maxWidth: 300 },
  words: { fontSize: fonts.size.s, color: colors.neutral700, fontStyle: "italic" },

  tailRow: { display: "flex", justifyContent: "space-between", gap: spacing.xl, alignItems: "flex-end", marginTop: spacing.s },
  terms: { fontSize: fonts.size.xs, color: colors.neutral600, whiteSpace: "pre-wrap", maxWidth: 360, lineHeight: 1.4 },
  signCol: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, textAlign: "right" },
  seal: { maxHeight: "28mm", maxWidth: "40mm", objectFit: "contain", opacity: 0.85 },
  signText: { fontSize: fonts.size.s, color: colors.neutral700, whiteSpace: "pre-wrap" },

  totals: { width: 300, display: "flex", flexDirection: "column", gap: spacing["2xs"] },
  totalRow: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: fonts.size.s },
  totalRowStrong: { marginTop: spacing["2xs"], paddingTop: spacing.xs, borderTop: `${strokes.s} solid ${colors.neutral300}` },
  totalLabel: { color: colors.neutral600 },
  totalValue: { color: colors.neutral900, fontVariantNumeric: "tabular-nums" },
  totalValueStrong: { fontFamily: fonts.family.secondary, fontSize: fonts.size.h5 },
};
