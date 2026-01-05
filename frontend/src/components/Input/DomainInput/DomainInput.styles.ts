import { CSSProperties } from "react";
import { colors, radii, fonts, spacing } from "../../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    border: `1px solid ${colors.neutral300}`,
    borderRadius: radii.m,
    gap: spacing.xs,
    overflow: "hidden",
    backgroundColor: "transparent",
    height: 54,
    width: "100%",
  },

  input: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    padding: spacing.s,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    backgroundColor: "transparent",
    color: colors.neutral900,
  },

  suffix: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    borderLeft: `1px solid ${colors.neutral300}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    color: colors.neutral900,
    backgroundColor: "transparent",
    whiteSpace: "nowrap",
  },
};
