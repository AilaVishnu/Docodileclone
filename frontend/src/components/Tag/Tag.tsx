import React, { CSSProperties } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Tag pill — design-system component used in two visual variants:
//
//  - "outline" (default, Figma 2372:7150) — white bg, sage secondary/100
//    border, dark text, tiny ✕. Used by AutocompleteTags chips on the
//    Prescription page (History / Complaints / Diagnosis / Tests).
//  - "filled" (Figma 2392:5347's specialty chip) — dark sage secondary/700
//    bg, white text + ✕. Used by the BuildYourClinic specialty picker.
// ─────────────────────────────────────────────────────────────────────────────

type TagProps = {
  label: React.ReactNode;
  /** Visual variant — see file header. */
  variant?: "outline" | "filled";
  /** When provided, a small ✕ button is rendered at the trailing edge. */
  onRemove?: () => void;
  /** aria-label for the remove button, e.g. `Remove Dengue Fever`. */
  removeLabel?: string;
  /** Style override for the outer pill container. */
  style?: CSSProperties;
};

export function Tag({
  label,
  variant = "outline",
  onRemove,
  removeLabel,
  style,
}: TagProps) {
  const isFilled = variant === "filled";
  const tagStyle = isFilled ? { ...styles.tag, ...styles.tagFilled } : styles.tag;
  const removeStyle = isFilled
    ? { ...styles.removeButton, ...styles.removeButtonFilled }
    : styles.removeButton;
  return (
    <span style={{ ...tagStyle, ...style }}>
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={removeStyle}
        >
          {isFilled ? (
            // Filled variant uses the larger close-circle glyph from
            // Figma's icon set so the ✕ reads against the saturated bg.
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" />
              <path
                d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" aria-hidden="true">
              <path
                d="M1 1L5 5M5 1L1 5"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      )}
    </span>
  );
}

const styles: Record<string, CSSProperties> = {
  // Outline variant — Figma 2372:7150
  tag: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2xs"],
    padding: `${spacing["3xs"]} ${spacing.xs}`,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.secondary100}`,
    borderRadius: radii.full,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral900,
    whiteSpace: "nowrap" as const,
  },
  // Filled variant override — Figma 2392:5347 specialty chip
  tagFilled: {
    backgroundColor: colors.secondary700,
    border: "none",
    color: colors.neutral100,
    paddingLeft: spacing.xs,
    paddingRight: spacing["2xs"],
  },
  removeButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 12,
    height: 12,
    padding: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: colors.neutral500,
  },
  removeButtonFilled: {
    width: 16,
    height: 16,
    color: colors.neutral100,
  },
};
