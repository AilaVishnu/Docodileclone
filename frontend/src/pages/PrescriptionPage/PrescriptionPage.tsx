import React from "react";
import { styles } from "./PrescriptionPage.styles";
import { ReactComponent as PatientAvatar } from "../../assets/staff/patient.svg";
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
import { ReactComponent as ChatDotsIcon } from "../../assets/icons/chat-dots.svg";
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

// ─────────────────────────────────────────────────────────────────────────────
// PrescriptionPage — base scaffold per Figma "Visits" design.
// Renders static placeholder structure; wire up real data/inputs as follow-up.
// ─────────────────────────────────────────────────────────────────────────────

// Per-visit data shape. Tab metadata (id/caption/label) is local UI state;
// the actual visit content (vitals, complaints, diagnosis, Rx, etc.) should
// come from the backend keyed by patientId+visitId. The seam below renders
// blank fields until that fetch is wired in.
//
// TODO(backend): replace `EMPTY_VITALS` / blank fields with a fetch like
//   const { data: visits } = useVisits(patientId);
// where useVisits returns VisitData[] keyed by visit id.
type VisitData = {
  id: number;
  caption: string;
  label: string;
  vitals: Record<string, string>;
  complaints: string;
  diagnosis: string;
  notesForPatient: string;
  privateNotes: string;
  tests: string;
  rxRowCount: number;
  reviewDate: Date | null;
  reviewDays: string;
};
const EMPTY_VITALS: Record<string, string> = {
  BP: "", BMI: "", Height: "", Weight: "",
  Temperature: "", Pulse: "", Waist: "", Hip: "", SPO2: "",
};
const blankVisit = (id: number, caption: string, label: string): VisitData => ({
  id, caption, label,
  vitals: { ...EMPTY_VITALS },
  complaints: "",
  diagnosis: "",
  notesForPatient: "",
  privateNotes: "",
  tests: "",
  rxRowCount: 5,
  reviewDate: null,
  reviewDays: "",
});
// Tab metadata only — no visit content baked in.
const VISITS: VisitData[] = [
  blankVisit(0, "visit 1", "22 May"),
  blankVisit(1, "visit 2", "12 Jun"),
  blankVisit(2, "visit 3", "Today"),
];

// Figma node 2057:6284 — Vitals laid out as 6 columns × 2 rows.
// Each cell has a value (cream) + unit pill (white/border).
// BP is special: placeholder shows `/` acting as sys / dia divider.
type VitalCell = { label: string; unit: string; unitWidth?: number; placeholder?: string };
const VITAL_COLUMNS: VitalCell[][] = [
  [
    { label: "BP",    unit: "mmHg", unitWidth: 64 },
    { label: "BMI",   unit: "kg/m²", unitWidth: 64 },
  ],
  [
    { label: "Height", unit: "cm", unitWidth: 44 },
    { label: "Weight", unit: "kg", unitWidth: 44 },
  ],
  [
    { label: "Temperature", unit: "°C", unitWidth: 44 },
    { label: "Pulse",       unit: "bpm", unitWidth: 44 },
  ],
  [
    { label: "Waist", unit: "cm", unitWidth: 44 },
    { label: "Hip",   unit: "cm", unitWidth: 44 },
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
  { label: "Family History",       field: "family_history",      placeholder: "Type here..." },
  { label: "Allergies",            field: "allergies",           placeholder: "Type here..." },
  { label: "Personal History",     field: "personal_history",    placeholder: "Type here..." },
  { label: "Past Medical History", field: "past_medical_history", placeholder: "Type here..." },
];

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
  BP_sys:      { mmHg: { min: 60, max: 220 }, kPa:  { min: 8,  max: 30  } },
  BP_dia:      { mmHg: { min: 30, max: 140 }, kPa:  { min: 4,  max: 19  } },
  BMI:         { "kg/m²": { min: 10, max: 60 } },
  Height:      { cm:   { min: 30, max: 250 }, in:   { min: 12, max: 100 } },
  Weight:      { kg:   { min: 1,  max: 300 }, lb:   { min: 2,  max: 660 } },
  Temperature: { "°C": { min: 30, max: 45  }, "°F": { min: 86, max: 113 } },
  Pulse:       { bpm:  { min: 30, max: 220 } },
  Waist:       { cm:   { min: 30, max: 200 }, in:   { min: 12, max: 80  } },
  Hip:         { cm:   { min: 30, max: 200 }, in:   { min: 12, max: 80  } },
  SPO2:        { "%":  { min: 50, max: 100 } },
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
  mmHg: { altUnit: "kPa",  convert: (v) => convertBp(v, "kPa") },
  kPa:  { altUnit: "mmHg", convert: (v) => convertBp(v, "mmHg") },
  cm:   { altUnit: "in",   convert: (v) => convertNum(v, 0.393701) },
  in:   { altUnit: "cm",   convert: (v) => convertNum(v, 2.54) },
  kg:   { altUnit: "lb",   convert: (v) => convertNum(v, 2.20462) },
  lb:   { altUnit: "kg",   convert: (v) => convertNum(v, 0.453592) },
  "°C": { altUnit: "°F",   convert: (v) => convertTemp(v, "F") },
  "°F": { altUnit: "°C",   convert: (v) => convertTemp(v, "C") },
};

