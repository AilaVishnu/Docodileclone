import React from "react";
import type { CSSProperties } from "react";
import { Field } from "../../components/Field";
import { colors, fonts, spacing } from "../../styles/theme";

// HistoryBlock — the four history fields in a 2-column grid.
export type HistoryData = {
  familyHistory: string;
  allergies: string;
  personalHistory: string;
  pastMedicalHistory: string;
};
export const emptyHistory = (): HistoryData => ({ familyHistory: "", allergies: "", personalHistory: "", pastMedicalHistory: "" });

const gridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.m };
const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: spacing["2xs"], minWidth: 0 };
const labelStyle: CSSProperties = {
  fontFamily: fonts.family.primary,
  fontSize: fonts.control.sm,
  fontWeight: fonts.weight.medium,
  color: colors.neutral700,
};

const FIELDS: { key: keyof HistoryData; label: string }[] = [
  { key: "familyHistory", label: "Family history" },
  { key: "allergies", label: "Allergies" },
  { key: "personalHistory", label: "Personal history" },
  { key: "pastMedicalHistory", label: "Past medical history" },
];

export function HistoryBlock({ value, onChange }: { value: HistoryData; onChange: (next: HistoryData) => void }) {
  return (
    <div style={gridStyle}>
      {FIELDS.map((f) => (
        <label key={f.key} style={wrapStyle}>
          <span style={labelStyle}>{f.label}</span>
          <Field
            variant="box"
            fill="filled"
            value={value[f.key]}
            onChange={(v) => onChange({ ...value, [f.key]: v } as HistoryData)}
            placeholder="Type here…"
          />
        </label>
      ))}
    </div>
  );
}
