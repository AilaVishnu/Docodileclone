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
            // Plain ✕ (no surrounding circle).
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M3 3L9 9M9 3L3 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path
                d="M2 2L8 8M8 2L2 8"
                stroke="currentColor"
                strokeWidth="1.5"
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
    gap: spacing.xs,
    padding: `${spacing["2xs"]} ${spacing.s}`,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.secondary100}`,
    borderRadius: radii.full,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    whiteSpace: "nowrap" as const,
  },
  // Filled variant override — Figma 2392:5347 specialty chip
  tagFilled: {
    backgroundColor: colors.secondary700,
    border: "none",
    color: colors.neutral100,
    // 4px vertical (from base) / 8px horizontal both sides → 4,8,4,8.
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
  },
  removeButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
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
