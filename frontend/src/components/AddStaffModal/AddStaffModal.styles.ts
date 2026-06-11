import { CSSProperties } from "react";
import { colors, spacing, fonts } from "../../styles/theme";

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
  body: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.m,
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
