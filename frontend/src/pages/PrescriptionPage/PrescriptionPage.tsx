import React from "react";
import { styles } from "./PrescriptionPage.styles";
import { pickAvatar } from "../../utils/avatar";
// Action-list icons exported from Figma node 2059:6764 (currentColor-normalized)
import { ReactComponent as VisitsIcon } from "../../assets/icons/visits.svg";
import { ReactComponent as PulseIcon } from "../../assets/icons/pulse.svg";
import { ReactComponent as FileIcon } from "../../assets/icons/file.svg";
import { ReactComponent as HistoryIcon } from "../../assets/icons/history.svg";
import { ReactComponent as BillCheckIcon } from "../../assets/icons/bill-check-small.svg";
// Contact-card icons exported from Figma node 2073:3264 (currentColor-normalized)
import { ReactComponent as LetterIcon } from "../../assets/icons/letter.svg";
import { ReactComponent as VideocameraIcon } from "../../assets/icons/videocamera.svg";
import { ReactComponent as PenIcon } from "../../assets/icons/pen.svg";
// Main content section icons exported from Figma node 2057:6283
import { ReactComponent as HeartPulseIcon } from "../../assets/icons/heart-pulse.svg";
import { ReactComponent as HourglassIcon } from "../../assets/icons/hourglass-line.svg";
import { ReactComponent as ChatSquareCallIcon } from "../../assets/icons/chat-square-call.svg";
import { ReactComponent as MagniferBugIcon } from "../../assets/icons/magnifer-bug.svg";
import { ReactComponent as PillsIcon } from "../../assets/icons/pills.svg";
import { ReactComponent as DocumentIcon } from "../../assets/icons/document-school.svg";
import { ReactComponent as UsersIcon } from "../../assets/icons/users-group-rounded.svg";
import { ReactComponent as RestartIcon } from "../../assets/icons/restart-24.svg";
import { ReactComponent as ChevronIcon } from "../../assets/icons/chevron-up.svg";
import { ReactComponent as MicIcon } from "../../assets/icons/microphone.svg";
import { ReactComponent as RewindIcon } from "../../assets/icons/rewind-back-circle.svg";
import { ReactComponent as ArrowLeftIcon } from "../../assets/icons/arrow-left.svg";
import { ReactComponent as CalendarIcon } from "../../assets/icons/calendar.svg";
import { ReactComponent as ReorderIcon } from "../../assets/icons/reorder.svg";
import { ReactComponent as TuningIcon } from "../../assets/icons/tuning.svg";
import { ReactComponent as DownloadIcon } from "../../assets/icons/download.svg";
import { ReactComponent as ListSortIcon } from "../../assets/icons/list-sort.svg";
import { ReactComponent as WidgetIcon } from "../../assets/icons/widget.svg";
import { DatePicker } from "../../components/AppointmentQueue/DatePicker";
import { PopoverMenu } from "../../components/PopoverMenu/PopoverMenu";
import { Toast } from "../../components/Toast";
import { Autocomplete } from "../../components/Autocomplete/Autocomplete";
import { MedicineAutocomplete } from "../../components/MedicineAutocomplete/MedicineAutocomplete";
import { FrequencyPicker } from "../../components/FrequencyPicker/FrequencyPicker";
import { WhenPicker } from "../../components/WhenPicker/WhenPicker";
import { DosagePicker } from "../../components/DosagePicker/DosagePicker";
import { DurationPicker } from "../../components/DurationPicker/DurationPicker";
import { AutocompleteTags } from "../../components/Autocomplete/AutocompleteTags";
import { useDoctors } from "../../hooks/useDoctors";
import { colors } from "../../styles/theme";
import { PrescriptionQueue } from "./PrescriptionQueue";
import { Patient } from "../../hooks/usePatients";
import { SessionBar } from "../../components/SessionBar/SessionBar";
import {
  recordActiveSession,
  clearActiveSession,
  consumePendingSessionNav,
  type PendingSessionNav,
} from "../../components/TopNav/SessionTrayButton";
import { useVisits } from "../../hooks/useVisits";
import { createVisit, updateVisit, RxRowDTO, SaveVisitRequest, VisitDTO } from "../../api/visits";
import { markStarted, unmarkStarted } from "../../utils/sessionStarted";
import { API_BASE_URL } from "../../apiConfig";

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
  [
    { label: "Hip", unit: "cm", unitWidth: 44 },
  ],
];

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

// Figma node 2057:6381 — Rx table columns. Medicine flex-grows, Notes fills remainder.
const RX_COLUMNS = ["#", "Medicine", "Dosage", "When", "Frequency", "Duration", "Notes"];

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
type ThenRow = { dosage: string; whenToTake: string; frequency: string; duration: string; notes: string };
const blankThenRow = (): ThenRow => ({ dosage: "", whenToTake: "", frequency: "", duration: "", notes: "" });

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
  duration: "",
  notes: "",
  thenRows: [],
});

const fromRxDTO = (dto: RxRowDTO): RxRowDraft => ({
  id: dto.id ?? null,
  position: dto.position,
  medicine: dto.medicine ?? "",
  genericName: "",
  medicineNote: dto.medicineNote ?? "",
  dosage: dto.dosage ?? "",
  whenToTake: dto.whenToTake ?? "",
  frequency: dto.frequency ?? "",
  duration: dto.duration ?? "",
  notes: dto.notes ?? "",
  thenRows: [],
});

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

// Format the secondary line of the patient identity card. Shape:
// "(M|25)  9876543210" — gender shortened to M/F if needed; phone trailing.
// Falls back gracefully when fields are missing.
const formatPatientMeta = (
  p: { gender: string | null; age: number | null; phone: string | null } | null
): string => {
  if (!p) return "";
  const genderShort = (() => {
    if (!p.gender) return "";
    const g = p.gender.trim().toLowerCase();
    if (g.startsWith("m")) return "M";
    if (g.startsWith("f")) return "F";
    return p.gender;
  })();
  const ageStr = p.age != null ? String(p.age) : "";
  const head = genderShort || ageStr ? `(${[genderShort, ageStr].filter(Boolean).join("|")})` : "";
  return [head, p.phone ?? ""].filter(Boolean).join("  ");
};

