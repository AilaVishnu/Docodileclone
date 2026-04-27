import { CSSProperties } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Prescription page — baseline scaffold per Figma node 2057:6224
// Two-column layout: patient/context pane on the left (308px fixed),
// visit-form area on the right (grows).
// All sections rendered as Cards to match the existing design system.
// ─────────────────────────────────────────────────────────────────────────────

export const styles: Record<string, CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    width: "100%",
  },

  // Header uses the same column grid as the body so the title (column 2)
  // aligns with the right area's left edge — i.e. above the visit tabs.
  header: {
    display: "grid",
    gridTemplateColumns: "308px minmax(0, 1fr)",
    gap: spacing.m,
    alignItems: "start",
  },
  headerLeft: {
    display: "flex",
    alignItems: "flex-start",
  },
  headerRight: {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing.m,
  },
  headerTitleGroup: {
    flex: 1,
    textAlign: "left" as const,
  },
  // Figma node 2057:6739 — Linear/Arrows/Arrow Left back button.
  // No circle border per the design — just the icon, neutral900.
  backButton: {
    width: 32,
    height: 32,
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral900,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    flexShrink: 0,
    marginTop: spacing["2xs"],
  },
  title: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h4,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  subtitle: {
    margin: 0,
    marginTop: spacing["2xs"],
    fontSize: fonts.size.s,
    color: colors.neutral500,
  },
  body: {
    display: "grid",
    gridTemplateColumns: "308px minmax(0, 1fr)",
    gap: spacing.m,
    alignItems: "start",
  },

  // ── Left column ──────────────────────────────────────────────────────────
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
  },
  // Patient identity block — avatar overlaps the top of the text tile so the
  // circle sits half-in, half-out of the card. Wrapper has no bg; the tile
  // below it carries the primary100 cream.
  patientWrapper: {
    position: "relative" as const,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 36,
  },
  avatar: {
    position: "absolute" as const,
    top: 0,
    width: 72,
    height: 72,
    borderRadius: radii.full,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  // Figma node 2057:6696 — text tile. primary100 bg, radii.xl, vertical-m
  // padding, serif type. Top padding is boosted so the overlapping avatar
  // fits without crowding the primary line.
  patientCard: {
    backgroundColor: colors.primary100,
    borderRadius: radii.xl,
    padding: `${spacing["3xl"]} ${spacing.m} ${spacing.m}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing["2xs"],
    width: "100%",
  },
  patientPrimary: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
    textAlign: "center",
    whiteSpace: "nowrap" as const,
  },
  patientSecondary: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.l,
    lineHeight: fonts.lineHeight.l,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
    textAlign: "center",
    whiteSpace: "nowrap" as const,
  },

  // Figma node 2059:6764 — left-rail action list ("Visits / Reports / Files /
  // Timeline / Bills"). Container: primary100 bg, radius m, padding l/m, gap xs.
  actionList: {
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    padding: `${spacing.m} ${spacing.l}`,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: `${spacing["2xs"]} ${spacing.xs}`,
    borderRadius: radii.m,
    cursor: "pointer",
    color: colors.neutral900,
    fontSize: fonts.size.m,
    width: "100%",
  },
  actionRowActive: {
    backgroundColor: colors.primary700,
    color: colors.neutral100,
  },
  actionIcon: {
    width: 20,
    height: 20,
    flexShrink: 0,
    color: "currentColor",
  },
  actionBadge: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: fonts.size.xs,
    fontFamily: fonts.family.primary,
    fontWeight: fonts.weight.regular,
    flexShrink: 0,
    backgroundColor: colors.primary200,
    color: colors.neutral500,
  },
  actionBadgeActive: {
    backgroundColor: colors.primary600,
    color: colors.primary100,
  },
  actionLabel: {
    flex: 1,
  },
  actionCount: {
    color: colors.neutral500,
    fontSize: fonts.size.xs,
  },

  // Figma node 2073:3264 — contact card. Same container treatment as the
  // action list above; just no badges on the rows.
  shareCard: {
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    padding: `${spacing.m} ${spacing.l}`,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },

  // ── Right column ─────────────────────────────────────────────────────────
  // Right area = visit tabs ABOVE the cream sheet (transparent wrapper).
  rightArea: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    minWidth: 0,
  },
  // Figma node 2057:6283 — main visit content sits on a white sheet (radius
  // xl, padding xl, gap xl). Each section card on top is transparent-filled
  // and separated only by its primary300 1px border.
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    minWidth: 0,
    backgroundColor: colors.neutral100,
    padding: spacing.xl,
    borderRadius: radii.xl,
  },

  // Figma nodes 2133:9887 (inactive) + 2133:9894 (active) — visit tabs.
  // Each tab is a 136x40 pill with a caption (paragraph-xs) and label
  // (paragraph-m) rendered inline, gap xs.
  //   Inactive: alpha-black-0 bg, label in alpha-black-3
  //   Active:   white bg, label in neutral-900
  //   Caption is always alpha-black-3 regardless of state
  tabsBar: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    // Pushed down so the tabs sit on the same baseline as the patient
    // identity card on the left (which is offset by the overlapping avatar).
    marginTop: 36,
  },
  // Figma node 2133:9927 — Tuning settings dropdown. Wrapper just pushes
  // the PopoverMenu trigger to the far right of the tabs row.
  tuningWrap: {
    marginLeft: "auto",
    flexShrink: 0,
    display: "inline-flex",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: `${spacing.xs} ${spacing.m}`,
    borderRadius: radii.xl,
    cursor: "pointer",
    backgroundColor: colors.alphaBlack0,
    minWidth: 136,
    height: 40,
    fontFamily: fonts.family.primary,
  },
  tabActive: {
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
  },
  tabInactive: {
    color: colors.alphaBlack3,
  },
  tabCaption: {
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    fontWeight: fonts.weight.regular,
    color: colors.alphaBlack3,
  },
  tabLabel: {
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontWeight: fonts.weight.regular,
    color: "inherit",
  },

  // Figma node 2057:6284 — section card. Solid primary300 border (no shadow),
  // radii.m, padding l/m. Title is Libertinus Serif Semi-Bold.
  sectionCard: {
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: `${spacing.m} ${spacing.l}`,
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    color: colors.neutral900,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    color: colors.neutral900,
  },
  sectionTitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  // Chevron toggle — transparent button, rotates 180° when collapsed.
  sectionToggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    color: colors.neutral900,
  },

  // Vitals — 6 columns × up to 2 rows. Each cell stacks label above a split
  // field (cream value 80×28 + bordered-white unit pill at right). Single-
  // cell columns push their content to the bottom so the second (isolated)
  // Hip aligns with BMI / Weight / Pulse on the lower row.
  vitalsGrid: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: spacing.l,
    // Reserve space below the bottom row so absolutely-positioned error
    // helper text ("Enter valid details …") doesn't overlap the card edge.
    paddingBottom: spacing.l,
  },
  vitalColumn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    gap: spacing["3xl"],
  },
  vitalCell: {
    position: "relative" as const,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  vitalLabel: {
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
  },
  vitalInputRow: {
    display: "flex",
    alignItems: "center",
    height: 28,
  },
  vitalInputValue: {
    width: 80,
    height: "100%",
    border: "none",
    outline: "none",
    padding: spacing.xs,
    fontSize: fonts.size.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    backgroundColor: colors.primary100,
    borderTopLeftRadius: radii.m,
    borderBottomLeftRadius: radii.m,
    textAlign: "center" as const,
  },
  // Out-of-range warning state — fills the input + unit pill with the
  // theme's `redAlpha10` (rgba(251, 55, 72, 0.1)), a soft transparent
  // pink-red wash over the cream. No underline, no border ring.
  vitalInputValueInvalid: {
    backgroundColor: colors.redAlpha10,
    color: colors.red200,
  },
  vitalUnitInvalid: {
    backgroundColor: colors.redAlpha10,
    color: colors.red200,
    // Add a red border in the invalid state so the warning reads clearly
    // (the default `vitalUnit` is borderless when valid).
    border: `${strokes.xs} solid ${colors.red200}`,
  },
  vitalInputInvalidText: {
    color: colors.red200,
    fontWeight: 500,
  },
  // Floats below the cell so it doesn't change the cell's height — keeps the
  // vitals grid rows aligned even when one cell has an error message.
  vitalErrorMessage: {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    marginTop: spacing.xs,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    fontFamily: fonts.family.primary,
    color: colors.red200,
    whiteSpace: "nowrap" as const,
    pointerEvents: "none" as const,
  },
  // BP split: two narrow inputs separated by a fixed "/" character. Same
  // outer shape as `vitalInputValue` so it pairs cleanly with the unit pill.
  bpSplitInput: {
    width: 80,
    height: "100%",
    backgroundColor: colors.primary100,
    borderTopLeftRadius: radii.m,
    borderBottomLeftRadius: radii.m,
    display: "flex",
    alignItems: "center",
    padding: `0 ${spacing["2xs"]}`,
    boxSizing: "border-box" as const,
  },
  bpHalfInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    border: "none",
    outline: "none",
    padding: 0,
    fontSize: fonts.size.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    backgroundColor: "transparent",
    textAlign: "center" as const,
  },
  bpSeparator: {
    flexShrink: 0,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    padding: `0 ${spacing["3xs"]}`,
    userSelect: "none" as const,
  },
  // Figma node 2057:6296 — unit pill: white bg, 1px primary300 cream border,
  // right-rounded corners, neutral500 grey text. Clickable to toggle between
  // alternate units (cm↔in, kg↔lb, °C↔°F, mmHg↔kPa).
  vitalUnit: {
    height: "100%",
    padding: spacing.xs,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral500,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderTopRightRadius: radii.m,
    borderBottomRightRadius: radii.m,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap" as const,
    boxSizing: "border-box" as const,
    outline: "none",
  },

  // 2x2 text-field grid (Chief Complaints — legacy)
  complaintsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: spacing.m,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
  },
  textField: {
    border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    minHeight: 36,
    backgroundColor: "transparent",
    outline: "none",
    fontFamily: fonts.family.primary,
  },

  // Figma node 2073:3030 — History 2×2 grid. Cream-filled fields (primary100),
  // radii.m, height 36, no border. Column gap 20 (spacing.l), row gap 12 (s).
  historyGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: spacing.l,
    rowGap: spacing.s,
    width: "100%",
  },
  historyField: {
    height: 36,
    border: "none",
    outline: "none",
    padding: spacing.xs,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    width: "100%",
    boxSizing: "border-box" as const,
  },

  // Single-row labeled field (Complaints note / Examination / Tests / Advice /
  // Refer to / Review). Label column 120px, label text uses serif semibold.
  bottomRows: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    paddingLeft: spacing.l,
  },
  noteRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
  },
  noteLabel: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    width: 120,
    flexShrink: 0,
    color: colors.neutral900,
    fontSize: fonts.size.m,
  },
  noteLabelText: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  noteField: {
    flex: 1,
    minWidth: 0,
    border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    minHeight: 36,
    backgroundColor: "transparent",
    outline: "none",
    fontFamily: fonts.family.primary,
  },
  // Field wrapper for dictatable rows (Tests / Advice / Complaints / Examination).
  // Figma: cream primary100 fill, radii.m, 36 height, inline mic + rewind icons.
  noteFieldWrap: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    paddingRight: spacing.xs,
    height: 36,
  },
  noteFieldInner: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    padding: spacing.xs,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    backgroundColor: "transparent",
    fontFamily: fonts.family.primary,
  },
  dictateIcons: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
    color: colors.neutral700,
    flexShrink: 0,
  },
  // Figma node 2071:2962 — Linear/Essentional,UI/Reorder. Drag handle that
  // sits to the RIGHT of the dictate field (outside the cream wrapper).
  reorderHandle: {
    flexShrink: 0,
    color: colors.neutral900,
    cursor: "grab",
  },

  // Figma node 2143:11458 — sort/list-view toggles, far right of the
  // Reports tabs row. Two transparent 32x32 icon buttons grouped via a
  // marginLeft:auto wrapper.
  reportViewToggle: {
    marginLeft: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["3xs"],
    flexShrink: 0,
  },
  reportViewToggleButton: {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: colors.alphaBlack3,
    padding: 0,
    borderRadius: radii.xs,
  },
  // The currently selected view-mode toggle gets the dark color so the
  // pair reads as a segmented control (selected vs. unselected).
  reportViewToggleButtonActive: {
    color: colors.neutral900,
  },

  // Figma node 2143:11610 — grid layout. 4 columns, gap m. Each card is
  // ~200×200, cream wrapper with a white inner thumbnail tile and a
  // text footer (name + date + size).
  reportsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: spacing.m,
  },
  reportCard: {
    position: "relative" as const,
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    padding: spacing.s,
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    aspectRatio: "1 / 1",
  },
  reportCardThumb: {
    position: "relative" as const,
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.primary300,
    overflow: "hidden",
  },
  reportCardThumbIcon: {
    width: 32,
    height: 32,
    color: colors.primary300,
  },
  reportCardMic: {
    position: "absolute" as const,
    right: spacing.s,
    bottom: spacing.s,
    color: colors.neutral700,
    display: "inline-flex",
  },
  reportCardKebab: {
    position: "absolute" as const,
    top: spacing.xs,
    right: spacing.xs,
    color: colors.neutral700,
    display: "inline-flex",
  },
  reportCardFooter: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["3xs"],
  },
  reportCardName: {
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
  },
  reportCardMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral400 ?? colors.neutral500,
    fontFamily: fonts.family.primary,
  },

  // Empty-state placeholder for sections that aren't built yet (Timeline,
  // Bills). Centered title + muted subtitle, no card chrome.
  comingSoon: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: `${spacing["3xl"]} ${spacing.l}`,
    gap: spacing.xs,
    minHeight: 200,
  },
  comingSoonTitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  comingSoonBody: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    color: colors.alphaBlack3,
  },

  // Figma node 2143:11171 — "+ Add Report" pill on the page header. Dark
  // neutral900 fill with primary100 text, full-radius pill.
  addReportButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["2xs"],
    height: 40,
    padding: `${spacing["2xs"]} ${spacing.s}`,
    borderRadius: radii.full,
    backgroundColor: colors.neutral900,
    color: colors.primary100,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    border: "none",
    cursor: "pointer",
    flexShrink: 0,
    marginTop: spacing["2xs"],
  },
  addReportPlus: {
    fontSize: fonts.size.l,
    lineHeight: 1,
  },

  // Figma node 2143:11160 — AI Summary card. Cream tile in the left rail
  // with a serif title and a paragraph-s body.
  aiSummaryCard: {
    backgroundColor: colors.primary100,
    borderRadius: radii.xl,
    padding: spacing.l,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
    textAlign: "center" as const,
  },
  aiSummaryTitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.l,
    lineHeight: fonts.lineHeight.l,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  aiSummaryBody: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
  },

  // Figma node 2143:10938 — Reports table. Header row of column captions
  // (paragraph-xs, neutral500) followed by cream-filled data pills.
  // Columns: # (24) | mic chip (40) | name (flex) | category (120) |
  // date (120) | actions (120).
  reportsTable: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  reportsHeaderRow: {
    display: "grid",
    gridTemplateColumns: "24px 40px minmax(120px, 1fr) 120px 120px 120px",
    gap: spacing.s,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
  },
  reportRow: {
    display: "grid",
    gridTemplateColumns: "24px 40px minmax(120px, 1fr) 120px 120px 120px",
    gap: spacing.s,
    alignItems: "center",
    backgroundColor: colors.primary100,
    borderRadius: radii.xs,
    padding: spacing["2xs"],
    minHeight: 52,
  },
  reportSerial: {
    textAlign: "center" as const,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral700,
    fontFamily: fonts.family.primary,
  },
  // Cream chip wrapping the mic icon — primary200 fill, radii.m, padding 2xs.
  reportMicChip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary200,
    borderRadius: radii.m,
    padding: spacing["2xs"],
    width: 40,
    height: 40,
    color: colors.neutral900,
    flexShrink: 0,
  },
  reportName: {
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    fontFamily: fonts.family.primary,
  },
  reportCell: {
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral700,
    fontFamily: fonts.family.primary,
    textAlign: "center" as const,
  },
  reportActions: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs,
    color: colors.neutral700,
  },

  // Figma node 2057:6283 — Complaints + Diagnosis (and Notes for Patient +
  // Private Notes) two-column textarea cards. Each card has a header row
  // (icon + title + kebab handle) and a cream textarea field with the
  // dictate icons docked at its bottom-right corner.
  noteCardsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: spacing.m,
  },
  noteCard: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  noteCardPrivate: {
    // Private Notes uses a neutral grey instead of cream so it reads as
    // "internal", visually separated from the patient-facing notes.
  },
  noteCardFieldPrivate: {
    backgroundColor: colors.alphaBlack1,
  },
  noteCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `0 ${spacing["2xs"]}`,
  },
  noteCardField: {
    position: "relative" as const,
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    padding: spacing.s,
    minHeight: 96,
    display: "flex",
  },
  noteCardTextarea: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    resize: "none" as const,
    backgroundColor: "transparent",
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    minHeight: 80,
  },
  noteCardDictate: {
    position: "absolute" as const,
    right: spacing.s,
    bottom: spacing.s,
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
    color: colors.neutral700,
  },

  // Refer to — split dropdown with neutral300 border, 120px text + chevron tail.
  referDropdown: {
    display: "inline-flex",
    alignItems: "stretch",
    height: 32,
    border: `${strokes.xs} solid ${colors.neutral300}`,
    borderRadius: radii.m,
    overflow: "hidden",
    cursor: "pointer",
  },
  referText: {
    display: "flex",
    alignItems: "center",
    width: 120,
    padding: spacing.xs,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.alphaBlack2,
    borderRight: `${strokes.xs} solid ${colors.neutral300}`,
  },
  referChevron: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `${spacing.xs} ${spacing["2xs"]}`,
    color: colors.neutral700,
  },
  // Dropdown menu of clinic doctors, opens below the Refer-To pill.
  referMenu: {
    position: "absolute" as const,
    top: "calc(100% + 4px)",
    left: 0,
    minWidth: 200,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: spacing["2xs"],
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    zIndex: 1000,
    maxHeight: 240,
    overflowY: "auto" as const,
  },
  referMenuEmpty: {
    padding: `${spacing.xs} ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    fontStyle: "italic" as const,
  },
  referMenuItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start" as const,
    gap: spacing["3xs"],
    width: "100%",
    padding: `${spacing.xs} ${spacing.s}`,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    borderRadius: radii.xs,
    textAlign: "left" as const,
  },
  referMenuItemName: {
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
  },
  referMenuItemMeta: {
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
  },

  // Figma node 2057:6381 — Rx table. Each data row is cream-filled (primary100)
  // with radii.xs corners. Columns: # (24) | Medicine (flex) | Dosage |
  // When | Frequency | Duration (all 120) | Notes (auto).
  rxTable: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  // Figma node 2057:6381 — grid columns uniform at 120px for all five
  // right-side columns (Dosage / When / Frequency / Duration / Notes); the
  // # column is 24px and Medicine flexes. Header captions and data cells
  // are center-aligned to match the design (Medicine stays left).
  rxHeaderRow: {
    display: "grid",
    gridTemplateColumns: "24px minmax(160px, 1fr) 120px 120px 120px 120px 120px",
    gap: spacing.s,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
  },
  rxRow: {
    display: "grid",
    gridTemplateColumns: "24px minmax(160px, 1fr) 120px 120px 120px 120px 120px",
    gap: spacing.s,
    alignItems: "center",
    backgroundColor: colors.primary100,
    borderRadius: radii.xs,
    padding: spacing["2xs"],
  },
  rxCell: {
    border: "none",
    borderRadius: radii.xs,
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    backgroundColor: "transparent",
    outline: "none",
    fontFamily: fonts.family.primary,
    minWidth: 0,
    textAlign: "center" as const,
  },
  rxSerial: {
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    textAlign: "center" as const,
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
  },
  // Medicine cell stacks name + pen-icon note below it.
  rxMedicineCell: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    minWidth: 0,
  },
  rxMedicineInput: {
    border: "none",
    outline: "none",
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    backgroundColor: "transparent",
    minWidth: 0,
  },
  rxMedicineNote: {
    display: "flex",
    alignItems: "center",
    gap: spacing["2xs"],
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
    color: colors.alphaBlack3,
  },
  rxMedicineNoteInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    fontFamily: fonts.family.primary,
    color: colors.alphaBlack3,
    backgroundColor: "transparent",
  },

  // Figma node 2143:10552 — "Add Medicine" row. Sits below the cream data
  // rows on the white sheet, so no fill. Plus-glyph + label on the left, the
  // rewind+mic dictate icons before the drag handle on the right.
  addMedicineRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    padding: `${spacing["2xs"]} 0`,
    borderRadius: radii.xs,
    backgroundColor: "transparent",
  },
  addMedicinePlus: {
    width: 24,
    textAlign: "center" as const,
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    fontFamily: fonts.family.primary,
    flexShrink: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  addMedicineText: {
    flex: 1,
    minWidth: 0,
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    fontFamily: fonts.family.primary,
    textAlign: "left" as const,
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },

  // Review row — date picker (primary300 bordered) + long cream text field.
  reviewRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    flex: 1,
    minWidth: 0,
  },
  // Figma node 2057:6522 — date chip: calendar icon 24px + "Select Date"
  // placeholder. primary300 border, radii.m, padding xs, gap xs.
  reviewDate: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
    height: 40,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: spacing.xs,
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
    cursor: "pointer",
  },
  reviewDateText: {
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontFamily: fonts.family.primary,
    color: colors.neutral300,
    whiteSpace: "nowrap" as const,
  },
  reviewLong: {
    flex: 1,
    minWidth: 0,
    height: 40,
    border: "none",
    backgroundColor: colors.primary100,
    borderRadius: radii.m,
    padding: spacing.xs,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral900,
    outline: "none",
    fontFamily: fonts.family.primary,
  },
  // Next Review — "or ___ days" segment between the date chip and the notes
  // input. The number input has a thin underline; "days" sits as a label.
  reviewOr: {
    flexShrink: 0,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
  },
  reviewDaysWrap: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
  },
  reviewDaysInput: {
    width: 56,
    height: 32,
    border: "none",
    borderBottom: `${strokes.xs} solid ${colors.neutral300}`,
    backgroundColor: "transparent",
    outline: "none",
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    textAlign: "center" as const,
  },
  reviewDaysLabel: {
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
  },
};
