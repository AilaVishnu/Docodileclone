import { CSSProperties } from "react";
import { fonts, radii, spacing, colors, rem } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    borderRadius: radii.primary,
    padding: rem(48),
    width: "100%",
    maxWidth: rem(560),
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    position: "relative",
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h4,
    color: colors.neutral900,
    fontWeight: fonts.weight.regular,
    margin: 0,
  },

  passwordRow: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  eyeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: fonts.size.l,
    marginLeft: rem(8),
    opacity: 0.7,
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: rem(8),
  },

  footerText: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral900,
    margin: 0,
    cursor: "pointer",
  },

  supportPopup: {
    position: "absolute",
    bottom: rem(-50),
    left: "50%",
    transform: "translateX(-50%)",
    padding: `${rem(10)} ${rem(20)}`,
    borderRadius: radii.m,
    fontSize: fonts.size.s,
    fontFamily: fonts.family.primary,
    fontWeight: fonts.weight.medium,
    zIndex: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    whiteSpace: "nowrap",
    transition: "all 0.3s ease",
  },
};
