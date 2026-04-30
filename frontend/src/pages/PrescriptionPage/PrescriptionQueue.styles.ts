import { CSSProperties } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Styles for the Prescription "Today's Queue" landing — Figma 2282:17378.
// Card width / avatar overlap match the reference frame; the row layout is
// a tighter alternative for the same data.
// ─────────────────────────────────────────────────────────────────────────────

export const styles: Record<string, CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
    width: "100%",
  },
  // "Today's Queue" — centered serif title (Figma: H5 24/34)
  title: {
    margin: 0,
    textAlign: "center" as const,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  // Tabs row + view-mode toggle
  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.m,
  },
  tabs: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
  },
  // Tab pill — Figma 2340:1151 (design-system "tabs" component).
  // Inactive: alphaBlack0 bg + alphaBlack3 text, 12px radius, paragraph-m
  // typography (Inter 16/22). Active: white bg with neutral900 text.
  tab: {
    height: 40,
    padding: `${spacing.xs} ${spacing.m}`,
    borderRadius: radii.xl,
    border: "none",
    backgroundColor: colors.alphaBlack0,
    color: colors.alphaBlack3,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    cursor: "pointer",
  },
  tabActive: {
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
  },
  viewToggle: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["2xs"],
  },
  viewBtn: {
    width: 40,
    height: 40,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.s,
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral600,
    cursor: "pointer",
  },
  viewBtnActive: {
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
  },

  // ─── grid (card) layout — Figma 2282:18638 ────────────────────────────
  grid: {
    display: "flex",
    flexWrap: "wrap" as const,
    rowGap: 73,
    columnGap: spacing.xl, // 24px between cards horizontally; row-gap matches paddingTop so wrapped rows clear the 49px avatar overlap.
    // 49px avatar overlap + 24px breathing room below the tabs above so
    // the avatar tops don't kiss the tab pills.
    paddingTop: 73,
  },
  // Card body: cream bg, peach border (only when prescription is in
  // progress — see cardGridIdle below for the non-active variant), fixed
  // 308x279, generous top padding for the avatar overlap.
  cardGrid: {
    position: "relative" as const,
    backgroundColor: colors.primary100,
    border: `${strokes.xs} solid ${colors.primary500}`,
    borderRadius: radii.xl,
    width: 308,
    // Figma body height 279. Avatar overlaps the card top by 49px (avatar
    // is 81 tall, body sits at y=49 of the 328-tall outer group), so the
    // card's effective top padding includes that overlap.
    minHeight: 279,
    padding: `49px ${spacing.xl} ${spacing.xl}`,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: spacing.m,
    boxSizing: "border-box" as const,
  },
  // Override applied to cards whose prescription has NOT been started —
  // keeps the same border-box dimensions but renders the border invisible
  // so only "In Progress" cards stand out with the peach outline.
  cardGridIdle: {
    border: `${strokes.xs} solid transparent`,
  },
  cardAvatar: {
    position: "absolute" as const,
    // Figma: avatar (80x81) sits at the very top of the outer 308x328
    // group; card body starts 49px below it, so the avatar overlaps the
    // body by 49px.
    top: -49,
    left: "50%",
    transform: "translateX(-50%)",
    width: 80,
    height: 81,
    borderRadius: radii.full,
    backgroundColor: colors.primary300,
    objectFit: "contain" as const,
  },
  cardBody: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    // space-between distributes title / rows / footer across the body
    // height so the View Pad button always sits at the same baseline,
    // even if a row wraps and grows the rows block by a line.
    justifyContent: "space-between" as const,
    gap: spacing.m,
    width: "100%",
    height: "100%",
  },
  cardTitle: {
    margin: 0,
    textAlign: "center" as const,
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
  },
  // "T023: Vinay Pittampally" — H5 (24/34)
  cardTitleName: {
    fontSize: 24,
    lineHeight: "34px",
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
  },
  // "(M|25)" — slightly smaller (20/28)
  cardTitleMeta: {
    fontSize: 20,
    lineHeight: "28px",
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
  },
  cardRows: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.xs,
    width: "100%",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center" as const,
    gap: spacing.m,
    width: "100%",
  },
  rowLabel: {
    width: 80,
    color: colors.alphaBlack3,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontFamily: fonts.family.primary,
  },
  rowValue: {
    width: 80,
    color: colors.neutral900,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontFamily: fonts.family.primary,
  },
  typeRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["2xs"],
  },
  cardFooter: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },

  // ─── list layout — table mirroring AppointmentQueue's QueueTable ──────
  tableWrap: {
    backgroundColor: colors.primary100,
    borderRadius: radii.l,
    padding: spacing.l,
    overflow: "auto" as const,
  },
  table: {
    width: "100%",
    maxWidth: "100%",
    borderCollapse: "collapse" as const,
    textAlign: "left" as const,
    tableLayout: "fixed" as const,
  },
  // Figma 1932:2438 row padding: 8px horizontal / 12px vertical. Same for
  // every cell so columns line up vertically across header + data rows.
  th: {
    padding: "14px 8px",
    borderBottom: `${strokes.xs} solid ${colors.primary300}`,
    color: colors.alphaBlack3,
    fontWeight: fonts.weight.regular,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontFamily: fonts.family.primary,
    textAlign: "left" as const,
    verticalAlign: "middle" as const,
  },
  tr: {
    borderBottom: `${strokes.xs} solid ${colors.primary300}`,
  },
  td: {
    padding: "14px 8px",
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    verticalAlign: "middle" as const,
    whiteSpace: "nowrap" as const,
  },
  tdSerial: {
    padding: "14px 8px",
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    verticalAlign: "middle" as const,
    textAlign: "left" as const,
  },
  // <td> can't be display:flex without breaking vertical-align; the inner
  // span handles the flex layout for name + (M|25) meta.
  tdName: {
    padding: "14px 8px",
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    verticalAlign: "middle" as const,
    whiteSpace: "nowrap" as const,
  },
  tdNameInner: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
  },
  tdNamePrimary: {
    color: colors.neutral900,
  },
  tdNameMeta: {
    color: colors.neutral500,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  },
  tdNameDivider: {
    color: colors.neutral300,
  },

  // shared empty / loading state
  empty: {
    padding: spacing.xl,
    textAlign: "center" as const,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    border: `${strokes.xs} dashed ${colors.primary300}`,
  },
};
