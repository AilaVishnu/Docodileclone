import { CSSProperties } from "react";
import { colors, spacing, fonts } from "../../styles/theme";

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
    justifyContent: "flex-end",
    gap: spacing.m,
  },
};
