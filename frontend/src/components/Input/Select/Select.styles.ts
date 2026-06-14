import { CSSProperties } from "react";
import { colors, radii, fonts, spacing, strokes, shadows } from "../../../styles/theme";

// Matches Figma dropdown-m (node 312:1441).
//
// STATE → VISUAL
//   Default (empty, idle):    border neutral300 · arrow neutral300 · placeholder neutral500
//   Hover:                    border neutral900 · arrow neutral900 · placeholder neutral500
//   Open (menu visible):      border neutral900 · arrow neutral900 · value neutral900
//   Filled (has value):       border neutral900 · arrow neutral900 · value neutral900
//   Disabled:                 border neutral300 · arrow neutral300 · text     neutral500
//   Error:                    border red200    · arrow red200    · (inherits)
//
// RULE OF THUMB: border and arrow always share the same color — they switch
// together. Text color is the only axis that tracks "empty vs filled".
export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: `0 ${spacing.xs}`,
    // Longhand (not the `border` shorthand) so the hover/open/error states below
    // can override just `borderColor` without React warning about mixing
    // shorthand + non-shorthand border properties across re-renders.
    borderWidth: strokes.xs,
    borderStyle: "solid",
    borderColor: colors.neutral300,
    borderRadius: radii.m,
    backgroundColor: colors.neutral100,
    height: "var(--input-h, 40px)",
    width: "100%",
    position: "relative",
    cursor: "pointer",
    transition: "border-color 0.15s ease, color 0.15s ease",
    boxSizing: "border-box",
    // `color` on the container becomes the `currentColor` source for the
    // arrow and any iconLeft the consumer passes in. Default = neutral300
    // (grey), matches the border.
    color: colors.neutral300,
  },

  // Applied on hover / open / filled — border AND arrow AND iconLeft all
  // switch to neutral900 together via inherited `currentColor`.
  containerActive: {
    borderColor: colors.neutral900,
    color: colors.neutral900,
  },

  // Applied when disabled (passive look — greyed, non-interactive).
  containerDisabled: {
    borderColor: colors.neutral300,
    color: colors.neutral300,
    cursor: "not-allowed",
    opacity: 0.6,
  },

  errorContainer: {
    borderColor: colors.red200,
    color: colors.red200,
  },

  select: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md, // static 16 per our control scale
    // Value text is always neutral900; placeholder override below.
    color: colors.neutral900,
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    border: "none",
    outline: "none",
    padding: 0,
    backgroundColor: "transparent",
    cursor: "inherit",
  },

  // Selected value (and placeholder) — one line, ellipsis on overflow; never wraps.
  value: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "left",
  },

  // Placeholder text (shown when no value selected) stays neutral400
  // regardless of hover/open — per Figma every state keeps the placeholder
  // at the muted grey. Only the border/arrow react.
  placeholder: {
    color: colors.neutral400,
  },

  // iconLeft wrapper — inherits `color` from the container so it follows
  // the same state coloring as the arrow.
  iconLeft: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    color: "inherit",
  },

  arrow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // color: inherits from container → switches with state
    color: "inherit",
    transition: "transform 0.2s ease",
    pointerEvents: "none",
    flexShrink: 0,
    width: 24,
    height: 24,
  },

  // ─── Menu (dropdown panel) ───────────────────────────────────────────
  menu: {
    position: "absolute" as const,
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    boxShadow: shadows.menu,
    zIndex: 100,
    maxHeight: "220px",
    overflowY: "auto" as const,
    padding: spacing["2xs"], // 4px
    scrollbarWidth: "none" as const,
    msOverflowStyle: "none" as const,
  },

  menuItem: {
    padding: `${spacing["2xs"]} ${spacing.xs}`, // 4/8
    minHeight: 28,
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    cursor: "pointer",
    borderRadius: radii.m,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm, // static 14
    color: colors.neutral900,
    textAlign: "left" as const,
    transition: "background-color 0.12s ease",
  },

  menuItemHovered: {
    backgroundColor: colors.active.shade100,
  },

  menuItemSelected: {
    backgroundColor: colors.primary100,
    color: colors.primary700,
  },
};
