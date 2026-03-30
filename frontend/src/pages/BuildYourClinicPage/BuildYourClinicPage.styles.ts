import { CSSProperties } from "react";
import { colors, fonts, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
    minHeight: "100vh",
    padding: "20px 24px",
    backgroundColor: colors.yellowTeeth,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
    overflowX: "hidden",
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h3,
    fontWeight: fonts.weight.regular,
    color: colors.blindBlack,
    marginBottom: 8,
  },

  workspaceContainer: {
    width: "100%",
    maxWidth: "1200px",
    transition: "max-width 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },

  rightContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 0,
    height: "100%",
    minHeight: 340,
  },

  footer: {
    marginTop: spacing.l,
    display: "flex",
    gap: spacing.xl,
    justifyContent: "center",
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
    padding: `${spacing.s} ${spacing.l}`,
    paddingBottom: spacing.l,
    boxSizing: "border-box" as const,
    display: "flex",
    flexDirection: "column" as const,
    minHeight: 160,
    marginTop: -2, // Pull the body up to overlap
    position: "relative" as const,
    zIndex: 1,
  },

  staffList: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 100px)",
    gap: "12px 12px",
    width: "100%",
    justifyContent: "center",
  },

  staffCardWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    width: 100,
    gap: 4,
  },

  staffCard: {
    width: 100,
    height: 84,
    borderRadius: "50px 50px 0 0",
    overflow: "hidden",
    cursor: "pointer",
    flexShrink: 0,
    backgroundColor: "transparent",
  },

  staffName: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
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
    fontSize: fonts.size.xs,
    color: colors.neutral700,
    textAlign: "center" as const,
    width: "100%",
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  },

  addStaffCard: {
    width: 100,
    height: 84,
    borderRadius: "50px 50px 0 0",
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
};