// Build per-cell vital state from the active visit's seed values. Keyed by
// `${columnIndex}-${rowIndex}` so the duplicate "Hip" cell gets its own slot.
type VitalCellState = { value: string; unit: string };
const buildVitalState = (visit: VisitData): Record<string, VitalCellState> => {
  const state: Record<string, VitalCellState> = {};
  VITAL_COLUMNS.forEach((col, ci) => {
    col.forEach((v, ri) => {
      state[`${ci}-${ri}`] = {
        value: visit.vitals[v.label] ?? "",
        unit: v.unit,
      };
    });
  });
  return state;
};

// Figma node 2059:6764 — patient-context action list.
// "Visits" renders active by default; count badges are circular.
// Icons are the exact Linear set from the Figma design, normalized to
// currentColor so they flip between dark/white with the row's active state.
const ACTIONS: { icon: React.ReactNode; label: string; count: number }[] = [
  { icon: <VisitsIcon style={styles.actionIcon} />, label: "Visits", count: 3 },
  { icon: <PulseIcon style={styles.actionIcon} />, label: "Reports", count: 2 },
  { icon: <FileIcon style={styles.actionIcon} />, label: "Files", count: 6 },
  { icon: <HistoryIcon style={styles.actionIcon} />, label: "Timeline", count: 23 },
  { icon: <BillCheckIcon style={styles.actionIcon} />, label: "Bills", count: 4 },
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
  const [activeTab, setActiveTab] = React.useState(0);
  const [activeAction, setActiveAction] = React.useState(0);
  const activeVisit = VISITS[activeTab];
  const [reviewDate, setReviewDate] = React.useState<Date | null>(activeVisit.reviewDate);
  const [showReviewDatePicker, setShowReviewDatePicker] = React.useState(false);
  const [rxRowCount, setRxRowCount] = React.useState<number>(activeVisit.rxRowCount);
  const [reviewDays, setReviewDays] = React.useState<string>(activeVisit.reviewDays);
  // Vital values + units (units are clickable to toggle between alternates
  // like cm↔in, kg↔lb, °C↔°F, mmHg↔kPa).
  const [vitalState, setVitalState] =
    React.useState<Record<string, VitalCellState>>(() => buildVitalState(activeVisit));
  // History field values (Family History, Allergies, …). Controlled so the
  // <Autocomplete> dropdown can drive them. Reset on visit-tab change.
  const [historyValues, setHistoryValues] =
    React.useState<Record<string, string>>(() =>
      Object.fromEntries(HISTORY_FIELDS.map((f) => [f.field, ""]))
    );
  // Diagnosis + Complaints + Tests are also suggestion-driven
  // (specialty-scoped via the same API).
  const [diagnosisValue, setDiagnosisValue] = React.useState<string>(activeVisit.diagnosis);
  const [complaintsValue, setComplaintsValue] = React.useState<string>(activeVisit.complaints);
  const [testsValue, setTestsValue] = React.useState<string>(activeVisit.tests);

  // Sync controlled state to the selected visit's seed when the tab changes.
  // Uncontrolled inputs are remounted via the `key` on the visits wrapper
  // below so they pick up new defaultValues automatically.
  React.useEffect(() => {
    setReviewDate(activeVisit.reviewDate);
    setReviewDays(activeVisit.reviewDays);
    setRxRowCount(activeVisit.rxRowCount);
    setShowReviewDatePicker(false);
    setVitalState(buildVitalState(activeVisit));
    setHistoryValues(Object.fromEntries(HISTORY_FIELDS.map((f) => [f.field, ""])));
    setDiagnosisValue(activeVisit.diagnosis);
    setComplaintsValue(activeVisit.complaints);
    setTestsValue(activeVisit.tests);
  }, [activeTab, activeVisit]);

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

  // List-view tab state — shared across Reports / Files (defaults to the
  // last tab to mirror the Pathology selection in the Figma reference).
  const [activeListTab, setActiveListTab] = React.useState<number>(2);
  // Toggle between the table layout (default) and the card grid layout
  // (Figma node 2143:11610). Driven by the list/widget icons in the tabs row.
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");
  // Tuning button dropdown items — open/close + outside-click handling lives
  // inside <PopoverMenu>, so we just declare the actions here.
  const tuningMenuItems = [
    {
      label: "Clear all",
      onClick: () => {
        setVitalState(buildVitalState(activeVisit));
        setReviewDate(activeVisit.reviewDate);
        setReviewDays(activeVisit.reviewDays);
        setRxRowCount(activeVisit.rxRowCount);
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
  // Display rows = backend rows (empty for now) + client-side uploads.
  const displayRows: ListRow[] = listViewConfig
    ? [...listViewConfig.rows, ...(uploadedItems[activeAction] ?? [])]
    : [];
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

  return (
    <div style={styles.page}>
      {/* Header — title + subtitle swap based on which left-rail action is
          active. Reports view also surfaces an "+ Add Report" pill on the
          right (Figma node 2143:11171). */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button type="button" style={styles.backButton} aria-label="Back">
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
              <button type="button" style={styles.addReportButton} onClick={openFilePicker}>
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
        </div>
      </header>

      <div style={styles.body}>
        {/* ─── Left column ──────────────────────────────────────────── */}
        <aside style={styles.leftColumn}>
          <div style={styles.patientWrapper}>
            <div style={styles.avatar}>
              <PatientAvatar width={72} height={72} />
            </div>
            <div style={styles.patientCard}>
              <p style={styles.patientPrimary}>T023: Vinay Pittampally</p>
              <p style={styles.patientSecondary}>(M|25)  8885672664</p>
            </div>
          </div>

          <div style={styles.actionList}>
            {ACTIONS.map((a, i) => {
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
                    {a.count}
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

        {/* ─── Right area — content swapped via activeAction ─────────── */}
        <div style={styles.rightArea}>
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
            {VISITS.map((t) => (
              <div
                key={t.id}
                style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : styles.tabInactive) }}
                onClick={() => setActiveTab(t.id)}
              >
                <span style={styles.tabCaption}>{t.caption}</span>
                <span style={styles.tabLabel}>{t.label}</span>
              </div>
            ))}
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
              {HISTORY_FIELDS.map((f) => (
                <label key={f.label} style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>{f.label}</span>
                  <Autocomplete
                    field={f.field}
                    value={historyValues[f.field] ?? ""}
                    onChange={(next) =>
                      setHistoryValues((prev) => ({ ...prev, [f.field]: next }))
                    }
                    placeholder={f.placeholder}
                    inputStyle={styles.historyField}
                    ariaLabel={f.label}
                  />
                </label>
              ))}
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
                  <ChatDotsIcon style={styles.sectionIcon} />
                  <h3 style={styles.sectionTitle}>Complaints</h3>
                </div>
                <ReorderIcon style={styles.reorderHandle} width={20} height={20} />
              </div>
              <div style={styles.noteCardField}>
                <Autocomplete
                  field="complaints"
                  value={complaintsValue}
                  onChange={setComplaintsValue}
                  placeholder="Type here..."
                  inputStyle={styles.noteCardTextarea}
                  multiline
                  ariaLabel="Complaints"
                  trailingSlot={
                    <span style={styles.noteCardDictate}>
                      <RewindIcon width={20} height={20} />
                      <MicIcon width={20} height={20} />
                    </span>
                  }
                />
              </div>
            </div>
            <div style={styles.noteCard}>
              <div style={styles.noteCardHeader}>
                <div style={styles.sectionTitleWrap}>
                  <MagniferBugIcon style={styles.sectionIcon} />
                  <h3 style={styles.sectionTitle}>Diagnosis</h3>
                </div>
                <ReorderIcon style={styles.reorderHandle} width={20} height={20} />
              </div>
              <div style={styles.noteCardField}>
                <Autocomplete
                  field="diagnosis"
                  value={diagnosisValue}
                  onChange={setDiagnosisValue}
                  placeholder="Type here..."
                  inputStyle={styles.noteCardTextarea}
                  multiline
                  ariaLabel="Diagnosis"
                  trailingSlot={
                    <span style={styles.noteCardDictate}>
                      <RewindIcon width={20} height={20} />
                      <MicIcon width={20} height={20} />
                    </span>
                  }
                />
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
              <div style={styles.rxHeaderRow}>
                {RX_COLUMNS.map((c) => (
                  <span key={c} style={{ textAlign: c === "#" ? "center" : "left" }}>{c}</span>
                ))}
              </div>
              {Array.from({ length: rxRowCount }, (_, i) => i + 1).map((n) => (
                <div key={n} style={styles.rxRow}>
                  <span style={styles.rxSerial}>{n}</span>
                  <div style={styles.rxMedicineCell}>
                    <input style={styles.rxMedicineInput} placeholder="Medicine" />
                    <div style={styles.rxMedicineNote}>
                      <PenIcon width={12} height={12} />
                      <input style={styles.rxMedicineNoteInput} placeholder="Medicine" />
                    </div>
                  </div>
                  <input style={styles.rxCell} placeholder="Dosage" />
                  <input style={styles.rxCell} placeholder="When" />
                  <input style={styles.rxCell} placeholder="Frequency" />
                  <input style={styles.rxCell} placeholder="Duration" />
                  <input style={styles.rxCell} placeholder="Notes" />
                </div>
              ))}
              {/* Figma node 2143:10552 — "Add Medicine" footer row (white, with
                  dictate icons + drag handle). Clicking "+" or the label
                  appends one more empty row to the Rx table. */}
              <div style={styles.addMedicineRow}>
                <button
                  type="button"
                  style={styles.addMedicinePlus}
                  onClick={() => setRxRowCount((c) => c + 1)}
                  aria-label="Add medicine row"
                >
                  +
                </button>
                <button
                  type="button"
                  style={styles.addMedicineText}
                  onClick={() => setRxRowCount((c) => c + 1)}
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
                  defaultValue={activeVisit.notesForPatient}
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
                  defaultValue={activeVisit.privateNotes}
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
                <Autocomplete
                  field="tests"
                  value={testsValue}
                  onChange={setTestsValue}
                  placeholder="Add tests..."
                  inputStyle={styles.noteFieldInner}
                  ariaLabel="Tests"
                  trailingSlot={
                    <span style={styles.dictateIcons}>
                      <RewindIcon width={20} height={20} />
                      <MicIcon width={20} height={20} />
                    </span>
                  }
                />
              </div>
              <ReorderIcon style={styles.reorderHandle} width={20} height={20} />
            </div>
            {/* Refer to — dropdown (select doctor) */}
            <div style={styles.noteRow}>
              <div style={styles.noteLabel}>
                <UsersIcon style={styles.sectionIcon} />
                <span style={styles.noteLabelText}>Refer to</span>
              </div>
              <div style={styles.referDropdown}>
                <span style={styles.referText}>select doctor</span>
                <span style={styles.referChevron}>
                  <ChevronIcon width={16} height={16} style={{ transform: "rotate(180deg)" }} />
                </span>
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
                        onSelect={(d: Date) => {
                          setReviewDate(d);
                          setShowReviewDatePicker(false);
                        }}
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
                    onChange={(e) => setReviewDays(e.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    placeholder=""
                  />
                  <span style={styles.reviewDaysLabel}>days</span>
                </div>
                <input style={styles.reviewLong} placeholder="Notes for Review..." />
              </div>
            </div>
          </div>
          </section>
        </>
        )}
        </div>
      </div>
      <Toast message={toast.message} isVisible={toast.visible} onClose={closeToast} />
    </div>
  );
}
