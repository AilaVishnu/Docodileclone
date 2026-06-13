import { CSSProperties } from "react";
import { colors, spacing, fonts } from "../../styles/theme";
import { cardSurface } from "../Card/Card.styles";

export const styles: Record<string, CSSProperties> = {
  card: {
    // Cream staff surface — shared with StaffDetailsCard.
    ...cardSurface("cream", "none"),
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,     // was spacing.s — breathing between sections
    padding: spacing.l, // was spacing.s — more generous interior
    minWidth: "25vw",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: spacing.s,
    rowGap: spacing.m,
    alignItems: "start",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2xs"], // tight label-to-input (matches AddServiceModal)
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
  },

  label: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
    color: colors.neutral700,
  },

    hint: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral900,
    opacity: 0.5,
    marginTop: 2,
    },

};
