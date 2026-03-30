import { CSSProperties } from "react";
import { colors, spacing, fonts, radii } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    position: "fixed",
    bottom: spacing.xl,
    right: spacing.xl,
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.neutral200}`,
    borderRadius: radii.xxl,
    padding: `${spacing.s} ${spacing.m}`,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    zIndex: 1200,
    animation: "slideIn 0.3s ease-out",
  },

  icon: {
    width: 24,
    height: 24,
    flexShrink: 0,
  },

  message: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.blindBlack,
    margin: 0,
  },

  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    color: colors.neutral500,
    padding: 0,
    marginLeft: spacing.xs,
    flexShrink: 0,
  },
};
