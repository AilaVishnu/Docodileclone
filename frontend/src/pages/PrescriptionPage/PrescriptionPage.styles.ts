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
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    minWidth: 0,
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

  // Shared section card (Vitals / Chief Complaints / Prescription / …)
  sectionCard: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.xl,
    padding: `${spacing.m} ${spacing.l}`,
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    boxShadow: `0 1px 2px ${colors.alphaBlack0}`,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    color: colors.neutral900,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    color: colors.neutral900,
  },
  sectionTitle: {
    margin: 0,
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.medium,
    color: colors.neutral900,
  },

  // Vitals grid — 6 pairs of label + dual inputs
  vitalsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: spacing.m,
  },
  vitalCell: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2xs"],
  },
  vitalLabel: {
    fontSize: fonts.size.xs,
    color: colors.neutral500,
  },
  vitalInputRow: {
    display: "flex",
    border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.m,
    overflow: "hidden",
  },
  vitalInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    padding: `${spacing["2xs"]} ${spacing.xs}`,
    fontSize: fonts.control.sm,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    backgroundColor: "transparent",
  },
  vitalUnit: {
    padding: `${spacing["2xs"]} ${spacing.xs}`,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
    backgroundColor: colors.alphaBlack0,
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap" as const,
  },

  // 2x2 text-field grid (Chief Complaints)
  complaintsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: spacing.m,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2xs"],
  },
  fieldLabel: {
    fontSize: fonts.size.xs,
    color: colors.neutral500,
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

  // Single-row labeled field (Complaints note / Examination / Notes / Advise)
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
  // Field wrapper for dictatable rows: input + inline mic/rewind icons
  noteFieldWrap: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.m,
    paddingRight: spacing.s,
    minHeight: 36,
  },
  noteFieldInner: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    padding: `${spacing.xs} ${spacing.s}`,
    fontSize: fonts.control.sm,
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

  // Prescription table
  rxTable: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  rxHeaderRow: {
    display: "grid",
    gridTemplateColumns: "24px minmax(160px, 1.4fr) repeat(5, minmax(0, 1fr)) 100px",
    gap: spacing.xs,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    paddingBottom: spacing["2xs"],
    borderBottom: `${strokes.xs} solid ${colors.neutral200}`,
  },
  rxRow: {
    display: "grid",
    gridTemplateColumns: "24px minmax(160px, 1.4fr) repeat(5, minmax(0, 1fr)) 100px",
    gap: spacing.xs,
    alignItems: "center",
  },
  rxCell: {
    border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.m,
    padding: `${spacing["2xs"]} ${spacing.xs}`,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    backgroundColor: "transparent",
    outline: "none",
    minHeight: 36,
    fontFamily: fonts.family.primary,
  },
  rxSerial: {
    fontSize: fonts.size.s,
    color: colors.neutral500,
    textAlign: "center",
  },

  // Review row — short + long field together
  reviewRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    flex: 1,
    minWidth: 0,
  },
  reviewShort: {
    width: 140,
    flexShrink: 0,
    border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
    outline: "none",
    fontFamily: fonts.family.primary,
  },
};
