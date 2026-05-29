import { CSSProperties } from "react";
import { colors, fonts, spacing, strokes, radii } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
    // Fill the locked viewport and scroll INTERNALLY (vertical only) — the
    // browser itself never scrolls. `safe center` keeps the content centered
    // when it fits, but falls back to top-aligned when it overflows so the
    // top is never clipped out of reach.
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    backgroundColor: colors.secondary200,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "safe center",
    padding: spacing.xl,
    boxSizing: "border-box",
  },

  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.xl,
    justifyContent: "center",
    marginTop: spacing.xxl,
  },

  buildLink: {
    marginTop: spacing.xxl,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    textDecoration: "underline",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
  },

  logoutButton: {
    position: "fixed" as const,
    bottom: spacing.l,
    right: spacing.l,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    // Page rule: all grey text/stroke = neutral500.
    color: colors.neutral500,
    background: "none",
    border: `${strokes.xs} solid ${colors.neutral500}`,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.m}`, // was 6/16 — 6 snapped to 8
    cursor: "pointer",
  },
};