// Figma node 2059:6764 — patient-context action list.
// "Visits" renders active by default; count badges are circular.
// Icons are the exact Linear set from the Figma design, normalized to
// currentColor so they flip between dark/white with the row's active state.
// Static action metadata (icon + label). Counts are computed dynamically
// inside the component from real data sources, not hardcoded here.
type ActionMeta = { icon: React.ReactNode; label: string };
const ACTION_META: ActionMeta[] = [
  { icon: <VisitsIcon style={styles.actionIcon} />, label: "Visits" },
  { icon: <PulseIcon style={styles.actionIcon} />, label: "Reports" },
  { icon: <FileIcon style={styles.actionIcon} />, label: "Files" },
  { icon: <HistoryIcon style={styles.actionIcon} />, label: "Timeline" },
  { icon: <BillCheckIcon style={styles.actionIcon} />, label: "Bills" },
];

// Figma node 2073:3264 — contact/edit card. Three rows, no active state.
const CONTACT_ACTIONS: { icon: React.ReactNode; label: string }[] = [
  { icon: <LetterIcon style={styles.actionIcon} />, label: "Email Patient" },
  { icon: <VideocameraIcon style={styles.actionIcon} />, label: "Video Call Patient" },
  { icon: <PenIcon style={styles.actionIcon} />, label: "Edit Patient Info" },
];

// Figma node 2143:10730 — Reports view, swapped in when "Reports" is active.
// AI Summary copy comes from the backend per-patient — left blank until wired.
// TODO(backend): replace with `useAiSummary(patientId).text`.
const AI_SUMMARY_TEXT = "";

// List-view config — Reports (action 1) and Files (action 2) render the same
// table/grid layout with their own header copy, tabs, and rows. Tab metadata
// stays static; `rows` comes from the backend per-patient.
// TODO(backend): replace empty `rows` arrays with fetched data, e.g.
//   const { data: reports } = useReports(patientId);
//   const { data: files }   = useFiles(patientId);
type ListViewConfig = {
  title: string;
  subtitle: string;
  addLabel: string;
  nameColumn: string;
  tabs: readonly string[];
  rows: { name: string; category: string; date: string }[];
};
const LIST_VIEWS: Record<number, ListViewConfig> = {
  1: {
    title: "Reports",
    subtitle: "",
    addLabel: "Add Report",
    nameColumn: "Report name",
    tabs: ["All Reports", "Blood", "Pathology"],
    rows: [],
  },
  2: {
    title: "Files",
    subtitle: "",
    addLabel: "Add File",
    nameColumn: "File name",
    tabs: ["All Files", "Documents", "Images"],
    rows: [],
  },
};

// Two-input BP cell: systolic + fixed `/` + diastolic. Auto-advances focus
// to the diastolic input once the systolic input has 3 digits, or when the
// user explicitly types `/`. Validation styling is driven by parent state.
function BpInput({
  valid, sysValid, diaValid,
  sys, dia,
  onSysChange, onDiaChange, onEnter,
}: {
  valid: boolean;
  sysValid: boolean;
  diaValid: boolean;
  sys: string;
  dia: string;
  onSysChange: (v: string) => void;
  onDiaChange: (v: string) => void;
  onEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  const diaRef = React.useRef<HTMLInputElement>(null);
  const handleSysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    onSysChange(next);
    if (next.length >= 3) diaRef.current?.focus();
  };
  const handleSysKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "/") {
      e.preventDefault();
      diaRef.current?.focus();
      return;
    }
    onEnter(e);
  };
  return (
    <div
      style={{
        ...styles.bpSplitInput,
        ...(!valid ? styles.vitalInputValueInvalid : {}),
      }}
    >
      <input
        style={{ ...styles.bpHalfInput, ...(!sysValid ? styles.vitalInputInvalidText : {}) }}
        value={sys}
        onChange={handleSysChange}
        onKeyDown={handleSysKeyDown}
        inputMode="numeric"
        aria-label="Systolic"
        aria-invalid={!sysValid}
      />
      <span style={styles.bpSeparator}>/</span>
      <input
        ref={diaRef}
        style={{ ...styles.bpHalfInput, ...(!diaValid ? styles.vitalInputInvalidText : {}) }}
        value={dia}
        onChange={(e) => onDiaChange(e.target.value)}
        onKeyDown={onEnter}
        inputMode="numeric"
        aria-label="Diastolic"
        aria-invalid={!diaValid}
      />
    </div>
  );
}

