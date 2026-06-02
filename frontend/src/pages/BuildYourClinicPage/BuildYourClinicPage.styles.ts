import { CSSProperties } from "react";
import { colors, fonts, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
    minHeight: "100vh",
    // Vertical padding scales with viewport — creates equal breathing room
    // above the heading and below the CTAs at larger screens.
    // Horizontal stays static.
    padding: "clamp(12px, 1.56vw, 48px) 24px",
    backgroundColor: colors.primary100,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center", // centers everything vertically — top space = bottom space
    boxSizing: "border-box",
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h4,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
    marginBottom: spacing.s,
  },

  workspaceContainer: {
    width: "100%",
    maxWidth: "1220px",
    transition: "max-width 0.3s ease",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },

  rightContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    height: "100%",
    paddingLeft: "2%",
  },

  footer: {
    marginTop: spacing.l,
    display: "flex",
    gap: spacing.xxl,
    justifyContent: "center",
    flexShrink: 0,
  },

  houseContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "105%",
    maxWidth: 680,
    position: "relative" as const,
    marginLeft: -60,
  },

  roofImage: {
    width: "100%",
    height: "auto",
    display: "block",
    transform: "translateY(2px)", // Push the roof down slightly
    position: "relative" as const,
    zIndex: 2,
  },

  houseBody: {
    backgroundColor: colors.primary400,
    width: "100%",
    // top stays tight (roof sits flush just above). L/R/B bumped for breathing.
    padding: `${spacing.xs} ${spacing.xl} ${spacing.xl} ${spacing.xl}`,
    boxSizing: "border-box" as const,
    display: "flex",
    flexDirection: "column" as const,
    marginTop: -2,
    position: "relative" as const,
    zIndex: 1,
  },

  staffList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 105px)",
    gap: "10px 16px",
    width: "100%",
    justifyContent: "start",
  },

  staffCardWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    width: 105,
    // Window-to-name gap. Previously bumped from 2 → 8, felt slightly loose.
    // 4 (spacing.2xs) is tighter, keeps label visually tethered to the
    // window while the name/role stack stays readable.
    gap: spacing["2xs"],
  },

  staffCard: {
    width: 80,
    height: 68,
    borderRadius: "40px 40px 0 0",
    overflow: "hidden",
    cursor: "pointer",
    flexShrink: 0,
    backgroundColor: "transparent",
  },

  staffName: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
    color: colors.neutral900,
    textAlign: "left" as const,
    width: "100%",
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  },

  staffRole: {
    fontFamily: fonts.family.primary,
    // Was caption (10) — too small and created a big gap between name & role
    // in the hierarchy. xs (12) matches name size; hierarchy held by weight
    // (name medium, role regular) and colour (blindBlack vs neutral700).
    fontSize: fonts.size.xs,
    color: colors.neutral700,
    textAlign: "left" as const,
    width: "100%",
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  },

  addStaffCard: {
    width: 80,
    height: 68,
    borderRadius: "40px 40px 0 0",
    border: `2px dashed rgba(255,255,255,0.5)`,
    backgroundColor: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    color: "rgba(255,255,255,0.7)",
    boxSizing: "border-box" as const,
  },

  bushRight: {
    position: "absolute" as const,
    bottom: -5,
    right: -40,
    width: 65,
    height: 55,
    zIndex: 3,
    transform: "scaleX(-1)",
  },

  deactivatedSection: {
    marginTop: spacing.l,
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.s,
  },
  deactivatedTitle: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
    color: colors.neutral700,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  deactivatedRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.m,
    padding: `${spacing.s} ${spacing.m}`,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  deactivatedInfo: {
    display: "flex",
    flexDirection: "column" as const,
  },
  deactivatedName: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    fontWeight: fonts.weight.medium,
    color: colors.neutral900,
  },
  deactivatedRole: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral700,
  },
};
