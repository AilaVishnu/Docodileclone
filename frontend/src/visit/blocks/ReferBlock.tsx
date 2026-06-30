import React from "react";
import type { CSSProperties } from "react";
import { Select } from "../../components/Input/Select/Select";
import { colors, fonts, spacing } from "../../styles/theme";

// ReferBlock — refer the patient to another doctor.
export type ReferData = { doctor: string };
export const emptyRefer = (): ReferData => ({ doctor: "" });

const DOCTORS = ["Dr. Anjali Menon — Dermatology", "Dr. Vikram Rao — Rheumatology", "Dr. Priya Nair — Plastic surgery"];

const rowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: spacing.m };
const labelStyle: CSSProperties = { fontFamily: fonts.family.primary, fontSize: fonts.control.md, color: colors.neutral700, flexShrink: 0 };

export function ReferBlock({ value, onChange }: { value: ReferData; onChange: (next: ReferData) => void }) {
  return (
    <div style={rowStyle}>
      <span style={labelStyle}>Refer to</span>
      <div style={{ width: 300 }}>
        <Select options={DOCTORS} value={value.doctor} onChange={(v) => onChange({ doctor: v })} placeholder="Select doctor" fill="filled" />
      </div>
    </div>
  );
}
