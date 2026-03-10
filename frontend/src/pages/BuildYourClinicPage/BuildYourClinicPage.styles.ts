import { CSSProperties } from "react";
import { colors, fonts, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    minWidth: "100vw",
    padding: "48px 24px",
    backgroundColor: colors.yellowTeeth,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h2,
    fontWeight: fonts.weight.regular,
    color: colors.blindBlack,
    marginBottom: 16,
  },

  workspaceContainer: {
    minWidth: "60vw",
    transition: "max-width 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },

  rightContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    height: "100%",
  },

  footer: {
    marginTop: spacing.xxl,
    display: "flex",
    gap: spacing.xl,
    justifyContent: "center",
  },

  houseContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: 708,
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
    padding: `${spacing.l} ${spacing.xl}`,
    paddingBottom: 0,
    boxSizing: "border-box" as const,
    display: "flex",
    justifyContent: "center",
    minHeight: 100,
    alignItems: "flex-end",
    marginTop: -2, // Pull the body up to overlap
    position: "relative" as const,
    zIndex: 1,
  },

  staffList: {
    display: "flex",
    gap: 15,
    overflowX: "auto" as const,
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
  },

  staffCardWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    flexShrink: 0,
    gap: 6,
  },

  staffCard: {
    width: 120,
    height: 100,
    borderRadius: "60px 60px 0 0",
    overflow: "hidden",
    cursor: "pointer",
    flexShrink: 0,
  },

  staffImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },

  staffLabelsRow: {
    display: "flex",
    gap: 15,
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.primary400,
    width: "100%",
    boxSizing: "border-box" as const,
    lineHeight: "normal",
  },

  staffLabelWrapper: {
    width: 120,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    flexShrink: 0,
  },

  staffName: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    fontWeight: fonts.weight.medium,
    color: colors.blindBlack,
    textAlign: "center" as const,
    width: "100%",
  },

  staffRole: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral700,
    textAlign: "center" as const,
    width: "100%",
  },

  addStaffCard: {
    width: 120,
    height: 100,
    borderRadius: "60px 60px 0 0",
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
