import { CSSProperties } from "react";
import { colors, fonts, spacing, radii } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  outerCard: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    marginTop: spacing.s,
  },

  cardTitle: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    fontWeight: fonts.weight.regular,
    color: colors.blindBlack,
    margin: 0,
    paddingBottom: "4px",
    minHeight: "32px",
    lineHeight: "32px",
  },

  innerCard: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },

  rowWithAction: {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing.xs,
    width: "100%",
  },

  specialtySection: {
    width: "100%",
  },

  specialtyInputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    width: "100%",
    padding: spacing.xs,
    borderBottom: `1px solid ${colors.neutral300}`,
    minHeight: 36,
  },

  specialtyIcon: {
    display: "flex",
    alignItems: "center",
    color: colors.blindBlack,
    opacity: 0.8,
    flexShrink: 0,
  },

  tagRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
    flex: 1,
    alignItems: "center",
  },

  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.secondary700,
    color: colors.neutral100,
    borderRadius: radii.pill,
    padding: "3px 10px",
    fontSize: fonts.size.xs,
    fontFamily: fonts.family.primary,
    fontWeight: fonts.weight.medium,
    lineHeight: 1.4,
  },

  tagRemove: {
    background: "none",
    border: "none",
    color: colors.neutral100,
    cursor: "pointer",
    padding: 0,
    fontSize: 10,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },

  tagInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.blindBlack,
    minWidth: 80,
    flexShrink: 1,
    padding: 0,
  },

  saveButton: {
    width: "100%",
    marginTop: spacing.xs,
    display: "flex",
    flexDirection: "column" as const,
  },
};
