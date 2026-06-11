import { CSSProperties } from "react";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: spacing.m,
  },

  card: {
    width: "min(440px, calc(100vw - 32px))",
    backgroundColor: colors.neutral100,
    borderRadius: radii["2xl"],
    padding: spacing.xl,
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    margin: 0,
    fontSize: fonts.size.h6,
    lineHeight: fonts.lineHeight.h6,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
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

  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
    backgroundColor: colors.neutral100,
  },

  inputWrapError: {
    borderColor: colors.red200,
  },

  prefix: {
    fontSize: fonts.size.s,
    color: colors.neutral500,
  },

  suffix: {
    fontSize: fonts.size.s,
    color: colors.neutral500,
  },

  input: {
    flex: 1,
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: fonts.size.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    minWidth: 0,
    MozAppearance: "textfield",
  },

  modeToggle: {
    display: "inline-flex",
    border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.s,
    overflow: "hidden",
  },

  modeBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: `2px ${spacing.xs}`,
    fontSize: fonts.size.xs,
    fontFamily: fonts.family.primary,
    color: colors.neutral500,
  },

  modeBtnActive: {
    backgroundColor: colors.neutral900,
    color: colors.neutral100,
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
