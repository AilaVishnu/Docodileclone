import React from "react";
import { styles } from "./PrescriptionPage.styles";
import { pickAvatar } from "../../utils/avatar";
import { Icon } from "../../components/Icon";
import { Card } from "../../components/Card";
import { IconButton } from "../../components/IconButton";
import { MeasureField } from "../../components/MeasureField";
import { DatePicker } from "../../components/DatePicker/DatePicker";
import { PopoverMenu } from "../../components/PopoverMenu/PopoverMenu";
import { Toast } from "../../components/Toast";
import { resolveToastIcon } from "../../components/Toast/toastIcon";
import { Autocomplete } from "../../components/Autocomplete/Autocomplete";
import { MedicineAutocomplete } from "../../components/MedicineAutocomplete/MedicineAutocomplete";
import { FrequencyPicker } from "../../components/FrequencyPicker/FrequencyPicker";
import { WhenPicker } from "../../components/WhenPicker/WhenPicker";
import { FrequencyIntervalPicker } from "../../components/FrequencyIntervalPicker/FrequencyIntervalPicker";
import { DurationPicker } from "../../components/DurationPicker/DurationPicker";
import { AutocompleteTags } from "../../components/Autocomplete/AutocompleteTags";
import { useDoctors } from "../../hooks/useDoctors";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import {
  fetchPatientSummary,
  generatePatientSummary,
  parsePatientSummary,
  getAIHealth,
  type PatientSummary,
} from "../../api/ai";
import { PrescriptionQueue } from "./PrescriptionQueue";
import { Patient } from "../../hooks/usePatients";
import {
  consumePendingSessionNav,
  type PendingSessionNav,
} from "../../components/TopNav/SessionTrayButton";
import { markStarted, unmarkStarted } from "../../utils/sessionStarted";
import { useVisits } from "../../hooks/useVisits";
import { createVisit, updateVisit, deleteVisit, RxRowDTO, SaveVisitRequest, VisitDTO } from "../../api/visits";
import { listRxTemplates, saveRxTemplate, deleteRxTemplate } from "../../api/rxTemplates";
import { fetchLatestRxForMedicine, RxLatestDTO } from "../../api/rxHistory";
import { API_BASE_URL } from "../../apiConfig";
import { AddReportModal, AddReportRow } from "./AddReportModal";
import { FileViewer } from "./FileViewer";
import { EditPatientModal } from "./EditPatientModal";
import { buildPrintHtml, openPrintWindow, downloadAsPdf, getDefaultTemplate, loadTemplates, PrintVisitData } from "../Settings";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button";
import { Select } from "../../components/Input/Select/Select";
import { ViewToggle } from "../../components/ViewToggle";
import { PatientRecordHeader, RecordSection } from "../../components/PatientRecordHeader";
import { Tabs } from "../../components/Tabs";
import { DataGrid } from "../../components/DataGrid/DataGrid";

// ─────────────────────────────────────────────────────────────────────────────
// PrescriptionPage — base scaffold per Figma "Visits" design.
// Renders static placeholder structure; wire up real data/inputs as follow-up.
// ─────────────────────────────────────────────────────────────────────────────

// Visit content (vitals, complaints, diagnosis, Rx, etc.) is fetched from
// the backend via useVisits(patientId). Tab metadata (caption, label) is
// derived from the visit's visitDate at render time.
//
// Each VITAL_COLUMNS label maps to an explicit field on VisitDTO. BP is
// special — it's stored as separate sys/dia columns + a shared unit; here
// it round-trips via a single "sys/dia" string in the cell state.
const VITAL_FIELD_MAP: Record<
  string,
  { valueKey: keyof VisitDTO; unitKey: keyof VisitDTO } | undefined
> = {
  BMI: { valueKey: "bmi", unitKey: "bmiUnit" },
  Height: { valueKey: "height", unitKey: "heightUnit" },
  Weight: { valueKey: "weight", unitKey: "weightUnit" },
  Temperature: { valueKey: "temperature", unitKey: "temperatureUnit" },
  Pulse: { valueKey: "pulse", unitKey: "pulseUnit" },
  Waist: { valueKey: "waist", unitKey: "waistUnit" },
  Hip: { valueKey: "hip", unitKey: "hipUnit" },
  SPO2: { valueKey: "spo2", unitKey: "spo2Unit" },
};

// Figma node 2057:6284 — Vitals laid out as 6 columns × 2 rows.
// Each cell has a value (cream) + unit pill (white/border).
// BP is special: placeholder shows `/` acting as sys / dia divider.
type VitalCell = { label: string; unit: string; unitWidth?: number; placeholder?: string };
const VITAL_COLUMNS: VitalCell[][] = [
  [
    { label: "BP", unit: "mmHg", unitWidth: 64 },
    { label: "BMI", unit: "kg/m²", unitWidth: 64 },
  ],
  [
    { label: "Height", unit: "cm", unitWidth: 44 },
    { label: "Weight", unit: "kg", unitWidth: 44 },
  ],
  [
    { label: "Temperature", unit: "°C", unitWidth: 44 },
    { label: "Pulse", unit: "bpm", unitWidth: 44 },
  ],
  [
    { label: "Waist", unit: "cm", unitWidth: 44 },
    { label: "Hip", unit: "cm", unitWidth: 44 },
  ],
  [
    { label: "SPO2", unit: "%", unitWidth: 44 },
  ],
];

// Flattened, render-order list of the 10 vital cells. Keeps the original
// `${columnIndex}-${rowIndex}` key so vitalState (built from VITAL_COLUMNS)
// still resolves — only the layout changed (column-pairs → one responsive
// grid). Row-major order reads BP·BMI / Height·Weight / … pairing related
// vitals next to each other.
const VITAL_CELLS: { cell: VitalCell; cellKey: string }[] = VITAL_COLUMNS.flatMap(
  (col, ci) => col.map((cell, ri) => ({ cell, cellKey: `${ci}-${ri}` })),
);

// Figma node 2073:3030 — History section. 2×2 grid of cream-filled fields.
// Each row carries the `field` key for the suggestion API
// (GET /api/suggestions?field=&q=) so each input can autocomplete from a
// per-clinic catalog stored in Postgres rather than hardcoded options.
const HISTORY_FIELDS = [
  { label: "Family History", field: "family_history", placeholder: "Type here..." },
  { label: "Allergies", field: "allergies", placeholder: "Type here..." },
  { label: "Personal History", field: "personal_history", placeholder: "Type here..." },
  { label: "Past Medical History", field: "past_medical_history", placeholder: "Type here..." },
];

// History/Complaints/Diagnosis/Tests are stored as comma-joined strings on
// the visit (TEXT columns); the chip picker works with arrays, so we split
// on commas at the boundary and trim to drop "" / leading-trailing space.
const splitTags = (raw: string): string[] =>
  raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

// Override AutocompleteTags' default cream pill — the host already provides
// the cream noteCardField wrapper, so the inner box stays transparent and
// reserves room on the right for the absolute-positioned dictate icons.
const NOTE_CARD_TAGBOX_STYLE: React.CSSProperties = {
  backgroundColor: "transparent",
  borderRadius: 0,
  padding: 0,
  alignItems: "flex-start",
  alignContent: "flex-start",
  paddingRight: 64,
  width: "100%",
  minHeight: 80,
};

// Tests row — single-line field that grows vertically as chips wrap.
const TESTS_TAGBOX_STYLE: React.CSSProperties = {
  backgroundColor: "transparent",
  borderRadius: 0,
  padding: 0,
  width: "100%",
};

// Unit toggles for clickable vital pills. Clicking a unit swaps to the
// alternative unit and converts the displayed value. Units without an entry
// in this map (BMI/kg/m², Pulse/bpm, SPO2/%) are non-toggleable.
const convertNum = (v: string, factor: number, decimals = 1): string => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? v : (n * factor).toFixed(decimals);
};
const convertTemp = (v: string, to: "F" | "C"): string => {
  const n = parseFloat(v);
  if (Number.isNaN(n)) return v;
  return (to === "F" ? n * 9 / 5 + 32 : (n - 32) * 5 / 9).toFixed(1);
};
const convertBp = (v: string, to: "mmHg" | "kPa"): string =>
  v.split("/").map((p) => {
    const n = parseFloat(p.trim());
    if (Number.isNaN(n)) return p;
    return to === "kPa" ? (n * 0.133322).toFixed(1) : Math.round(n / 0.133322).toString();
  }).join("/");
// Realistic human-range bounds per (vital, unit). Values outside these get a
// visual warning state. BP sys/dia get separate keys ("BP_sys" / "BP_dia").
type VitalRange = { min: number; max: number };
const VITAL_RANGES: Record<string, Record<string, VitalRange>> = {
  BP_sys: { mmHg: { min: 60, max: 220 }, kPa: { min: 8, max: 30 } },
  BP_dia: { mmHg: { min: 30, max: 140 }, kPa: { min: 4, max: 19 } },
  BMI: { "kg/m²": { min: 10, max: 60 } },
  Height: { cm: { min: 30, max: 250 }, in: { min: 12, max: 100 } },
  Weight: { kg: { min: 1, max: 300 }, lb: { min: 2, max: 660 } },
  Temperature: { "°C": { min: 30, max: 45 }, "°F": { min: 86, max: 113 } },
  Pulse: { bpm: { min: 30, max: 220 } },
  Waist: { cm: { min: 30, max: 200 }, in: { min: 12, max: 80 } },
  Hip: { cm: { min: 30, max: 200 }, in: { min: 12, max: 80 } },
  SPO2: { "%": { min: 50, max: 100 } },
};

const isVitalValid = (rangeKey: string, value: string, unit: string): boolean => {
  if (value.trim() === "") return true; // empty is allowed
  const ranges = VITAL_RANGES[rangeKey];
  const r = ranges?.[unit];
  if (!r) return true;
  const n = parseFloat(value);
  if (Number.isNaN(n)) return false;
  return n >= r.min && n <= r.max;
};

const UNIT_TOGGLES: Record<string, { altUnit: string; convert: (v: string) => string }> = {
  mmHg: { altUnit: "kPa", convert: (v) => convertBp(v, "kPa") },
  kPa: { altUnit: "mmHg", convert: (v) => convertBp(v, "mmHg") },
  cm: { altUnit: "in", convert: (v) => convertNum(v, 0.393701) },
  in: { altUnit: "cm", convert: (v) => convertNum(v, 2.54) },
  kg: { altUnit: "lb", convert: (v) => convertNum(v, 2.20462) },
  lb: { altUnit: "kg", convert: (v) => convertNum(v, 0.453592) },
  "°C": { altUnit: "°F", convert: (v) => convertTemp(v, "F") },
  "°F": { altUnit: "°C", convert: (v) => convertTemp(v, "C") },
};

// Build per-cell vital state from the active visit's DTO. Keyed by
// `${columnIndex}-${rowIndex}` so the duplicate "Hip" cell gets its own slot.
type VitalCellState = { value: string; unit: string };
const buildVitalState = (visit: VisitDTO | undefined): Record<string, VitalCellState> => {
  const state: Record<string, VitalCellState> = {};
  VITAL_COLUMNS.forEach((col, ci) => {
    col.forEach((v, ri) => {
      const key = `${ci}-${ri}`;
      if (v.label === "BP") {
        const sys = visit?.bpSystolic ?? "";
        const dia = visit?.bpDiastolic ?? "";
        state[key] = {
          value: sys || dia ? `${sys}/${dia}` : "",
          unit: visit?.bpUnit ?? v.unit,
        };
      } else {
        const map = VITAL_FIELD_MAP[v.label];
        if (map) {
          state[key] = {
            value: ((visit?.[map.valueKey] as string | null | undefined) ?? "") as string,
            unit: ((visit?.[map.unitKey] as string | null | undefined) ?? v.unit) as string,
          };
        } else {
          state[key] = { value: "", unit: v.unit };
        }
      }
    });
  });
  return state;
};

// A secondary dose line added via the "Then" plus icon on a medicine row.
type ThenRow = { dosage: string; whenToTake: string; frequency: string; frequencyInterval: string; duration: string; notes: string };
const blankThenRow = (): ThenRow => ({ dosage: "", whenToTake: "", frequency: "", frequencyInterval: "", duration: "", notes: "" });

// Draft Rx row in component state — `id` may be null for fresh rows that
// haven't been saved yet; otherwise carries the server-assigned UUID.
type RxRowDraft = {
  id: string | null;
  position: number;
  medicine: string;
  genericName: string;
  medicineNote: string;
  dosage: string;
  whenToTake: string;
  frequency: string;
  frequencyInterval: string;
  duration: string;
  notes: string;
  thenRows: ThenRow[];
};

const blankRxRow = (position: number): RxRowDraft => ({
  id: null,
  position,
  medicine: "",
  genericName: "",
  medicineNote: "",
  dosage: "",
  whenToTake: "",
  frequency: "",
  frequencyInterval: "",
  duration: "",
  notes: "",
  thenRows: [],
});

// Services-style trailing row: keep every filled row (a medicine entered) in
// order, followed by exactly one empty row to type the next medicine into.
// Typing into the trailing empty fills it and a fresh empty re-appears. The
// trailing empty carries no medicine, so the save path (which drops rows with
// no medicine) already ignores it.
const withTrailingRx = (rows: RxRowDraft[]): RxRowDraft[] => {
  const filled = rows.filter((r) => r.medicine.trim() !== "");
  const empty = rows.find((r) => r.medicine.trim() === "");
  return [...filled, empty ?? blankRxRow(0)].map((r, i) => ({ ...r, position: i + 1 }));
};

const fromRxDTO = (dto: RxRowDTO): RxRowDraft => ({
  id: dto.id ?? null,
  position: dto.position,
  medicine: dto.medicine ?? "",
  genericName: "",
  medicineNote: dto.medicineNote ?? "",
  dosage: dto.dosage ?? "",
  whenToTake: dto.whenToTake ?? "",
  frequency: dto.frequency ?? "",
  frequencyInterval: dto.frequencyInterval ?? "",
  duration: dto.duration ?? "",
  notes: dto.notes ?? "",
  thenRows: [],
});

// ── Prescription templates (clinic-shared, stored on the backend) ───────────
// A reusable clinical template — complaints/diagnosis/tests/notes/review + the
// Rx rows. Excludes vitals and history, which are per-patient measurements and
// shouldn't be auto-filled from a template. The backend stores `content` as an
// opaque JSON blob of exactly this shape (minus the name).
// Per-section template kinds. Each card / footer has its own list — saving
// from one card only surfaces in that card's Load list.
type TemplateKind =
  | "complaints"
  | "diagnosis"
  | "tests"
  | "notes_for_patient"
  | "private_notes"
  | "rx";

type SavedTemplate = { name: string; content: string };

const tplStyles: Record<string, React.CSSProperties> = {
  container: { display: "flex", flexDirection: "column", gap: spacing.m, width: 460, maxWidth: "92vw" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.s },
  title: { margin: 0, fontFamily: fonts.family.secondary, fontSize: fonts.size.h5, lineHeight: fonts.lineHeight.h5, fontWeight: fonts.weight.regular, color: colors.neutral900 },
  subtitle: { margin: "4px 0 0", fontSize: fonts.size.s, color: colors.neutral500 },
  saveRow: { display: "flex", gap: spacing.s, alignItems: "center" },
  input: { flex: 1, height: 40, boxSizing: "border-box", padding: `0 ${spacing.s}`, border: `1px solid ${colors.neutral300}`, borderRadius: radii.m, backgroundColor: colors.neutral150, fontFamily: fonts.family.primary, fontSize: fonts.control.md, color: colors.neutral900, outline: "none" },
  saveBtn: { flexShrink: 0, height: 40, padding: "0 20px", border: "none", borderRadius: radii.full, backgroundColor: colors.primary700, color: colors.neutral100, fontFamily: fonts.family.primary, fontSize: fonts.control.md, cursor: "pointer" },
  list: { display: "flex", flexDirection: "column", gap: spacing.xs, maxHeight: 280, overflowY: "auto" },
  empty: { fontFamily: fonts.family.primary, fontSize: fonts.size.s, color: colors.neutral500, textAlign: "center", margin: `${spacing.m} 0` },
  item: { display: "flex", alignItems: "center", gap: spacing.xs, backgroundColor: colors.neutral150, borderRadius: radii.m, paddingRight: spacing.xs },
  itemName: { flex: 1, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: `10px ${spacing.s}`, fontFamily: fonts.family.primary, fontSize: fonts.control.md, color: colors.neutral900, borderRadius: radii.m },
  itemDelete: { flexShrink: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: colors.red100, cursor: "pointer", fontSize: 14, borderRadius: radii.s },
};

// Move-to-today confirmation dialog. Mirrors tplStyles' tokens so it reads as
// part of the same modal family.
const moveStyles: Record<string, React.CSSProperties> = {
  container: { display: "flex", flexDirection: "column", gap: spacing.s, width: 420, maxWidth: "92vw" },
  title: { margin: 0, fontFamily: fonts.family.secondary, fontSize: fonts.size.h5, lineHeight: fonts.lineHeight.h5, fontWeight: fonts.weight.regular, color: colors.neutral900 },
  body: { margin: 0, fontFamily: fonts.family.primary, fontSize: fonts.size.s, lineHeight: fonts.lineHeight.s, color: colors.neutral700 },
  bodyMuted: { margin: `${spacing.xs} 0 0`, fontFamily: fonts.family.primary, fontSize: fonts.size.s, color: colors.neutral500 },
  actions: { display: "flex", justifyContent: "flex-end", gap: spacing.s, marginTop: spacing.s },
};

