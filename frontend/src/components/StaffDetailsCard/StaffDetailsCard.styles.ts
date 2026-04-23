import { CSSProperties } from "react";
import { colors, radii, spacing, rem } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,     // was spacing.xs — more breath between inputs
    borderRadius: radii.m,
    padding: spacing.l, // was spacing.s — more generous interior
    backgroundColor: colors.primary100,
    minWidth: "25vw",
    flex: 1,
  },
  genderGroup: {
    display: "flex",
    gap: rem(24),
    marginTop: rem(4),
    alignItems: "center",
  },

  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: rem(2),
    padding: rem(2),
    color: colors.neutral900,
    cursor: "pointer",
  },

  radioInput: {
    cursor: "pointer",
    accentColor: colors.neutral900
  },
};
