import { CSSProperties } from "react";
import { colors, fonts, radii, spacing, strokes, fluidSpacing } from "../../styles/theme";
import { tableHeadCell, tableDivider } from "../../styles/tableStyles";

// ─────────────────────────────────────────────────────────────────────────────
// Styles for the Prescription "Today's Queue" landing — Figma 2282:17378.
// Card width / avatar overlap match the reference frame; the row layout is
// a tighter alternative for the same data.
// ─────────────────────────────────────────────────────────────────────────────

export const styles: Record<string, CSSProperties> = {
  // Acts as its OWN scroll container (mirroring AppointmentQueue.container)
  // so the sticky <PageHeader/> can hug the very top of main. See
  // PageHeader.styles.ts for the sticky-clamp note.
  page: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
    padding: `0 ${fluidSpacing.outerX} ${fluidSpacing.outerY}`,
    overflowY: "auto",
    overflowX: "hidden",
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
    height: "var(--tab-md-h, 40px)",
    // Horizontal padding is tier-aware via --rxq-tab-padx (16px default,
    // 12px on the 1200–1439 tier). Vertical stays at spacing.xs.
    padding: `${spacing.xs} var(--rxq-tab-padx, 16px)`,
    borderRadius: "var(--tab-md-r, 12px)",
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
    // neutral900 to match the sidebar's icon tone (paired with strokeWidth
    // 1.5 on the icon component for the same weight).
    color: colors.neutral900,
    cursor: "pointer",
  },
  viewBtnActive: {
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
  },

  // ─── grid (card) layout — Figma 2282:18638 ────────────────────────────
  // Card width is fixed (308); the number of cards per row grows with the
  // viewport (auto-fill packs as many as fit), and the horizontal gap scales
  // between 16px (tight on 1024) and 32px (breathy on 2560). Cards stay
  // centered in the row so leftover space goes to outer gutters.
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 308px)",
    // Left-justified so the first card lines up with the "View all" tab on
    // the left of the controls row above. Extra horizontal space lands on
    // the right as a single gutter (rather than splitting both sides).
    justifyContent: "start",
    columnGap: "clamp(16px, 1.5vw, 32px)",
    rowGap: 73, // matches paddingTop so wrapped rows clear the 49px avatar overlap.
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
    // Tight horizontal padding (xl 24 → s 12) — buys interior width without
    // changing the card's 308px outer footprint, so longer names/labels have
    // more room before they need to truncate.
    padding: `49px ${spacing.s} ${spacing.xl}`,
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
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
  },
  // "(M|25)" — slightly smaller (l: 20/28)
  cardTitleMeta: {
    fontSize: fonts.size.l,
    lineHeight: fonts.lineHeight.l,
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
  },
  cardRows: {
    display: "flex",
    flexDirection: "column" as const,
    // Slightly more vertical air between Service / Type / Time / Status rows
    // (xs 8 → s 12) so each row reads as its own line, not a tight list.
    gap: spacing.s,
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
  // Vertical rhythm matches AppointmentQueue (th 12px / td 10px) so the two
  // queue tables read as siblings. Per-cell paddingLeft/Right is overridden
  // inline (mirrors the QueueTable spacer pattern).
  th: {
    ...tableHeadCell, // shared: alphaBlack3 / 400 / primary300 divider
    padding: "12px 0",
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontFamily: fonts.family.primary,
    verticalAlign: "middle" as const,
  },
  tr: {
    borderBottom: tableDivider,
  },
  td: {
    padding: "10px 0",
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    verticalAlign: "middle" as const,
    whiteSpace: "nowrap" as const,
  },
  tdSerial: {
    padding: "10px 0",
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    verticalAlign: "middle" as const,
    textAlign: "left" as const,
    whiteSpace: "nowrap" as const,
  },
  // <td> can't be display:flex without breaking vertical-align; the inner
  // span handles the flex layout for name + (M|25) meta.
  tdName: {
    padding: "10px 0",
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