// Format a yyyy-MM-dd date as "DD MMM" (or "Today" if it's today's date).
const formatVisitLabel = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const today = new Date();
  if (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  ) {
    return "Today";
  }
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const todayIso = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Build a new visit's save payload by carrying a source visit forward —
// review patients usually get the same Rx with minor tweaks, so the doctor
// edits from a copy instead of retyping. Carried over: history, diagnosis,
// Rx, tests, all notes (patient / private / review), refer-to. Reset because
// they're specific to each visit: vitals (measured fresh), the complaint
// (reason for THIS visit), the review/follow-up date. `source` undefined
// (no prior visit) yields a fully blank draft.
const copyForwardDraft = (
  source: VisitDTO | undefined,
  opts: { visitDate: string; createdByDoctorId?: string | null; appointmentId?: string | null },
): SaveVisitRequest => ({
  visitDate: opts.visitDate,
  // Per-visit — not carried forward.
  bpSystolic: null, bpDiastolic: null, bpUnit: null,
  bmi: null, bmiUnit: null, height: null, heightUnit: null,
  weight: null, weightUnit: null, temperature: null, temperatureUnit: null,
  pulse: null, pulseUnit: null, waist: null, waistUnit: null,
  hip: null, hipUnit: null, spo2: null, spo2Unit: null,
  complaints: null,
  reviewDate: null, reviewDays: null,
  // Carried forward from the source visit.
  familyHistory: source?.familyHistory ?? null,
  allergies: source?.allergies ?? null,
  personalHistory: source?.personalHistory ?? null,
  pastMedicalHistory: source?.pastMedicalHistory ?? null,
  diagnosis: source?.diagnosis ?? null,
  notesForPatient: source?.notesForPatient ?? null,
  privateNotes: source?.privateNotes ?? null,
  tests: source?.tests ?? null,
  reviewNotes: source?.reviewNotes ?? null,
  referDoctorId: source?.referDoctorId ?? null,
  createdByDoctorId: opts.createdByDoctorId ?? null,
  appointmentId: opts.appointmentId,
  sessionStartedAt: null, sessionEndedAt: null, sessionDurationSec: null,
  prescriptions: (source?.prescriptions ?? []).map((p, i) => ({ ...p, id: null, position: i + 1 })),
});

// Total units to dispense for one Rx row:
//   qty = ceil( units/dose × doses/day × days )
// Returns null when any input is missing or unparseable (SOS, "As
// directed", fractional dose with no clear duration) so the printed Rx
// can simply show a blank Total column. Mirrors the formula used by
// AppointmentQueue's Bill Medicines auto-quantity so the printed Rx and
// the dispensary bill stay consistent.
// Topical / liquid / per-pack forms (creams, lotions, drops, syrups…) ship as
// a single unit (tube/bottle/bar), so their dispense quantity is 1 — not
// doses × days like tablets/capsules.
const PER_PACK_FORM = /cream|lotion|gel|ointment|\boil\b|shampoo|soap|wash|serum|sunscreen|balm|paste|scrub|spray|powder|syrup|suspension|solution|drop|moisturi|conditioner|foam|emulsion|liniment|tincture/i;
const computeRxTotal = (medicine?: string | null, dosage?: string | null, frequency?: string | null, duration?: string | null): number | null => {
  if (medicine && PER_PACK_FORM.test(medicine)) return 1;
  const dosageMatch = (dosage ?? "").match(/([\d.]+)/);
  const unitsPerDose = dosageMatch ? parseFloat(dosageMatch[1]) : 1;
  const dosesPerDay = (frequency ?? "")
    .split(/[-+,/\s]+/)
    .map((p) => parseInt(p, 10))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => a + b, 0);
  const d = (duration ?? "").match(/(\d+)\s*(day|week|month|year|d|w|m|y)?/i);
  if (!d) return null;
  const n = parseInt(d[1], 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  const unit = (d[2] ?? "day").toLowerCase();
  const days = unit.startsWith("w") ? n * 7
    : (unit.startsWith("mon") || unit === "m") ? n * 30
    : unit.startsWith("y") ? n * 365
    : n;
  if (!dosesPerDay || !Number.isFinite(unitsPerDose) || unitsPerDose <= 0) return null;
  return Math.ceil(unitsPerDose * dosesPerDay * days);
};

// Figma node 2059:6764 — patient-context action list.
// "Visits" renders active by default; count badges are circular.
// Icons are the exact Linear set from the Figma design, normalized to
// currentColor so they flip between dark/white with the row's active state.
// Static action metadata (icon + label). Counts are computed dynamically
// inside the component from real data sources, not hardcoded here.
type ActionMeta = { icon: React.ReactNode; label: string };
const ACTION_META: ActionMeta[] = [
  { icon: <Icon name="visits" tone="inherit" style={styles.actionIcon} />, label: "Visits" },
  // Reports + Files merged into a single "Files" tab — category is now a
  // first-class metadata field on each upload (Reports / Prescriptions /
  // Observations / Admin / Other), with chip filtering below.
  { icon: <Icon name="file" tone="inherit" style={styles.actionIcon} />, label: "Files" },
  { icon: <Icon name="history" tone="inherit" style={styles.actionIcon} />, label: "Timeline" },
  { icon: <Icon name="bill-check" tone="inherit" style={styles.actionIcon} />, label: "Bills" },
  // Info appended at the END so the other action indices (Visits 0 … Bills 3)
  // are untouched; the nav just RENDERS it first (see NAV_ORDER).
  { icon: <Icon name="user-hands" tone="inherit" style={styles.actionIcon} />, label: "Info" },
];

// Display order for the section nav — Info (index 4) shows first, before Visits.
const NAV_ORDER = [4, 0, 1, 2, 3];
const INFO_ACTION = 4;


// List-view config — single "Files" entry at action 1. Tabs are semantic
// categories (not file formats) — the chip the user picks at upload time
// drives both the table and these filter chips. NOTE: the Files tab's rows
// come from `serverFiles` (fetched from the backend); `rows` here is only the
// static config scaffold, not the live data.
type ListViewConfig = {
  title: string;
  subtitle: string;
  addLabel: string;
  nameColumn: string;
  dateColumn: string;
  tabs: readonly string[];
  rows: { name: string; category: string; date: string }[];
};
const LIST_VIEWS: Record<number, ListViewConfig> = {
  1: {
    title: "Files",
    subtitle: "",
    addLabel: "Add File",
    nameColumn: "File name",
    dateColumn: "Investigation date",
    // Semantic categories — match the values used in AddReportModal's
    // Category dropdown so chip filtering is exact-match against `row.category`.
    // "All" is a virtual chip handled in `displayRows` (passes everything through).
    tabs: ["All", "Reports", "Prescriptions", "Observations", "Admin", "Other"],
    rows: [],
  },
};

// (BpInput removed — the BP cell now uses the shared <MeasureField bp> with its
// own auto-advance systolic→diastolic logic.)

