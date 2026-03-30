import { CSSProperties } from "react";
import { colors, spacing, fonts, radii } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.s,
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    fontWeight: fonts.weight.regular,
    margin: 0,
    color: colors.blindBlack,
  },

  closeButton: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: colors.blindBlack,
  },

  topSection: {
    display: "flex",
    gap: spacing.s,
    marginBottom: spacing.s,
    alignItems: "stretch",
  },

  footer: {
    marginTop: spacing.s,
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
    color: colors.blindBlack,
    margin: 0,
  },

  actions: {
    display: "flex",
    gap: spacing.m,
  },
};
