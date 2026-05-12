import { CSSProperties } from "react";
import { colors, radii, spacing, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,     // was spacing.s — breathing between sections
    borderRadius: radii.m,
    padding: spacing.l, // was spacing.s — more generous interior
    backgroundColor: colors.primary100,
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

  radioGroup: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.m,
    marginLeft: 28, // aligns under icon
  },

  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: fonts.size.s,
    color: colors.neutral900,
    lineHeight: 1,
  },
  
  radioInput: {
    margin: 0,
    accentColor: colors.neutral900,
    cursor: "pointer",
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

  // "Other" role custom text input — shown beneath the radio group when
  // user picks the "Other" option in the role card.
  otherRoleInput: {
    marginLeft: 28, // align with radio labels (icon-column offset)
    marginTop: spacing.xs,
    padding: `${spacing.xs} ${spacing.s}`,
    borderRadius: radii.m,
    border: `1px solid ${colors.neutral300}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    backgroundColor: colors.neutral100,
    outline: "none",
    width: "60%",
    maxWidth: 280,
  },
};
