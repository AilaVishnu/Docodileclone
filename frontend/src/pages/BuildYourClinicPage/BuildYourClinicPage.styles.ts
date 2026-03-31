import { CSSProperties } from "react";
import { colors, fonts, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
    height: "100vh",
    padding: "12px 24px",
    backgroundColor: colors.yellowTeeth,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h4,
    fontWeight: fonts.weight.regular,
    color: colors.blindBlack,
    marginBottom: spacing.s,
  },

  workspaceContainer: {
    width: "100%",
    maxWidth: "1200px",
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
    paddingRight: "10%",
  },

  footer: {
    marginTop: spacing.m,
    display: "flex",
    gap: spacing.xl,
    justifyContent: "center",
    flexShrink: 0,
  },

  houseContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: 600,
    position: "relative" as const,
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
    padding: `${spacing.xs} ${spacing.s}`,
    paddingBottom: spacing.s,
    boxSizing: "border-box" as const,
    display: "flex",
    flexDirection: "column" as const,
    marginTop: -2,
    position: "relative" as const,
    zIndex: 1,
  },

  staffList: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 80px)",
    gap: "8px 8px",
    width: "100%",
    justifyContent: "center",
  },

  staffCardWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    width: 80,
    gap: 2,
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
    color: colors.blindBlack,
    textAlign: "center" as const,
    width: "100%",
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  },

  staffRole: {
    fontFamily: fonts.family.primary,
    fontSize: "10px",
    color: colors.neutral700,
    textAlign: "center" as const,
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
    right: -25,
    width: 65,
    height: 55,
    zIndex: 3,
    transform: "scaleX(-1)",
  },
};
