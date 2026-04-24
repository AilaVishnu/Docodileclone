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
    justifyContent: "space-between",
    gap: spacing.m,
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
  patientCard: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.xl,
    padding: `${spacing.xl} ${spacing.m}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.s,
    boxShadow: `0 1px 2px ${colors.alphaBlack0}`,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: colors.active.shade100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.neutral500,
  },
  patientLine: {
    margin: 0,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    textAlign: "center",
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

  shareCard: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.xl,
    padding: spacing.m,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
    boxShadow: `0 1px 2px ${colors.alphaBlack0}`,
  },

  // ── Right column ─────────────────────────────────────────────────────────
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    minWidth: 0,
  },

  tabsBar: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: `${spacing["2xs"]} ${spacing.xs}`,
    backgroundColor: colors.neutral100,
    borderRadius: radii.xl,
    boxShadow: `0 1px 2px ${colors.alphaBlack0}`,
  },
  tab: {
    padding: `${spacing.xs} ${spacing.m}`,
    borderRadius: radii.m,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.15,
    minWidth: 120,
  },
  tabActive: {
    backgroundColor: colors.active.shade100,
    color: colors.neutral900,
  },
  tabInactive: {
    color: colors.neutral600,
  },
  tabCaption: {
    fontSize: fonts.size.xs,
    color: colors.neutral500,
  },
  tabLabel: {
    fontSize: fonts.size.m,
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
