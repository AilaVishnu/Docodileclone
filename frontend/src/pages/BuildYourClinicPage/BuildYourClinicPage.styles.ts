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
    gap: 24,
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
    maxWidth: 600,
  },

  roofImage: {
    width: "100%",
    display: "block",
    marginBottom: -24, // Fix gap between roof and body
  },

  houseBody: {
    backgroundColor: colors.primary400, // Color from image (approximate)
    width: "100%",
    padding: `${spacing.l} ${spacing.xl}`,
    paddingBottom: 0, // Align items to bottom
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    minHeight: 140,
    alignItems: "flex-end", // Align cards to bottom
  },

  staffList: {
    display: "flex",
    gap: spacing.s,
    overflowX: "auto",
    paddingBottom: spacing.s,
    width: "100%",
    justifyContent: "center",
  },

  staffCard: {
    width: 100,
    height: 135,
    borderRadius: "50px 50px 8px 8px", // Arch shape
    backgroundColor: colors.skinColor,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  },

  staffImage: {
    width: 64,
    height: 64,
    marginBottom: spacing.xs,
  },

  staffName: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    fontWeight: fonts.weight.medium,
    color: colors.blindBlack,
    marginBottom: spacing.xs,
    textAlign: "center",
    width: "100%",
    padding: "0 4px",
  },

  staffRole: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral700,
    marginBottom: spacing.m,
    textAlign: "center",
  },

  addStaffCard: {
    width: 100,
    height: 135,
    borderRadius: "50px 50px 8px 8px",
    border: `2px dashed ${colors.neutral100}`,
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    color: colors.neutral100,
  },
};
