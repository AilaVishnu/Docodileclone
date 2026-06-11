import { CSSProperties } from "react";
import { colors, spacing } from "../../styles/theme";
import { cardSurface } from "../Card/Card.styles";

export const styles: Record<string, CSSProperties> = {
  card: {
    // Cream staff surface — shared with AdditionalStaffDetailsCard.
    ...cardSurface("cream", "none"),
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,     // was spacing.xs — more breath between inputs
    padding: spacing.l, // was spacing.s — more generous interior
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
