import { CSSProperties } from "react";
import { colors, spacing, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
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
