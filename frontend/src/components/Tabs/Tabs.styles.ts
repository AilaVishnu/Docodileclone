import { CSSProperties } from "react";
import { colors, radii, fonts, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  // ── "connected" variant — used by ClinicTabs. Rounded-top trapezoid
  //    tabs that visually attach to the content panel below. ───────
  container: {
    display: "flex",
    alignItems: "flex-end",
    width: "100%",
  },

  tab: {
    padding: "12px 36px",
    borderRadius: `${radii.primary}px ${radii.primary}px 0 0`,
    border: 0,
    borderBottom: 0,
    backgroundColor: colors.secondary100,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    cursor: "pointer",
    position: "relative",
    color: colors.neutral700,
    transition: "all 0.2s ease",
    outline: "none",
    boxShadow: "none",
    maxWidth: 200,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  activeTab: {
    backgroundColor: colors.active.shade100,
    color: colors.neutral900,
    fontWeight: fonts.weight.medium,
    zIndex: 2,
  },

  actionsContainer: {
    display: "flex",
    marginLeft: "auto",
    alignItems: "center",
  },

  actionButton: {
    padding: "12px 24px",
    background: "none",
    border: "none",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    color: colors.neutral900,
    opacity: 0.5,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  // ── "block" variant — matches the Stats module's tab strip. Pill-shaped
  //    rounded blocks, no visual attachment to the content below. ─────
  blockContainer: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    gap: spacing.s,
    flexWrap: "wrap",
  },
  blockStrip: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  blockTab: {
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
    maxWidth: 220,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    transition: "background-color 160ms, color 160ms",
  },
  blockTabActive: {
    backgroundColor: colors.neutral100,
    color: colors.neutral900,
  },
  blockActionsContainer: {
    display: "flex",
    marginLeft: "auto",
    alignItems: "center",
    gap: spacing.xs,
  },
  blockActionButton: {
    height: 40,
    padding: `${spacing.xs} ${spacing.m}`,
    borderRadius: radii.xl,
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral700,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },
};