export function PrescriptionPage() {
  // null → renders <PatientPicker>; otherwise renders the prescription form
  // scoped to that patient. Clicking "← back to patients" clears it.
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const selectedPatientId = selectedPatient?.id ?? null;
  // The appointment row the doctor clicked View Pad on. Needed so the
  // Start Session / End Session actions can update the appointment's
  // backend status without bouncing back to the queue.
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string | null>(null);

  // If the doctor clicked an entry in the header session-tray, route them
  // straight back to that patient's prescription form. Handled both on mount
  // (component wasn't rendered yet) and via a custom event (already mounted).
  React.useEffect(() => {
    const pending = consumePendingSessionNav();
    if (pending) {
      setSelectedPatient(pending.patient);
      setSelectedAppointmentId(pending.appointmentId);
    }
    const handler = (e: Event) => {
      const nav = (e as CustomEvent<PendingSessionNav>).detail;
      setSelectedPatient(nav.patient);
      setSelectedAppointmentId(nav.appointmentId);
    };
    window.addEventListener("docodile:session-nav", handler);
    return () => window.removeEventListener("docodile:session-nav", handler);
  }, []);
  // Visits for this patient. `useVisits(null)` returns []; switching to a
  // patient triggers the fetch.
  const { visits, loading: visitsLoading, loadedFor: visitsLoadedFor, refetch: refetchVisits } = useVisits(selectedPatientId);
  const [activeTab, setActiveTab] = React.useState(0);
  const [activeAction, setActiveAction] = React.useState(0);
  const activeVisit: VisitDTO | undefined = visits[activeTab];
  const [reviewDate, setReviewDate] = React.useState<Date | null>(null);
  const [showReviewDatePicker, setShowReviewDatePicker] = React.useState(false);
  const [rxRows, setRxRows] = React.useState<RxRowDraft[]>([]);
  const [rxInteractions, setRxInteractions] = React.useState<Array<{ drug: string; interactsWith: string; comment: string }>>([]);
  const [reviewDays, setReviewDays] = React.useState<string>("");
  // Vital values + units (units are clickable to toggle between alternates
  // like cm↔in, kg↔lb, °C↔°F, mmHg↔kPa).
  const [vitalState, setVitalState] =
    React.useState<Record<string, VitalCellState>>(() => buildVitalState(undefined));
  // History field values (Family History, Allergies, …). Controlled so the
  // <Autocomplete> dropdown can drive them. Reset on visit-tab change.
  const [historyValues, setHistoryValues] =
    React.useState<Record<string, string>>(() =>
      Object.fromEntries(HISTORY_FIELDS.map((f) => [f.field, ""]))
    );
  // Diagnosis + Complaints + Tests are also suggestion-driven
  // (specialty-scoped via the same API).
  const [diagnosisValue, setDiagnosisValue] = React.useState<string>("");
  const [complaintsValue, setComplaintsValue] = React.useState<string>("");
  const [testsValue, setTestsValue] = React.useState<string>("");
  // Notes-for-Patient + Private Notes + Review-Notes are now controlled too
  // so we can serialize them on Save.
  const [notesForPatientValue, setNotesForPatientValue] = React.useState<string>("");
  const [privateNotesValue, setPrivateNotesValue] = React.useState<string>("");
  const [reviewNotesValue, setReviewNotesValue] = React.useState<string>("");
  const [saving, setSaving] = React.useState<boolean>(false);
  // Form is non-interactive until the user clicks Start Session on the
  // floating SessionBar. Pausing / ending re-locks. Visually unchanged
  // while locked — only pointer-events are blocked.
  const [formActive, setFormActive] = React.useState<boolean>(false);
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
    setReviewDate(activeVisit?.reviewDate ? new Date(activeVisit.reviewDate) : null);
    setReviewDays(activeVisit?.reviewDays != null ? String(activeVisit.reviewDays) : "");
    setReviewNotesValue(activeVisit?.reviewNotes ?? "");

    // Build the new rows first so we can also resolve genericNames against
    // the same list — if we called setRxRows and then read rxRows in a
    // separate effect the second effect would still see the old state.
    const newRows =
      activeVisit?.prescriptions && activeVisit.prescriptions.length > 0
        ? activeVisit.prescriptions.map(fromRxDTO)
        : Array.from({ length: 5 }, (_, i) => blankRxRow(i + 1));
    setRxRows(newRows);

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
            setRxRows((prev) => prev.map((r, ix) => ix === i ? { ...r, genericName: gn } : r));
          })
          .catch(() => {});
      });
    }

    setShowReviewDatePicker(false);
    setVitalState(buildVitalState(activeVisit));
    setHistoryValues({
      family_history: activeVisit?.familyHistory ?? "",
      allergies: activeVisit?.allergies ?? "",
      personal_history: activeVisit?.personalHistory ?? "",
      past_medical_history: activeVisit?.pastMedicalHistory ?? "",
    });
    setDiagnosisValue(activeVisit?.diagnosis ?? "");
    setComplaintsValue(activeVisit?.complaints ?? "");
    setTestsValue(activeVisit?.tests ?? "");
    setNotesForPatientValue(activeVisit?.notesForPatient ?? "");
    setPrivateNotesValue(activeVisit?.privateNotes ?? "");
    setReferDoctorId(activeVisit?.referDoctorId ?? null);
    setReferOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeVisit?.id]);

  // Debounced auto-save whenever rxRows changes while a session is active.
  // Pickers (WhenPicker, FrequencyPicker) are div/button elements — they
  // never fire a blur that bubbles to the form wrapper, so relying solely
  // on handleFormBlur would silently drop every picker selection.
  // The ref holds the latest save function so the closure is never stale.
  const latestSaveRef = React.useRef<() => void>(() => {});
  latestSaveRef.current = () => {
    if (formActive && activeVisit) void handleSave({ silent: true });
  };
  React.useEffect(() => {
    if (!formActive) return;
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

  // Auto-create today's draft when the patient has zero visits, so the
  // form always has a row to write into. The ref-guard keeps React
  // StrictMode (which double-invokes effects in dev) from creating a
  // duplicate today-visit.
  const autoCreatedForPatientRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (
      selectedPatientId &&
      !visitsLoading &&
      // Only fire after a successful fetch has confirmed visits are empty
      // for THIS patient. Without this guard the initial render (visits=[],
      // loading=false) tricks the effect into POSTing a duplicate "today"
      // visit on every reopen.
      visitsLoadedFor === selectedPatientId &&
      visits.length === 0 &&
      autoCreatedForPatientRef.current !== selectedPatientId
    ) {
      autoCreatedForPatientRef.current = selectedPatientId;
      const draft: SaveVisitRequest = {
        visitDate: todayIso(),
        bpSystolic: null, bpDiastolic: null, bpUnit: null,
        bmi: null, bmiUnit: null, height: null, heightUnit: null,
        weight: null, weightUnit: null, temperature: null, temperatureUnit: null,
        pulse: null, pulseUnit: null, waist: null, waistUnit: null,
        hip: null, hipUnit: null, spo2: null, spo2Unit: null,
        familyHistory: null, allergies: null, personalHistory: null, pastMedicalHistory: null,
        complaints: null, diagnosis: null, notesForPatient: null, privateNotes: null, tests: null,
        referDoctorId: null,
        reviewDate: null, reviewDays: null, reviewNotes: null,
        sessionStartedAt: null, sessionEndedAt: null, sessionDurationSec: null,
        prescriptions: [],
      };
      void createVisit(selectedPatientId, draft).then(() => refetchVisits());
    }
  }, [selectedPatientId, visitsLoading, visitsLoadedFor, visits.length, refetchVisits]);
  // Reset the auto-create guard whenever the user picks a different patient
  // (or leaves and comes back to the same one).
  React.useEffect(() => {
    if (selectedPatientId === null) autoCreatedForPatientRef.current = null;
  }, [selectedPatientId]);

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

  const setVitalValue = (key: string, value: string) =>
    setVitalState((prev) => ({ ...prev, [key]: { ...prev[key], value } }));
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
  const toggleVitalUnit = (key: string) =>
    setVitalState((prev) => {
      const cell = prev[key];
      const toggle = UNIT_TOGGLES[cell.unit];
      if (!toggle) return prev;
      return { ...prev, [key]: { value: toggle.convert(cell.value), unit: toggle.altUnit } };
    });

  // List-view tab state — shared across Reports / Files. Defaults to the
  // first tab ("All Reports" / "All Files").
  const [activeListTab, setActiveListTab] = React.useState<number>(0);
  // Toggle between the table layout (default) and the card grid layout
  // (Figma node 2143:11610). Driven by the list/widget icons in the tabs row.
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");
  // Tuning button dropdown items — open/close + outside-click handling lives
  // inside <PopoverMenu>, so we just declare the actions here.
  const tuningMenuItems = [
    {
      label: "+ New Visit",
      onClick: () => void handleAddVisit(),
    },
    {
      label: "Clear all",
      onClick: () => {
        setVitalState(buildVitalState(undefined));
        setReviewDate(null);
        setReviewDays("");
        setReviewNotesValue("");
        setRxRows(Array.from({ length: 5 }, (_, i) => blankRxRow(i + 1)));
        setHistoryValues({
          family_history: "", allergies: "", personal_history: "", past_medical_history: "",
        });
        setDiagnosisValue("");
        setComplaintsValue("");
        setTestsValue("");
        setNotesForPatientValue("");
        setPrivateNotesValue("");
      },
    },
    {
      label: "Saved templates",
      onClick: () => {
        // TODO: open Saved Templates picker once the backend exists.
      },
    },
  ];

  // ── Header + right-area content driven by which left-rail action is active.
  // - activeAction 0 (Visits): default visits layout
  // - LIST_VIEWS entry (Reports / Files): table or grid list view
  // - Timeline / Bills: "coming soon" placeholder
  const listViewConfig = LIST_VIEWS[activeAction] ?? null;

  // Client-side uploads for the Reports / Files list views, keyed by
  // activeAction (1 = Reports, 2 = Files). Clicking the "+ Add" pill in the
  // page header opens a native file picker; selected files are appended to
  // this map so they show up immediately in the list/grid below.
  // TODO(backend): on upload, also POST the file to /reports or /files.
  type ListRow = { name: string; category: string; date: string };
  const [uploadedItems, setUploadedItems] = React.useState<Record<number, ListRow[]>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const openFilePicker = () => fileInputRef.current?.click();
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "2-digit",
    });
    const newRows: ListRow[] = files.map((f) => ({
      name: f.name,
      category: "Uploaded",
      date: today,
    }));
    setUploadedItems((prev) => ({
      ...prev,
      [activeAction]: [...(prev[activeAction] ?? []), ...newRows],
    }));
    // Reset so selecting the same file twice still triggers onChange.
    e.target.value = "";
  };
  const addThenRow = (rowIdx: number) =>
    setRxRows((prev) => prev.map((r, ri) => ri !== rowIdx ? r : { ...r, thenRows: [...r.thenRows, blankThenRow()] }));
  const removeThenRow = (rowIdx: number, thenIdx: number) =>
    setRxRows((prev) => prev.map((r, ri) => ri !== rowIdx ? r : { ...r, thenRows: r.thenRows.filter((_, ti) => ti !== thenIdx) }));
  const updateThenField = (rowIdx: number, thenIdx: number, key: keyof ThenRow, value: string) =>
    setRxRows((prev) => prev.map((r, ri) => ri !== rowIdx ? r : { ...r, thenRows: r.thenRows.map((t, ti) => ti !== thenIdx ? t : { ...t, [key]: value }) }));

  // Display rows = backend rows (empty for now) + client-side uploads.
  const displayRows: ListRow[] = listViewConfig
    ? [...listViewConfig.rows, ...(uploadedItems[activeAction] ?? [])]
    : [];

  // Action-list badge counts pulled from the same data sources the right
  // pane reads from. Timeline + Bills have no data layer yet so they show 0
  // until those features are built.
  const countFor = (actionIndex: number): number => {
    const config = LIST_VIEWS[actionIndex];
    if (config) {
      return config.rows.length + (uploadedItems[actionIndex]?.length ?? 0);
    }
    if (actionIndex === 0) return visits.length; // Visits
    return 0; // Timeline (3), Bills (4) — placeholders
  };
  const comingSoonLabel = activeAction === 3 ? "Timeline" : activeAction === 4 ? "Bills" : null;
  const headerTitle =
    listViewConfig?.title ?? comingSoonLabel ?? "Visits";
  // Subtitle is derived from the displayed row count for list views (backend
  // data + client uploads), defaults to a placeholder for Coming Soon, and
  // stays static for the default Visits view.
  const headerSubtitle = listViewConfig
    ? `${listViewConfig.rows.length + (uploadedItems[activeAction]?.length ?? 0)} ${listViewConfig.title.toLowerCase()} on file`
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
          r.frequency || r.duration || r.notes
        )
        .map((r, i) => ({
          id: r.id,
          position: i + 1,
          medicine: r.medicine || null,
          medicineNote: r.medicineNote || null,
          dosage: r.dosage || null,
          whenToTake: r.whenToTake || null,
          frequency: r.frequency || null,
          duration: r.duration || null,
          notes: r.notes || null,
        })),
    };
  };

  const handleSave = async (opts?: { silent?: boolean }) => {
    if (!activeVisit || !selectedPatientId) return;
    setSaving(true);
    try {
      await updateVisit(activeVisit.id, buildSaveRequest());
      await refetchVisits();
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
    if (!formActive || !activeVisit) return;
    void handleSave({ silent: true });
  };

  // Save on every Pause / Resume — the doctor's edits up to that moment
  // get persisted even if they walk away with the session paused.
  // formActive transitions cover Start (no-op effectively), Pause,
  // Resume; End is handled in handleSessionEnd. We skip the very first
  // render so we don't fire a save before the visit data has loaded.
  const prevFormActiveRef = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (prevFormActiveRef.current === null) {
      prevFormActiveRef.current = formActive;
      return;
    }
    if (prevFormActiveRef.current === formActive) return;
    prevFormActiveRef.current = formActive;
    if (activeVisit) void handleSave({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formActive, activeVisit?.id]);

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

  const handleSessionStart = () => {
    if (selectedPatient) markStarted(selectedPatient.id);
    // Surface this session in the header tray so the doctor can navigate
    // back to it from any other screen until the session ends.
    if (activeVisit && selectedPatient) {
      recordActiveSession({
        visitId: activeVisit.id,
        patient: selectedPatient,
        appointmentId: selectedAppointmentId ?? null,
      });
    }
    // Persist the session-start time on the visit row so other devices
    // see when this prescription session began.
    if (activeVisit) {
      const req: SaveVisitRequest = {
        ...buildSaveRequest(),
        sessionStartedAt: new Date().toISOString(),
      };
      void updateVisit(activeVisit.id, req).then(() => refetchVisits());
    }
  };

  const handleSessionEnd = (totalSeconds: number) => {
    if (selectedPatient) unmarkStarted(selectedPatient.id);
    // Drop this session from the header tray.
    if (activeVisit) clearActiveSession(activeVisit.id);
    // Persist the locked-in duration on the visit so reopening the
    // prescription on any device shows the same final time.
    if (activeVisit) {
      const req: SaveVisitRequest = {
        ...buildSaveRequest(),
        sessionEndedAt: new Date().toISOString(),
        sessionDurationSec: totalSeconds,
      };
      void updateVisit(activeVisit.id, req).then(() => refetchVisits());
    } else {
      void handleSave();
    }
    // Move the appointment to COMPLETED so the queues show the right
    // status next time they're viewed.
    if (selectedAppointmentId) {
      void patchAppointmentStatus(selectedAppointmentId, "COMPLETED");
    }
  };

  const handleAddVisit = async () => {
    if (!selectedPatientId) return;
    setSaving(true);
    try {
      const draft: SaveVisitRequest = {
        visitDate: todayIso(),
        bpSystolic: null, bpDiastolic: null, bpUnit: null,
        bmi: null, bmiUnit: null, height: null, heightUnit: null,
        weight: null, weightUnit: null, temperature: null, temperatureUnit: null,
        pulse: null, pulseUnit: null, waist: null, waistUnit: null,
        hip: null, hipUnit: null, spo2: null, spo2Unit: null,
        familyHistory: null, allergies: null, personalHistory: null, pastMedicalHistory: null,
        complaints: null, diagnosis: null, notesForPatient: null, privateNotes: null, tests: null,
        referDoctorId: null,
        reviewDate: null, reviewDays: null, reviewNotes: null,
        sessionStartedAt: null, sessionEndedAt: null, sessionDurationSec: null,
        prescriptions: [],
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
    }
  };

  if (selectedPatientId === null) {
    // Today's Queue is the new internal home for the Prescription page
    // (Figma 2282:17378) — same data source as the Appointment Queue.
    return (
      <div ref={pageRootRef}>
        <PrescriptionQueue
          onSelect={(patient, appointmentId) => {
            setSelectedPatient(patient);
            setSelectedAppointmentId(appointmentId);
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
    return (
      <div ref={pageRootRef}>
        <PrescriptionQueue
          onSelect={(patient, appointmentId) => {
            setSelectedPatient(patient);
            setSelectedAppointmentId(appointmentId);
          }}
        />
      </div>
    );
  }

  return (
    <div ref={pageRootRef} style={styles.page}>
      {/* Header — title + subtitle swap based on which left-rail action is
          active. Reports view also surfaces an "+ Add Report" pill on the
          right (Figma node 2143:11171). */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            type="button"
            style={styles.backButton}
            aria-label="Back to patients"
            onClick={() => {
              setSelectedPatient(null);
              setSelectedAppointmentId(null);
            }}
          >
            <ArrowLeftIcon width={24} height={24} />
          </button>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.headerTitleGroup}>
            <h2 style={styles.title}>{headerTitle}</h2>
            <p style={styles.subtitle}>{headerSubtitle}</p>
          </div>
          {listViewConfig && (
            <>
              <button
                type="button"
                style={{
                  ...styles.addReportButton,
                  ...(formActive ? null : { opacity: 0.55, cursor: "not-allowed" }),
                }}
                onClick={openFilePicker}
                disabled={!formActive}
                title={!formActive ? "Start a session to upload" : undefined}
              >
                <span style={styles.addReportPlus}>+</span>
                <span>{listViewConfig.addLabel}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFilesSelected}
                style={{ display: "none" }}
              />
            </>
          )}
          {/* Save button removed — saves are now auto-triggered every 30s
              while a session is running, plus on End Session. */}
        </div>
      </header>

      <div style={styles.body}>
        {/* ─── Left column ──────────────────────────────────────────── */}
        <aside style={styles.leftColumn}>
          <div style={styles.patientWrapper}>
            <div style={styles.avatar}>
              <img
                src={pickAvatar({
                  gender: selectedPatient?.gender,
                  // backend stores age in months; the picker buckets in years
                  ageYears:
                    selectedPatient?.age != null
                      ? Math.floor(selectedPatient.age / 12)
                      : null,
                })}
                alt=""
                width={72}
                height={72}
                style={{ display: "block", objectFit: "contain" }}
              />
            </div>
            <div style={styles.patientCard}>
              <p style={styles.patientPrimary}>{selectedPatient?.name ?? ""}</p>
              <p style={styles.patientSecondary}>
                {formatPatientMeta(selectedPatient)}
              </p>
            </div>
          </div>

          <div style={styles.actionList}>
            {ACTION_META.map((a, i) => {
              const isActive = activeAction === i;
              return (
                <div
                  key={a.label}
                  style={{
                    ...styles.actionRow,
                    ...(isActive ? styles.actionRowActive : {}),
                  }}
                  onClick={() => setActiveAction(i)}
                >
                  {a.icon}
                  <span style={styles.actionLabel}>{a.label}</span>
                  <span
                    style={{
                      ...styles.actionBadge,
                      ...(isActive ? styles.actionBadgeActive : {}),
                    }}
                  >
                    {countFor(i)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* AI Summary card — Figma node 2143:11160. Static cream tile with
              a serif heading and a paragraph-s body summarizing the patient. */}
          <div style={styles.aiSummaryCard}>
            <h4 style={styles.aiSummaryTitle}>AI Summary</h4>
            <p style={styles.aiSummaryBody}>{AI_SUMMARY_TEXT}</p>
          </div>

          <div style={styles.shareCard}>
            {CONTACT_ACTIONS.map((a) => (
              <div key={a.label} style={styles.actionRow}>
                {a.icon}
                <span style={styles.actionLabel}>{a.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ─── Right area — content swapped via activeAction. Locked
              behind the session: until the user clicks Start on the
              SessionBar, pointer-events are blocked and the content fades
              very slightly so the form reads as "frozen". */}
        <div
          style={{
            ...styles.rightArea,
            ...(formActive
              ? null
              // Mostly readable while locked — labels stay legible so the
              // doctor can scan the form before starting a session. Clicks
              // are still blocked via pointer-events:none.
              : { pointerEvents: "none", opacity: 0.75, userSelect: "none" }),
            transition: "opacity 0.15s ease",
          }}
          aria-disabled={!formActive}
          // Save-on-blur: any descendant input / textarea / select that
          // loses focus triggers a silent save. React.onBlur surfaces the
          // bubbled focusout, so a single handler at the form root covers
          // every field below without needing to wire each one.
          onBlur={handleFormBlur}>

          {comingSoonLabel ? (
            <div style={styles.comingSoon}>
              <h3 style={styles.comingSoonTitle}>{comingSoonLabel}</h3>
              <p style={styles.comingSoonBody}>Coming soon</p>
            </div>
          ) : listViewConfig ? (
            <>
              {/* List-view tabs — same pill style as the visit tabs but with
                the category filters from the active config. */}
              <div style={styles.tabsBar}>
                {listViewConfig.tabs.map((label, i) => (
                  <div
                    key={label}
                    style={{ ...styles.tab, ...(activeListTab === i ? styles.tabActive : styles.tabInactive) }}
                    onClick={() => setActiveListTab(i)}
                  >
                    <span style={styles.tabLabel}>{label}</span>
                  </div>
                ))}
                <div style={styles.reportViewToggle}>
                  <button
                    type="button"
                    style={{
                      ...styles.reportViewToggleButton,
                      ...(viewMode === "list" ? styles.reportViewToggleButtonActive : {}),
                    }}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                  >
                    <ListSortIcon width={24} height={24} />
                  </button>
                  <button
                    type="button"
                    style={{
                      ...styles.reportViewToggleButton,
                      ...(viewMode === "grid" ? styles.reportViewToggleButtonActive : {}),
                    }}
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                  >
                    <WidgetIcon width={24} height={24} />
                  </button>
                </div>
              </div>

              {viewMode === "list" ? (
                /* List table — header row of column captions + data rows. */
                <div style={styles.reportsTable}>
                  <div style={styles.reportsHeaderRow}>
                    <span style={{ textAlign: "center" }}>#</span>
                    <span></span>
                    <span>{listViewConfig.nameColumn}</span>
                    <span style={{ textAlign: "center" }}>Category</span>
                    <span style={{ textAlign: "center" }}>Date</span>
                    <span style={{ textAlign: "center" }}>Actions</span>
                  </div>
                  {displayRows.map((r, i) => (
                    <div key={i} style={styles.reportRow}>
                      <span style={styles.reportSerial}>{i + 1}</span>
                      <div style={styles.reportMicChip}>
                        <MicIcon width={24} height={24} />
                      </div>
                      <span style={styles.reportName}>{r.name}</span>
                      <span style={styles.reportCell}>{r.category}</span>
                      <span style={styles.reportCell}>{r.date}</span>
                      <div style={styles.reportActions}>
                        <DownloadIcon width={24} height={24} />
                        <ReorderIcon width={20} height={20} style={styles.reorderHandle} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Grid view — Figma node 2143:11610. Cream cards with a white
                   inner tile (file thumbnail placeholder + mic chip) and
                   name + date + size below. Kebab handle in top-right. */
                <div style={styles.reportsGrid}>
                  {displayRows.map((r, i) => (
                    <div key={i} style={styles.reportCard}>
                      <div style={styles.reportCardThumb}>
                        <FileIcon style={styles.reportCardThumbIcon} />
                        <span style={styles.reportCardMic}>
                          <MicIcon width={20} height={20} />
                        </span>
                      </div>
                      <div style={styles.reportCardKebab}>
                        <ReorderIcon width={20} height={20} />
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
            <>
              {/* Visit tabs — sit OUTSIDE the cream sheet, above it. The tuning
              button (Figma node 2133:9927) is pushed to the far right of the
              row to filter / reconfigure the current visit's view. Each tab
              loads that visit's prescription data into the form below. */}
              <div style={styles.tabsBar}>
                {visits.map((v, i) => (
                  <div
                    key={v.id}
                    style={{ ...styles.tab, ...(activeTab === i ? styles.tabActive : styles.tabInactive) }}
                    onClick={() => setActiveTab(i)}
                  >
                    <span style={styles.tabCaption}>{`visit ${i + 1}`}</span>
                    <span style={styles.tabLabel}>{formatVisitLabel(v.visitDate)}</span>
                  </div>
                ))}
                {/* "+ New Visit" lives inside the tuning dropdown now —
                    see tuningMenuItems above. */}
                <div style={styles.tuningWrap}>
                  <PopoverMenu
                    trigger={<TuningIcon width={24} height={24} />}
                    items={tuningMenuItems}
                    ariaLabel="Visit settings"
                  />
                </div>
              </div>

              {/* Cream sheet wrapping all visit-content sections. Keyed by the
              active tab so React unmounts/remounts the subtree on switch,
              giving uncontrolled inputs fresh defaultValues for that visit. */}
              <section key={`visit-${activeTab}`} style={styles.rightColumn}>

                {/* Vitals */}
                <div style={styles.sectionCard}>
                  <div style={styles.sectionHeader}>
                    <div style={styles.sectionTitleWrap}>
                      <HeartPulseIcon style={styles.sectionIcon} />
                      <h3 style={styles.sectionTitle}>Vitals</h3>
                    </div>
                    <button
                      type="button"
                      style={styles.sectionToggle}
                      onClick={() => toggleSection("vitals")}
                      aria-label={openSections.vitals ? "Collapse Vitals" : "Expand Vitals"}
                    >
                      <ChevronIcon
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
                      {VITAL_COLUMNS.map((col, ci) => (
                        <div key={ci} style={styles.vitalColumn}>
                          {col.map((v, ri) => {
                            const cellKey = `${ci}-${ri}`;
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
                              <div key={ri} style={styles.vitalCell}>
                                <span style={styles.vitalLabel}>{v.label}</span>
                                <div style={styles.vitalInputRow} title={!valueValid ? rangeHint : undefined}>
                                  {isBp ? (
                                    <BpInput
                                      valid={valueValid}
                                      sysValid={sysValid}
                                      diaValid={diaValid}
                                      sys={bpSys}
                                      dia={bpDia}
                                      onSysChange={(v2) => setBpPart(v2, bpDia)}
                                      onDiaChange={(v2) => setBpPart(bpSys, v2)}
                                      onEnter={(e) => validateVitalOnEnter(e, v.label, cell.value, cell.unit, true)}
                                    />
                                  ) : (
                                    <input
                                      style={{
                                        ...styles.vitalInputValue,
                                        ...(!valueValid ? styles.vitalInputValueInvalid : {}),
                                      }}
                                      placeholder={v.placeholder ?? ""}
                                      value={cell.value}
                                      onChange={(e) => setVitalValue(cellKey, e.target.value)}
                                      onKeyDown={(e) => validateVitalOnEnter(e, v.label, cell.value, cell.unit)}
                                      aria-invalid={!valueValid}
                                    />
                                  )}
                                  <button
                                    type="button"
                                    onClick={canToggle ? () => toggleVitalUnit(cellKey) : undefined}
                                    style={{
                                      ...styles.vitalUnit,
                                      width: v.unitWidth ?? 44,
                                      cursor: canToggle ? "pointer" : "default",
                                      ...(!valueValid ? styles.vitalUnitInvalid : {}),
                                    }}
                                    title={canToggle ? `Switch to ${UNIT_TOGGLES[cell.unit].altUnit}` : undefined}
                                  >
                                    {cell.unit}
                                  </button>
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
                      ))}
                    </div>
                  )}
                </div>

                {/* History — Figma node 2073:3030 (2×2 grid, cream-filled fields) */}
                <div style={styles.sectionCard}>
                  <div style={styles.sectionHeader}>
                    <div style={styles.sectionTitleWrap}>
                      <HourglassIcon style={styles.sectionIcon} />
                      <h3 style={styles.sectionTitle}>History</h3>
                    </div>
                    <button
                      type="button"
                      style={styles.sectionToggle}
                      onClick={() => toggleSection("history")}
                      aria-label={openSections.history ? "Collapse History" : "Expand History"}
                    >
                      <ChevronIcon
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
                        <ChatSquareCallIcon style={styles.sectionIcon} />
                        <h3 style={styles.sectionTitle}>Complaints</h3>
                      </div>
                      <ReorderIcon style={styles.reorderHandle} width={24} height={24} />
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
                        <RewindIcon width={20} height={20} />
                        <MicIcon width={20} height={20} />
                      </span>
                    </div>
                  </div>
                  <div style={styles.noteCard}>
                    <div style={styles.noteCardHeader}>
                      <div style={styles.sectionTitleWrap}>
                        <MagniferBugIcon style={styles.sectionIcon} />
                        <h3 style={styles.sectionTitle}>Diagnosis</h3>
                      </div>
                      <ReorderIcon style={styles.reorderHandle} width={24} height={24} />
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
                        <RewindIcon width={20} height={20} />
                        <MicIcon width={20} height={20} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prescription table */}
                <div style={styles.sectionCard}>
                  <div style={styles.sectionHeader}>
                    <div style={styles.sectionTitleWrap}>
                      <PillsIcon style={styles.sectionIcon} />
                      <h3 style={styles.sectionTitle}>Rx</h3>
                    </div>
                    <button
                      type="button"
                      style={styles.sectionToggle}
                      onClick={() => toggleSection("rx")}
                      aria-label={openSections.rx ? "Collapse Rx" : "Expand Rx"}
                    >
                      <ChevronIcon
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
                      <div style={styles.rxHeaderRow}>
                        {RX_COLUMNS.map((c) => (
                          <span key={c} style={{ textAlign: c === "Medicine" ? "left" : "center" }}>{c}</span>
                        ))}
                        <span /> {/* delete column — no header label */}
                      </div>
                      {rxRows.map((row, i) => {
                        const updateField = (key: keyof RxRowDraft, value: string) =>
                          setRxRows((prev) => prev.map((r, ix) => (ix === i ? { ...r, [key]: value } : r)));
                        return (
                          <React.Fragment key={row.id ?? `draft-${i}`}>
                            <div style={{ ...styles.rxRow, zIndex: rxRows.length + 5 - i }}>
                              <span style={styles.rxSerial}>{i + 1}</span>
                              <div style={styles.rxMedicineCell}>
                                <MedicineAutocomplete
                                  inputStyle={styles.rxMedicineInput}
                                  placeholder="Medicine"
                                  value={row.medicine}
                                  onChange={(v) => setRxRows((prev) => prev.map((r, ix) => ix === i ? { ...r, medicine: v, genericName: "" } : r))}
                                  onSelect={(name, genericName) => setRxRows((prev) => prev.map((r, ix) => ix === i ? { ...r, medicine: name, genericName } : r))}
                                />
                                <div style={styles.rxGenericRow}>
                                  <span style={styles.rxGenericName}>
                                    {row.medicine ? (row.genericName || "Unknown") : ""}
                                  </span>
                                  <button
                                    type="button"
                                    style={styles.rxAddNoteBtn}
                                    title="Add Then dose"
                                    onClick={() => addThenRow(i)}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                      <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <DosagePicker value={row.dosage} onChange={(v) => updateField("dosage", v)} medicineName={row.medicine} genericName={row.genericName} />
                              <WhenPicker value={row.whenToTake} onChange={(v) => updateField("whenToTake", v)} />
                              <FrequencyPicker value={row.frequency} onChange={(v) => updateField("frequency", v)} />
                              <DurationPicker value={row.duration} onChange={(v) => updateField("duration", v)} />
                              <input style={styles.rxCell} placeholder="Notes" value={row.notes} onChange={(e) => updateField("notes", e.target.value)} />
                              <span /> {/* delete placeholder — main row is not individually deletable */}
                            </div>

                            {row.thenRows.map((thenRow, ti) => (
                              <React.Fragment key={`then-${i}-${ti}`}>
                                <div style={{ ...styles.rxThenDivider, zIndex: rxRows.length + 5 - i }}>
                                  <span style={styles.rxThenBadge}>Then</span>
                                </div>
                                <div style={{ ...styles.rxThenRow, zIndex: rxRows.length + 5 - i }}>
                                  <span /> {/* empty # cell */}
                                  <span /> {/* empty medicine cell */}
                                  <DosagePicker value={thenRow.dosage} onChange={(v) => updateThenField(i, ti, "dosage", v)} medicineName={row.medicine} genericName={row.genericName} />
                                  <WhenPicker value={thenRow.whenToTake} onChange={(v) => updateThenField(i, ti, "whenToTake", v)} />
                                  <FrequencyPicker value={thenRow.frequency} onChange={(v) => updateThenField(i, ti, "frequency", v)} />
                                  <DurationPicker value={thenRow.duration} onChange={(v) => updateThenField(i, ti, "duration", v)} />
                                  <input style={styles.rxCell} placeholder="Notes" value={thenRow.notes} onChange={(e) => updateThenField(i, ti, "notes", e.target.value)} />
                                  <button type="button" style={styles.rxDeleteBtn} onClick={() => removeThenRow(i, ti)} title="Remove this dose line">
                                    ×
                                  </button>
                                </div>
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        );
                      })}
                      {/* Figma node 2143:10552 — "Add Medicine" footer row (white, with
                  dictate icons + drag handle). Clicking "+" or the label
                  appends one more empty row to the Rx table. */}
                      <div style={styles.addMedicineRow}>
                        <button
                          type="button"
                          style={styles.addMedicinePlus}
                          onClick={() => setRxRows((rows) => [...rows, blankRxRow(rows.length + 1)])}
                          aria-label="Add medicine row"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          style={styles.addMedicineText}
                          onClick={() => setRxRows((rows) => [...rows, blankRxRow(rows.length + 1)])}
                        >
                          Add Medicine
                        </button>
                        <span style={styles.dictateIcons}>
                          <RewindIcon width={20} height={20} />
                          <MicIcon width={20} height={20} />
                        </span>
                        <ReorderIcon style={styles.reorderHandle} width={20} height={20} />
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
                        <DocumentIcon style={styles.sectionIcon} />
                        <h3 style={styles.sectionTitle}>Notes for Patient</h3>
                      </div>
                      <ReorderIcon style={styles.reorderHandle} width={20} height={20} />
                    </div>
                    <div style={styles.noteCardField}>
                      <textarea
                        style={styles.noteCardTextarea}
                        placeholder="Type here..."
                        value={notesForPatientValue}
                        onChange={(e) => setNotesForPatientValue(e.target.value)}
                      />
                      <span style={styles.noteCardDictate}>
                        <RewindIcon width={20} height={20} />
                        <MicIcon width={20} height={20} />
                      </span>
                    </div>
                  </div>
                  <div style={{ ...styles.noteCard, ...styles.noteCardPrivate }}>
                    <div style={styles.noteCardHeader}>
                      <div style={styles.sectionTitleWrap}>
                        <UsersIcon style={styles.sectionIcon} />
                        <h3 style={styles.sectionTitle}>Private Notes</h3>
                      </div>
                      <ReorderIcon style={styles.reorderHandle} width={20} height={20} />
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
                      <DocumentIcon style={styles.sectionIcon} />
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
                        <RewindIcon width={20} height={20} />
                        <MicIcon width={20} height={20} />
                      </span>
                    </div>
                    <ReorderIcon style={styles.reorderHandle} width={20} height={20} />
                  </div>
                  {/* Refer to — dropdown of doctors in the current clinic
                (fetched from /api/doctors, which filters by the caller's
                clinicId via the JWT). Click the pill to open; selecting a
                doctor sets referDoctorId and closes the menu. */}
                  <div style={styles.noteRow}>
                    <div style={styles.noteLabel}>
                      <UsersIcon style={styles.sectionIcon} />
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
                          {referDoctorName || "select doctor"}
                        </span>
                        <span style={styles.referChevron}>
                          <ChevronIcon
                            width={16}
                            height={16}
                            style={{ transform: referOpen ? "rotate(0deg)" : "rotate(180deg)" }}
                          />
                        </span>
                      </div>
                      {referOpen && (
                        <div style={styles.referMenu}>
                          {doctors.length === 0 ? (
                            <div style={styles.referMenuEmpty}>No doctors in this clinic</div>
                          ) : (
                            doctors.map((d) => (
                              <button
                                key={d.id}
                                type="button"
                                style={styles.referMenuItem}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setReferDoctorId(d.id);
                                  setReferOpen(false);
                                }}
                              >
                                <span style={styles.referMenuItemName}>{d.name}</span>
                                {d.speciality && (
                                  <span style={styles.referMenuItemMeta}>{d.speciality}</span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Next Review — date picker + "or ___ days" + notes field */}
                  <div style={styles.noteRow}>
                    <div style={styles.noteLabel}>
                      <RestartIcon style={styles.sectionIcon} />
                      <span style={styles.noteLabelText}>Next Review</span>
                    </div>
                    <div style={styles.reviewRow}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div
                          style={styles.reviewDate}
                          onClick={() => setShowReviewDatePicker((v) => !v)}
                        >
                          <CalendarIcon width={24} height={24} style={{ color: "currentColor" }} />
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
                          <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, zIndex: 1100 }}>
                            <DatePicker
                              selectedDate={reviewDate ?? new Date()}
                              onSelect={pickReviewDate}
                              onClose={() => setShowReviewDatePicker(false)}
                              style={{ top: "auto", bottom: "8px" }}
                              disablePast
                            />
                          </div>
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
      <Toast message={toast.message} isVisible={toast.visible} onClose={closeToast} />
      {/* Floating session toolbar (Figma node 2255:10871) — fixed at the
          bottom of the viewport so the prescription form scrolls behind it. */}
      {/* Only mount once the visit fetch has resolved for this patient.
          Otherwise the bar mounts first with no storageKey, briefly renders
          its idle Start Session state, then remounts with the real visit
          id and flips to Running/Paused — visible as a one-frame jerk. */}
      {visitsLoadedFor === selectedPatientId && (
        <SessionBar
          // Remount per-visit so the bar reads the persisted state for the
          // active visit rather than carrying state across visit switches.
          key={activeVisit?.id ?? "no-visit"}
          storageKey={activeVisit?.id}
          onPrint={() => showToast("Print: not wired yet")}
          onDownload={() => showToast("Download: not wired yet")}
          onShare={() => showToast("Share: not wired yet")}
          onActiveChange={setFormActive}
          onStart={handleSessionStart}
          onEnd={handleSessionEnd}
        />
      )}
    </div>
  );
}
