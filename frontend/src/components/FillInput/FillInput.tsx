import React from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";

// ──────────────────────────────────────────────────────────────────────────────
// FillInput — a borderless cream "fill block" input. The plainest editable field
// in the system: a primary100 fill, rounded, no border, no spinner arrows.
//   • list  — bind a <datalist> id and typing shows the native suggestions
//             dropdown (no chevron affordance — the list opens as you type).
//   • align — text alignment (left for names, center for numbers).
// Shared by the Bill modal line items and the prescription page.
// ──────────────────────────────────────────────────────────────────────────────
export type FillInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Datalist id — typing shows the suggestions dropdown (no chevron). */
  list?: string;
  inputMode?: "numeric" | "decimal" | "text";
  align?: "left" | "center" | "right";
  ariaLabel?: string;
  onFocus?: () => void;
};

export function FillInput({ value, onChange, placeholder, list, inputMode = "text", align = "left", ariaLabel, onFocus }: FillInputProps) {
  return (
    <input
      className="fill-input"
      list={list}
      inputMode={inputMode}
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      style={{
        width: "100%", height: "var(--input-h, 32px)", boxSizing: "border-box",
        border: "none", outline: "none", borderRadius: radii.m,
        background: colors.primary100, color: colors.neutral900,
        padding: `0 ${spacing.xs}`, textAlign: align,
        fontFamily: fonts.family.primary, fontSize: fonts.size.m,
      }}
    />
  );
}
