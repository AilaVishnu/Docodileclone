import { CSSProperties } from "react";
import { fonts, radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    borderRadius: radii.primary,
    padding: 48,
    width: "100%",
    maxWidth: 560,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h4,
    color: "#122525",
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
    fontSize: 20,
    marginLeft: 8,
    opacity: 0.7,
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8,
  },

  footerText: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: "#122525",
    margin: 0,
    cursor: "pointer",
  },
};
