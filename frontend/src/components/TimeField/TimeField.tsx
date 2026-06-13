import React, { useState } from "react";
import { TimePicker } from "../AppointmentQueue/TimePicker";
import { ClockIcon } from "../../iconsUtil";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// TimeField — a labelled trigger "pill" (clock icon + time) that opens the
// shared TimePicker. Control-scale font (matches inputs/selects). `onWalkin`
// (if given) surfaces the picker's "Walk-in = now" action and `isWalkin`
// renders the "Walk-in" label instead of a clock time.
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

type TimeFieldProps = {
  value: string;
  onChange: (time: string) => void;
  selectedDate: Date;
  onWalkin?: (time: string) => void;
  isWalkin?: boolean;
  placeholder?: string;
  disabled?: boolean;
  disabledTitle?: string;
  invalid?: boolean;
  style?: React.CSSProperties;
};

export function TimeField({
  value, onChange, selectedDate, onWalkin, isWalkin,
  placeholder = "Select Time", disabled, disabledTitle, invalid, style,
}: TimeFieldProps) {
  const [open, setOpen] = useState(false);
  const filled = !!value || !!isWalkin;
  return (
    <div style={{ ...card, ...(invalid ? { borderColor: colors.red200, backgroundColor: colors.redAlpha10 } : {}), ...style }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: spacing.xs, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.65 : 1 }}
        onClick={() => { if (!disabled) setOpen(true); }}
        title={disabled ? disabledTitle : undefined}
      >
        <ClockIcon style={{ color: colors.neutral900, width: 24, height: 24, flexShrink: 0 }} />
        <span style={{ fontFamily: fonts.family.primary, fontSize: fonts.control.md, color: filled ? colors.neutral900 : colors.neutral400 }}>
          {isWalkin ? "Walk-in" : (value || placeholder)}
        </span>
      </div>
      {open && (
        <TimePicker
          initialTime={value}
          selectedDate={selectedDate}
          onSelect={(time: string) => { onChange(time); setOpen(false); }}
          onWalkin={(time: string) => { onWalkin?.(time); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
