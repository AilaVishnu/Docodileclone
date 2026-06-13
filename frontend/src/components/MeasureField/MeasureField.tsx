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
  onFocus?: () => void;
  /** Fixed unit-chip width (px). Defaults to a 44px minimum. */
  unitWidth?: number;
  /** Override the unit-chip text colour (e.g. match a placeholder grey). */
  unitColor?: string;
  /** "box" = white field for forms (price/qty); default cream = the vitals look. */
  box?: boolean;
  /** Fill the switchable unit chip (primary200) so it clearly reads as a button. */
  unitFilled?: boolean;
  // BP variant
  bp?: boolean;
  value2?: string;
  onChange2?: (value: string) => void;
  ariaLabel2?: string;
};

export function MeasureField({
  value, onChange, unit, onToggleUnit, prefix, placeholder, invalid, dense, box, unitFilled,
  inputMode = "numeric", ariaLabel, onKeyDown, onFocus, unitWidth, unitColor, bp, value2 = "", onChange2, ariaLabel2,
}: MeasureFieldProps) {
  const switchable = !!onToggleUnit;
  const height = dense ? 28 : "var(--input-h, 40px)";
  const R = radii.m;

  // BP variant: auto-advance from systolic → diastolic at 3 digits or on "/".
  const diaRef = React.useRef<HTMLInputElement>(null);
  const handleFirstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (bp && e.target.value.length >= 3) diaRef.current?.focus();
  };
  const handleFirstKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (bp && e.key === "/") { e.preventDefault(); diaRef.current?.focus(); return; }
    onKeyDown?.(e);
  };

  const inputBase: React.CSSProperties = {
    flex: 1, minWidth: 0, height: "100%", border: "none", outline: "none", padding: 0,
    fontSize: fonts.control.sm, fontFamily: fonts.family.primary, color: colors.neutral900,
    backgroundColor: "transparent", textAlign: box ? "left" : "center",
  };

  const inputs = (
    <>
      <input
        inputMode={inputMode} aria-label={ariaLabel} aria-invalid={invalid || undefined}
        value={value} onChange={handleFirstChange} onKeyDown={handleFirstKeyDown} onFocus={onFocus} placeholder={placeholder} style={inputBase}
      />
      {bp && (
        <>
          <span style={{ flexShrink: 0, fontSize: fonts.control.sm, color: colors.neutral500, padding: `0 ${spacing["3xs"]}`, userSelect: "none" }}>/</span>
          <input
            ref={diaRef} inputMode={inputMode} aria-label={ariaLabel2} aria-invalid={invalid || undefined}
            value={value2} onChange={(e) => onChange2?.(e.target.value)} onKeyDown={onKeyDown} onFocus={onFocus} style={inputBase}
          />
        </>
      )}
    </>
  );

  // ── Box variant — white field for forms (price/qty). One outer border; the
  // prefix / unit sit inside as dividers (fixed units; switchable shown by text). ──
  if (box) {
    return (
      <div style={{ display: "flex", alignItems: "stretch", height, width: "100%", boxSizing: "border-box",
        background: colors.neutral100, overflow: "hidden", borderRadius: R,
        border: `${strokes.xs} solid ${invalid ? colors.red200 : colors.neutral300}` }}>
        {prefix && (
          <span style={{ display: "flex", alignItems: "center", padding: `0 ${spacing.s}`, color: colors.neutral500,
            fontSize: fonts.control.md, borderRight: `${strokes.xs} solid ${colors.neutral200}` }}>{prefix}</span>
        )}
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", padding: `0 ${spacing.s}` }}>{inputs}</div>
        {unit && (
          <button type="button" onClick={onToggleUnit} title={switchable ? "Switch unit" : undefined}
            style={{ flexShrink: 0, ...(unitWidth ? { width: unitWidth } : { minWidth: 44 }), padding: `0 ${spacing.xs}`,
              display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap",
              fontSize: fonts.control.sm, fontFamily: fonts.family.primary, fontWeight: unitFilled ? fonts.weight.medium : undefined,
              background: unitFilled ? colors.primary200 : colors.neutral100, border: "none",
              borderLeft: unitFilled ? "none" : `${strokes.xs} solid ${colors.neutral200}`,
              color: unitFilled ? colors.neutral900 : (unitColor ?? (switchable ? colors.neutral800 : colors.neutral500)), cursor: switchable ? "pointer" : "default" }}>{unit}</button>
        )}
      </div>
    );
  }

  // ── Cream variant (default) — the vitals look. ──
  return (
    <div style={{ display: "flex", alignItems: "stretch", height, width: "100%" }}>
      {prefix && (
        <span style={{ display: "flex", alignItems: "center", padding: `0 ${spacing.xs}`, color: colors.neutral500,
          fontSize: fonts.control.md, background: colors.neutral100,
          border: `${strokes.xs} solid ${colors.primary300}`, borderRight: "none",
          borderRadius: `${R}px 0 0 ${R}px` }}>{prefix}</span>
      )}

      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", padding: `0 ${spacing.xs}`,
        backgroundColor: colors.primary100, boxSizing: "border-box",
        borderRadius: `${prefix ? 0 : R}px ${unit ? 0 : R}px ${unit ? 0 : R}px ${prefix ? 0 : R}px` }}>
        {inputs}
      </div>

      {unit && (
        <button
          type="button"
          onClick={onToggleUnit}
          title={switchable ? "Switch unit" : undefined}
          style={{
            flexShrink: 0, ...(unitWidth ? { width: unitWidth } : { minWidth: 44 }), padding: `0 ${spacing.xs}`, height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap",
            fontSize: fonts.control.sm, fontFamily: fonts.family.primary,
            backgroundColor: colors.neutral100,
            border: `${strokes.xs} solid ${invalid ? colors.red200 : switchable ? colors.primary500 : colors.primary300}`,
            color: unitColor ?? (switchable ? colors.neutral800 : colors.neutral500),
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
