import type { CSSProperties } from "react";
import { colors, fonts, spacing, strokes, radii } from "../../styles/theme";

// SectionBlock — the uniform chrome every visit block renders inside. Two
// surfaces: "flush" (divider-separated section in the visit sheet, matching the
// existing consult sections) and "card" (a distinct surface, via <Card>).
export const styles: Record<string, CSSProperties> = {
  // flush surface: a section with breathing room + a hairline divider below.
  flush: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
    padding: `${spacing.m} 0`,
    borderBottom: `${strokes.xs} solid ${colors.primary300}`,
  },
  flushNoDivider: { borderBottom: "none" },
  // card surface (bento, 2-colour scheme): a white card on the cream (primary200)
  // visit page — the white pops on the cream, so no border needed. Fields inside
  // are the same cream as the page, so the palette stays to two colours.
  card: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s, // internal gap matches the New Appointment cards
    background: colors.neutral100,
    borderRadius: radii["2xl"],
    padding: spacing.l,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.s,
  },
  titleWrap: { display: "flex", alignItems: "center", gap: spacing.xs, color: colors.neutral900, minWidth: 0 },
  icon: { width: 24, height: 24, color: colors.neutral900, flexShrink: 0 },
  title: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontWeight: fonts.weight.medium,
    color: colors.neutral900,
    whiteSpace: "nowrap",
  },
  summary: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    minWidth: 0,
  },
  actions: { display: "flex", alignItems: "center", gap: spacing["2xs"], flexShrink: 0 },
  // The whole title area is the collapse target (clicking the small arrow alone is
  // fiddly), so it's a full-width button with the chevron pinned to its right.
  titleToggle: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
    color: colors.neutral900,
    font: "inherit",
  },
  toggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    color: colors.neutral900,
  },
};
