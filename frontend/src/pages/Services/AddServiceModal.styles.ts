import { CSSProperties } from "react";
import { colors, fonts, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: spacing.m,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2xs"],
  },

  label: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
    color: colors.neutral700,
  },

  required: {
    color: colors.red200,
    marginLeft: 2,
  },

  errorText: {
    fontSize: fonts.size.xs,
    color: colors.red200,
  },

  footer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.s,
    marginTop: spacing.xs,
  },

};
