import React from "react";
import type { CSSProperties } from "react";
import { DateField } from "../../components/DateField";
import { Field } from "../../components/Field";
import { colors, fonts, spacing } from "../../styles/theme";

// ReviewBlock — the next review: a date, or a number of days, plus notes.
export type ReviewData = { date: Date | null; days: string; notes: string };
export const emptyReview = (): ReviewData => ({ date: null, days: "", notes: "" });

const rowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: spacing.s, flexWrap: "wrap" };
const orStyle: CSSProperties = { fontFamily: fonts.family.primary, fontSize: fonts.control.md, color: colors.neutral500 };
const daysLabel: CSSProperties = { fontFamily: fonts.family.primary, fontSize: fonts.control.md, color: colors.neutral700 };

export function ReviewBlock({ value, onChange }: { value: ReviewData; onChange: (next: ReviewData) => void }) {
  const set = (patch: Partial<ReviewData>) => onChange({ ...value, ...patch });
  return (
    <div style={rowStyle}>
      <div style={{ width: 184 }}>
        <DateField value={value.date} onChange={(d) => set({ date: d })} placeholder="Select date" />
      </div>
      <span style={orStyle}>or</span>
      <div style={{ width: 64 }}><Field variant="box" fill="filled" value={value.days} onChange={(v) => set({ days: v })} placeholder="0" align="center" /></div>
      <span style={daysLabel}>days</span>
      <div style={{ flex: 1, minWidth: 160 }}><Field variant="box" fill="filled" value={value.notes} onChange={(v) => set({ notes: v })} placeholder="Notes for Review…" /></div>
    </div>
  );
}
