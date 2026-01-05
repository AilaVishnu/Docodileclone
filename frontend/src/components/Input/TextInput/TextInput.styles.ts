import { CSSProperties } from "react";
import { colors, fonts, spacing } from "../../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.xs,
    borderBottom: `1px solid ${colors.neutral300}`,
    width: "100%",
  },

  icon: {
    fontSize: 20,
    lineHeight: 1,
    color: colors.blindBlack,
    opacity: 0.8,
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    color: colors.neutral900,
  },
};
