import React from "react";
import { colors, fonts } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Radio — one labelled radio option. Native <input type="radio"> tinted with the
// canonical neutral900 accent + a control-font label, wrapped in a <label> so the
// text is clickable. Use RadioGroup for a set; use Radio directly only when you
// need custom composition. Replaces the ~7 hand-rolled radio rows (gender, role,
// payment method) that diverged in accent colour, font and spacing.
// ─────────────────────────────────────────────────────────────────────────────
type RadioProps = {
  name?: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: React.ReactNode;
  disabled?: boolean;
  /** Override the label colour (e.g. a red "Waive" option). */
  color?: string;
};

export function Radio({ name, value, checked, onChange, label, disabled, color }: RadioProps) {
  // Fully custom (appearance:none) so the unchecked RING also reads neutral900,
  // not browser-grey — accent-color alone only tints the checked dot. Matches
  // the field-icon weight. Disabled dims ring + dot to neutral400.
  const dot = disabled ? colors.neutral400 : colors.neutral900;
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: fonts.family.primary,
        fontSize: fonts.control.sm,
        lineHeight: 1,
        color: disabled ? colors.neutral400 : color ?? colors.neutral900,
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          width: 16,
          height: 16,
          margin: 0,
          flexShrink: 0,
          border: `1.5px solid ${dot}`,
          borderRadius: "50%",
          background: checked ? `radial-gradient(circle, ${dot} 0 4px, transparent 5px)` : "transparent",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      />
      {label}
    </label>
  );
}
