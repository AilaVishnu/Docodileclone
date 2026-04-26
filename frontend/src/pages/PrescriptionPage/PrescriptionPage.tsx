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

// ─────────────────────────────────────────────────────────────────────────────
// PrescriptionPage — base scaffold per Figma "Visits" design.
// Renders static placeholder structure; wire up real data/inputs as follow-up.
// ─────────────────────────────────────────────────────────────────────────────

// Figma node 2057:6284 — Vitals laid out as 6 columns × 2 rows.
// Each cell has a value (cream) + unit pill (white/border).
// BP is special: placeholder shows `/` acting as sys / dia divider.
type VitalCell = { label: string; unit: string; unitWidth?: number; placeholder?: string };
const VITAL_COLUMNS: VitalCell[][] = [
  [
    { label: "BP",    unit: "mmHg", unitWidth: 64, placeholder: "  /  " },
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
const HISTORY_FIELDS = [
  { label: "Family History",      placeholder: "Type here..." },
  { label: "Allergies",           placeholder: "Type here..." },
  { label: "Personal History",    placeholder: "Type here..." },
  { label: "Past Medical History", placeholder: "Type here..." },
];

// Figma node 2057:6381 — Rx table columns. Medicine flex-grows, Notes fills remainder.
const RX_COLUMNS = ["#", "Medicine", "Dosage", "When", "Frequency", "Duration", "Notes"];
const INITIAL_RX_ROW_COUNT = 5;

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
const AI_SUMMARY_TEXT =
  "Vinay presents with complaints of dandruff. Clinical evaluation performed " +
  "(1 feb) and appropriate treatment and care advice provided (MedX). But no " +
  "visible change in last visit (8 feb).";

// List-view config — Reports (action 1) and Files (action 2) both render the
// same table layout with their own header copy, tabs, and rows.
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
    subtitle: "5 reports on file",
    addLabel: "Add Report",
    nameColumn: "Report name",
    tabs: ["All Reports", "Blood", "Pathology"],
    rows: [
      { name: "CBC Report", category: "Pathology", date: "20 May '26" },
      { name: "CBC Report", category: "Pathology", date: "20 May '26" },
      { name: "CBC Report", category: "Pathology", date: "20 May '26" },
      { name: "CBC Report", category: "Pathology", date: "20 May '26" },
    ],
  },
  2: {
    title: "Files",
    subtitle: "6 files on file",
    addLabel: "Add File",
    nameColumn: "File name",
    tabs: ["All Files", "Documents", "Images"],
    rows: [
      { name: "Discharge Summary", category: "Documents", date: "12 Apr '26" },
      { name: "X-Ray Chest",       category: "Images",    date: "08 Apr '26" },
      { name: "Consent Form",      category: "Documents", date: "01 Apr '26" },
      { name: "Lab Slip",          category: "Documents", date: "20 Mar '26" },
      { name: "MRI Knee",          category: "Images",    date: "15 Mar '26" },
      { name: "Insurance Letter",  category: "Documents", date: "10 Mar '26" },
    ],
  },
};

export function PrescriptionPage() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [activeAction, setActiveAction] = React.useState(0);
  const [reviewDate, setReviewDate] = React.useState<Date | null>(null);
  const [showReviewDatePicker, setShowReviewDatePicker] = React.useState(false);
  const [rxRowCount, setRxRowCount] = React.useState<number>(INITIAL_RX_ROW_COUNT);
  const [reviewDays, setReviewDays] = React.useState<string>("");
  // List-view tab state — shared across Reports / Files (defaults to the
  // last tab to mirror the Pathology selection in the Figma reference).
  const [activeListTab, setActiveListTab] = React.useState<number>(2);
  // Toggle between the table layout (default) and the card grid layout
  // (Figma node 2143:11610). Driven by the list/widget icons in the tabs row.
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");

  // ── Header + right-area content driven by which left-rail action is active.
  // If LIST_VIEWS has an entry, render the list-view layout; otherwise show
  // the default Visits layout.
  const listViewConfig = LIST_VIEWS[activeAction] ?? null;
  const headerTitle = listViewConfig?.title ?? "Visits";
  const headerSubtitle = listViewConfig?.subtitle ?? "Patient visit history and prescription";

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
            <button type="button" style={styles.addReportButton}>
              <span style={styles.addReportPlus}>+</span>
              <span>{listViewConfig.addLabel}</span>
            </button>
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
        {listViewConfig ? (
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
                {listViewConfig.rows.map((r, i) => (
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
                {listViewConfig.rows.map((r, i) => (
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
              row to filter / reconfigure the current visit's view. */}
          <div style={styles.tabsBar}>
            {[{ id: 0, caption: "visit 1", label: "22 May" },
              { id: 1, caption: "visit 2", label: "Clinic 2" },
              { id: 2, caption: "visit 3", label: "Today" }].map((t) => (
              <div
                key={t.id}
                style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : styles.tabInactive) }}
                onClick={() => setActiveTab(t.id)}
              >
                <span style={styles.tabCaption}>{t.caption}</span>
                <span style={styles.tabLabel}>{t.label}</span>
              </div>
            ))}
            <button type="button" style={styles.tabsTuningButton} aria-label="Visit settings">
              <TuningIcon width={24} height={24} />
            </button>
          </div>

          {/* Cream sheet wrapping all visit-content sections */}
          <section style={styles.rightColumn}>

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
                  {col.map((v) => (
                    <div key={v.label} style={styles.vitalCell}>
                      <span style={styles.vitalLabel}>{v.label}</span>
                      <div style={styles.vitalInputRow}>
                        <input style={styles.vitalInputValue} placeholder={v.placeholder ?? ""} />
                        <span style={{ ...styles.vitalUnit, width: v.unitWidth ?? 44 }}>{v.unit}</span>
                      </div>
                    </div>
                  ))}
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
                  <input style={styles.historyField} placeholder={f.placeholder} />
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
                <textarea style={styles.noteCardTextarea} placeholder="Type here..." />
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
                <ReorderIcon style={styles.reorderHandle} width={20} height={20} />
              </div>
              <div style={styles.noteCardField}>
                <textarea style={styles.noteCardTextarea} placeholder="Type here..." />
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
                <textarea style={styles.noteCardTextarea} placeholder="Type here..." />
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
                <textarea style={styles.noteCardTextarea} placeholder="Type here..." />
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
                <input style={styles.noteFieldInner} placeholder="Add tests..." />
                <span style={styles.dictateIcons}>
                  <RewindIcon width={20} height={20} />
                  <MicIcon width={20} height={20} />
                </span>
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
    </div>
  );
}
