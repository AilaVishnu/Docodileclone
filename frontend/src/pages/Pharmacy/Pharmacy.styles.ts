import { CSSProperties } from "react";
import { colors, fonts, radii, spacing, strokes, fluidSpacing } from "../../styles/theme";
import { tableHeadCell, tableDivider } from "../../styles/tableStyles";

export const styles: Record<string, CSSProperties> = {
  // Own scroll container filling <main> so the shared sticky <PageHeader> hugs
  // the top, like the Appointments / Rx Pad / Patient Files modules.
  page: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    padding: `0 ${fluidSpacing.outerX} ${fluidSpacing.outerY}`,
    overflowY: "auto",
    overflowX: "hidden",
    minWidth: 0,
  },
  content: {
    width: "100%",
    minWidth: 0,
    marginTop: "var(--main-gap, 24px)",
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
  },

  // Centered serif title with primary CTA pinned to the right — 3-col grid
  // keeps the title optically centered regardless of CTA width.
  header: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: spacing.m,
  },
  headerSpacer: {},
  headerActions: {
    justifySelf: "end",
  },
  title: {
    margin: 0,
    textAlign: "center",
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
    justifyContent: "space-between",
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
    flex: 1,
    minWidth: 0,
  },
  toolbarRight: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
  },
  // Pill-shaped, borderless — matches Services / PatientFiles search.
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    width: "100%",
    maxWidth: 360,
    height: "var(--search-h)",
    padding: `0 ${spacing.m}`,
    backgroundColor: colors.neutral100,
    borderRadius: 55,
    boxSizing: "border-box",
  },
  searchIcon: {
    width: "var(--search-icon)",
    height: "var(--search-icon)",
    color: colors.neutral400,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: fonts.family.primary,
    fontSize: "var(--search-fs)",
    color: colors.neutral900,
  },
  // Binary filter pill — matches PrescriptionQueue tab convention:
  // inactive = subtle alphaBlack0 bg w/ muted text, active = white pill w/
  // dark text. Never solid black (that's reserved for the primary CTA).
  togglePill: {
    height: "var(--tab-md-h, 40px)",
    padding: `0 ${spacing.m}`,
    borderRadius: "var(--tab-md-r, 12px)",
    border: "none",
    backgroundColor: colors.alphaBlack0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.alphaBlack3,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  // White pill (matches the canonical Tabs) — was an inverted dark pill, which
  // contradicted this block's own comment. Now neutral100 bg / neutral900 text.
  togglePillActive: {
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
  },
  // (Sort chips now use the shared <Tabs variant="block"> component.)

  // View toggle: gap-only group, matches PrescriptionQueue pattern.
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

  // ─── List view ───────────────────────────────────────────────────────────
  // Matches Services tableContainer — cream bg, large radius, generous pad.
  listCard: {
    backgroundColor: colors.primary100,
    borderRadius: 24,
    padding: spacing.xl,
    overflow: "hidden",
  },
  tableScroll: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
  },
  thead: {
    backgroundColor: "transparent",
  },
  th: {
    ...tableHeadCell, // shared: alphaBlack3 / 400 / primary300 divider
    padding: `${spacing.s} ${spacing.m}`,
    fontSize: fonts.control.xs,
    whiteSpace: "nowrap",
  },
  thNumeric: {
    textAlign: "right",
  },
  tr: {
    borderBottom: tableDivider,
  },
  trAlt: {
    backgroundColor: "transparent",
  },
  td: {
    padding: `${spacing.s} ${spacing.m}`,
    whiteSpace: "nowrap",
  },
  tdNumeric: {
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  invoiceLink: {
    color: colors.primary700,
    textDecoration: "none",
    cursor: "pointer",
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: colors.neutral600,
    borderRadius: radii.xs,
  },

  // ─── Shelf view ──────────────────────────────────────────────────────────
  shelfContainer: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
  },
  shelf: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  shelfHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingLeft: spacing["2xs"],
  },
  shelfTitle: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    fontWeight: fonts.weight.medium,
  },
  shelfCount: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
  },
  shelfPlank: {
    position: "relative",
    backgroundColor: colors.primary100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: spacing.m,
    paddingBottom: spacing.l,
  },
  shelfRow: {
    display: "flex",
    flexDirection: "row",
    gap: spacing.m,
    overflowX: "auto",
    overflowY: "hidden",
    scrollSnapType: "x mandatory",
  },
  // wooden plank base under the row
  shelfBase: {
    position: "absolute",
    left: spacing.s,
    right: spacing.s,
    bottom: spacing["3xs"],
    height: 8,
    borderRadius: radii.xs,
    backgroundColor: colors.primary400,
    opacity: 0.6,
  },

  tile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.xs,
    cursor: "pointer",
    background: "transparent",
    border: "none",
    padding: 0,
    width: 120,
    flexShrink: 0,
    scrollSnapAlign: "start",
  },
  tileLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing["3xs"],
    width: "100%",
  },
  tileIllustration: {
    width: 64,
    height: 80,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    position: "relative",
  },
  tileName: {
    width: "100%",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral900,
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    padding: `0 ${spacing["2xs"]}`,
  },
  tileMeta: {
    display: "flex",
    alignItems: "center",
    gap: spacing["2xs"],
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.caption,
    lineHeight: fonts.lineHeight.caption,
    color: colors.neutral500,
  },
  tileStockOut: {
    color: colors.red200,
  },

  expiryChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: `1px ${spacing["2xs"]}`,
    borderRadius: radii.full,
    fontSize: fonts.size.caption,
    lineHeight: fonts.lineHeight.caption,
    fontFamily: fonts.family.primary,
    fontWeight: fonts.weight.medium,
  },
  expiryGood: {
    backgroundColor: colors.greenAlpha10,
    color: colors.green200,
  },
  expiryWarn: {
    backgroundColor: colors.yellowAlpha10,
    color: colors.yellow200,
  },
  expiryBad: {
    backgroundColor: colors.redAlpha10,
    color: colors.red200,
  },

  // ─── Drill-in modal body (uses shared Modal component) ───────────────────
  detailModal: {
    width: 520,
    maxWidth: "90vw",
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
  },
  detailHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.s,
  },
  detailName: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.h6,
    lineHeight: fonts.lineHeight.h6,
    color: colors.neutral900,
    fontWeight: fonts.weight.medium,
  },
  detailCategory: {
    marginTop: spacing["3xs"],
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
  },
  detailClose: {
    width: 32,
    height: 32,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: colors.neutral700,
    fontSize: 22,
    borderRadius: radii.xs,
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    rowGap: spacing.m,
    columnGap: spacing.m,
  },
  detailLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
  },
  detailValue: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    marginTop: 2,
  },

  emptyState: {
    padding: `${spacing.xl} ${spacing.l}`,
    textAlign: "center",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral500,
  },
};
