// ─────────────────────────────────────────────────────────────────────────────
// Print template — clinic-configurable layout for prescription printouts.
//
// Two paper modes, set per template:
//   • "preprinted" — the clinic's pre-printed letterhead is loaded in the
//     printer. We render only the body text within the blank middle zone, so
//     the user configures top/bottom margins large enough to clear the
//     printed letterhead's design.
//   • "blank" — plain A4 paper is loaded. We render the header image, body,
//     and footer image ourselves.
//
// Stored as JSON in localStorage under `docodile_print_templates_<clinicId>`.
// Replace with a backend endpoint when one exists — only `storage.ts` needs
// to change.
// ─────────────────────────────────────────────────────────────────────────────

export type PaperMode = "preprinted" | "blank";

export type RxLayout = "list" | "tabular";

export type LengthUnit = "mm" | "cm" | "in";

export type PatientFieldKey =
  | "patientId"
  | "phone"
  | "address"
  | "referredBy"
  | "age"
  | "gender"
  | "doctorName"
  | "visitNumber"
  | "visitDate"
  | "visitTime"
  | "validTill";

export type PrintTemplate = {
  id: string;
  name: string;
  isDefault: boolean;

  paperMode: PaperMode;

  // Page margins. Always stored in millimeters — the editor lets users
  // view/enter in their preferred unit but converts to mm on the way in.
  margins: { top: number; right: number; bottom: number; left: number };
  // User's preferred unit for entering margins. Purely a display setting.
  marginsUnit: LengthUnit;

  // Header / footer images — base64 data URLs. Only used in "blank" mode;
  // ignored when paperMode === "preprinted".
  headerImage?: string;
  footerImage?: string;

  // Doctor signature / seal — base64 data URLs.
  signatureImage?: string;
  signatureHeightMm: number;
  signatureText?: string; // e.g. "Dr. Anika Reddy\nMBBS, MD"
  sealImage?: string;

  // Typography.
  fontFamily: string;
  fontSizePt: number;

  // Rx options.
  showGenericName: boolean;
  rxLayout: RxLayout;

  // Patient field toggles.
  show: Record<PatientFieldKey, boolean>;

  capitalizePatientName: boolean;

  // Number of days the prescription is valid for — printed as "Valid till
  // <date>" when show.validTill is on. Computed against the visit date at
  // print time. 0 / undefined hides the row regardless of the toggle.
  validityDays?: number;
};

export const DEFAULT_TEMPLATE: Omit<PrintTemplate, "id"> = {
  name: "Default print template",
  isDefault: true,
  paperMode: "blank",
  margins: { top: 25, right: 15, bottom: 25, left: 15 },
  marginsUnit: "mm",
  headerImage: undefined,
  footerImage: undefined,
  signatureImage: undefined,
  signatureHeightMm: 18,
  signatureText: "",
  sealImage: undefined,
  fontFamily: "Inter, Helvetica, Arial, sans-serif",
  fontSizePt: 11,
  showGenericName: true,
  rxLayout: "list",
  show: {
    patientId: false,
    phone: true,
    address: false,
    referredBy: true,
    age: true,
    gender: true,
    doctorName: false,
    visitNumber: false,
    visitDate: true,
    visitTime: true,
    validTill: false,
  },
  capitalizePatientName: true,
  validityDays: 7,
};

export const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: "Inter (sans)",      value: "Inter, Helvetica, Arial, sans-serif" },
  { label: "Helvetica",          value: "Helvetica, Arial, sans-serif" },
  { label: "Times New Roman",   value: "'Times New Roman', Times, serif" },
  { label: "Georgia",            value: "Georgia, 'Times New Roman', serif" },
  { label: "Courier (mono)",    value: "'Courier New', Courier, monospace" },
];