// Renders an image thumbnail for files — handles both local blob URLs and
// auth-protected API download URLs by fetching with the JWT when needed.
function AuthThumb({ fileUrl, mimeType, style }: { fileUrl: string | null | undefined; mimeType: string | null | undefined; style?: React.CSSProperties }) {
  const isImage = (mimeType ?? "").startsWith("image/");
  const [src, setSrc] = React.useState<string | null>(fileUrl && !fileUrl.startsWith(API_BASE_URL) ? fileUrl : null);

  React.useEffect(() => {
    if (!fileUrl || !isImage) { setSrc(null); return; }
    if (!fileUrl.startsWith(API_BASE_URL)) { setSrc(fileUrl); return; }
    let objectUrl: string | null = null;
    const token = localStorage.getItem("docodile_token");
    fetch(fileUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.blob() : null)
      .then((blob) => { if (blob) { objectUrl = URL.createObjectURL(blob); setSrc(objectUrl); } })
      .catch(() => {});
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [fileUrl, isImage]);

  if (!src) return null;
  return <img src={src} alt="" style={style} />;
}

type PrescriptionPageProps = {
  onNavigate?: (tab: import("../../components/SideNav").NavTab) => void;
  // Bumped by HomePage after a walk-in is created so the queue refetches
  // and the new "At Doc" card appears without a manual reload.
  queueRefreshKey?: number;
};

export function PrescriptionPage({ onNavigate, queueRefreshKey }: PrescriptionPageProps = {}) {
  // Drain any pending nav synchronously during the very first render so
  // the form mounts with the right patient already selected — no brief
  // flash of the patient picker before the chart opens.
  const initialNavRef = React.useRef<PendingSessionNav | null | undefined>(undefined);
  if (initialNavRef.current === undefined) {
    initialNavRef.current = consumePendingSessionNav();
  }
  const initialNav = initialNavRef.current;

  // null → renders <PatientPicker>; otherwise renders the prescription form
  // scoped to that patient. Clicking "← back to patients" clears it.
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(initialNav?.patient ?? null);
  const selectedPatientId = selectedPatient?.id ?? null;
  // The appointment row the doctor clicked View Pad on. Needed so the
  // Start Session / End Session actions can update the appointment's
  // backend status without bouncing back to the queue.
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string | null>(initialNav?.appointmentId ?? null);
  // Status of the selected appointment — gates the auto-create so a visit is
  // only generated once the patient has been sent to the doctor (AT_DOC) or
  // is already in session (IN_PROGRESS). Opening the pad on a still-BOOKED
  // card shows past visits without spawning a new one.
  const [selectedAppointmentStatus, setSelectedAppointmentStatus] = React.useState<string | null>(null);
  // The date the queue was showing when the doctor clicked View Pad.
  // Used as the visit date for auto-create so past-date queues don't
  // create a visit stamped today.
  const [queueDate, setQueueDate] = React.useState<string>(todayIso());
  // Doctor who owns the queue entry the user just clicked View Pad on.
  // Threaded into the visit's createdByDoctorId so the Patient Files filter
  // (which scopes by treating doctor / department) can find this patient.
  const [appointmentDoctorId, setAppointmentDoctorId] = React.useState<string | null>(null);

  // Slot picker — when a patient is opened without a specific appointment
  // (e.g. from Patient Files) and has 2+ appointments today, ask which slot
  // this consultation is for before opening/creating its visit.
  const [slotOptions, setSlotOptions] = React.useState<
    { id: string; scheduledTime: string | null; doctorId: string | null; status?: string | null }[] | null
  >(null);
  const slotFetchedForRef = React.useRef<string | null>(null);
  // Patient id for which the today-appointments check has finished. The
  // auto-create effect waits on this so it never creates a visit before we
  // know whether the doctor needs to pick a slot.
  const [slotChecked, setSlotChecked] = React.useState<string | null>(null);

  // If the doctor clicked an entry in the header session-tray, route them
  // straight back to that patient's prescription form. Handled both on mount
  // (component wasn't rendered yet) and via a custom event (already mounted).
  // Where Back should route the doctor — set when the patient was
  // opened from another screen (Patient Files, the session tray, etc.).
  // Falls back to clearing selection so the prescription home picker
  // reappears, matching the original behavior.
  const [returnTab, setReturnTab] = React.useState<import("../../components/SideNav").NavTab | null>(
    initialNav?.returnTab ?? null,
  );
  React.useEffect(() => {
    // initialNav was already consumed at first render — we just listen
    // for subsequent navs fired while the page is already mounted (e.g.
    // the session tray in the top nav).
    const handler = (e: Event) => {
      const nav = (e as CustomEvent<PendingSessionNav>).detail;
      setSelectedPatient(nav.patient);
      setSelectedAppointmentId(nav.appointmentId);
      if (nav.returnTab) setReturnTab(nav.returnTab);
      if (typeof nav.initialAction === "number") setActiveAction(nav.initialAction);
    };
    window.addEventListener("docodile:session-nav", handler);
    return () => window.removeEventListener("docodile:session-nav", handler);
  }, []);
  // Visits for this patient. `useVisits(null)` returns []; switching to a
  // patient triggers the fetch.
  const { visits, loading: visitsLoading, loadedFor: visitsLoadedFor, refetch: refetchVisits } = useVisits(selectedPatientId);
  const [activeTab, setActiveTab] = React.useState(0);
  const [activeAction, setActiveAction] = React.useState(initialNav?.initialAction ?? 0);
  // Prescription output language (drives the printed/shared Rx language). UI
  // selector lives on the floating bar; wiring the actual translation is TBD.
  const [language, setLanguage] = React.useState("English");
  const activeVisit: VisitDTO | undefined = visits[activeTab];
  // Visit immediately before the currently-viewed tab — used by the rewind
  // buttons to pull the previous prescription's data into the current form.
  const prevVisit: VisitDTO | undefined = activeTab > 0 ? visits[activeTab - 1] : undefined;
  const [reviewDate, setReviewDate] = React.useState<Date | null>(null);
  const [showReviewDatePicker, setShowReviewDatePicker] = React.useState(false);
  // Tracks unsaved edits since the visit loaded / was last saved. Surfaces
  // the "Save changes" button on an already-completed visit only after the
  // doctor actually edits. Set on form input + rx mutations, cleared on save
  // and on visit change.
  const [dirty, setDirty] = React.useState<boolean>(false);
  const [rxRows, _setRxRows] = React.useState<RxRowDraft[]>([]);
  // Every USER rx mutation (add / delete row, picker change, etc.) flags
  // dirty. The visit-load populate and the async generic-name enrichment use
  // the raw `_setRxRows` so loading a visit never looks like an edit.
  const setRxRows = React.useCallback((value: React.SetStateAction<RxRowDraft[]>) => {
    _setRxRows(value);
    setDirty(true);
  }, []);
  const [rxInteractions, setRxInteractions] = React.useState<Array<{ drug: string; interactsWith: string; comment: string }>>([]);

  // Per-medicine autofill: index this patient's PAST prescriptions by medicine
  // name (most recent wins), excluding the visit being edited. Visits arrive
  // sorted ascending by date, so later iterations overwrite earlier ones.
  const lastRxByMedicine = React.useMemo(() => {
    const map = new Map<string, RxRowDTO>();
    for (const v of visits) {
      if (activeVisit && v.id === activeVisit.id) continue;
      for (const rx of v.prescriptions ?? []) {
        const key = (rx.medicine ?? "").trim().toLowerCase();
        if (key) map.set(key, rx);
      }
    }
    return map;
  }, [visits, activeVisit]);

  // When the doctor enters a medicine they've prescribed to this patient
  // before, pre-fill that row from the last such prescription. Only fills
  // empty fields, so it never clobbers what the doctor has already typed.
  // Per-medicine clinic-wide cache for the autofill API — avoids re-fetching
  // the same medicine within a session. Cleared on save so the doctor's just-
  // saved edits become the new default the next time anyone prescribes it.
  const clinicWideRxCacheRef = React.useRef<Map<string, RxLatestDTO | null>>(new Map());
  const clinicWideRxFetchingRef = React.useRef<Set<string>>(new Set());

  const applyAutofillFromRx = (rowIndex: number, prior: {
    dosage?: string | null;
    whenToTake?: string | null;
    frequency?: string | null;
    frequencyInterval?: string | null;
    duration?: string | null;
    notes?: string | null;
  }) => {
    setRxRows((prev) => prev.map((r, ix) => ix !== rowIndex ? r : {
      ...r,
      dosage: r.dosage || (prior.dosage ?? ""),
      whenToTake: r.whenToTake || (prior.whenToTake ?? ""),
      frequency: r.frequency || (prior.frequency ?? ""),
      frequencyInterval: r.frequencyInterval || (prior.frequencyInterval ?? ""),
      duration: r.duration || (prior.duration ?? ""),
      notes: r.notes || (prior.notes ?? ""),
    }));
  };

  const autofillRxFromHistory = (rowIndex: number, medicineName: string) => {
    const key = medicineName.trim().toLowerCase();
    if (!key) return;
    // 1) Same-patient match first — instant from in-memory `visits`.
    const samePatient = lastRxByMedicine.get(key);
    if (samePatient) { applyAutofillFromRx(rowIndex, samePatient); return; }
    // 2) Clinic-wide latest — cached after the first lookup per medicine. The
    // backend returns whichever patient most recently had this medicine, so
    // the doctor's just-saved edits become the default for the next entry.
    const cache = clinicWideRxCacheRef.current;
    if (cache.has(key)) {
      const cached = cache.get(key);
      if (cached) applyAutofillFromRx(rowIndex, cached);
      return;
    }
    const inflight = clinicWideRxFetchingRef.current;
    if (inflight.has(key)) return;
    inflight.add(key);
    void fetchLatestRxForMedicine(medicineName.trim(), activeVisit?.id ?? null)
      .then((res) => { cache.set(key, res); if (res) applyAutofillFromRx(rowIndex, res); })
      .catch(() => { /* silently ignore — autofill is opportunistic */ })
      .finally(() => { inflight.delete(key); });
  };
  const [reviewDays, setReviewDays] = React.useState<string>("");
  // Vital values + units (units are clickable to toggle between alternates
  // like cm↔in, kg↔lb, °C↔°F, mmHg↔kPa).
  const [vitalState, setVitalState] =
    React.useState<Record<string, VitalCellState>>(() => buildVitalState(undefined));
  // History field values (Family History, Allergies, …). Controlled so the
  // <Autocomplete> dropdown can drive them. Reset on visit-tab change.
  const [historyValues, _setHistoryValues] =
    React.useState<Record<string, string>>(() =>
      Object.fromEntries(HISTORY_FIELDS.map((f) => [f.field, ""]))
    );
  // Diagnosis + Complaints + Tests are also suggestion-driven
  // (specialty-scoped via the same API).
  const [diagnosisValue, _setDiagnosisValue] = React.useState<string>("");
  const [complaintsValue, _setComplaintsValue] = React.useState<string>("");
  const [testsValue, _setTestsValue] = React.useState<string>("");
  // Chip/tag + suggestion fields are click-driven (× to remove a chip, pick a
  // suggestion) so they don't all bubble a form `onChange`. Wrap their setters
  // to flag dirty on any user change; the visit-load populate uses the raw
  // `_set*` versions so loading a visit is never treated as an edit.
  const setHistoryValues = React.useCallback((value: React.SetStateAction<Record<string, string>>) => {
    _setHistoryValues(value);
    setDirty(true);
  }, []);
  const setDiagnosisValue = React.useCallback((value: React.SetStateAction<string>) => {
    _setDiagnosisValue(value);
    setDirty(true);
  }, []);
  const setComplaintsValue = React.useCallback((value: React.SetStateAction<string>) => {
    _setComplaintsValue(value);
    setDirty(true);
  }, []);
  const setTestsValue = React.useCallback((value: React.SetStateAction<string>) => {
    _setTestsValue(value);
    setDirty(true);
  }, []);
  // Notes-for-Patient + Private Notes + Review-Notes are now controlled too
  // so we can serialize them on Save.
  const [notesForPatientValue, setNotesForPatientValue] = React.useState<string>("");
  const [privateNotesValue, setPrivateNotesValue] = React.useState<string>("");
  const [reviewNotesValue, setReviewNotesValue] = React.useState<string>("");
  const [saving, setSaving] = React.useState<boolean>(false);
  // Dedicated flag for the "+ New Visit" action ONLY. The shared `saving` flag
  // flips on every silent blur/debounce auto-save, which made the New Visit
  // button flicker between "New Visit"/"Creating…" (and enabled/disabled) while
  // the doctor typed. This tracks just the add-visit op so the button is stable.
  const [addingVisit, setAddingVisit] = React.useState<boolean>(false);
  // When completing an OLD, never-finished consultation, we don't complete it
  // on its stale date — we move its data to a fresh visit dated today and drop
  // the old one. This holds the original visit's date label while the
  // confirmation dialog is open (null = closed).
  const [moveToTodayDate, setMoveToTodayDate] = React.useState<string | null>(null);
  // Bumped to force the visit form to reload its saved data (used to discard
  // an edit when the move-to-today dialog is cancelled).
  const [revertNonce, setRevertNonce] = React.useState(0);
  // The visit id whose data the form currently holds. Updated (in state, so
  // it flips atomically with the form fields) every time the form populates
  // from a visit. handleSave refuses to write unless this matches the active
  // visit — so during a visit switch the previous visit's form data can never
  // be saved onto the newly-selected visit (the data-bleed-between-visits bug).
  const [loadedVisitId, setLoadedVisitId] = React.useState<string | null>(null);
  // Visits are loaded ASC by visit_date, so the latest one sits at the
  // tail of the array — that's "today's visit", the one whose SessionBar
  // Editability is purely a function of the visit's session lifecycle, not
  // the calendar date or tab order: a visit is editable as long as its
  // session hasn't been ended. Once the doctor ends the session the visit
  // is locked permanently (read-only history). This intentionally covers
  // past visits the doctor left open — they stay editable until ended.
  const isLatestVisit = visits.length === 0 || activeTab === visits.length - 1;
  // Editability runs on a 24h timer that STARTS when the View Pad is opened
  // (sessionStartedAt) — NOT the visit date, and NOT the end of the
  // consultation. While the session is open (un-ended) the pad stays editable
  // regardless of age so the doctor can finish it; once ended/completed it
  // stays editable for 24h FROM THE OPEN, then hard-locks. A visit that was
  // never opened (no session start) falls back to its visit date so today's
  // fresh visits are still editable.
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const visitMs = activeVisit?.visitDate ? new Date(activeVisit.visitDate).getTime() : null;
  const sessionStartMs = activeVisit?.sessionStartedAt ? new Date(activeVisit.sessionStartedAt).getTime() : null;
  // Whether THIS visit is finished. For an appointment-linked visit that's the
  // appointment's own status (read from the visit DTO, not the appointment the
  // chart was opened through). A visit with NO appointment (e.g. a manually
  // added "+ New Visit") has no status to flip, so we treat it as complete once
  // its session has been ended — that's what "Complete visit" stamps.
  const activeCompleted =
    (activeVisit?.appointmentStatus ?? "").toUpperCase() === "COMPLETED" ||
    (activeVisit != null && activeVisit.appointmentId == null && activeVisit.sessionEndedAt != null);
  // An OPEN consultation: the pad was opened (session started) but the visit
  // was never completed (no end) AND its appointment isn't already Completed.
  // It must stay editable no matter how old the visit is — otherwise once it
  // crosses the 24h mark it hard-locks with NO way to finish it, leaving the
  // appointment stuck IN_PROGRESS forever. The !activeCompleted guard stops a
  // finished visit whose end-time was never stamped (legacy/inconsistent data)
  // from masquerading as an open session.
  const hasOpenSession =
    activeVisit?.sessionStartedAt != null &&
    activeVisit?.sessionEndedAt == null &&
    !activeCompleted;
  const isWithinBuffer = (() => {
    // Open consultation (pad opened, not yet ended) — always editable so it can
    // be finished, regardless of age.
    if (hasOpenSession) return true;
    // Ended/completed → editable for 24h counted FROM when the pad was opened.
    if (sessionStartMs != null && !Number.isNaN(sessionStartMs)) {
      return Date.now() - sessionStartMs < ONE_DAY_MS;
    }
    // Never opened (no session start) → fall back to the visit date so a fresh
    // today visit is editable until its date passes 24h.
    return visitMs != null && !Number.isNaN(visitMs) && Date.now() - visitMs < ONE_DAY_MS;
  })();
  const isEditable = isWithinBuffer;

  // Edit flag used by every gate below. The form is editable whenever the
  // visit is within its edit window (today's / within 24h, or an open
  // in-progress session) — no longer gated behind starting a session.
  const canEditForm = isEditable;

  // An editable visit that is OLDER than 24h and still in progress (never
  // completed). Editing one of these shouldn't quietly amend a stale-dated
  // record — instead we prompt to relocate it to today (see the move-to-today
  // dialog). For such a visit to be editable at all it must be an open session
  // (a never-started old visit is already locked), so this is precisely the
  // "abandoned consultation the doctor is reopening days later" case.
  const visitOlderThan24h =
    visitMs != null && !Number.isNaN(visitMs) && Date.now() - visitMs > ONE_DAY_MS;
  const isOldPending = canEditForm && !activeCompleted && visitOlderThan24h;

  // On initial open of a patient, jump to the latest (today's) visit
  // tab. Without this the tabs default to index 0, which is the OLDEST
  // visit — confusing when the doctor expects to land on today.
  // Tracked per-patient so we don't keep snapping the user back to the
  // tail when they deliberately click an older tab.
  const initializedTabForRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (selectedPatientId === null) {
      initializedTabForRef.current = null;
      return;
    }
    if (
      visitsLoadedFor === selectedPatientId &&
      visits.length > 0 &&
      initializedTabForRef.current !== selectedPatientId
    ) {
      initializedTabForRef.current = selectedPatientId;
      setActiveTab(visits.length - 1);
    }
  }, [selectedPatientId, visitsLoadedFor, visits.length]);
  // Refer-To doctor — clinic-scoped picker. `referDoctorId` holds the
  // selected doctor's UUID; the visible label comes from the matching row
  // in the `doctors` list fetched via useDoctors().
  const [referDoctorId, setReferDoctorId] = React.useState<string | null>(null);
  const [referOpen, setReferOpen] = React.useState(false);
  const referWrapRef = React.useRef<HTMLDivElement>(null);
  const { data: doctors } = useDoctors();
  const referDoctorName = doctors.find((d) => d.id === referDoctorId)?.name ?? "";
  React.useEffect(() => {
    if (!referOpen) return;
    const handler = (e: MouseEvent) => {
      if (referWrapRef.current && !referWrapRef.current.contains(e.target as Node)) {
        setReferOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [referOpen]);

  // Next-Review date <-> days are linked. Picking a date computes the
  // whole-day delta from today; typing days computes today + days. Both
  // setters update both slots so the two stay in sync without useEffect
  // (avoiding loops).
  const daysFromToday = (d: Date): number => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
  };
  const dateAfterDays = (days: number): Date => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    t.setDate(t.getDate() + days);
    return t;
  };
  const pickReviewDate = (d: Date) => {
    setReviewDate(d);
    setReviewDays(String(Math.max(0, daysFromToday(d))));
    setShowReviewDatePicker(false);
    setDirty(true);
  };
  const changeReviewDays = (raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    setReviewDays(cleaned);
    setReviewDate(cleaned === "" ? null : dateAfterDays(parseInt(cleaned, 10)));
  };

  // Sync controlled state to the selected visit's seed when the tab changes.
  // Uncontrolled inputs are remounted via the `key` on the visits wrapper
  // below so they pick up new defaultValues automatically.
  React.useEffect(() => {
    // Mark that the form now holds THIS visit's data (set in the same state
    // batch as the fields below, so handleSave's guard sees them in sync).
    setLoadedVisitId(activeVisit?.id ?? null);
    setReviewDate(activeVisit?.reviewDate ? new Date(activeVisit.reviewDate) : null);
    setReviewDays(activeVisit?.reviewDays != null ? String(activeVisit.reviewDays) : "");
    setReviewNotesValue(activeVisit?.reviewNotes ?? "");

    // Build the new rows first so we can also resolve genericNames against
    // the same list — if we called setRxRows and then read rxRows in a
    // separate effect the second effect would still see the old state.
    const newRows = withTrailingRx(
      activeVisit?.prescriptions && activeVisit.prescriptions.length > 0
        ? activeVisit.prescriptions.map(fromRxDTO)
        : [],
    );
    _setRxRows(newRows); // load — not a user edit, don't flag dirty

    // Resolve genericName for every row that has a medicine but no cached
    // generic name (all rows on first load since fromRxDTO sets it to "").
    const toResolve = newRows
      .map((r, i) => ({ row: r, i }))
      .filter(({ row }) => row.medicine.trim());
    if (toResolve.length > 0) {
      const token = localStorage.getItem("docodile_token") ?? "";
      toResolve.forEach(({ row, i }) => {
        fetch(`${API_BASE_URL}/api/medicines/search?q=${encodeURIComponent(row.medicine)}&limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.ok ? r.json() : [])
          .then((data: Array<{ genericName?: string; generic_name?: string }>) => {
            const gn = data[0]?.genericName ?? data[0]?.generic_name ?? "Unknown";
            // Background enrichment, not a user edit — raw setter, no dirty.
            _setRxRows((prev) => prev.map((r, ix) => ix === i ? { ...r, genericName: gn } : r));
          })
          .catch(() => {});
      });
    }

    setShowReviewDatePicker(false);
    setVitalState(buildVitalState(activeVisit));
    // Load — raw setters so populating the form is not treated as an edit.
    _setHistoryValues({
      family_history: activeVisit?.familyHistory ?? "",
      allergies: activeVisit?.allergies ?? "",
      personal_history: activeVisit?.personalHistory ?? "",
      past_medical_history: activeVisit?.pastMedicalHistory ?? "",
    });
    _setDiagnosisValue(activeVisit?.diagnosis ?? "");
    _setComplaintsValue(activeVisit?.complaints ?? "");
    _setTestsValue(activeVisit?.tests ?? "");
    setNotesForPatientValue(activeVisit?.notesForPatient ?? "");
    setPrivateNotesValue(activeVisit?.privateNotes ?? "");
    setReferDoctorId(activeVisit?.referDoctorId ?? null);
    setReferOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeVisit?.id, revertNonce]);

  // Debounced auto-save whenever rxRows changes while a session is active.
  // Pickers (WhenPicker, FrequencyPicker) are div/button elements — they
  // never fire a blur that bubbles to the form wrapper, so relying solely
  // on handleFormBlur would silently drop every picker selection.
  // The ref holds the latest save function so the closure is never stale.
  const latestSaveRef = React.useRef<() => void>(() => {});
  latestSaveRef.current = () => {
    // Suppressed while the move-to-today dialog is open so a debounced Rx edit
    // can't slip onto the stale-dated visit before the doctor decides.
    if (canEditForm && activeVisit && moveToTodayDate == null) void handleSave({ silent: true });
  };
  React.useEffect(() => {
    if (!canEditForm) return;
    const timer = setTimeout(() => latestSaveRef.current(), 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rxRows]);

  // Check drug interactions whenever the Rx medicine list changes.
  // Sends saved medicine names to the backend which resolves generics itself —
  // so warnings persist after page reload without needing to re-select.
  React.useEffect(() => {
    const medicines = rxRows.map((r) => r.medicine).filter(Boolean);
    if (medicines.length < 2) { setRxInteractions([]); return; }
    const timer = setTimeout(() => {
      const token = localStorage.getItem("docodile_token") ?? "";
      fetch(`${API_BASE_URL}/api/medicines/interactions?medicines=${encodeURIComponent(medicines.join(","))}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.ok ? r.json() : [])
        .then(setRxInteractions)
        .catch(() => setRxInteractions([]));
    }, 600);
    return () => clearTimeout(timer);
  }, [rxRows]);

  // Each appointment owns its own visit. Opening a pad from an appointment
  // jumps to (or creates) the visit tagged with that appointment id — so a
  // patient's two same-day appointments get two distinct visits, each with
  // its own session, rather than reusing one stale today-visit.
  //
  // The ref-guard keeps React StrictMode (double-invokes effects in dev),
  // and the async create→refetch window, from creating a duplicate.
  const autoCreatedForApptRef = React.useRef<string | null>(null);
  // One-shot "jump to this appointment's visit" — after the first open we
  // stop forcing the tab so the doctor can browse previous visits freely.
  const apptJumpedRef = React.useRef<string | null>(null);
  // One-shot "jump to the unfinished session" for ambient (no-appointment)
  // opens, so the doctor resumes where they left off without it overriding
  // their tab choice afterwards.
  const unfinishedJumpedForPatientRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!selectedPatientId || visitsLoading || visitsLoadedFor !== selectedPatientId) return;
    // Wait until we've checked today's appointments, and don't create
    // anything while the slot-picker popup is open — the doctor's choice
    // decides which appointment's visit to create/open.
    if (slotChecked !== selectedPatientId || slotOptions) return;

    // ── Appointment context: one visit per appointment ──────────────────
    if (selectedAppointmentId) {
      const apptIdx = visits.findIndex((v) => v.appointmentId === selectedAppointmentId);
      if (apptIdx >= 0) {
        // This appointment already has its visit — open it ONCE. After that
        // the doctor controls the tab, so they can browse earlier visits.
        if (apptJumpedRef.current !== selectedAppointmentId) {
          if (activeTab !== apptIdx) setActiveTab(apptIdx);
          const v = visits[apptIdx];
          if (v.visitDate && queueDate !== v.visitDate) setQueueDate(v.visitDate);
          apptJumpedRef.current = selectedAppointmentId;
        }
        autoCreatedForApptRef.current = selectedAppointmentId;
        return;
      }
      // No visit for this appointment yet — create one tagged with it.
      // After refetch this effect re-runs and the branch above selects it.
      // Gate: only when the receptionist has marked the patient as sent to
      // the doctor (AT_DOC) or they're already in session (IN_PROGRESS).
      // On a still-BOOKED card the pad opens but no visit is auto-spawned.
      const apptStatus = (selectedAppointmentStatus ?? "").toUpperCase();
      if (apptStatus !== "AT_DOC" && apptStatus !== "IN_PROGRESS") {
        return;
      }
      if (autoCreatedForApptRef.current !== selectedAppointmentId) {
        autoCreatedForApptRef.current = selectedAppointmentId;
        // Carry the patient's most recent past visit forward (visits are
        // sorted oldest→newest, so the last one is the latest). Review
        // patients open pre-filled with their history / diagnosis / Rx /
        // notes — vitals, complaint and review date start fresh.
        const lastVisit = visits.length > 0 ? visits[visits.length - 1] : undefined;
        const draft = copyForwardDraft(lastVisit, {
          visitDate: queueDate,
          createdByDoctorId: appointmentDoctorId,
          appointmentId: selectedAppointmentId,
        });
        void createVisit(selectedPatientId, draft)
          .then(() => refetchVisits())
          .catch((err: Error) => showToast(err.message || "Failed to create visit"));
      }
      return;
    }

    // ── Ambient (no appointment): resume an unfinished session once ─────
    const unfinishedIdx = visits.findIndex((v) => v.sessionStartedAt && !v.sessionEndedAt);
    if (unfinishedIdx >= 0 && unfinishedJumpedForPatientRef.current !== selectedPatientId) {
      const v = visits[unfinishedIdx];
      if (activeTab !== unfinishedIdx) setActiveTab(unfinishedIdx);
      if (v.visitDate && queueDate !== v.visitDate) setQueueDate(v.visitDate);
      unfinishedJumpedForPatientRef.current = selectedPatientId;
    }
  }, [selectedPatientId, selectedAppointmentId, selectedAppointmentStatus, visitsLoading, visitsLoadedFor, visits, refetchVisits, queueDate, activeTab, appointmentDoctorId, slotChecked, slotOptions]);
  // Reset the one-shot guards when the user leaves the patient.
  React.useEffect(() => {
    if (selectedPatientId === null) {
      autoCreatedForApptRef.current = null;
      apptJumpedRef.current = null;
      unfinishedJumpedForPatientRef.current = null;
      slotFetchedForRef.current = null;
      setSlotOptions(null);
      setSlotChecked(null);
      setSelectedAppointmentStatus(null);
    }
  }, [selectedPatientId]);

  // On every pad open, look up the patient's appointments for today. With
  // 2+, ask which slot this consultation is for (popup below) — a visit is
  // only created once the doctor picks. With exactly 1, adopt it silently.
  // With 0, leave the ambient flow (existing visits / "No visits yet").
  // Runs even when the queue pre-selected an appointment, so clicking
  // either same-day card still asks which slot.
  React.useEffect(() => {
    if (!selectedPatientId || visitsLoadedFor !== selectedPatientId) return;
    if (slotFetchedForRef.current === selectedPatientId) return;
    slotFetchedForRef.current = selectedPatientId;
    const today = todayIso();
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem("docodile_token");
        const res = await fetch(`${API_BASE_URL}/api/tenant/appointments?date=${today}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok || cancelled) return;
        const all: Array<{ id: string; patientId: string; scheduledTime: string | null; doctorId: string | null; status?: string | null }> =
          await res.json();
        const mine = all.filter((a) => a.patientId === selectedPatientId);
        if (cancelled) return;
        if (mine.length >= 2) {
          setSlotOptions(mine);
        } else if (mine.length === 1) {
          setSelectedAppointmentId(mine[0].id);
          setSelectedAppointmentStatus(mine[0].status ?? null);
          if (mine[0].doctorId) setAppointmentDoctorId(mine[0].doctorId);
        }
        // When the appointment was pre-selected (queue's View Pad), pick up
        // its status from the same fetch so the auto-create gate works.
        if (selectedAppointmentId) {
          const match = all.find((a) => a.id === selectedAppointmentId);
          if (match) setSelectedAppointmentStatus(match.status ?? null);
        }
      } catch {
        /* ignore — fall back to the ambient flow */
      } finally {
        if (!cancelled) setSlotChecked(selectedPatientId);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedPatientId, visitsLoadedFor]);

  // Adopt the slot the doctor picked → the per-appointment auto-create
  // effect then opens (or creates) that appointment's visit.
  const chooseSlot = (a: { id: string; doctorId: string | null; status?: string | null }) => {
    setSelectedAppointmentId(a.id);
    setSelectedAppointmentStatus(a.status ?? null);
    if (a.doctorId) setAppointmentDoctorId(a.doctorId);
    setQueueDate(todayIso());
    setSlotOptions(null);
  };

  // When the view swaps from picker → form (or back), reset the scroll
  // position to the absolute top. The PrescriptionPage renders inside
  // HomePage's scrollable container (not the window), so we walk up the
  // DOM from the page root to find the nearest scrollable ancestor and
  // pin its scrollTop to 0. Falls back to window.scrollTo if nothing
  // scrollable is found.
  const pageRootRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const start = pageRootRef.current;
    if (!start) return;
    let node: HTMLElement | null = start;
    while (node) {
      const overflow = window.getComputedStyle(node).overflowY;
      if (overflow === "auto" || overflow === "scroll") {
        node.scrollTop = 0;
        return;
      }
      node = node.parentElement;
    }
    window.scrollTo(0, 0);
  }, [selectedPatientId]);

  // Toast for validation feedback — fired only when the user presses Enter
  // on an invalid input (or clicks a submit button — not yet wired). Blur
  // alone does not show a toast; the in-cell red message is the silent cue.
  const [toast, setToast] = React.useState<{ visible: boolean; message: string }>(
    { visible: false, message: "" },
  );
  const showToast = (message: string) => setToast({ visible: true, message });
  const closeToast = () => setToast({ visible: false, message: "" });

  const setVitalValue = (key: string, value: string) => {
    setVitalState((prev) => ({ ...prev, [key]: { ...prev[key], value } }));
    setDirty(true);
  };
  const validateVitalOnEnter = (
    e: React.KeyboardEvent<HTMLInputElement>,
    label: string,
    value: string,
    unit: string,
    isBp = false,
  ) => {
    if (e.key !== "Enter") return;
    if (isBp) {
      const [sys = "", dia = ""] = value.split("/");
      const sysOk = isVitalValid("BP_sys", sys, unit);
      const diaOk = isVitalValid("BP_dia", dia, unit);
      if (!sysOk || !diaOk) showToast(`Please enter a valid blood pressure (${unit})`);
    } else {
      if (!isVitalValid(label, value, unit)) {
        showToast(`Please enter a valid ${label.toLowerCase()} (${unit})`);
      }
    }
  };
  const toggleVitalUnit = (key: string) => {
    setVitalState((prev) => {
      const cell = prev[key];
      const toggle = UNIT_TOGGLES[cell.unit];
      if (!toggle) return prev;
      return { ...prev, [key]: { value: toggle.convert(cell.value), unit: toggle.altUnit } };
    });
    setDirty(true);
  };

  // List-view tab state — shared across Reports / Files. Defaults to the
  // first tab ("All Reports" / "All Files").
  const [activeListTab, setActiveListTab] = React.useState<number>(0);
  // Toggle between the table layout (default) and the card grid layout
  // (Figma node 2143:11610). Driven by the list/widget icons in the tabs row.
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");
  // Per-section prescription templates (clinic-shared, backend-stored).
  // Each card / footer has its own kind; saving from a kind only surfaces in
  // that kind's Load list. The same modal serves both modes (load vs save),
  // driven by `templatesKind` for which section it's scoped to.
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [templatesMode, setTemplatesMode] = React.useState<"load" | "save">("load");
  const [templatesKind, setTemplatesKind] = React.useState<TemplateKind>("rx");
  const [templateName, setTemplateName] = React.useState("");
  const [savedTemplates, setSavedTemplates] = React.useState<SavedTemplate[]>([]);
  const [templatesBusy, setTemplatesBusy] = React.useState(false);

  // What goes into `content` for each kind — only the relevant section's data,
  // so a "Complaints" template stays a complaints blob and a load is scoped.
  const buildTemplateContent = (kind: TemplateKind): string => {
    switch (kind) {
      case "complaints": return JSON.stringify({ complaints: complaintsValue });
      case "diagnosis": return JSON.stringify({ diagnosis: diagnosisValue });
      case "tests": return JSON.stringify({ tests: testsValue });
      case "notes_for_patient": return JSON.stringify({ notesForPatient: notesForPatientValue });
      case "private_notes": return JSON.stringify({ privateNotes: privateNotesValue });
      case "rx": return JSON.stringify({ rxRows });
    }
  };

  // Apply a loaded template's content to ONLY the kind's section, leaving
  // every other field alone. Malformed JSON falls back to blanks.
  const applyTemplateContent = (kind: TemplateKind, content: string) => {
    let c: Record<string, unknown> = {};
    try { c = JSON.parse(content) as Record<string, unknown>; } catch { /* keep blanks */ }
    switch (kind) {
      case "complaints": setComplaintsValue(typeof c.complaints === "string" ? c.complaints : ""); break;
      case "diagnosis": setDiagnosisValue(typeof c.diagnosis === "string" ? c.diagnosis : ""); break;
      case "tests": setTestsValue(typeof c.tests === "string" ? c.tests : ""); break;
      case "notes_for_patient": setNotesForPatientValue(typeof c.notesForPatient === "string" ? c.notesForPatient : ""); break;
      case "private_notes": setPrivateNotesValue(typeof c.privateNotes === "string" ? c.privateNotes : ""); break;
      case "rx": {
        const rows = Array.isArray(c.rxRows) ? (c.rxRows as RxRowDraft[]) : [];
        // Reset ids/positions so loaded rows save as fresh Rx rows on this visit.
        setRxRows(withTrailingRx(rows.map((r, i) => ({ ...r, id: null, position: i + 1, thenRows: r.thenRows ?? [] }))));
        break;
      }
    }
  };

  const refreshTemplates = (kind: TemplateKind) =>
    listRxTemplates(kind)
      .then((rows) => setSavedTemplates(rows.map((r) => ({ name: r.name, content: r.content }))))
      .catch((e: Error) => showToast(e.message || "Couldn't load templates"));

  const openTemplates = (mode: "load" | "save", kind: TemplateKind) => {
    setTemplatesMode(mode);
    setTemplatesKind(kind);
    setTemplateName("");
    setShowTemplates(true);
    void refreshTemplates(kind);
  };

  const handleSaveTemplate = () => {
    const name = templateName.trim();
    if (!name) { showToast("Enter a template name"); return; }
    const kind = templatesKind;
    const content = buildTemplateContent(kind);
    setTemplatesBusy(true);
    saveRxTemplate(name, content, kind)
      .then(() => { setTemplateName(""); setShowTemplates(false); showToast(`Saved template "${name}"`); return refreshTemplates(kind); })
      .catch((e: Error) => showToast(e.message || "Couldn't save template"))
      .finally(() => setTemplatesBusy(false));
  };

  const handleLoadTemplate = (t: SavedTemplate) => {
    applyTemplateContent(templatesKind, t.content);
    setShowTemplates(false);
    showToast(`Loaded "${t.name}"`);
  };

  const handleDeleteTemplate = (name: string) => {
    const kind = templatesKind;
    setTemplatesBusy(true);
    deleteRxTemplate(name, kind)
      .then(() => refreshTemplates(kind))
      .catch((e: Error) => showToast(e.message || "Couldn't delete template"))
      .finally(() => setTemplatesBusy(false));
  };

  // Clear all — wipes every field on the current prescription back to blank.
  // Relocated out of the old "tuning" dropdown into the section action bar
  // (it acts on the active prescription, same scope as Print / Download /
  // Share). Constructive "+ New Visit" deliberately lives elsewhere (the visit
  // tab strip) so a mis-click can never swap create-a-visit for wipe-the-form.
  const handleClearAll = () => {
    setVitalState(buildVitalState(undefined));
    setReviewDate(null);
    setReviewDays("");
    setReviewNotesValue("");
    setRxRows([blankRxRow(1)]);
    setHistoryValues({
      family_history: "", allergies: "", personal_history: "", past_medical_history: "",
    });
    setDiagnosisValue("");
    setComplaintsValue("");
    setTestsValue("");
    setNotesForPatientValue("");
    setPrivateNotesValue("");
  };

  // Download every file in the patient's Files tab (best-effort: triggers a
  // browser download per file that has a URL).
  const handleDownloadAllFiles = () => {
    const downloadable = serverFiles.filter((f) => f.fileUrl);
    if (!downloadable.length) {
      showToast("No files to download");
      return;
    }
    downloadable.forEach((f) => {
      const a = document.createElement("a");
      a.href = f.fileUrl as string;
      a.download = f.name || "";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
    showToast(`Downloading ${downloadable.length} file${downloadable.length === 1 ? "" : "s"}…`);
  };

  // Contact / patient actions — collapsed into the header "⋯" kebab so the
  // sticky header carries the stable patient-level actions (call / email /
  // video / edit) without crowding the section nav beside it.
  const contactMenuItems = [
    ...(selectedPatient?.phone
      ? [{ icon: <Icon name="phone" tone="inherit" style={styles.kebabItemIcon} />, label: `${selectedPatient.phone}`, onClick: () => { window.location.href = `tel:${selectedPatient.phone}`; } }]
      : []),
    { icon: <Icon name="mail" tone="inherit" style={styles.kebabItemIcon} />, label: "Email patient", onClick: () => {} },
    { icon: <Icon name="videocamera" tone="inherit" style={styles.kebabItemIcon} />, label: "Video call", onClick: () => {} },
    { icon: <Icon name="pen" tone="inherit" style={styles.kebabItemIcon} />, label: "Edit patient info", onClick: () => setShowEditPatient(true) },
  ];

  // ── Header + right-area content driven by which left-rail action is active.
  // - activeAction 0 (Visits): default visits layout
  // - LIST_VIEWS entry (Reports / Files): table or grid list view
  // - Timeline / Bills: "coming soon" placeholder
  const listViewConfig = LIST_VIEWS[activeAction] ?? null;

  type ListRow = {
    id?: string;
    fileId?: string;      // backend UUID — present for server-persisted files
    name: string;
    category: string;
    date: string;
    fileUrl?: string | null;
    mimeType?: string | null;
  };

  // Server-persisted files for action 1 (Files tab). Populated on patient
  // select and extended optimistically when the user uploads new files.
  const [serverFiles, setServerFiles] = React.useState<ListRow[]>([]);

  React.useEffect(() => {
    if (!selectedPatientId) { setServerFiles([]); return; }
    const token = localStorage.getItem("docodile_token");
    fetch(`${API_BASE_URL}/api/patients/${selectedPatientId}/files`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((dtos: Array<{ id: string; name: string; category: string | null; investigationDate: string | null; mimeType: string | null; createdAt: string }>) => {
        setServerFiles(dtos.map((d) => ({
          id: d.id,
          fileId: d.id,
          name: d.name,
          category: d.category ?? "Other",
          date: d.investigationDate
            ? new Date(d.investigationDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
            : new Date(d.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }),
          fileUrl: null,
          mimeType: d.mimeType ?? null,
        })));
      })
      .catch(() => setServerFiles([]));
  }, [selectedPatientId]);

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditPatient, setShowEditPatient] = React.useState(false);
  // AI Summary popover (opened from the ✨ button in the slim icon rail).
  const [showAiSummary, setShowAiSummary] = React.useState(false);
  // AI patient summary — fetched (cached, free) on patient change and shown in
  // the ✨ card + popover; the popover's Generate button calls the paid POST.
  const [aiSummary, setAiSummary] = React.useState<PatientSummary | null>(null);
  const [aiStale, setAiStale] = React.useState(false);       // backend says new visits invalidated the cache
  const [aiConfigured, setAiConfigured] = React.useState<boolean | null>(null);
  const [aiGenerating, setAiGenerating] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);

  // Load the CACHED summary whenever the patient changes (never calls OpenAI).
  React.useEffect(() => {
    if (!selectedPatientId) { setAiSummary(null); setAiStale(false); setAiError(null); return; }
    let cancelled = false;
    setAiError(null);
    (async () => {
      try {
        const health = await getAIHealth();
        if (cancelled) return;
        setAiConfigured(health.configured);
        if (!health.configured) { setAiSummary(null); return; }
        const resp = await fetchPatientSummary(selectedPatientId);
        if (cancelled) return;
        setAiStale(!resp.generated);
        setAiSummary(resp.content ? parsePatientSummary(resp.content) : null);
      } catch (e) {
        if (!cancelled) setAiError((e as Error).message || "Couldn't load summary");
      }
    })();
    return () => { cancelled = true; };
  }, [selectedPatientId]);

  // Explicit (paid) generation — wired to the popover's Generate/Regenerate.
  const handleGenerateSummary = async () => {
    if (!selectedPatientId || aiGenerating) return;
    setAiGenerating(true);
    setAiError(null);
    try {
      const resp = await generatePatientSummary(selectedPatientId);
      setAiStale(!resp.generated);
      setAiSummary(resp.content ? parsePatientSummary(resp.content) : null);
    } catch (e) {
      setAiError((e as Error).message || "Couldn't generate summary");
    } finally {
      setAiGenerating(false);
    }
  };
  // The currently-open file row. null = list view.
  const [viewerOpen, setViewerOpen] = React.useState<ListRow | null>(null);
  const handleAddRows = (rows: AddReportRow[]) => {
    // Always show every row immediately. fileId present = persisted on server.
    // fileId absent = backend upload failed; still visible via local blob URL.
    setServerFiles((prev) => [
      ...rows.map((r) => ({
        id: r.id,
        fileId: r.fileId,
        name: r.name,
        category: r.category,
        date: r.date,
        fileUrl: r.fileUrl,
        mimeType: r.mimeType,
      })),
      ...prev,
    ]);
  };
  const removeRxRow = (rowIdx: number) =>
    setRxRows((prev) => withTrailingRx(prev.filter((_, ri) => ri !== rowIdx)));
  const addThenRow = (rowIdx: number) =>
    setRxRows((prev) => prev.map((r, ri) => ri !== rowIdx ? r : { ...r, thenRows: [...r.thenRows, blankThenRow()] }));
  const removeThenRow = (rowIdx: number, thenIdx: number) =>
    setRxRows((prev) => prev.map((r, ri) => ri !== rowIdx ? r : { ...r, thenRows: r.thenRows.filter((_, ti) => ti !== thenIdx) }));
  const updateThenField = (rowIdx: number, thenIdx: number, key: keyof ThenRow, value: string) =>
    setRxRows((prev) => prev.map((r, ri) => ri !== rowIdx ? r : { ...r, thenRows: r.thenRows.map((t, ti) => ti !== thenIdx ? t : { ...t, [key]: value }) }));

  // Display rows for the Files tab (action 1) come from serverFiles (backend).
  // Other list-view actions use their config's static rows array.
  const allRows: ListRow[] = listViewConfig
    ? (activeAction === 1 ? serverFiles : listViewConfig.rows)
    : [];
  const activeChipLabel = listViewConfig?.tabs[activeListTab] ?? "All";
  const displayRows: ListRow[] = activeChipLabel === "All"
    ? allRows
    : allRows.filter((r) => r.category === activeChipLabel);

  // Action-list badge counts pulled from the same data sources the right
  // pane reads from. Timeline + Bills have no data layer yet so they show 0
  // until those features are built.
  const countFor = (actionIndex: number): number => {
    if (actionIndex === 1) return serverFiles.length;
    const config = LIST_VIEWS[actionIndex];
    if (config) return config.rows.length;
    if (actionIndex === 0) return visits.length; // Visits
    return 0; // Timeline (2), Bills (3) — placeholders, post-merge indexes.
  };
  // Action indices after the Reports/Files merge:
  //   0 = Visits   1 = Files   2 = Timeline   3 = Bills
  // Header label per section. Timeline (2) is implemented (a visit feed);
  // only Bills (3) is still a "coming soon" placeholder.
  const sectionLabel = activeAction === 2 ? "Timeline" : activeAction === 3 ? "Bills" : null;
  const comingSoonLabel = activeAction === 3 ? "Bills" : null;
  const headerTitle =
    listViewConfig?.title ?? sectionLabel ?? "Visits";
  // Subtitle: row count for list views (backend data + client uploads),
  // visit count for the Timeline feed, the placeholder for Bills, and a static
  // line for the default Visits view.
  const fileCount = activeAction === 1 ? serverFiles.length : (listViewConfig?.rows.length ?? 0);
  const headerSubtitle = listViewConfig
    ? `${fileCount} ${listViewConfig.title.toLowerCase()} on file`
    : activeAction === 2
      ? `${visits.length} ${visits.length === 1 ? "visit" : "visits"}`
      : comingSoonLabel
        ? "Coming soon"
        : "Patient visit history and prescription";

  // Each collapsible section starts expanded; clicking the header chevron toggles.
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    vitals: true,
    history: true,
    rx: true,
  });
  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const formatReviewDate = (d: Date): string =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  // Build a SaveVisitRequest from the current form state. Vitals are
  // re-split for BP (sys/dia from the combined "sys/dia" cell value) and
  // mapped from VITAL_FIELD_MAP for the rest.
  const buildSaveRequest = (): SaveVisitRequest => {
    const cellByLabel = (label: string): VitalCellState | undefined => {
      for (let ci = 0; ci < VITAL_COLUMNS.length; ci++) {
        for (let ri = 0; ri < VITAL_COLUMNS[ci].length; ri++) {
          if (VITAL_COLUMNS[ci][ri].label === label) {
            return vitalState[`${ci}-${ri}`];
          }
        }
      }
      return undefined;
    };
    const bp = cellByLabel("BP");
    const [bpSys = "", bpDia = ""] = (bp?.value ?? "").split("/");
    const fmtDate = (d: Date | null): string | null => {
      if (!d) return null;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    const pickValue = (label: string): string | null => cellByLabel(label)?.value || null;
    const pickUnit = (label: string): string | null => cellByLabel(label)?.unit || null;

    return {
      visitDate: activeVisit?.visitDate ?? todayIso(),
      bpSystolic: bpSys || null,
      bpDiastolic: bpDia || null,
      bpUnit: bp?.unit || null,
      bmi: pickValue("BMI"), bmiUnit: pickUnit("BMI"),
      height: pickValue("Height"), heightUnit: pickUnit("Height"),
      weight: pickValue("Weight"), weightUnit: pickUnit("Weight"),
      temperature: pickValue("Temperature"), temperatureUnit: pickUnit("Temperature"),
      pulse: pickValue("Pulse"), pulseUnit: pickUnit("Pulse"),
      waist: pickValue("Waist"), waistUnit: pickUnit("Waist"),
      hip: pickValue("Hip"), hipUnit: pickUnit("Hip"),
      spo2: pickValue("SPO2"), spo2Unit: pickUnit("SPO2"),
      familyHistory: historyValues.family_history || null,
      allergies: historyValues.allergies || null,
      personalHistory: historyValues.personal_history || null,
      pastMedicalHistory: historyValues.past_medical_history || null,
      complaints: complaintsValue || null,
      diagnosis: diagnosisValue || null,
      notesForPatient: notesForPatientValue || null,
      privateNotes: privateNotesValue || null,
      tests: testsValue || null,
      referDoctorId: referDoctorId,
      reviewDate: fmtDate(reviewDate),
      reviewDays: reviewDays.trim() === "" ? null : parseInt(reviewDays, 10),
      reviewNotes: reviewNotesValue || null,
      // Pass the SessionBar timing fields through unchanged when saving
      // so an in-progress timer survives auto-save round-trips. The
      // bar-driven handlers below also overwrite these explicitly on
      // Start / End.
      sessionStartedAt: activeVisit?.sessionStartedAt ?? null,
      sessionEndedAt: activeVisit?.sessionEndedAt ?? null,
      sessionDurationSec: activeVisit?.sessionDurationSec ?? null,
      prescriptions: rxRows
        .filter((r) =>
          r.medicine || r.medicineNote || r.dosage || r.whenToTake ||
          r.frequency || r.frequencyInterval || r.duration || r.notes
        )
        .map((r, i) => ({
          id: r.id,
          position: i + 1,
          medicine: r.medicine || null,
          medicineNote: r.medicineNote || null,
          dosage: r.dosage || null,
          whenToTake: r.whenToTake || null,
          frequency: r.frequency || null,
          frequencyInterval: r.frequencyInterval || null,
          duration: r.duration || null,
          notes: r.notes || null,
        })),
    };
  };

  // Vitals that fall outside their valid clinical range (mirrors the per-field
  // validation rendered in the vitals grid). We never persist or complete a
  // visit with clinically-impossible measurements — saving/completing is
  // blocked and the offending fields are highlighted with a toast.
  const invalidVitalLabels = VITAL_CELLS.filter(({ cell: v, cellKey }) => {
    const cell = vitalState[cellKey];
    if (v.label === "BP") {
      const [sys = "", dia = ""] = cell.value.split("/");
      return !(isVitalValid("BP_sys", sys, cell.unit) && isVitalValid("BP_dia", dia, cell.unit));
    }
    return !isVitalValid(v.label, cell.value, cell.unit);
  }).map(({ cell: v }) => v.label);
  const hasInvalidVitals = invalidVitalLabels.length > 0;

  const handleSave = async (opts?: { silent?: boolean }) => {
    if (!activeVisit || !selectedPatientId) return;
    // Never write the form to a visit it wasn't loaded from. During a visit
    // switch the active visit changes one render before the form repopulates;
    // saving in that gap would copy the old visit's data onto the new one (and
    // blank the old). Skip until the form has caught up to the active visit.
    if (loadedVisitId !== activeVisit.id) return;
    // Block saving invalid vitals. The fields are already highlighted inline;
    // an explicit Save click also gets a toast (auto-saves stay silent).
    if (hasInvalidVitals) {
      if (!opts?.silent) showToast("Enter valid vitals before saving");
      return;
    }
    setSaving(true);
    try {
      await updateVisit(activeVisit.id, buildSaveRequest());
      await refetchVisits();
      setDirty(false);
      // The doctor's just-saved schedule is now the clinic's latest for any
      // medicines in this visit — clear the autofill cache so the next entry
      // re-fetches and reflects those edits.
      clinicWideRxCacheRef.current.clear();
      // Auto-saves stay silent; only explicit actions toast.
      if (!opts?.silent) showToast("Visit saved");
    } catch (e) {
      // Auto-saves stay quiet on success but should still surface
      // failures so the doctor knows their work isn't being persisted.
      showToast(`Save failed: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save trigger: whenever a field within the form loses focus
  // (i.e. the doctor moves to the next field, clicks elsewhere, or
  // tabs out of the form). The form is wrapped in a div with this
  // handler attached — onBlur on a container bubbles every descendant
  // blur, so one handler covers every input / textarea / dropdown.
  // No interval, no debounce: each save corresponds to a deliberate
  // hand-off between fields.
  // Not memoised — useCallback with [formActive, activeVisit?.id] would
  // capture a stale handleSave whose buildSaveRequest closes over the rxRows
  // from when the session started, dropping every edit made after that.
  const handleFormBlur = () => {
    if (!canEditForm || !activeVisit) return;
    // Don't persist while the move-to-today dialog is deciding the fate of an
    // edit — the change must not leak onto the stale-dated visit.
    if (moveToTodayDate != null) return;
    // Auto-save on blur works for every visit, including completed ones — a
    // post-completion edit is persisted without reopening the appointment
    // (handleSave changes no status). handleSave also clears the dirty flag,
    // so the "Save changes" button hides again once the edit is saved.
    void handleSave({ silent: true });
  };

  // "Was this visit edited since the doctor opened its tab?" — survives the
  // silent blur auto-save (which clears `dirty` the moment focus leaves a
  // field). We need a flag that DOESN'T reset on save so that completing an
  // old, pending visit can tell "you changed something → move it to today"
  // from "untouched → just end the consultation in place".
  const editedSinceLoadRef = React.useRef(false);
  // Flip-to-IN_PROGRESS guard — fires at most once per appointment so we don't
  // re-patch the status on every dirty toggle.
  const startedInProgressRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!dirty) return;
    editedSinceLoadRef.current = true;
    // Editing a patient who's been sent to the doctor (AT_DOC) flips the
    // appointment to IN_PROGRESS so the queue reflects the live consultation.
    // Once per appointment; "Complete visit" later moves it to COMPLETED.
    const apptId = activeVisit?.appointmentId;
    if (apptId &&
        (activeVisit?.appointmentStatus ?? "").toUpperCase() === "AT_DOC" &&
        startedInProgressRef.current !== apptId) {
      startedInProgressRef.current = apptId;
      if (apptId === selectedAppointmentId) setSelectedAppointmentStatus("IN_PROGRESS");
      void patchAppointmentStatus(apptId, "IN_PROGRESS").then(() => refetchVisits());
    }
    // Editing an OLD, still-in-progress visit → ask to move it to today
    // BEFORE the change settles onto the stale date. The blur/debounce
    // auto-saves are blocked while this dialog is open (see handleFormBlur /
    // latestSaveRef), so nothing lands on the old visit until the doctor
    // decides. Cancel discards the edit; Continue relocates to today.
    if (isOldPending && moveToTodayDate == null && activeVisit) {
      setMoveToTodayDate(activeVisit.visitDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);

  // A fresh visit (tab switch / patient change) starts clean — drop any
  // unsaved-edit flag left from the previous visit.
  React.useEffect(() => {
    setDirty(false);
    editedSinceLoadRef.current = false;
  }, [activeVisit?.id]);


  // Best-effort PATCH against the appointment status. Tries the
  // public /api/appointments endpoint first (broad role allowlist) and
  // falls back to /api/tenant/appointments which only accepts ADMIN.
  // Failures are toasted so the doctor knows the queue may not reflect
  // the new status until a backend retry.
  const patchAppointmentStatus = async (apptId: string, status: string) => {
    const token = localStorage.getItem("docodile_token");
    const body = JSON.stringify({ status });
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/tenant/appointments/${apptId}/status`,
        { method: "PATCH", headers, body },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      showToast(`Status update failed: ${(e as Error).message}`);
    }
  };

  // Explicitly finish a consultation: save the current form and mark the
  // linked appointment COMPLETED. This replaces "End Session" as the path to
  // COMPLETED now that the session timer is being retired — without it, an
  // appointment could never leave IN_PROGRESS and the queue/stats would stall.
  // Footer "Complete visit" / "Save changes" → finish the active consultation
  // in place. An old pending visit that the doctor edited has ALREADY been
  // relocated to today at edit-time (see the move-to-today dialog), so by the
  // time Complete is clicked there's never a stale date to worry about. An
  // untouched old pending visit completes on its own date without fuss.
  const handleCompleteVisit = async () => {
    if (!activeVisit) return;
    // Don't let a visit be completed/saved with out-of-range vitals — toast and
    // highlight the offending fields instead of persisting bad data.
    if (hasInvalidVitals) {
      showToast("Enter valid vitals before completing");
      return;
    }
    await completeVisitInPlace();
  };

  // Finish the active consultation on its own visit row: stamp the end time,
  // persist the form, and flip its OWN appointment to COMPLETED (first time
  // only). A visit with no appointment of its own is finished purely by the
  // end-stamp — we never touch the entry appointment, which belongs to a
  // different visit.
  const completeVisitInPlace = async () => {
    if (!activeVisit) return;
    const apptId = activeVisit.appointmentId;
    const alreadyCompleted = activeCompleted;
    // Stop the consultation timer and persist the form. The backend computes
    // the duration from sessionStartedAt (set when the doctor opened the pad)
    // to sessionEndedAt. On the FIRST completion we stamp the end time now;
    // re-saving an already-completed visit preserves the original end time so
    // the recorded duration isn't inflated.
    const endIso = activeVisit.sessionEndedAt ?? new Date().toISOString();
    const req: SaveVisitRequest = {
      ...buildSaveRequest(),
      sessionEndedAt: endIso,
    };
    await updateVisit(activeVisit.id, req);
    if (apptId && !alreadyCompleted) {
      // Flip status only on the first completion. A later re-save keeps the
      // visit Completed — it never goes back to In Progress.
      await patchAppointmentStatus(apptId, "COMPLETED");
      // Clear the "Ongoing" flag so the completed card shows Completed.
      if (selectedPatient) unmarkStarted(selectedPatient.id);
    }
    // Refetch AFTER the status patch so the visit DTO carries the new
    // appointmentStatus — the footer keys its label off the active visit.
    await refetchVisits();
    // Reflect completion locally too so the open-pad effect doesn't re-mark
    // the patient Ongoing (it keys off selectedAppointmentStatus). Only when
    // the visit we completed IS the entry appointment.
    if (apptId && apptId === selectedAppointmentId) setSelectedAppointmentStatus("COMPLETED");
    setDirty(false);
    editedSinceLoadRef.current = false;
    showToast(alreadyCompleted ? "Changes saved" : "Visit marked complete");
  };

  // Confirm action for the "move to today" dialog (triggered the moment the
  // doctor edits an OLD pending visit): clone the in-form data — including the
  // edit that triggered this — into a fresh visit dated today, delete the
  // stale pending visit, and land the doctor on the new today tab to keep
  // working. The visit stays IN PROGRESS (no end stamp); the doctor completes
  // it later like any other today visit.
  const moveToToday = async () => {
    if (!activeVisit || !selectedPatientId) { setMoveToTodayDate(null); return; }
    // Same guard as save/complete — never relocate a visit carrying invalid
    // vitals; keep the dialog open so the doctor can fix the highlighted fields.
    if (hasInvalidVitals) { showToast("Enter valid vitals first"); return; }
    setSaving(true);
    const oldId = activeVisit.id;
    const apptId = activeVisit.appointmentId;
    const startedAt = activeVisit.sessionStartedAt;
    const prevLen = visits.length; // net unchanged (one deleted, one created)
    try {
      const base = buildSaveRequest();
      const draft: SaveVisitRequest = {
        ...base,
        visitDate: todayIso(),
        // Carry the appointment link so the moved visit stays tied to the same
        // booking; preserve the original start so the duration is honest.
        appointmentId: apptId ?? undefined,
        sessionStartedAt: startedAt ?? new Date().toISOString(),
        sessionEndedAt: null,
        sessionDurationSec: null,
        prescriptions: base.prescriptions.map((p, i) => ({ ...p, id: null, position: i + 1 })),
      };
      await createVisit(selectedPatientId, draft);
      await deleteVisit(oldId);
      await refetchVisits();
      setDirty(false);
      editedSinceLoadRef.current = false;
      // The new today visit sorts last; land the doctor on it to keep editing.
      setActiveTab(Math.max(0, prevLen - 1));
      showToast("Visit moved to today");
    } catch (e) {
      showToast(`Move failed: ${(e as Error).message}`);
    } finally {
      setSaving(false);
      setMoveToTodayDate(null);
    }
  };

  // Cancel the move: discard the edit that triggered the dialog and restore
  // the old pending visit's saved data, leaving it untouched on its own date.
  // Bumping the nonce remounts the visit subtree (uncontrolled inputs reset to
  // their defaultValues) and re-runs the populate effect (controlled state).
  const cancelMoveToToday = () => {
    setMoveToTodayDate(null);
    setDirty(false);
    editedSinceLoadRef.current = false;
    setRevertNonce((n) => n + 1);
  };

  // Opening the pad for an At Doc / In Progress patient flips the queue card
  // from "At Doc" to "Ongoing" — the queue reads this per-patient "started"
  // flag. This replaces the old "Start Session" trigger. Idempotent, so it's
  // safe to run on every open (including a re-open).
  React.useEffect(() => {
    if (!selectedPatient || !selectedAppointmentId) return;
    const apptStatus = (selectedAppointmentStatus ?? "").toUpperCase();
    if (apptStatus === "AT_DOC" || apptStatus === "IN_PROGRESS") {
      markStarted(selectedPatient.id);
    }
  }, [selectedPatient, selectedAppointmentId, selectedAppointmentStatus]);

  // Start the consultation timer the moment the doctor opens the pad for an
  // appointment that's with them (At Doc / In Progress): stamp
  // sessionStartedAt once. Server-persisted; the backend computes the elapsed
  // duration up to "Complete visit". Guarded so it fires once per visit and
  // never overwrites a start time that's already set.
  const timerStartedForVisitRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!activeVisit || !selectedAppointmentId) return;
    if (activeVisit.appointmentId !== selectedAppointmentId) return;
    if (activeVisit.sessionStartedAt) return;
    if (timerStartedForVisitRef.current === activeVisit.id) return;
    const apptStatus = (selectedAppointmentStatus ?? "").toUpperCase();
    if (apptStatus !== "AT_DOC" && apptStatus !== "IN_PROGRESS") return;
    timerStartedForVisitRef.current = activeVisit.id;
    const req: SaveVisitRequest = {
      ...buildSaveRequest(),
      sessionStartedAt: new Date().toISOString(),
    };
    void updateVisit(activeVisit.id, req).then(() => refetchVisits());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVisit, selectedAppointmentId, selectedAppointmentStatus]);

  const handleAddVisit = async () => {
    if (!selectedPatientId) return;
    setSaving(true);
    setAddingVisit(true);
    try {
      // Persist any unsaved edits on the CURRENT visit before switching to the
      // new one, so adding a visit can never appear to drop the previous one's
      // data.
      if (canEditForm && activeVisit && dirty) {
        await handleSave({ silent: true });
      }
      // Carry the current visit's data into the new visit. Review patients
      // usually get the same prescription with minor tweaks, so the doctor
      // edits from a copy instead of retyping. Carried over: history,
      // diagnosis, Rx, tests, all notes (patient / private / review). Reset
      // because they're specific to each visit: vitals (measured fresh), the
      // complaint (reason for THIS visit), the review/follow-up date, plus the
      // technical fields (today's date, fresh session, no appointment link,
      // and new Rx-row ids so they save as this visit's own rows).
      const base = buildSaveRequest();
      const draft: SaveVisitRequest = {
        ...base,
        visitDate: todayIso(),
        appointmentId: undefined,
        sessionStartedAt: null,
        sessionEndedAt: null,
        sessionDurationSec: null,
        // Per-visit — do NOT carry forward.
        bpSystolic: null, bpDiastolic: null, bpUnit: null,
        bmi: null, bmiUnit: null, height: null, heightUnit: null,
        weight: null, weightUnit: null, temperature: null, temperatureUnit: null,
        pulse: null, pulseUnit: null, waist: null, waistUnit: null,
        hip: null, hipUnit: null, spo2: null, spo2Unit: null,
        complaints: null,
        reviewDate: null, reviewDays: null,
        prescriptions: base.prescriptions.map((p, i) => ({ ...p, id: null, position: i + 1 })),
      };
      await createVisit(selectedPatientId, draft);
      await refetchVisits();
      // Switch to the newly added (last) tab on next render — visits is
      // sorted ascending by visit_date, so the new one lives at the end.
      setActiveTab(visits.length); // length BEFORE refetch — the new visit will land at this index after refetch
    } catch (e) {
      showToast(`Add visit failed: ${(e as Error).message}`);
    } finally {
      setSaving(false);
      setAddingVisit(false);
    }
  };

  // Share the prescription to the patient over WhatsApp via a click-to-chat
  // link (wa.me) — opens WhatsApp pre-filled with the Rx as text to the
  // patient's number; the doctor taps Send. No WhatsApp API / account needed.
  const handleShareWhatsApp = () => {
    if (!selectedPatient) { showToast("Select a patient first"); return; }
    const digits = (selectedPatient.phone ?? "").replace(/\D/g, "");
    if (!digits) { showToast("This patient has no phone number on file"); return; }
    // India default: bare 10-digit numbers get a 91 country code; longer
    // numbers are assumed to already carry one.
    const intl = digits.length === 10 ? `91${digits}` : digits;

    const meds = rxRows
      .filter((r) => r.medicine.trim())
      .map((r, i) => {
        const schedule = [r.frequency, r.whenToTake, r.frequencyInterval, r.duration]
          .map((s) => s.trim()).filter(Boolean).join(" · ");
        const head = `${i + 1}. ${r.medicine.trim()}${schedule ? ` — ${schedule}` : ""}`;
        return r.notes.trim() ? `${head}\n   (${r.notes.trim()})` : head;
      });
    if (meds.length === 0) { showToast("Add a medicine before sharing"); return; }

    const clinicName = localStorage.getItem("docodile_clinic_name") || "Clinic";
    const lines = [
      `*${clinicName}*`,
      `Prescription for ${selectedPatient.name}`,
      `Date: ${activeVisit?.visitDate ?? todayIso()}`,
      "",
      "Medicines:",
      ...meds,
    ];
    if (reviewDate) {
      const r = `${reviewDate.getFullYear()}-${String(reviewDate.getMonth() + 1).padStart(2, "0")}-${String(reviewDate.getDate()).padStart(2, "0")}`;
      lines.push("", `Next review: ${r}`);
    }

    window.open(`https://wa.me/${intl}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  };

  // ── Print prescription ──────────────────────────────────────────────────
  // Assemble a PrintVisitData payload from the current patient + visit + form
  // state and hand it to the configured print template. The template tells
  // us whether to render header/footer (Blank A4) or text-only (pre-printed
  // letterhead) and which patient fields to show. Auto-saves first so the
  // print reflects the latest edits.
  const handlePrintPrescription = async (action: "print" | "download" = "print") => {
    // The default-template cache is primed by the editor (Settings → Print
    // template). If the user prints without visiting Settings first this
    // session, fetch lazily so we never miss a configured template.
    let template = getDefaultTemplate();
    if (!template) {
      try {
        await loadTemplates();
        template = getDefaultTemplate();
      } catch (e) {
        showToast(`Couldn't load print template: ${(e as Error).message}`);
        return;
      }
    }
    if (!template) {
      showToast("No print template — set one up in Settings → Print template");
      return;
    }
    if (!selectedPatient || !activeVisit) {
      showToast("Nothing to print yet");
      return;
    }
    if (canEditForm) {
      try { await handleSave({ silent: true }); } catch {}
    }
    const vitalsForPrint: { label: string; value: string }[] = [];
    const v = activeVisit;
    if (v.bpSystolic && v.bpDiastolic) {
      vitalsForPrint.push({ label: "BP", value: `${v.bpSystolic}/${v.bpDiastolic} ${v.bpUnit ?? "mmHg"}` });
    }
    if (v.pulse)       vitalsForPrint.push({ label: "Pulse", value: `${v.pulse} ${v.pulseUnit ?? ""}`.trim() });
    if (v.spo2)        vitalsForPrint.push({ label: "SpO₂",  value: `${v.spo2} ${v.spo2Unit ?? "%"}`.trim() });
    if (v.temperature) vitalsForPrint.push({ label: "Temp",  value: `${v.temperature} ${v.temperatureUnit ?? ""}`.trim() });
    if (v.weight)      vitalsForPrint.push({ label: "Weight", value: `${v.weight} ${v.weightUnit ?? "kg"}` });
    if (v.height)      vitalsForPrint.push({ label: "Height", value: `${v.height} ${v.heightUnit ?? "cm"}` });
    if (v.bmi)         vitalsForPrint.push({ label: "BMI",   value: `${v.bmi}`.trim() });

    const visitIndex = visits.findIndex((vv) => vv.id === activeVisit.id);
    const data: PrintVisitData = {
      patientName: selectedPatient.name,
      patientAge: selectedPatient.age != null ? `${Math.floor(selectedPatient.age / 12)}y` : null,
      patientGender: selectedPatient.gender,
      patientPhone: selectedPatient.phone,
      patientAddress: null, // Patient type has no address yet.
      patientId: selectedPatient.id,
      visitNumber: visitIndex >= 0 ? visits.length - visitIndex : null, // newest = highest #
      visitDate: activeVisit.visitDate,
      visitTime: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
      referredBy: referDoctorName || null,
      doctorName: doctors.find((d) => d.id === activeVisit.createdByDoctorId)?.name ?? null,
      doctorCredentials: null,
      complaints: complaintsValue,
      diagnosis: diagnosisValue,
      vitals: vitalsForPrint,
      tests: testsValue,
      notesForPatient: notesForPatientValue,
      rx: rxRows.map((r) => ({
        medicine: r.medicine ?? null,
        genericName: r.genericName ?? null,
        dosage: r.dosage ?? null,
        whenToTake: r.whenToTake ?? null,
        frequency: r.frequency ?? null,
        frequencyInterval: r.frequencyInterval ?? null,
        duration: r.duration ?? null,
        notes: r.notes ?? null,
        // Total units to dispense — mirrors the Bill Medicines modal's
        // auto-quantity so the printed Rx and the dispensary bill stay
        // consistent. Returns null when any field is unparseable (SOS,
        // "As directed") and the column shows blank.
        totalQty: computeRxTotal(r.medicine, r.dosage, r.frequency, r.duration),
      })),
      reviewDate: reviewDate ? `${reviewDate.getFullYear()}-${String(reviewDate.getMonth() + 1).padStart(2, "0")}-${String(reviewDate.getDate()).padStart(2, "0")}` : null,
      reviewNotes: reviewNotesValue,
    };
    const html = buildPrintHtml(template, data);
    if (action === "download") {
      const fname = `prescription-${selectedPatient.name.replace(/\s+/g, "_")}-${queueDate}`;
      try {
        await downloadAsPdf(html, fname);
      } catch (e) {
        showToast(`Couldn't download: ${(e as Error).message}`);
      }
    } else {
      // Browser's native print dialog — user picks destination (printer or
      // Save as PDF). Skips the custom preview modal entirely.
      openPrintWindow(html);
    }
  };

  if (selectedPatientId === null) {
    // Today's Queue is the new internal home for the Prescription page
    // (Figma 2282:17378) — same data source as the Appointment Queue.
    return (
      <div ref={pageRootRef}>
        <PrescriptionQueue
          refreshKey={queueRefreshKey}
          onSelect={(patient, appointmentId, date, doctorId) => {
            setQueueDate(date);
            setSelectedPatient(patient);
            setSelectedAppointmentId(appointmentId);
            setAppointmentDoctorId(doctorId);
          }}
        />
      </div>
    );
  }

  // Hold on the queue until visits for the just-selected patient have
  // resolved. Without this gate the form mounts with empty fields, the
  // user sees a brief unfilled state, then activeVisit lands and every
  // field pops in at once — perceived as a jerk.
  if (visitsLoadedFor !== selectedPatientId) {
    // A patient is already selected (e.g. opened from Patient Files) but
    // their visits haven't been fetched yet — show a quiet loading
    // skeleton instead of flashing the queue picker, which would be a
    // misleading screen on its way to the actual chart.
    if (selectedPatientId !== null) {
      return (
        <div ref={pageRootRef} style={{ padding: 40, textAlign: "center", color: colors.neutral500, fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
          Loading patient file…
        </div>
      );
    }
    return (
      <div ref={pageRootRef}>
        <PrescriptionQueue
          refreshKey={queueRefreshKey}
          onSelect={(patient, appointmentId, date, doctorId) => {
            setQueueDate(date);
            setSelectedPatient(patient);
            setSelectedAppointmentId(appointmentId);
            setAppointmentDoctorId(doctorId);
          }}
        />
      </div>
    );
  }

  return (
    <div ref={pageRootRef} style={styles.page}>
      {/* Sticky record header — back · patient name · section nav (Info first
          via NAV_ORDER) · contact "⋯" kebab. Now the shared, reusable
          <PatientRecordHeader> (Patterns) rather than hand-built markup. */}
      <PatientRecordHeader
        title={selectedPatient?.name ?? ""}
        onBack={() => {
          setSelectedPatient(null);
          setSelectedAppointmentId(null);
        }}
        backLabel="Back to patients"
        navLabel="Patient record sections"
        sections={NAV_ORDER.map(
          (i): RecordSection => ({
            id: String(i),
            label: ACTION_META[i].label,
            icon: ACTION_META[i].icon,
            badge: countFor(i),
          })
        )}
        activeId={String(activeAction)}
        onSelect={(id) => setActiveAction(Number(id))}
        actions={
          <PopoverMenu
            trigger={<span style={styles.kebabTrigger} aria-hidden="true">⋯</span>}
            items={contactMenuItems}
            ariaLabel="Patient contact and actions"
          />
        }
      />

      <div style={styles.body}>
        {/* ─── Form area — content swapped via activeAction. Locked
              behind the session: until the user clicks Start on the
              SessionBar, pointer-events are blocked and the content fades
              very slightly so the form reads as "frozen". */}
        <div
          style={{
            ...styles.rightArea,
            // The lock applies ONLY to the prescription form (action 0). The
            // other chart sections — Files (1), Timeline (2), Bills (3),
            // Info (4) — stay fully usable (Add file etc.) regardless of the
            // visit's editability; locking a past/unstarted visit must not
            // freeze the whole chart.
            ...(canEditForm || activeAction !== 0
              ? null
              // Mostly readable while locked — labels stay legible so the
              // doctor can scan the form. Clicks are blocked via
              // pointer-events:none. Past visits hit this unconditionally so
              // they read as historic only.
              : { pointerEvents: "none", opacity: 0.75, userSelect: "none" }),
            transition: "opacity 0.15s ease",
          }}
          aria-disabled={!canEditForm && activeAction === 0}
          // Any descendant input/textarea/select change bubbles here — flag
          // unsaved edits so the "Save changes" button surfaces on an
          // already-completed visit only after the doctor actually edits.
          onChange={() => { if (canEditForm) setDirty(true); }}
          // Save-on-blur: any descendant input / textarea / select that
          // loses focus triggers a silent save. React.onBlur surfaces the
          // bubbled focusout, so a single handler at the form root covers
          // every field below without needing to wire each one.
          onBlur={handleFormBlur}>

          {activeAction === INFO_ACTION ? (
            // Info — reuses the New Appointment cards: ID/avatar card, a
            // read-only basic-info card, and an AI summary card (in the Bill
            // card's slot).
            <div style={styles.infoGrid}>
              <Card style={styles.infoIdCard}>
                <img
                  src={pickAvatar({
                    gender: selectedPatient?.gender,
                    ageYears: selectedPatient?.age != null ? Math.floor(selectedPatient.age / 12) : null,
                  })}
                  alt=""
                  style={styles.infoAvatar}
                />
                <h1 style={styles.infoIdText}>
                  {selectedPatient?.displayNo != null ? `T${selectedPatient.displayNo}` : "T---"}
                </h1>
              </Card>

              <Card style={styles.infoFieldsCard}>
                {[
                  { icon: <Icon name="user" tone="inherit" style={styles.infoRowIcon} />, label: "Name", value: selectedPatient?.name },
                  { icon: <Icon name="mail" tone="inherit" style={styles.infoRowIcon} />, label: "Email", value: selectedPatient?.email },
                  { icon: <Icon name="phone" tone="inherit" style={styles.infoRowIcon} />, label: "Phone", value: selectedPatient?.phone },
                  { icon: <Icon name="calendar" tone="inherit" style={styles.infoRowIcon} />, label: "Age", value: selectedPatient?.age != null ? `${Math.floor(selectedPatient.age / 12)} yrs` : null },
                  { icon: <Icon name="user" tone="inherit" style={styles.infoRowIcon} />, label: "Gender", value: selectedPatient?.gender },
                ].map((f) => (
                  <div key={f.label} style={styles.infoRow}>
                    {f.icon}
                    <div style={styles.infoValue}>{f.value || "—"}</div>
                  </div>
                ))}
              </Card>

              <Card style={styles.infoAiCard}>
                <div style={styles.infoAiHead}>
                  <span style={styles.infoAiSparkle} aria-hidden="true">✨</span>
                  <span style={styles.infoAiTitle}>AI summary</span>
                </div>
                <p style={styles.infoAiBody}>
                  {aiConfigured === false
                    ? "AI is not configured for this clinic."
                    : aiSummary?.summary
                      ? aiSummary.summary
                      : "No summary yet — open AI Summary to generate one."}
                </p>
              </Card>
            </div>
          ) : activeAction === 2 ? (
            // Timeline — chronological feed of the patient's visits (newest
            // first), each with a short synopsis (complaints → diagnosis).
            // File / Rx events interleave here once an activity feed exists.
            <div style={styles.timeline}>
              {visits.length === 0 ? (
                <p style={styles.comingSoonBody}>No visits yet.</p>
              ) : (
                <div style={styles.timelineList}>
                  <div style={styles.timelineLine} aria-hidden />
                  {visits.map((v, i) => ({ v, n: i + 1 })).reverse().map(({ v, n }) => {
                    const parts: string[] = [];
                    if (v.complaints) parts.push(v.complaints);
                    if (v.diagnosis) parts.push(`Dx: ${v.diagnosis}`);
                    const synopsis = parts.join(" · ");
                    return (
                      <div key={v.id} style={styles.timelineItem}>
                        <span style={styles.timelineDot}><Icon name="visits" tone="inherit" style={styles.timelineDotIcon} /></span>
                        <div style={styles.timelineContent}>
                          <div style={styles.timelineHead}>
                            <span style={styles.timelineTitle}>{`Visit ${n}`}</span>
                            <span style={styles.timelineDate}>{formatVisitLabel(v.visitDate)}</span>
                          </div>
                          <p style={styles.timelineSynopsis}>{synopsis || "Consultation"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : comingSoonLabel ? (
            <div style={styles.comingSoon}>
              {/* Section title moved into the sticky <PageHeader/>; only the
                  "Coming soon" body remains here. */}
              <p style={styles.comingSoonBody}>Coming soon</p>
            </div>
          ) : listViewConfig ? (
            <>
              {/* List-view tabs — styled to match the Rx Pad home page
                filter pills (View all / At Doc / …) with tier-responsive
                horizontal padding. */}
              <div style={styles.tabsBar}>
                <Tabs
                  variant="block"
                  size="sm"
                  inline
                  items={listViewConfig.tabs.map((label, i) => ({ id: String(i), label }))}
                  activeId={String(activeListTab)}
                  onSelect={(id) => setActiveListTab(Number(id))}
                />
                <ViewToggle value={viewMode} onChange={setViewMode} style={{ marginLeft: "auto" }} />
              </div>

              {viewMode === "list" ? (
                /* List table — the shared DataGrid (Catalog-styled). Whole row
                   opens the file in the viewer. */
                <DataGrid
                  rows={displayRows}
                  rowKey={(r, i) => r.id ?? i}
                  onRowClick={(r) => setViewerOpen(r)}
                  columns={[
                    { key: "n", header: "#", width: 40, align: "center", render: (_r, i) => i + 1 },
                    { key: "mic", header: "", width: 48, align: "center", render: () => <Icon name="microphone" size={24} tone="inherit" /> },
                    { key: "name", header: listViewConfig.nameColumn, align: "left", render: (r) => r.name },
                    { key: "cat", header: "Category", width: 140, render: (r) => r.category },
                    { key: "date", header: listViewConfig.dateColumn, width: 140, render: (r) => r.date },
                    { key: "act", header: "Actions", width: 110, render: () => (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: spacing.s }}>
                        <Icon name="download" size={24} tone="inherit" />
                        <Icon name="menu" size={20} tone="inherit" />
                      </div>
                    ) },
                  ]}
                />
              ) : (
                /* Grid view — Figma node 2143:11610. Cream cards with a white
                   inner tile (file thumbnail placeholder + mic chip) and
                   name + date + size below. Kebab handle in top-right. */
                <div style={styles.reportsGrid}>
                  {/* Add-file affordance lives in the floating action bar now. */}
                  {displayRows.map((r, i) => (
                    <div
                      key={r.id ?? i}
                      style={{ ...styles.reportCard, cursor: "pointer" }}
                      onClick={() => setViewerOpen(r)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setViewerOpen(r);
                        }
                      }}
                    >
                      <div style={styles.reportCardThumb}>
                        <AuthThumb
                          fileUrl={r.fileUrl ?? (r.fileId && selectedPatientId ? `${API_BASE_URL}/api/patients/${selectedPatientId}/files/${r.fileId}/download` : null)}
                          mimeType={r.mimeType}
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {!(r.mimeType ?? "").startsWith("image/") && <Icon name="file" tone="inherit" style={styles.reportCardThumbIcon} />}
                        <span style={styles.reportCardMic}>
                          <Icon name="microphone" size={20} tone="inherit" />
                        </span>
                      </div>
                      <div style={styles.reportCardKebab}>
                        <Icon name="menu" size={20} tone="inherit" />
                      </div>
                      <div style={styles.reportCardFooter}>
                        <span style={styles.reportCardName}>{r.name}</span>
                        <div style={styles.reportCardMeta}>
                          <span>{r.date}</span>
                          <span>2.4MB</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            selectedPatientId &&
            !visitsLoading &&
            visitsLoadedFor === selectedPatientId &&
            visits.length === 0 &&
            !selectedAppointmentId
          ) ? (
            // Patient opened with no visits and no appointment (just added
            // or freshly migrated) — offer to create the first visit rather
            // than dropping straight into a blank session form.
            <section style={styles.rightColumn}>
              <div style={styles.noVisits}>
                <Icon name="visits" size={40} tone="inherit" style={styles.noVisitsIcon} />
                <h3 style={styles.noVisitsTitle}>No visits yet</h3>
                <p style={styles.noVisitsText}>
                  This patient has no recorded visits. Create one to start
                  charting today's consultation.
                </p>
                <button
                  type="button"
                  style={styles.noVisitsBtn}
                  onClick={handleAddVisit}
                  disabled={saving}
                >
                  {saving ? "Creating…" : "Create visit"}
                </button>
              </div>
            </section>
          ) : (
            <>
              {/* Visit tabs — sit OUTSIDE the cream sheet, above it. The tuning
              button (Figma node 2133:9927) is pushed to the far right of the
              row to filter / reconfigure the current visit's view. Each tab
              loads that visit's prescription data into the form below.
              `pointerEvents: auto` is forced on so the tabs remain clickable
              even when the form below has `pointer-events: none` (locked
              past visit / pre-Start state) — the doctor must always be
              able to navigate back to today to start the session. */}
              <div style={{ ...styles.tabsBar, pointerEvents: "auto" }}>
                {visits.map((v, i) => (
                  <div
                    key={v.id}
                    style={{ ...styles.tab, ...(activeTab === i ? styles.tabActive : styles.tabInactive) }}
                    onClick={() => setActiveTab(i)}
                  >
                    <span style={{ ...styles.tabNumber, ...(activeTab === i ? styles.tabNumberActive : {}) }}>{i + 1}</span>
                    <span style={styles.tabLabel}>{formatVisitLabel(v.visitDate)}</span>
                  </div>
                ))}
                {/* "+ New Visit" — the "new tab" slot, sitting right after the
                    last visit. Deliberately the ONLY create action here and
                    kept clear of anything destructive. */}
                <button
                  type="button"
                  style={styles.newVisitBtn}
                  onClick={handleAddVisit}
                  disabled={addingVisit}
                  title="Add a new visit"
                >
                  <span style={styles.newVisitPlus} aria-hidden="true">+</span>
                  <span>{addingVisit ? "Creating…" : "New Visit"}</span>
                </button>
              </div>

              {/* Cream sheet wrapping all visit-content sections. Keyed by the
              active tab so React unmounts/remounts the subtree on switch,
              giving uncontrolled inputs fresh defaultValues for that visit. */}
              <section key={`visit-${activeTab}-${revertNonce}`} style={styles.rightColumn}>

                {/* Vitals */}
                <div style={styles.sectionCard}>
                  <div style={styles.sectionHeader}>
                    <div style={styles.sectionTitleWrap}>
                      <Icon name="heart-pulse" tone="inherit" style={styles.sectionIcon} />
                      <h3 style={styles.sectionTitle}>Vitals</h3>
                    </div>
                    <button
                      type="button"
                      style={styles.sectionToggle}
                      onClick={() => toggleSection("vitals")}
                      aria-label={openSections.vitals ? "Collapse Vitals" : "Expand Vitals"}
                    >
                      <Icon
                        name="chevron-up"
                        tone="inherit"
                        style={{
                          ...styles.sectionIcon,
                          transform: openSections.vitals ? "rotate(0deg)" : "rotate(180deg)",
                          transition: "transform 0.15s ease",
                        }}
                      />
                    </button>
                  </div>
                  {openSections.vitals && (
                    <div style={styles.vitalsGrid}>
                      {VITAL_CELLS.map(({ cell: v, cellKey }) => {
                            const cell = vitalState[cellKey];
                            const canToggle = !!UNIT_TOGGLES[cell.unit];
                            // BP is rendered as two inputs separated by a fixed `/`.
                            // The combined "sys/dia" string still lives in vitalState
                            // so unit conversion (mmHg↔kPa) keeps working.
                            const isBp = v.label === "BP";
                            const [bpSys = "", bpDia = ""] = isBp ? cell.value.split("/") : [];
                            const setBpPart = (sys: string, dia: string) =>
                              setVitalValue(cellKey, `${sys}/${dia}`);
                            // Range validation per (label, unit). Out-of-range values
                            // get a soft red tint; empty values stay neutral.
                            const sysValid = isBp ? isVitalValid("BP_sys", bpSys, cell.unit) : true;
                            const diaValid = isBp ? isVitalValid("BP_dia", bpDia, cell.unit) : true;
                            const valueValid = isBp ? sysValid && diaValid : isVitalValid(v.label, cell.value, cell.unit);
                            const rangeForLabel = isBp ? VITAL_RANGES.BP_sys?.[cell.unit] : VITAL_RANGES[v.label]?.[cell.unit];
                            const rangeHint = rangeForLabel
                              ? `Valid: ${rangeForLabel.min}–${rangeForLabel.max} ${cell.unit}`
                              : undefined;
                            return (
                              <div key={cellKey} style={styles.vitalCell}>
                                <span style={styles.vitalLabel}>{v.label}</span>
                                <div style={styles.vitalInputRow} title={!valueValid ? rangeHint : undefined}>
                                  <MeasureField
                                    bp={isBp}
                                    value={isBp ? bpSys : cell.value}
                                    onChange={isBp ? (val) => setBpPart(val, bpDia) : (val) => setVitalValue(cellKey, val)}
                                    value2={isBp ? bpDia : undefined}
                                    onChange2={isBp ? (val) => setBpPart(bpSys, val) : undefined}
                                    unit={cell.unit}
                                    unitWidth={v.unitWidth}
                                    onToggleUnit={canToggle ? () => toggleVitalUnit(cellKey) : undefined}
                                    invalid={!valueValid}
                                    dense
                                    placeholder={v.placeholder ?? ""}
                                    onKeyDown={(e) => validateVitalOnEnter(e, v.label, cell.value, cell.unit, isBp)}
                                    ariaLabel={isBp ? "Systolic" : v.label}
                                    ariaLabel2={isBp ? "Diastolic" : undefined}
                                  />
                                </div>
                                {!valueValid && (
                                  <span style={styles.vitalErrorMessage}>
                                    {rangeForLabel
                                      ? `Enter valid details (${rangeForLabel.min}–${rangeForLabel.max} ${cell.unit})`
                                      : "Enter valid details"}
                                  </span>
                                )}
                              </div>
                            );
                      })}
                    </div>
                  )}
                </div>

                {/* History — Figma node 2073:3030 (2×2 grid, cream-filled fields) */}
                <div style={styles.sectionCard}>
                  <div style={styles.sectionHeader}>
                    <div style={styles.sectionTitleWrap}>
                      <Icon name="hourglass-line" tone="inherit" style={styles.sectionIcon} />
                      <h3 style={styles.sectionTitle}>History</h3>
                    </div>
                    <button
                      type="button"
                      style={styles.sectionToggle}
                      onClick={() => toggleSection("history")}
                      aria-label={openSections.history ? "Collapse History" : "Expand History"}
                    >
                      <Icon
                        name="chevron-up"
                        tone="inherit"
                        style={{
                          ...styles.sectionIcon,
                          transform: openSections.history ? "rotate(0deg)" : "rotate(180deg)",
                          transition: "transform 0.15s ease",
                        }}
                      />
                    </button>
                  </div>
                  {openSections.history && (
                    <div style={styles.historyGrid}>
                      {HISTORY_FIELDS.map((f) => {
                        const raw = historyValues[f.field] ?? "";
                        const tags = splitTags(raw);
                        return (
                          // Plain <div> instead of <label>: a label forwards clicks
                          // to the first focusable child, and once chips exist the
                          // first focusable child is the leftmost chip's ✕ button —
                          // so clicking the label text would silently remove a tag.
                          <div key={f.label} style={styles.fieldGroup}>
                            <span style={styles.fieldLabel}>{f.label}</span>
                            <AutocompleteTags
                              field={f.field}
                              value={tags}
                              onChange={(next) =>
                                setHistoryValues((prev) => ({
                                  ...prev,
                                  [f.field]: next.join(", "),
                                }))
                              }
                              placeholder={f.placeholder}
                              ariaLabel={f.label}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Figma node 2057:6283 — Complaints + Diagnosis cards laid out
              side-by-side. Each card is a multi-line cream textarea with the
              dictate icons docked at the bottom-right corner and a kebab
              handle in the section header. */}
                <div style={styles.noteCardsRow}>
                  <div style={styles.noteCard}>
                    <div style={styles.noteCardHeader}>
                      <div style={styles.sectionTitleWrap}>
                        <Icon name="chat-dots" tone="inherit" style={styles.sectionIcon} />
                        <h3 style={styles.sectionTitle}>Complaints</h3>
                      </div>
                      <PopoverMenu
                        trigger={<Icon name="menu" size={24} tone="inherit" style={styles.reorderHandle} />}
                        items={[{ label: "Save as template", onClick: () => openTemplates("save", "complaints") }]}
                        ariaLabel="Template options"
                      />
                    </div>
                    <div style={styles.noteCardField}>
                      <AutocompleteTags
                        field="complaints"
                        value={splitTags(complaintsValue)}
                        onChange={(next) => setComplaintsValue(next.join(", "))}
                        placeholder="Type here..."
                        ariaLabel="Complaints"
                        containerStyle={NOTE_CARD_TAGBOX_STYLE}
                      />
                      <span style={styles.noteCardDictate}>
                        <IconButton
                          ariaLabel="Copy complaints from previous visit"
                          size={28}
                          disabled={!prevVisit?.complaints || !canEditForm}
                          onClick={() => prevVisit?.complaints && setComplaintsValue(prevVisit.complaints)}
                        >
                          <Icon name="rewind-back-circle" size={20} tone="inherit" />
                        </IconButton>
                        <IconButton ariaLabel="Load template" size={28} onClick={() => openTemplates("load", "complaints")}>
                          <Icon name="microphone" size={20} tone="inherit" />
                        </IconButton>
                                              </span>
                    </div>
                  </div>
                  <div style={styles.noteCard}>
                    <div style={styles.noteCardHeader}>
                      <div style={styles.sectionTitleWrap}>
                        <Icon name="magnifer-bug" tone="inherit" style={styles.sectionIcon} />
                        <h3 style={styles.sectionTitle}>Diagnosis</h3>
                      </div>
                      <PopoverMenu
                        trigger={<Icon name="menu" size={24} tone="inherit" style={styles.reorderHandle} />}
                        items={[{ label: "Save as template", onClick: () => openTemplates("save", "diagnosis") }]}
                        ariaLabel="Template options"
                      />
                    </div>
                    <div style={styles.noteCardField}>
                      <AutocompleteTags
                        field="diagnosis"
                        value={splitTags(diagnosisValue)}
                        onChange={(next) => setDiagnosisValue(next.join(", "))}
                        placeholder="Type here..."
                        ariaLabel="Diagnosis"
                        containerStyle={NOTE_CARD_TAGBOX_STYLE}
                      />
                      <span style={styles.noteCardDictate}>
                        <IconButton
                          ariaLabel="Copy diagnosis from previous visit"
                          size={28}
                          disabled={!prevVisit?.diagnosis || !canEditForm}
                          onClick={() => prevVisit?.diagnosis && setDiagnosisValue(prevVisit.diagnosis)}
                        >
                          <Icon name="rewind-back-circle" size={20} tone="inherit" />
                        </IconButton>
                        <IconButton ariaLabel="Load template" size={28} onClick={() => openTemplates("load", "diagnosis")}>
                          <Icon name="microphone" size={20} tone="inherit" />
                        </IconButton>
                                              </span>
                    </div>
                  </div>
                </div>

                {/* Prescription table */}
                <div style={styles.sectionCard}>
                  <div style={styles.sectionHeader}>
                    <div style={styles.sectionTitleWrap}>
                      <Icon name="pills" tone="inherit" style={styles.sectionIcon} />
                      <h3 style={styles.sectionTitle}>Rx</h3>
                    </div>
                    <button
                      type="button"
                      style={styles.sectionToggle}
                      onClick={() => toggleSection("rx")}
                      aria-label={openSections.rx ? "Collapse Rx" : "Expand Rx"}
                    >
                      <Icon
                        name="chevron-up"
                        tone="inherit"
                        style={{
                          ...styles.sectionIcon,
                          transform: openSections.rx ? "rotate(0deg)" : "rotate(180deg)",
                          transition: "transform 0.15s ease",
                        }}
                      />
                    </button>
                  </div>
                  {openSections.rx && (
                    <div style={styles.rxTable}>
                      {rxInteractions.length > 0 && (
                        <div style={styles.rxInteractionBanner}>
                          {rxInteractions.map((w, i) => (
                            <div key={i} style={styles.rxInteractionRow}>
                              <span style={styles.rxInteractionIcon}>⚠</span>
                              <span style={styles.rxInteractionText}>
                                <strong style={{ textTransform: "capitalize" }}>{w.drug}</strong>
                                {" + "}
                                <strong style={{ textTransform: "capitalize" }}>{w.interactsWith}</strong>
                                {w.comment ? `: ${w.comment}` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {rxRows.map((row, i) => {
                        const updateField = (key: keyof RxRowDraft, value: string) =>
                          setRxRows((prev) => prev.map((r, ix) => (ix === i ? { ...r, [key]: value } : r)));
                        return (
                          <div key={row.id ?? `draft-${i}`} style={{ ...styles.rxGroup, zIndex: rxRows.length + 5 - i }}>
                            {/* Left: serial + medicine cell — visually anchors for all tapering rows */}
                            <div style={styles.rxGroupLeft}>
                              <span style={styles.rxSerial}>{i + 1}</span>
                              <div style={{ ...styles.rxMedicineCell, flex: 1, position: "relative" }}>
                                <div style={styles.rxMedicineInputCol}>
                                  <MedicineAutocomplete
                                    inputStyle={styles.rxMedicineInput}
                                    placeholder="Medicine"
                                    value={row.medicine}
                                    onChange={(v) => { setRxRows((prev) => withTrailingRx(prev.map((r, ix) => ix === i ? { ...r, medicine: v, genericName: "" } : r))); autofillRxFromHistory(i, v); }}
                                    onSelect={(name, genericName) => { setRxRows((prev) => withTrailingRx(prev.map((r, ix) => ix === i ? { ...r, medicine: name, genericName } : r))); autofillRxFromHistory(i, name); }}
                                  />
                                </div>
                                {row.medicine.trim() && (
                                  <input
                                    type="text"
                                    style={{
                                      ...styles.rxGenericName,
                                      position: "absolute",
                                      left: spacing.s,
                                      top: "calc(100% + 2px)",
                                      width: "auto",
                                      right: 8,
                                    }}
                                    placeholder="Unknown"
                                    value={row.genericName}
                                    onChange={(e) => updateField("genericName", e.target.value)}
                                  />
                                )}
                                <div style={styles.rxGenericRow}>
                                  <button
                                    type="button"
                                    style={styles.rxAddNoteBtn}
                                    title="Add tapering dose"
                                    onClick={() => addThenRow(i)}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                      <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                            {/* Right: stacked tapering rows */}
                            <div style={styles.rxGroupRight}>
                              <div style={styles.rxDataRow}>
                                <div style={styles.rxDataCell}><FrequencyPicker value={row.frequency} onChange={(v) => updateField("frequency", v)} /></div>
                                <div style={styles.rxDataCell}><WhenPicker value={row.whenToTake} onChange={(v) => updateField("whenToTake", v)} /></div>
                                <div style={styles.rxDataCell}><FrequencyIntervalPicker value={row.frequencyInterval} onChange={(v) => updateField("frequencyInterval", v)} /></div>
                                <div style={styles.rxDataCell}><DurationPicker value={row.duration} onChange={(v) => updateField("duration", v)} /></div>
                                <input style={{ ...styles.rxCell, flex: 1, minWidth: 0 }} placeholder="Notes" value={row.notes} onChange={(e) => updateField("notes", e.target.value)} />
                                {row.medicine.trim() && (
                                  <button type="button" style={styles.rxDeleteBtn} onClick={() => removeRxRow(i)} title="Remove medicine">
                                    <Icon name="trash" size={16} tone="inherit" />
                                  </button>
                                )}
                              </div>
                              {row.thenRows.map((thenRow, ti) => (
                                <div key={`then-${i}-${ti}`} style={styles.rxDataRow}>
                                  <div style={styles.rxDataCell}><FrequencyPicker value={thenRow.frequency} onChange={(v) => updateThenField(i, ti, "frequency", v)} /></div>
                                  <div style={styles.rxDataCell}><WhenPicker value={thenRow.whenToTake} onChange={(v) => updateThenField(i, ti, "whenToTake", v)} /></div>
                                  <div style={styles.rxDataCell}><FrequencyIntervalPicker value={thenRow.frequencyInterval} onChange={(v) => updateThenField(i, ti, "frequencyInterval", v)} /></div>
                                  <div style={styles.rxDataCell}><DurationPicker value={thenRow.duration} onChange={(v) => updateThenField(i, ti, "duration", v)} /></div>
                                  <input style={{ ...styles.rxCell, flex: 1, minWidth: 0 }} placeholder="Notes" value={thenRow.notes} onChange={(e) => updateThenField(i, ti, "notes", e.target.value)} />
                                  <button type="button" style={styles.rxDeleteBtn} onClick={() => removeThenRow(i, ti)} title="Remove tapering row">
                                    <Icon name="trash" size={16} tone="inherit" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {/* Rx-level actions row — copy from previous visit, load /
                          save template. (Adding a row is now the trailing empty
                          row: type a medicine and the next empty appears.) */}
                      <div style={styles.addMedicineRow}>
                        <span style={styles.dictateIcons}>
                          <IconButton
                            ariaLabel="Copy Rx from previous visit"
                            size={28}
                            disabled={!prevVisit?.prescriptions?.length || !canEditForm}
                            onClick={() => {
                              if (prevVisit?.prescriptions?.length) {
                                setRxRows(withTrailingRx(prevVisit.prescriptions.map((dto, i) => ({ ...fromRxDTO(dto), id: null, position: i + 1 }))));
                              }
                            }}
                          >
                            <Icon name="rewind-back-circle" size={20} tone="inherit" />
                          </IconButton>
                          <IconButton ariaLabel="Load template" size={28} onClick={() => openTemplates("load", "rx")}>
                            <Icon name="microphone" size={20} tone="inherit" />
                          </IconButton>
                                                  </span>
                        <PopoverMenu
                        trigger={<Icon name="menu" size={20} tone="inherit" style={styles.reorderHandle} />}
                        items={[{ label: "Save as template", onClick: () => openTemplates("save", "rx") }]}
                        ariaLabel="Template options"
                      />
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes for Patient + Private Notes — same card pattern as
              Complaints/Diagnosis, but Private Notes uses a neutral grey fill
              to visually separate "patient-facing" from "internal" notes. */}
                <div style={styles.noteCardsRow}>
                  <div style={styles.noteCard}>
                    <div style={styles.noteCardHeader}>
                      <div style={styles.sectionTitleWrap}>
                        <Icon name="document-school" tone="inherit" style={styles.sectionIcon} />
                        <h3 style={styles.sectionTitle}>Notes for Patient</h3>
                      </div>
                      <PopoverMenu
                        trigger={<Icon name="menu" size={20} tone="inherit" style={styles.reorderHandle} />}
                        items={[{ label: "Save as template", onClick: () => openTemplates("save", "notes_for_patient") }]}
                        ariaLabel="Template options"
                      />
                    </div>
                    <div style={styles.noteCardField}>
                      <textarea
                        style={styles.noteCardTextarea}
                        placeholder="Type here..."
                        value={notesForPatientValue}
                        onChange={(e) => setNotesForPatientValue(e.target.value)}
                      />
                      <span style={styles.noteCardDictate}>
                        <IconButton
                          ariaLabel="Copy notes from previous visit"
                          size={28}
                          disabled={!prevVisit?.notesForPatient || !canEditForm}
                          onClick={() => prevVisit?.notesForPatient && setNotesForPatientValue(prevVisit.notesForPatient)}
                        >
                          <Icon name="rewind-back-circle" size={20} tone="inherit" />
                        </IconButton>
                        <IconButton ariaLabel="Load template" size={28} onClick={() => openTemplates("load", "notes_for_patient")}>
                          <Icon name="microphone" size={20} tone="inherit" />
                        </IconButton>
                                              </span>
                    </div>
                  </div>
                  <div style={{ ...styles.noteCard, ...styles.noteCardPrivate }}>
                    <div style={styles.noteCardHeader}>
                      <div style={styles.sectionTitleWrap}>
                        <Icon name="users-group-rounded" tone="inherit" style={styles.sectionIcon} />
                        <h3 style={styles.sectionTitle}>Private Notes</h3>
                      </div>
                      <PopoverMenu
                        trigger={<Icon name="menu" size={20} tone="inherit" style={styles.reorderHandle} />}
                        items={[{ label: "Save as template", onClick: () => openTemplates("save", "private_notes") }]}
                        ariaLabel="Template options"
                      />
                    </div>
                    <div style={{ ...styles.noteCardField, ...styles.noteCardFieldPrivate }}>
                      <textarea
                        style={styles.noteCardTextarea}
                        placeholder="Type here..."
                        value={privateNotesValue}
                        onChange={(e) => setPrivateNotesValue(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom rows — Figma node 2057:6494 */}
                <div style={styles.bottomRows}>
                  {/* Tests — dictatable with mic/rewind */}
                  <div style={styles.noteRow}>
                    <div style={styles.noteLabel}>
                      <Icon name="document-school" tone="inherit" style={styles.sectionIcon} />
                      <span style={styles.noteLabelText}>Tests</span>
                    </div>
                    <div style={styles.noteFieldWrap}>
                      <AutocompleteTags
                        field="tests"
                        value={splitTags(testsValue)}
                        onChange={(next) => setTestsValue(next.join(", "))}
                        placeholder="Add tests..."
                        ariaLabel="Tests"
                        containerStyle={TESTS_TAGBOX_STYLE}
                      />
                      <span style={styles.dictateIcons}>
                        <IconButton
                          ariaLabel="Copy tests from previous visit"
                          size={28}
                          disabled={!prevVisit?.tests || !canEditForm}
                          onClick={() => prevVisit?.tests && setTestsValue(prevVisit.tests)}
                        >
                          <Icon name="rewind-back-circle" size={20} tone="inherit" />
                        </IconButton>
                        <IconButton ariaLabel="Load template" size={28} onClick={() => openTemplates("load", "tests")}>
                          <Icon name="microphone" size={20} tone="inherit" />
                        </IconButton>
                                              </span>
                    </div>
                    <PopoverMenu
                        trigger={<Icon name="menu" size={20} tone="inherit" style={styles.reorderHandle} />}
                        items={[{ label: "Save as template", onClick: () => openTemplates("save", "tests") }]}
                        ariaLabel="Template options"
                      />
                  </div>
                  {/* Refer to — dropdown of doctors in the current clinic
                (fetched from /api/doctors, which filters by the caller's
                clinicId via the JWT). Click the pill to open; selecting a
                doctor sets referDoctorId and closes the menu. */}
                  <div style={styles.noteRow}>
                    <div style={styles.noteLabel}>
                      <Icon name="users-group-rounded" tone="inherit" style={styles.sectionIcon} />
                      <span style={styles.noteLabelText}>Refer to</span>
                    </div>
                    <div ref={referWrapRef} style={{ position: "relative" }}>
                      <div
                        style={styles.referDropdown}
                        onClick={() => setReferOpen((v) => !v)}
                        role="button"
                        aria-haspopup="listbox"
                        aria-expanded={referOpen}
                      >
                        <span
                          style={{
                            ...styles.referText,
                            ...(referDoctorName ? { color: colors.neutral900 } : {}),
                          }}
                        >
                          {referDoctorName || "Select doctor"}
                        </span>
                        <span style={styles.referChevron}>
                          <Icon
                            name="chevron-up"
                            size={16}
                            tone="inherit"
                            style={{ transform: referOpen ? "rotate(0deg)" : "rotate(180deg)" }}
                          />
                        </span>
                      </div>
                      {referOpen && (() => {
                        // Hide the doctor who's already treating this visit
                        // — referring to yourself isn't a referral.
                        const referableDoctors = doctors.filter((d) => d.id !== appointmentDoctorId);
                        return (
                          <div style={styles.referMenu}>
                            {referableDoctors.length === 0 ? (
                              <div style={styles.referMenuEmpty}>No other doctors in this clinic</div>
                            ) : (
                              referableDoctors.map((d) => (
                                <button
                                  key={d.id}
                                  type="button"
                                  style={styles.referMenuItem}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setReferDoctorId(d.id);
                                    setReferOpen(false);
                                    setDirty(true);
                                  }}
                                >
                                  <span style={styles.referMenuItemName}>{d.name}</span>
                                  {(d.specialty || d.department) && (
                                    <span style={styles.referMenuItemMeta}>{d.specialty || d.department}</span>
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  {/* Next Review — date picker + "or ___ days" + notes field */}
                  <div style={styles.noteRow}>
                    <div style={styles.noteLabel}>
                      <Icon name="restart" tone="inherit" style={styles.sectionIcon} />
                      <span style={styles.noteLabelText}>Review</span>
                    </div>
                    <div style={styles.reviewRow}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div
                          style={styles.reviewDate}
                          onClick={() => setShowReviewDatePicker((v) => !v)}
                        >
                          <Icon name="calendar" size={24} tone="inherit" />
                          <span
                            style={{
                              ...styles.reviewDateText,
                              color: reviewDate ? "inherit" : styles.reviewDateText.color,
                            }}
                          >
                            {reviewDate ? formatReviewDate(reviewDate) : "Select Date"}
                          </span>
                        </div>
                        {showReviewDatePicker && (
                          <DatePicker
                            selectedDate={reviewDate ?? new Date()}
                            onSelect={pickReviewDate}
                            onClose={() => setShowReviewDatePicker(false)}
                            disablePast
                          />
                        )}
                      </div>
                      <span style={styles.reviewOr}>or</span>
                      <div style={styles.reviewDaysWrap}>
                        <input
                          style={styles.reviewDaysInput}
                          value={reviewDays}
                          onChange={(e) => changeReviewDays(e.target.value)}
                          inputMode="numeric"
                          placeholder=""
                        />
                        <span style={styles.reviewDaysLabel}>days</span>
                      </div>
                      <input
                        style={styles.reviewLong}
                        placeholder="Notes for Review..."
                        value={reviewNotesValue}
                        onChange={(e) => setReviewNotesValue(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
      <Toast message={toast.message} {...resolveToastIcon(toast.message)} isVisible={toast.visible} onClose={closeToast} />

      {/* Prescription templates — save the current Rx + clinical fields under a
          name, or load a saved one to auto-fill. Clinic-shared (backend). */}
      <Modal isOpen={showTemplates} onClose={() => setShowTemplates(false)}>
        <div style={tplStyles.container}>
          <header style={tplStyles.header}>
            <div>
              <h2 style={tplStyles.title}>
                {templatesMode === "save" ? "Save as template" : "Load template"}
              </h2>
              <p style={tplStyles.subtitle}>
                {templatesMode === "save"
                  ? "Name this prescription so you can reuse it later."
                  : "Pick a saved template to auto-fill the prescription."}
              </p>
            </div>
            <IconButton ariaLabel="Close" onClick={() => setShowTemplates(false)} />
          </header>

          {templatesMode === "save" ? (
            <div style={tplStyles.saveRow}>
              <input
                style={tplStyles.input}
                placeholder="Template Name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveTemplate(); }}
                autoFocus
              />
              <button type="button" style={tplStyles.saveBtn} onClick={handleSaveTemplate} disabled={templatesBusy}>
                Save
              </button>
            </div>
          ) : (
            <div style={tplStyles.list}>
              {savedTemplates.length === 0 ? (
                <p style={tplStyles.empty}>No saved templates yet.</p>
              ) : (
                savedTemplates.map((t) => (
                  <div key={t.name} style={tplStyles.item}>
                    <button type="button" style={tplStyles.itemName} onClick={() => handleLoadTemplate(t)} title="Load this template">
                      {t.name}
                    </button>
                    <button type="button" style={tplStyles.itemDelete} onClick={() => handleDeleteTemplate(t.name)} disabled={templatesBusy} title="Delete template">
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Move-to-today confirmation — fires when the doctor edits an OLD,
          still-in-progress visit. Continuing relocates the visit's data to a
          fresh visit dated today and removes the stale one; cancelling
          discards the edit and leaves the old visit untouched. */}
      <Modal isOpen={moveToTodayDate != null} onClose={cancelMoveToToday}>
        <div style={moveStyles.container}>
          <h2 style={moveStyles.title}>Move this visit to today?</h2>
          <p style={moveStyles.body}>
            Visit data of <strong>{moveToTodayDate ? formatVisitLabel(moveToTodayDate) : ""}</strong>{" "}
            will be moved to today&rsquo;s date.
          </p>
          <p style={moveStyles.body}>
            The {moveToTodayDate ? formatVisitLabel(moveToTodayDate) : ""} visit entry will be removed.
          </p>
          <p style={moveStyles.bodyMuted}>Do you want to continue?</p>
          <div style={moveStyles.actions}>
            <Button variant="light" size="sm" onClick={cancelMoveToToday} disabled={saving}>
              Cancel
            </Button>
            <Button variant="secondary" size="sm" onClick={moveToToday} disabled={saving}>
              {saving ? "Moving…" : "Continue"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Floating bottom bar — the ACTIVE SECTION'S actions. Section nav
          + contact actions moved up to the sticky header; this bar now adapts
          to which section is open. Output actions (Download / Print / Share)
          group on the left; the destructive Clear all is set apart behind a
          divider. Coming-soon sections (Timeline / Bills) render no bar. */}
      {activeAction <= 1 && (
        <div style={styles.bottomBar}>
          {activeAction === 0 ? (
            <>
              {/* Complete visit / Save changes — on any EDITABLE visit (today /
                  within 24h, or an open in-progress session). canEditForm
                  hard-locks visits past their 24h window, so a historic visit
                  shows no button. The label is driven by the ACTIVE VISIT's own
                  completion state (its appointment status, or — for a visit with
                  no appointment — whether its session is ended), never the entry
                  appointment, so a completed tab can't show a bogus "Complete
                  visit". Before completion: "Complete visit". After: hidden
                  until an edit, then "Save changes" — which STAYS visible once
                  the visit has been touched (even after the silent blur
                  auto-save clears `dirty`), so it doesn't vanish when the doctor
                  clicks outside a field. Clear all stays throughout the 24h
                  window. */}
              {canEditForm
                && (() => {
                const completed = activeCompleted;
                // Hide only on a completed visit that's untouched since the tab
                // opened. editedSinceLoadRef survives the auto-save (unlike
                // `dirty`) and resets on tab switch / completion, so once the
                // doctor edits, "Save changes" persists until they leave.
                if (completed && !dirty && !editedSinceLoadRef.current) return null;
                return (
                  <button
                    type="button"
                    style={{ ...styles.barBtn, backgroundColor: colors.red100, color: colors.neutral100 }}
                    // onMouseDown + preventDefault so the handler runs BEFORE the
                    // focused field blurs — otherwise the blur fires a silent
                    // auto-save that clears the dirty flag and hides this button
                    // before the click lands (the "no toast" bug).
                    onMouseDown={(e) => { e.preventDefault(); void handleCompleteVisit(); }}
                  >
                    <Icon name="check" size={18} tone="inherit" />
                    <span>{completed ? "Save changes" : "Complete visit"}</span>
                  </button>
                );
              })()}
              {/* Language selector — picks the printed/shared prescription
                  language. Compact Select sized to match the bar buttons. */}
              <div style={{ width: 128, "--input-h": "36px" } as React.CSSProperties}>
                <Select options={["English", "Hindi", "Telugu", "Tamil", "Kannada"]} value={language} onChange={setLanguage} />
              </div>
              <button type="button" style={styles.barBtn} onClick={() => handlePrintPrescription("download")}>
                <Icon name="download" size={18} tone="inherit" />
                <span>Download</span>
              </button>
              <button type="button" style={styles.barBtn} onClick={() => handlePrintPrescription("print")}>
                <Icon name="printer" size={18} tone="inherit" />
                <span>Print</span>
              </button>
              <button type="button" style={styles.barBtn} onClick={handleShareWhatsApp}>
                <Icon name="share" size={18} tone="inherit" />
                <span>Share</span>
              </button>
              {/* Clear all wipes the prescription — available the whole time a
                  visit is editable (today / within its 24h window), whether or
                  not it's been completed. It disappears only when the visit
                  hard-locks (date past 24h). The green Complete/Save button is
                  what toggles with completion; Clear all stays put. */}
              {canEditForm && (
                <>
                  <div style={styles.barDivider} aria-hidden />
                  <button type="button" style={{ ...styles.barBtn, ...styles.barBtnDanger }} onClick={handleClearAll}>
                    <Icon name="trash" size={18} tone="inherit" />
                    <span>Clear all</span>
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button type="button" style={styles.barBtn} onClick={() => setShowAddModal(true)}>
                <Icon name="file" size={18} tone="inherit" />
                <span>Add file</span>
              </button>
              <button type="button" style={styles.barBtn} onClick={handleDownloadAllFiles}>
                <Icon name="download" size={18} tone="inherit" />
                <span>Download all</span>
              </button>
            </>
          )}
        </div>
      )}

      {showAiSummary && (
        <>
          <div style={styles.aiPopoverBackdrop} onClick={() => setShowAiSummary(false)} />
          <div style={styles.aiPopover} role="dialog" aria-label="AI Summary">
            <h4 style={styles.aiSummaryTitle}>AI Summary</h4>
            {aiConfigured === false ? (
              <p style={styles.aiSummaryBody}>AI is not configured for this clinic.</p>
            ) : aiError ? (
              <p style={styles.aiSummaryBody}>{aiError}</p>
            ) : aiGenerating && !aiSummary ? (
              <p style={styles.aiSummaryBody}>Generating…</p>
            ) : aiSummary?.summary ? (
              <>
                <p style={styles.aiSummaryBody}>{aiSummary.summary}</p>
                {aiSummary.activeConditions.length > 0 && (
                  <p style={styles.aiSummaryBody}><strong>Active conditions:</strong> {aiSummary.activeConditions.join(", ")}</p>
                )}
                {aiSummary.allergies.length > 0 && (
                  <p style={styles.aiSummaryBody}><strong>Allergies:</strong> {aiSummary.allergies.join(", ")}</p>
                )}
                {aiSummary.riskFlags.length > 0 && (
                  <p style={styles.aiSummaryBody}><strong>Risk flags:</strong> {aiSummary.riskFlags.join(", ")}</p>
                )}
                {aiSummary.lastVisitGist && (
                  <p style={styles.aiSummaryBody}><strong>Last visit:</strong> {aiSummary.lastVisitGist}</p>
                )}
                {aiStale && <p style={styles.aiSummaryStale}>New visits since this summary — regenerate for the latest.</p>}
              </>
            ) : (
              <p style={styles.aiSummaryBody}>No summary yet for this patient.</p>
            )}
            {aiConfigured !== false && (
              <button type="button" style={styles.aiGenerateBtn} onClick={handleGenerateSummary} disabled={aiGenerating}>
                {aiGenerating ? "Generating…" : aiSummary?.summary ? "Regenerate" : "Generate"}
              </button>
            )}
          </div>
        </>
      )}

      {/* Add File modal. Drag-drop or click-to-choose, multi-file, per-file
          metadata (name, category, investigation date, tie-to-visit, notes).
          One unified flow now that Reports + Files are a single tab. */}
      <AddReportModal
        isOpen={showAddModal}
        visits={visits}
        defaultVisitId={activeVisit?.id ?? null}
        patientId={selectedPatientId}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddRows}
      />

      <EditPatientModal
        isOpen={showEditPatient}
        patient={selectedPatient}
        onClose={() => setShowEditPatient(false)}
        onSave={(updated) => {
          if (selectedPatient) setSelectedPatient({ ...selectedPatient, ...updated });
        }}
        onSaved={() => showToast("Patient info saved")}
        onArchived={() => {
          showToast("Patient archived");
          // Drop the now-hidden patient from local selection so the queue
          // re-fetches a fresh active-only list on next mount.
          setSelectedPatient(null);
        }}
        onError={(msg) => showToast(msg)}
      />

      {/* File viewer modal — opens when a row in the Files list is clicked.
          Shows the file with the annotation toolbar; close × dismisses.
          For server-only files (fileUrl null, fileId set) the viewer shows
          a download button; FileViewer fetches bytes lazily if needed. */}
      <Modal isOpen={viewerOpen !== null} onClose={() => setViewerOpen(null)} surface="transparent" padding={0} shadow="none">
        {viewerOpen && (
          <FileViewer
            file={{
              id: viewerOpen.id ?? viewerOpen.fileId ?? "file",
              name: viewerOpen.name,
              fileUrl: viewerOpen.fileUrl
                ? viewerOpen.fileUrl
                : viewerOpen.fileId && selectedPatientId
                  ? `${API_BASE_URL}/api/patients/${selectedPatientId}/files/${viewerOpen.fileId}/download`
                  : null,
              mimeType: viewerOpen.mimeType ?? null,
            }}
            onBack={() => setViewerOpen(null)}
          />
        )}
      </Modal>

      {/* Slot picker — patient has 2+ appointments today and was opened
          without a specific one. Asks which slot this consultation is for. */}
      <Modal
        isOpen={!!slotOptions}
        onClose={() => setSlotOptions(null)}
        surface={colors.primary100}
        width={460}
      >
        <div style={slotPickerStyles.card}>
          <h3 style={slotPickerStyles.title}>Choose an appointment slot</h3>
          <p style={slotPickerStyles.sub}>
            {selectedPatient?.name ?? "This patient"} has more than one appointment
            today. Pick the slot you're starting this consultation for.
          </p>
          <div style={slotPickerStyles.slots}>
            {(slotOptions ?? []).map((a) => (
              <button
                key={a.id}
                type="button"
                style={slotPickerStyles.slotBtn}
                onClick={() => chooseSlot(a)}
              >
                {formatSlot(a.scheduledTime)}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

// "25 May 2026 at 10:05 PM" for the appointment-slot picker.
function formatSlot(iso: string | null): string {
  if (!iso) return "Appointment";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Appointment";
  const datePart = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timePart = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${datePart} at ${timePart}`;
}

const slotPickerStyles: Record<string, React.CSSProperties> = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h6,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  sub: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral600,
    lineHeight: 1.5,
  },
  slots: {
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.s,
    justifyContent: "center",
    marginTop: spacing.s,
  },
  slotBtn: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.primary300}`,
    borderRadius: radii.full,
    padding: "10px 20px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};

