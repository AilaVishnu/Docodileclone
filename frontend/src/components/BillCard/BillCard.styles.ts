import { CSSProperties } from "react";
import { colors, fonts, rem } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },

  card: {
    display: "flex",
    flexDirection: "column",
    gap: rem(12),
    padding: rem(24),
    backgroundColor: colors.neutral100,
    borderRadius: `${rem(16)} ${rem(16)} 0 0`,
    flex: 1,
  },

  zigzag: {
    width: "100%",
    // Deeper, sharper V-notches — 50% gradient stops push the white
    // triangles all the way to the top so the cut-outs are full Vs (no
    // flat bottom). Larger height + width makes each notch more evident.
    height: rem(20),
    backgroundImage: `
      linear-gradient(135deg, ${colors.neutral100} 50%, transparent 50%),
      linear-gradient(225deg, ${colors.neutral100} 50%, transparent 50%)
    `,
    backgroundSize: `${rem(20)} ${rem(20)}`,
    backgroundRepeat: "repeat-x",
  },

  title: {
    margin: 0,
    fontSize: fonts.size.h5,
    fontWeight: fonts.weight.regular,
    textAlign: "center",
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
    lineHeight: fonts.lineHeight.h5,
  },

  servicesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: rem(4),
  },

  serviceItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${rem(8)} ${rem(12)}`,
    backgroundColor: colors.neutral150,
    borderRadius: rem(4),
    fontSize: fonts.size.m,
    fontFamily: fonts.family.primary,
    fontWeight: 400,
    color: colors.neutral900,
    lineHeight: rem(22),
  },

  fieldsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: rem(2),
  },

  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: rem(8),
    height: rem(40),
  },

  label: {
    fontSize: fonts.size.m,
    fontWeight: 400,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    width: rem(65),
    flexShrink: 0,
    lineHeight: rem(22),
  },

  fieldValue: {
    flex: 1,
    minWidth: 0, // allow child inputs to shrink instead of overflowing the card
    display: "flex",
    alignItems: "center",
    gap: "0",
    borderBottom: `1px solid ${colors.neutral300}`,
    padding: rem(8),
    fontSize: fonts.size.m,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    lineHeight: rem(22),
    overflow: "hidden", // clip any residual overflow cleanly
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: fonts.size.m,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    backgroundColor: "transparent",
    padding: 0,
    lineHeight: rem(22),
  },

  totalRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    padding: `${rem(8)} ${rem(12)}`,
    backgroundColor: colors.primary100,
  },

  totalLabel: {
    fontSize: fonts.size.m,
    fontWeight: 600,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    lineHeight: 1,
  },

  totalValue: {
    // Was h2 (48–64). Bill card is ~312px wide; h2 crowded the row and felt
    // visually oversized. h4 (32–42) is prominent without dominating.
    fontSize: fonts.size.h4,
    fontWeight: fonts.weight.regular,
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
    lineHeight: 1,
  },

  methodRow: {
    display: "flex",
    gap: rem(16),
    justifyContent: "center",
  },

  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: rem(6),
    fontSize: fonts.size.m,
    fontFamily: fonts.family.primary,
    cursor: "pointer",
    color: colors.neutral900,
  },

  radioInput: {
    margin: 0,
    cursor: "pointer",
  },

  noteInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: fonts.size.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral500,
    fontStyle: "italic",
    backgroundColor: "transparent",
    padding: 0,
  },

  toggleGroup: {
    display: "flex",
    border: `1px solid ${colors.neutral300}`,
    borderRadius: rem(6),
    overflow: "hidden",
    flexShrink: 0,
  },

  toggleActive: {
    padding: `${rem(4)} ${rem(10)}`,
    border: "none",
    backgroundColor: colors.active.shade100,
    color: colors.neutral900,
    fontSize: fonts.size.s,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
  },

  toggleInactive: {
    padding: `${rem(4)} ${rem(10)}`,
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral700,
    fontSize: fonts.size.s,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
  },
};
