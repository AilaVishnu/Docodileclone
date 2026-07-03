import { CSSProperties } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Internal "home" view of the Prescription page — a search bar + recent
// patients dashboard rendered when no patient is selected. Once the user
// picks a patient, PrescriptionPage swaps over to the existing form.
// ─────────────────────────────────────────────────────────────────────────────

export const styles: Record<string, CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
    width: "100%",
  },

  // Header — title + count subtitle, matches the Visits header treatment
  header: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2xs"],
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
    fontSize: fonts.size.s,
    color: colors.neutral500,
  },

  // Search input — pill-shaped Field (variant="pill"), responsive height.
  searchWrap: {
    position: "relative" as const,
    width: "100%",
  },

  // Recent-patients card — primary100 cream wash, list of clickable rows
  recentCard: {
    backgroundColor: colors.primary100,
    borderRadius: radii.xl,
    padding: spacing.l,
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  recentTitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.l,
    lineHeight: fonts.lineHeight.l,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  rowList: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2xs"],
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.m,
    width: "100%",
    padding: `${spacing.s} ${spacing.m}`,
    backgroundColor: colors.neutral100,
    border: "none",
    borderRadius: radii.m,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    textAlign: "left" as const,
  },
  rowAvatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    objectFit: "contain" as const,
    display: "block",
  },
  rowName: {
    flex: 1,
    minWidth: 0,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    color: colors.neutral900,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    whiteSpace: "nowrap" as const,
  },
  rowMeta: {
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    flexShrink: 0,
  },

  // Empty / loading / error states
  emptyState: {
    padding: spacing.l,
    textAlign: "center" as const,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
  },
};
