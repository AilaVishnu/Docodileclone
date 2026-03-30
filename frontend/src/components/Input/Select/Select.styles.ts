import { CSSProperties } from "react";
import { colors, radii, fonts, spacing } from "../../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    border: `1px solid ${colors.neutral300}`,
    borderRadius: radii.m,
    gap: spacing.xs,
    padding: `0 ${spacing.xs}`,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    height: 38,
    width: "100%",
    position: "relative",
    cursor: "pointer",
  },

  select: {
    flex: 1,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    border: "none",
    outline: "none",
    padding: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    backgroundColor: "transparent",
    color: colors.neutral900,
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
  },

  arrow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.neutral500,
    transition: "transform 0.2s ease",
    pointerEvents: "none",
  },

  errorContainer: {
    borderColor: colors.red200 || "red",
  },
};
