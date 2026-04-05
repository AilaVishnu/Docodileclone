import { CSSProperties } from "react";
import { colors, fonts, spacing, radii } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    backgroundColor: colors.primary100,
    borderRadius: radii.primary,
    padding: `${spacing.xl} ${spacing.xl} ${spacing.l}`,
    display: "flex",
    flexDirection: "column",
    gap: 0,
    width: 320,
    boxSizing: "border-box",
  },

  clinicName: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    fontWeight: fonts.weight.regular,
    color: colors.blindBlack,
    margin: 0,
    marginBottom: spacing.s,
  },

  domainBox: {
    display: "flex",
    alignItems: "center",
    border: `1px solid ${colors.neutral200}`,
    borderRadius: radii.m,
    overflow: "hidden",
    height: 42,
    backgroundColor: colors.neutralAlphaBlack,
    opacity: 0.7,
  },

  domainValue: {
    flex: 1,
    padding: `0 ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
  },

  domainSuffix: {
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    borderLeft: `1px solid ${colors.neutral300}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    height: "100%",
    whiteSpace: "nowrap",
  },

  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.neutralAlphaBlack,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
    marginTop: spacing.xs,
    minHeight: 36,
  },

  fieldRowMultiline: {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.neutralAlphaBlack,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
    marginTop: spacing.xs,
    minHeight: 36,
  },

  fieldIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 24,
    height: 24,
    color: colors.neutral500,
    opacity: 0.5,
  },

  fieldText: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    lineHeight: "24px",
  },

  specialtyRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.neutralAlphaBlack,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
    marginTop: spacing.xs,
    minHeight: 36,
  },

  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },

  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.secondary300,
    color: colors.neutral100,
    borderRadius: radii.pill,
    padding: "3px 10px",
    fontSize: fonts.size.xs,
    fontFamily: fonts.family.primary,
    fontWeight: fonts.weight.medium,
  },

  tagX: {
    fontSize: 10,
    opacity: 0.8,
  },

  buttonWrapper: {
    marginTop: spacing.s,
    display: "flex",
    justifyContent: "center",
  },
};
