// ─────────────────────────────────────────────────────────────────────────────
// Bill template — clinic-configurable layout for the "Bill cum Receipt"
// printout. The billing counterpart to PrintTemplate (prescriptions). Same two
// paper modes; the config is stored server-side (bill_template table) as a JSON
// blob and edited in Config → Bill template.
// ─────────────────────────────────────────────────────────────────────────────

export type PaperMode = "preprinted" | "blank";
export type LengthUnit = "mm" | "cm" | "in";

// Toggleable rows/columns on the receipt.
export type BillFieldKey =
  | "discountCol"     // the per-line Discount column
  | "gstRow"          // the "Total GST Amount" totals row
  | "amountInWords"   // "Five hundred rupees only"
  | "paymentMode"     // "Payment Mode: Card"
  | "referredBy"      // "Referred By" meta row
  | "patientId"       // "Patient Id" meta row
  | "patientAddress"  // "Address" meta row
  | "patientMobile"   // "Mobile Number" meta row
  | "receivedRow"     // "Received Amount" totals row
  | "balanceRow";     // "Balance Amount" totals row

export type BillTemplate = {
  id: string;
  name: string;
  isDefault: boolean;

  paperMode: PaperMode;
  // Always stored in millimeters; the editor lets users enter in mm/cm/in.
  margins: { top: number; right: number; bottom: number; left: number };
  marginsUnit: LengthUnit;

  // Letterhead / clinic identity — the gap the receipt has today (it hardcodes
  // "Your Clinic" + empty address). Printed in "blank" mode; ignored when a
  // pre-printed letterhead already carries the design.
  clinicName: string;
  clinicAddress: string;
  clinicPhone?: string;
  clinicEmail?: string;
  gstin?: string;
  logoImage?: string;    // base64 data URL — shown beside the clinic name
  headerImage?: string;  // base64 — full-width header band (blank mode)
  footerImage?: string;  // base64 — full-width footer band (blank mode)

  // Typography.
  fontFamily: string;
  accentColor?: string;  // title / rule / final-amount accent; falls back to a token

  // Content.
  title: string;         // "Bill cum Receipt"
  show: Record<BillFieldKey, boolean>;
  termsText?: string;    // footer terms / note, e.g. "Goods once sold…"

  // Authorised signatory.
  signatureImage?: string;
  signatureHeightMm: number;
  signatureText?: string; // printed below the signature, e.g. "Authorised Signatory"
  sealImage?: string;
};

export const DEFAULT_BILL_TEMPLATE: Omit<BillTemplate, "id"> = {
  name: "Default bill template",
  isDefault: true,
  paperMode: "blank",
  margins: { top: 12, right: 12, bottom: 12, left: 12 },
  marginsUnit: "mm",
  clinicName: "",
  clinicAddress: "",
  clinicPhone: "",
  clinicEmail: "",
  gstin: "",
  logoImage: undefined,
  headerImage: undefined,
  footerImage: undefined,
  fontFamily: "Inter, Helvetica, Arial, sans-serif",
  accentColor: undefined,
  title: "Bill cum Receipt",
  show: {
    discountCol: true,
    gstRow: true,
    amountInWords: true,
    paymentMode: true,
    referredBy: true,
    // Default ON to match the pre-template receipt, which printed the patient's
    // display id whenever present (queue / Bills page callers pass it).
    patientId: true,
    patientAddress: false,
    patientMobile: true,
    receivedRow: true,
    balanceRow: true,
  },
  termsText: "",
  signatureImage: undefined,
  signatureHeightMm: 18,
  signatureText: "",
  sealImage: undefined,
};
