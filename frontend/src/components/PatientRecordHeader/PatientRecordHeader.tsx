import React from "react";
import { Icon } from "../Icon";
import { styles } from "./PatientRecordHeader.styles";

// ─────────────────────────────────────────────────────────────────────────────
// PatientRecordHeader — compact sticky header for a patient/record screen.
//
// Layout (single row): back arrow (left gutter) · title · flexible gap ·
// section nav (full-height underline tabs, icon + label + optional count) ·
// actions slot (e.g. a contact "⋯" PopoverMenu). Full-bleed against the page
// gutter; the title left-aligns to the body content below.
//
// First adopted by the prescription page; reuse it for any record-style screen
// that wants a name + section nav along the top.
// ─────────────────────────────────────────────────────────────────────────────

export interface RecordSection {
  /** Stable id passed back to onSelect. */
  id: string;
  /** Tab label (also used as the accessible name / title). */
  label: string;
  /** Leading glyph — pass an <Icon … /> so it inherits the tab tone. */
  icon: React.ReactNode;
  /** Optional count rendered as a peach badge beside the label (hidden if 0). */
  badge?: number;
}

export interface PatientRecordHeaderProps {
  /** Record/patient name shown left-aligned to the body below. */
  title: string;
  /** Back-arrow handler. Omit to hide the arrow. */
  onBack?: () => void;
  /** Section tabs (Info / Visits / Files / …). */
  sections: RecordSection[];
  /** Currently-active section id. */
  activeId: string;
  /** Fires with the clicked section's id. */
  onSelect: (id: string) => void;
  /** Right-aligned actions slot (e.g. a contact kebab / PopoverMenu). */
  actions?: React.ReactNode;
  /** Width the inner content is capped at. Defaults to the page's content max. */
  contentMax?: string;
  /** aria-label for the back button. */
  backLabel?: string;
  /** aria-label for the section nav. */
  navLabel?: string;
}

export function PatientRecordHeader({
  title,
  onBack,
  sections,
  activeId,
  onSelect,
  actions,
  contentMax,
  backLabel = "Back",
  navLabel = "Record sections",
}: PatientRecordHeaderProps) {
  const innerStyle = contentMax
    ? { ...styles.inner, maxWidth: contentMax }
    : styles.inner;

  return (
    <header style={styles.header}>
      {onBack && (
        <button
          type="button"
          style={styles.backBtn}
          onClick={onBack}
          aria-label={backLabel}
          title={backLabel}
        >
          <Icon name="arrow-left" size={20} tone="inherit" />
        </button>
      )}

      <div style={styles.pad}>
        <div style={innerStyle}>
          <div style={styles.title}>
            <span style={styles.titleText}>{title}</span>
          </div>

          {/* Flexible gap pushes nav + actions to the right side. */}
          <div style={styles.spacer} />

          <nav style={styles.nav} role="tablist" aria-label={navLabel}>
            {sections.map((s) => {
              const isActive = activeId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={s.label}
                  title={s.label}
                  style={{ ...styles.tab, ...(isActive ? styles.tabActive : {}) }}
                  onClick={() => onSelect(s.id)}
                >
                  <span style={styles.tabIcon}>{s.icon}</span>
                  <span>{s.label}</span>
                  {!!s.badge && s.badge > 0 && (
                    <span style={styles.badge}>{s.badge}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {actions}
        </div>
      </div>
    </header>
  );
}
