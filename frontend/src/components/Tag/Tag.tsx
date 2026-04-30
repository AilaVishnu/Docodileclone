import React, { CSSProperties } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Tag pill — Figma 2372:7150 ("tags" design-system component).
// White background, sage (secondary/100) border, paragraph-xs text, and an
// optional small ✕ button at the right. Used by AutocompleteTags chips
// (History / Complaints / Diagnosis / Tests in the Prescription page).
// ─────────────────────────────────────────────────────────────────────────────

type TagProps = {
  label: React.ReactNode;
  /** When provided, a small ✕ button is rendered at the trailing edge. */
  onRemove?: () => void;
  /** aria-label for the remove button, e.g. `Remove Dengue Fever`. */
  removeLabel?: string;
  /** Style override for the outer pill container. */
  style?: CSSProperties;
};

export function Tag({ label, onRemove, removeLabel, style }: TagProps) {
  return (
    <span style={{ ...styles.tag, ...style }}>
      <span style={styles.label}>{label}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={styles.removeButton}
        >
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" aria-hidden="true">
            <path
              d="M1 1L5 5M5 1L1 5"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

const styles: Record<string, CSSProperties> = {
  tag: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s,
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
  label: {
    color: colors.neutral900,
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
};
