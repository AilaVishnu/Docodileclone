import { CSSProperties } from "react";
import { colors, spacing, fonts, radii } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    position: "fixed",
    // Anchored at bottom-right, just to the left of the chat bubble FAB
    // (52px bubble + 24px right offset + 12px gap ≈ 88px from the right edge).
    bottom: 24,
    right: 88,
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.neutral200}`,
    borderRadius: radii["2xl"],
    padding: `${spacing.s} ${spacing.m}`,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    zIndex: 4000,
    animation: "slideIn 0.3s ease-out",
  },

  // Same chip, but in normal document flow (no fixed overlay / z-index /
  // slide-in) — used by the `inline` prop for catalogs and stories.
  containerInline: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.s,
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.neutral200}`,
    borderRadius: radii["2xl"],
    padding: `${spacing.s} ${spacing.m}`,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  },

  icon: {
    width: 24,
    height: 24,
    flexShrink: 0,
  },

  message: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    margin: 0,
  },

  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: fonts.size.m,
    color: colors.neutral500,
    padding: 0,
    marginLeft: spacing.xs,
    flexShrink: 0,
  },

  actionButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    fontWeight: 600,
    color: colors.primary700,
    padding: `2px ${spacing.xs}`,
    marginLeft: spacing.xs,
    flexShrink: 0,
  },
};
