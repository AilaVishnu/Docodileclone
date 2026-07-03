import React from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";

export const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.s,
    backgroundColor: colors.neutral100,
    borderRadius: radii.xl,
    // Soft lift, matching the prescription page's action bar.
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    padding: `${spacing["2xs"]} ${spacing.s}`,
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
    height: 36,
    padding: `0 ${spacing.s}`,
    borderRadius: radii.m,
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral900,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    whiteSpace: "nowrap",
  },
  buttonActive: {
    backgroundColor: colors.active.shade200,
  },
  buttonPrimary: {
    backgroundColor: colors.primary600,
    color: colors.neutral100,
  },
  buttonDanger: {
    color: colors.red200,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: colors.neutral200,
    margin: `${spacing["2xs"]} ${spacing["2xs"]}`,
  },
};
