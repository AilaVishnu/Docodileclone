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
    zIndex: 4000,
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
    color: colors.neutral900,
    margin: 0,
  },

  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: fonts.size.m,
    color: colors.neutral500,
    padding: 0,
    marginLeft: spacing.xs,
    flexShrink: 0,
  },

  actionButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    fontWeight: 600,
    color: colors.primary700,
    padding: `2px ${spacing.xs}`,
    marginLeft: spacing.xs,
    flexShrink: 0,
  },
};
