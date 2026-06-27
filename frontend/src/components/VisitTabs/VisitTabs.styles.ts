import { CSSProperties } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  // Flex row: [‹] [scroller of tabs] [›] [+ New Visit]. The host passes any
  // page-level overrides (marginTop, pointerEvents) via the `style` prop.
  root: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
  },
  // Horizontal scroller holding the visit pills. `flex: 0 1 auto` + `minWidth: 0`
  // lets it shrink below the pills' natural width so overflow-x engages and the
  // chevrons page through it; scrollbar hidden via the global .no-scrollbar.
  scroller: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    flex: "0 1 auto",
    minWidth: 0,
    overflowX: "auto",
    overflowY: "hidden",
    scrollBehavior: "smooth",
  },
  // Pagination chevrons — 32px square, white fill + thin border so they read as
  // solid buttons against the cream page.
  arrow: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    flexShrink: 0,
    padding: 0,
    boxSizing: "border-box",
    borderRadius: radii.m,
    border: `${strokes.xs} solid ${colors.neutral200}`,
    backgroundColor: colors.neutral100,
    color: colors.neutral700,
    cursor: "pointer",
  },
  arrowDisabled: {
    opacity: 0.4,
    cursor: "default",
  },
  // Compact pill — slim single-line row. Inactive: faint grey fill. Active:
  // white fill (the segmented content carries the peach accent).
  tab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: `${spacing["2xs"]} ${spacing.s}`,
    borderRadius: radii.m,
    cursor: "pointer",
    backgroundColor: colors.alphaBlack0,
    height: 32,
    fontFamily: fonts.family.primary,
    whiteSpace: "nowrap",
  },
  tabActive: {
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
  },
  tabInactive: {
    color: colors.neutral500,
  },
  // Segmented content: a quiet grey visit number, a hairline divider, then the
  // date (the element the doctor scans). Active: divider + number go peach, the
  // date darkens. `stretch` makes the divider span the taller (date) cell.
  seg: {
    display: "inline-flex",
    alignItems: "stretch",
  },
  num: {
    display: "inline-flex",
    alignItems: "center",
    paddingRight: spacing.xs,
    // Longhand (not the `borderRight` shorthand) so toggling active→inactive
    // doesn't hit React's shorthand/longhand reconciliation bug — which would
    // drop border-right-color and fall the divider back to the text colour.
    borderRightWidth: strokes.xs,
    borderRightStyle: "solid",
    borderRightColor: colors.neutral300,
    fontSize: fonts.size.xs,
    lineHeight: 1,
    fontWeight: fonts.weight.regular,
    color: colors.neutral500,
  },
  numActive: {
    borderRightColor: colors.active.shade400,
    color: colors.active.shade500,
  },
  date: {
    display: "inline-flex",
    alignItems: "center",
    paddingLeft: spacing.xs,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontWeight: fonts.weight.regular,
    color: colors.neutral800,
  },
  dateActive: {
    color: colors.neutral900,
  },
  // "+ New Visit" — dashed "new tab" affordance, kept outside the scroller so
  // it stays visible no matter where the strip is scrolled.
  addBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["3xs"],
    height: 32,
    padding: `0 ${spacing.s}`,
    borderRadius: radii.m,
    border: `${strokes.xs} dashed ${colors.primary500}`,
    backgroundColor: "transparent",
    color: colors.neutral700,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  addPlus: {
    fontSize: 18,
    lineHeight: 1,
  },
};
