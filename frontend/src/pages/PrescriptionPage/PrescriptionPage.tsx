import React from "react";
import { styles } from "./PrescriptionPage.styles";
import { Button } from "../../components/Button";
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
import { ReactComponent as ChatDotsIcon } from "../../assets/icons/chat-dots.svg";
import { ReactComponent as StethoscopeIcon } from "../../assets/icons/stethoscope-24.svg";
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
  { label: "Family History",      placeholder: "Compliants..." },
  { label: "Allergies",           placeholder: "Compliants..." },
  { label: "Personal History",    placeholder: "Compliants..." },
  { label: "Past Medical History", placeholder: "Compliants..." },
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

export function PrescriptionPage() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [activeAction, setActiveAction] = React.useState(0);
  const [reviewDate, setReviewDate] = React.useState<Date | null>(null);
  const [showReviewDatePicker, setShowReviewDatePicker] = React.useState(false);
  const [rxRowCount, setRxRowCount] = React.useState<number>(INITIAL_RX_ROW_COUNT);

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
      {/* Header */}
      <header style={styles.header}>
        <button type="button" style={styles.backButton} aria-label="Back">
          <ArrowLeftIcon width={24} height={24} />
        </button>
        <div style={styles.headerTitleGroup}>
          <h2 style={styles.title}>Visits</h2>
          <p style={styles.subtitle}>Patient visit history and prescription</p>
        </div>
        <div style={styles.headerActions}>
          <Button variant="light" size="md">Save Draft</Button>
          <Button variant="dark" size="md">Finalize</Button>
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

          <div style={styles.shareCard}>
            {CONTACT_ACTIONS.map((a) => (
              <div key={a.label} style={styles.actionRow}>
                {a.icon}
                <span style={styles.actionLabel}>{a.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ─── Right area (tabs above the cream sheet) ──────────────── */}
        <div style={styles.rightArea}>
          {/* Visit tabs — sit OUTSIDE the cream sheet, above it */}
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
                <HeartPulseIcon style={styles.sectionIcon} />
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

          {/* Complaints + Examination single-line rows (no card outline) */}
          <div style={styles.bottomRows}>
            <div style={styles.noteRow}>
              <div style={styles.noteLabel}>
                <ChatDotsIcon style={styles.sectionIcon} />
                <span style={styles.noteLabelText}>Complaints</span>
              </div>
              <div style={styles.noteFieldWrap}>
                <input style={styles.noteFieldInner} placeholder="Type or dictate…" />
                <span style={styles.dictateIcons}>
                  <RewindIcon width={20} height={20} />
                  <MicIcon width={20} height={20} />
                </span>
              </div>
              <ReorderIcon style={styles.reorderHandle} width={20} height={20} />
            </div>
            <div style={styles.noteRow}>
              <div style={styles.noteLabel}>
                <StethoscopeIcon style={styles.sectionIcon} />
                <span style={styles.noteLabelText}>Examination</span>
              </div>
              <div style={styles.noteFieldWrap}>
                <input style={styles.noteFieldInner} placeholder="Type or dictate…" />
                <span style={styles.dictateIcons}>
                  <RewindIcon width={20} height={20} />
                  <MicIcon width={20} height={20} />
                </span>
              </div>
              <ReorderIcon style={styles.reorderHandle} width={20} height={20} />
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
            {/* Advice — dictatable with mic/rewind */}
            <div style={styles.noteRow}>
              <div style={styles.noteLabel}>
                <ChatDotsIcon style={styles.sectionIcon} />
                <span style={styles.noteLabelText}>Advice</span>
              </div>
              <div style={styles.noteFieldWrap}>
                <input style={styles.noteFieldInner} placeholder="Add advice..." />
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
            {/* Review — date picker + notes field */}
            <div style={styles.noteRow}>
              <div style={styles.noteLabel}>
                <RestartIcon style={styles.sectionIcon} />
                <span style={styles.noteLabelText}>Review</span>
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
                <input style={styles.reviewLong} placeholder="Notes..." />
              </div>
            </div>
          </div>
          </section>
        </div>
      </div>
    </div>
  );
}
