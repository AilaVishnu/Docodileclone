import { CSSProperties } from "react";
import { colors, radii, spacing, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
    borderRadius: radii.m,
    padding: spacing.xl,
    backgroundColor: colors.primary100,
    minWidth: "25vw",
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.blindBlack,
  },

  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
    marginLeft: 28, // aligns under icon
  },

  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    cursor: "pointer",
    fontSize: fonts.size.s,
    color: colors.blindBlack,
  },

  radioInput: {
    accentColor: colors.blindBlack,
    cursor: "pointer",
  },

  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    borderBottom: `2px solid ${colors.blindBlack}`,
    paddingBottom: spacing.xs,
  },

  select: {
    flex: 1,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.blindBlack,
    cursor: "pointer",
  },

  label: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.blindBlack,
    opacity: 0.8,
    },

    hint: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.blindBlack,
    opacity: 0.5,
    marginTop: 4,
    },
};
