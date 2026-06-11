import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// ──────────────────────────────────────────────────────────────────────────────
// MeasureField — a value box + a unit chip. The shared input behind the vitals
// grid, price (₹ prefix) and quantity/duration fields.
//   • unit            — the chip label (cm, kg, mins, …)
//   • onToggleUnit    — if provided, the chip is SWITCHABLE (highlighted; click to
//                       toggle the unit). The PARENT owns the unit + value
//                       conversion; this just renders + calls back.
//   • prefix          — a leading chip (e.g. ₹).
//   • bp              — BP variant: two inputs (systolic / diastolic) + a "/".
//   • dense           — 28px tall (the vitals grid); default reads --input-h.
// Look matches the legacy vitals field: cream value box + white chip, border
// primary300 (fixed) / primary500 (switchable).
// ──────────────────────────────────────────────────────────────────────────────
export type MeasureFieldProps = {
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  onToggleUnit?: () => void;
  prefix?: string;
  placeholder?: string;
  invalid?: boolean;
  dense?: boolean;
  inputMode?: "numeric" | "decimal" | "text";
  ariaLabel?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Fixed unit-chip width (px). Defaults to a 44px minimum. */
  unitWidth?: number;
  // BP variant
  bp?: boolean;
  value2?: string;
  onChange2?: (value: string) => void;
  ariaLabel2?: string;
};

export function MeasureField({
  value, onChange, unit, onToggleUnit, prefix, placeholder, invalid, dense,
  inputMode = "numeric", ariaLabel, onKeyDown, unitWidth, bp, value2 = "", onChange2, ariaLabel2,
}: MeasureFieldProps) {
  const switchable = !!onToggleUnit;
  const height = dense ? 28 : "var(--input-h, 40px)";
  const R = radii.m;

  const inputBase: React.CSSProperties = {
    flex: 1, minWidth: 0, height: "100%", border: "none", outline: "none", padding: 0,
    fontSize: fonts.size.s, fontFamily: fonts.family.primary, color: colors.neutral900,
    backgroundColor: "transparent", textAlign: "center",
  };

  return (
    <div style={{ display: "flex", alignItems: "stretch", height, width: "100%" }}>
      {prefix && (
        <span style={{ display: "flex", alignItems: "center", padding: `0 ${spacing.xs}`, color: colors.neutral500,
          fontSize: fonts.size.m, background: colors.neutral100,
          border: `${strokes.xs} solid ${colors.primary300}`, borderRight: "none",
          borderRadius: `${R}px 0 0 ${R}px` }}>{prefix}</span>
      )}

      {/* cream value box */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", padding: `0 ${spacing.xs}`,
        backgroundColor: colors.primary100, boxSizing: "border-box",
        borderRadius: `${prefix ? 0 : R}px ${unit ? 0 : R}px ${unit ? 0 : R}px ${prefix ? 0 : R}px` }}>
        <input
          inputMode={inputMode} aria-label={ariaLabel} aria-invalid={invalid || undefined}
          value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} style={inputBase}
        />
        {bp && (
          <>
            <span style={{ flexShrink: 0, fontSize: fonts.size.s, color: colors.neutral500, padding: `0 ${spacing["3xs"]}`, userSelect: "none" }}>/</span>
            <input
              inputMode={inputMode} aria-label={ariaLabel2} aria-invalid={invalid || undefined}
              value={value2} onChange={(e) => onChange2?.(e.target.value)} onKeyDown={onKeyDown} style={inputBase}
            />
          </>
        )}
      </div>

      {/* unit chip */}
      {unit && (
        <button
          type="button"
          onClick={onToggleUnit}
          title={switchable ? "Switch unit" : undefined}
          style={{
            flexShrink: 0, ...(unitWidth ? { width: unitWidth } : { minWidth: 44 }), padding: `0 ${spacing.xs}`, height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap",
            fontSize: fonts.size.s, fontFamily: fonts.family.primary,
            backgroundColor: colors.neutral100,
            border: `${strokes.xs} solid ${invalid ? colors.red200 : switchable ? colors.primary500 : colors.primary300}`,
            color: switchable ? colors.neutral800 : colors.neutral500,
            borderRadius: `0 ${R}px ${R}px 0`,
            cursor: switchable ? "pointer" : "default",
          }}
        >
          {unit}
        </button>
      )}
    </div>
  );
}
