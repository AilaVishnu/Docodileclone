import { CSSProperties } from "react";
import { colors, spacing, fonts, radii } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.m, // was spacing.s
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    fontWeight: fonts.weight.regular,
    margin: 0,
    color: colors.neutral900,
  },

  closeButton: {
    background: "none",
    border: "none",
    fontSize: fonts.size.m,
    cursor: "pointer",
    color: colors.neutral900,
  },

  topSection: {
    display: "flex",
    gap: spacing.m,         // was spacing.s — between illustration and details
    marginBottom: spacing.m, // was spacing.s — before Doctor fields card
    alignItems: "stretch",
  },

  footer: {
    marginTop: spacing.m, // was spacing.s — between last card and footer
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerRight: {
    display: "flex",
    gap: spacing.m,
  },

  deleteButton: {
    background: "none",
    border: "none",
    color: colors.red200,
    fontSize: fonts.size.m,
    fontFamily: fonts.family.primary,
    cursor: "pointer",
    padding: "10px",
    textDecoration: "underline",
  },
};

export const confirmStyles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  dialog: {
    background: colors.primary100,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.m,
    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
    minWidth: "200px",
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h6,
    fontWeight: fonts.weight.medium,
    color: colors.neutral900,
    margin: 0,
  },

  message: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral700,
    margin: 0,
    lineHeight: 1.5,
    textAlign: "center",
    maxWidth: "320px",
  },

  actions: {
    display: "flex",
    gap: spacing.m,
  },
};
