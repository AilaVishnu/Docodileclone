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

const COMPLAINT_FIELDS = [
  { label: "Primary complaint", placeholder: "e.g. Headache since 3 days" },
  { label: "Duration", placeholder: "e.g. 3 days" },
  { label: "Severity", placeholder: "Mild / Moderate / Severe" },
  { label: "Associated symptoms", placeholder: "Nausea, dizziness, …" },
];

const RX_COLUMNS = ["#", "Medicine", "Morning", "Afternoon", "Evening", "Night", "Days", "Qty"];
const RX_ROWS = [1, 2, 3, 4, 5];

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
              <ChevronIcon style={styles.sectionIcon} />
            </div>
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
          </div>

          {/* Chief Complaints */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleWrap}>
                <HeartPulseIcon style={styles.sectionIcon} />
                <h3 style={styles.sectionTitle}>Chief Complaints</h3>
              </div>
              <ChevronIcon style={styles.sectionIcon} />
            </div>
            <div style={styles.complaintsGrid}>
              {COMPLAINT_FIELDS.map((f) => (
                <label key={f.label} style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>{f.label}</span>
                  <input style={styles.textField} placeholder={f.placeholder} />
                </label>
              ))}
            </div>
          </div>

          {/* Notes + Examination single-line rows */}
          <div style={styles.sectionCard}>
            <div style={styles.noteRow}>
              <div style={styles.noteLabel}>
                <ChatDotsIcon style={styles.sectionIcon} />
                <span>Complaints</span>
              </div>
              <div style={styles.noteFieldWrap}>
                <input style={styles.noteFieldInner} placeholder="Type or dictate…" />
                <span style={styles.dictateIcons}>
                  <RewindIcon width={20} height={20} />
                  <MicIcon width={20} height={20} />
                </span>
              </div>
            </div>
            <div style={styles.noteRow}>
              <div style={styles.noteLabel}>
                <StethoscopeIcon style={styles.sectionIcon} />
                <span>Examination</span>
              </div>
              <div style={styles.noteFieldWrap}>
                <input style={styles.noteFieldInner} placeholder="Type or dictate…" />
                <span style={styles.dictateIcons}>
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
              <ChevronIcon style={styles.sectionIcon} />
            </div>
            <div style={styles.rxTable}>
              <div style={styles.rxHeaderRow}>
                {RX_COLUMNS.map((c) => (
                  <span key={c} style={{ textAlign: c === "#" ? "center" : "left" }}>{c}</span>
                ))}
              </div>
              {RX_ROWS.map((n) => (
                <div key={n} style={styles.rxRow}>
                  <span style={styles.rxSerial}>{n}</span>
                  <input style={styles.rxCell} placeholder="Medicine name" />
                  <input style={styles.rxCell} placeholder="0" />
                  <input style={styles.rxCell} placeholder="0" />
                  <input style={styles.rxCell} placeholder="0" />
                  <input style={styles.rxCell} placeholder="0" />
                  <input style={styles.rxCell} placeholder="—" />
                  <input style={styles.rxCell} placeholder="—" />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom rows */}
          <div style={styles.sectionCard}>
            <div style={styles.noteRow}>
              <div style={styles.noteLabel}>
                <DocumentIcon style={styles.sectionIcon} />
                <span>Notes</span>
              </div>
              <input style={styles.noteField} placeholder="Private notes…" />
            </div>
            <div style={styles.noteRow}>
              <div style={styles.noteLabel}>
                <ChatDotsIcon style={styles.sectionIcon} />
                <span>Advise</span>
              </div>
              <div style={styles.noteFieldWrap}>
                <input style={styles.noteFieldInner} placeholder="Instructions for the patient…" />
                <span style={styles.dictateIcons}>
                  <RewindIcon width={20} height={20} />
                  <MicIcon width={20} height={20} />
                </span>
              </div>
            </div>
            <div style={styles.noteRow}>
              <div style={styles.noteLabel}>
                <UsersIcon style={styles.sectionIcon} />
                <span>Follow-up</span>
              </div>
              <input style={styles.noteField} placeholder="Who is responsible?" />
            </div>
            <div style={styles.noteRow}>
              <div style={styles.noteLabel}>
                <RestartIcon style={styles.sectionIcon} />
                <span>Review</span>
              </div>
              <div style={styles.reviewRow}>
                <input style={styles.reviewShort} placeholder="e.g. 7 days" />
                <input style={styles.noteField} placeholder="Notes for review visit…" />
              </div>
            </div>
          </div>
          </section>
        </div>
      </div>
    </div>
  );
}
