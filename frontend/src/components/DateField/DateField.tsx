import React, { useState } from "react";
import { DatePicker } from "../DatePicker/DatePicker";
import { Icon } from "../Icon";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// DateField — a labelled trigger "pill" (calendar icon + formatted date) that
// opens the shared DatePicker. The trigger text uses the control-scale font so
// it matches inputs/selects. Pass `format` to control how the date renders.
// ─────────────────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  backgroundColor: colors.neutral100,
  borderRadius: radii.m,
  border: `${strokes.xs} solid ${colors.neutral100}`,
  padding: `${spacing.xs} ${spacing.m}`,
  minHeight: 40,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  position: "relative",
  boxSizing: "border-box",
  width: "100%",
};

type DateFieldProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  /** Display formatter. Defaults to "13 Jun 2026". */
  format?: (d: Date) => string;
  placeholder?: string;
  disabled?: boolean;
  disabledTitle?: string;
  disablePast?: boolean;
  invalid?: boolean;
  style?: React.CSSProperties;
};

const defaultFormat = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function DateField({
  value, onChange, format = defaultFormat, placeholder = "Select Date",
  disabled, disabledTitle, disablePast, invalid, style,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ ...card, ...(invalid ? { borderColor: colors.red200, backgroundColor: colors.redAlpha10 } : {}), ...style }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: spacing.xs, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.65 : 1 }}
        onClick={() => { if (!disabled) setOpen(true); }}
        title={disabled ? disabledTitle : undefined}
      >
        <Icon name="calendar-alt" size={24} color={colors.neutral900} style={{ flexShrink: 0 }} />
        <span style={{ fontFamily: fonts.family.primary, fontSize: fonts.control.md, color: value ? colors.neutral900 : colors.neutral400 }}>
          {value ? format(value) : placeholder}
        </span>
      </div>
      {open && (
        <DatePicker
          selectedDate={value ?? new Date()}
          onSelect={(date: Date) => { onChange(date); setOpen(false); }}
          onClose={() => setOpen(false)}
          disablePast={disablePast}
        />
      )}
    </div>
  );
}
