import { CSSProperties } from "react";
import { colors, fonts, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: colors.secondary200,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    boxSizing: "border-box",
  },

  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.xl,
    justifyContent: "center",
    marginTop: spacing.xxl,
  },

  buildLink: {
    marginTop: spacing.xxl,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.blindBlack,
    textDecoration: "underline",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
  },
};
