import { CSSProperties } from "react";
import { colors, radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    borderRadius: radii.m,
    padding: spacing.xl,
    backgroundColor: colors.primary100,
    minWidth: "25vw",
  },
  genderGroup: {
    display: "flex",
    gap: 24,
    marginTop: 12,
    alignItems: "center",
  },

  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    padding: "2px",
    color: colors.blindBlack,
    cursor: "pointer",
  },

  radioInput: {
    cursor: "pointer",
    accentColor: colors.blindBlack
  },
};
