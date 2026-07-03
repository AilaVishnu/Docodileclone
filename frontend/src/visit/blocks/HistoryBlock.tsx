import React from "react";
import type { CSSProperties } from "react";
import { AutocompleteTags } from "../../components/Autocomplete/AutocompleteTags";
import { colors, fonts, spacing } from "../../styles/theme";

// HistoryBlock — the four history fields as per-field AutocompleteTags chip
// inputs (each with its own suggestion catalog), in the page's 2-col grid.
// Lifted from PrescriptionPage (HISTORY_FIELDS + historyGrid).
const HISTORY_FIELDS = [
  { label: "Family History", field: "family_history", placeholder: "Type here..." },
  { label: "Allergies", field: "allergies", placeholder: "Type here..." },
  { label: "Personal History", field: "personal_history", placeholder: "Type here..." },
  { label: "Past Medical History", field: "past_medical_history", placeholder: "Type here..." },
];

export type HistoryData = Record<string, string[]>;
export const emptyHistory = (): HistoryData => {
  const d: HistoryData = {};
  HISTORY_FIELDS.forEach((f) => { d[f.field] = []; });
  return d;
};

const gridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: spacing.l, rowGap: spacing.s, width: "100%" };
const fieldGroupStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: spacing.xs };
const fieldLabelStyle: CSSProperties = { fontSize: fonts.control.xs, lineHeight: fonts.lineHeight.xs, color: colors.neutral500, fontFamily: fonts.family.primary };

export function HistoryBlock({ value, onChange }: { value: HistoryData; onChange: (next: HistoryData) => void }) {
  return (
    <div style={gridStyle}>
      {HISTORY_FIELDS.map((f) => (
        <div key={f.label} style={fieldGroupStyle}>
          <span style={fieldLabelStyle}>{f.label}</span>
          <AutocompleteTags
            field={f.field}
            value={value[f.field] ?? []}
            onChange={(next) => onChange({ ...value, [f.field]: next })}
            placeholder={f.placeholder}
            ariaLabel={f.label}
          />
        </div>
      ))}
    </div>
  );
}
