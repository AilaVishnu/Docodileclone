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

  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing.m,
  },
  headerTitleGroup: {
    flex: 1,
    textAlign: "center",
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
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
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
  },
  vitalColumn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  vitalCell: {
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
  vitalUnit: {
    height: "100%",
    padding: spacing.xs,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
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

  // Figma node 2057:6381 — Rx table. Each data row is cream-filled (primary100)
  // with radii.xs corners. Columns: # (24) | Medicine (flex) | Dosage |
  // When | Frequency | Duration (all 120) | Notes (auto).
  rxTable: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  rxHeaderRow: {
    display: "grid",
    gridTemplateColumns: "24px minmax(160px, 1fr) 120px 120px 120px 120px minmax(104px, auto)",
    gap: spacing.s,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
    padding: `${spacing["3xs"]} ${spacing["2xs"]}`,
  },
  rxRow: {
    display: "grid",
    gridTemplateColumns: "24px minmax(160px, 1fr) 120px 120px 120px 120px minmax(104px, auto)",
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
};
