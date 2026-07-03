import React from "react";
import { colors, spacing, fonts } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Switch — boolean toggle styled to match the Docodile design system. Track
// fills with the active theme color when on; thumb slides with a soft easing.
// Keyboard-operable via Space / Enter.
//
// Sizing:
//   • md (default) — 36×20 track, 16×16 thumb. Use in forms.
//   • sm           — 28×16 track, 12×12 thumb. Use in dense rows.
// ─────────────────────────────────────────────────────────────────────────────

export type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  size?: "sm" | "md";
  // Optional inline helper text rendered to the right of the track.
  hint?: React.ReactNode;
  // Accessible label — used by screen readers when there's no adjacent text.
  ariaLabel?: string;
  disabled?: boolean;
};

const SIZES = {
  sm: { track: { w: 28, h: 16 }, thumb: 12, travel: 12 },
  md: { track: { w: 36, h: 20 }, thumb: 16, travel: 16 },
} as const;

export function Switch({ checked, onChange, size = "md", hint, ariaLabel, disabled }: SwitchProps) {
  const s = SIZES[size];
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: spacing.s,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        style={{
          width: s.track.w,
          height: s.track.h,
          borderRadius: 999,
          backgroundColor: checked ? colors.active.shade600 : colors.neutral300,
          position: "relative",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "background-color var(--motion-base) var(--ease-standard)",
          flexShrink: 0,
          display: "inline-block",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: (s.track.h - s.thumb) / 2,
            left: 0,
            width: s.thumb,
            height: s.thumb,
            borderRadius: "50%",
            backgroundColor: colors.neutral100,
            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            transition: "transform var(--motion-slow) var(--ease-spring)",
            transform: `translateX(${checked ? s.travel + 2 : 2}px)`,
            display: "block",
          }}
        />
      </span>
      {hint && (
        <span style={{ fontSize: fonts.control.xs, color: colors.neutral500 }}>{hint}</span>
      )}
    </label>
  );
}
