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

  section: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m, // was spacing.s — label-to-input breathing
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
  },

  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    width: "100%",
  },

  select: {
    flex: 1,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    cursor: "pointer",
  },

  label: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    opacity: 0.8,
    },

    hint: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral900,
    opacity: 0.5,
    // Sits immediately under the Reg. No. input. The parent section uses
    // gap: spacing.m which spreads the field and the hint too far apart —
    // pull the hint up so it reads as a caption of the field.
    marginTop: -8,
    },

};
