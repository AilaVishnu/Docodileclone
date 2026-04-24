import React from "react";
import { styles } from "./PrescriptionPage.styles";
import { Button } from "../../components/Button";
import { ReactComponent as DocumentIcon } from "../../assets/icons/document-outline.svg";
import { ReactComponent as HourglassIcon } from "../../assets/icons/hourglass.svg";
import { ReactComponent as StopwatchIcon } from "../../assets/icons/stopwatch.svg";
import { ReactComponent as StethoscopeIcon } from "../../assets/icons/stethoscope-cup.svg";
import { ReactComponent as BillCheckIcon } from "../../assets/icons/bill-check.svg";
import { ReactComponent as RestartIcon } from "../../assets/icons/restart.svg";
import { ReactComponent as UsersIcon } from "../../assets/icons/users-group.svg";
import { ReactComponent as EditPencilIcon } from "../../assets/icons/edit-pencil.svg";
import { ReactComponent as ChevronIcon } from "../../assets/icons/chevron-down-dark.svg";
import { ReactComponent as UserIcon } from "../../assets/icons/user.svg";

// ─────────────────────────────────────────────────────────────────────────────
// PrescriptionPage — base scaffold per Figma "Visits" design.
// Renders static placeholder structure; wire up real data/inputs as follow-up.
// ─────────────────────────────────────────────────────────────────────────────

const VITALS: { label: string; leftValue: string; leftUnit: string; rightValue?: string; rightUnit?: string }[] = [
  { label: "BP", leftValue: "", leftUnit: "sys", rightValue: "", rightUnit: "dia" },
  { label: "Pulse", leftValue: "", leftUnit: "bpm" },
  { label: "Temperature", leftValue: "", leftUnit: "°F" },
  { label: "SpO2", leftValue: "", leftUnit: "%" },
  { label: "Weight", leftValue: "", leftUnit: "kg" },
  { label: "Height", leftValue: "", leftUnit: "cm" },
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
const ACTIONS: { icon: React.ReactNode; label: string; count: number }[] = [
  { icon: <DocumentIcon style={styles.actionIcon} />, label: "Visits", count: 3 },
  { icon: <HourglassIcon style={styles.actionIcon} />, label: "Reports", count: 2 },
  { icon: <DocumentIcon style={styles.actionIcon} />, label: "Files", count: 6 },
  { icon: <StopwatchIcon style={styles.actionIcon} />, label: "Timeline", count: 23 },
  { icon: <BillCheckIcon style={styles.actionIcon} />, label: "Bills", count: 4 },
];

const CONTACT_ACTIONS = [
  { icon: <DocumentIcon style={styles.actionIcon} />, label: "Email prescription" },
  { icon: <StopwatchIcon style={styles.actionIcon} />, label: "Schedule follow-up" },
  { icon: <EditPencilIcon style={styles.actionIcon} />, label: "Add note" },
];

export function PrescriptionPage() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [activeAction, setActiveAction] = React.useState(0);

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
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
          <div style={styles.patientCard}>
            <div style={styles.avatar}>
              <UserIcon width={40} height={40} />
            </div>
            <p style={styles.patientLine}>T023: Vinay Pittampally</p>
            <p style={{ ...styles.patientLine, color: "#8F8F8F", fontSize: 12 }}>M | 25 · 8885672664</p>
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

        {/* ─── Right column ─────────────────────────────────────────── */}
        <section style={styles.rightColumn}>
          {/* Visit tabs */}
          <div style={styles.tabsBar}>
            {[{ id: 0, caption: "visit 1", label: "22 May" },
              { id: 1, caption: "visit 2", label: "Clinic 2" },
              { id: 2, caption: "visit 3", label: "Clinic 2" }].map((t) => (
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

          {/* Vitals */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleWrap}>
                <HourglassIcon style={styles.sectionIcon} />
                <h3 style={styles.sectionTitle}>Vitals</h3>
              </div>
              <ChevronIcon style={styles.sectionIcon} />
            </div>
            <div style={styles.vitalsGrid}>
              {VITALS.map((v) => (
                <div key={v.label} style={styles.vitalCell}>
                  <span style={styles.vitalLabel}>{v.label}</span>
                  <div style={styles.vitalInputRow}>
                    <input style={styles.vitalInput} placeholder="—" />
                    <span style={styles.vitalUnit}>{v.leftUnit}</span>
                    {v.rightUnit && (
                      <>
                        <input style={styles.vitalInput} placeholder="—" />
                        <span style={styles.vitalUnit}>{v.rightUnit}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chief Complaints */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleWrap}>
                <StethoscopeIcon style={styles.sectionIcon} />
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
                <EditPencilIcon style={styles.sectionIcon} />
                <span>Complaints</span>
              </div>
              <input style={styles.noteField} placeholder="Type or dictate…" />
            </div>
            <div style={styles.noteRow}>
              <div style={styles.noteLabel}>
                <StethoscopeIcon style={styles.sectionIcon} />
                <span>Examination</span>
              </div>
              <input style={styles.noteField} placeholder="Type or dictate…" />
            </div>
          </div>

          {/* Prescription table */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleWrap}>
                <BillCheckIcon style={styles.sectionIcon} />
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
                <EditPencilIcon style={styles.sectionIcon} />
                <span>Advise</span>
              </div>
              <input style={styles.noteField} placeholder="Instructions for the patient…" />
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
  );
}
