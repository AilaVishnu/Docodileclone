import { CSSProperties } from "react";
import { colors, radii, spacing } from "../../styles/theme";

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
    gap: 24,
    marginTop: 4,
    alignItems: "center",
  },

  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    padding: "2px",
    color: colors.neutral900,
    cursor: "pointer",
  },

  radioInput: {
    cursor: "pointer",
    accentColor: colors.neutral900
  },
};
