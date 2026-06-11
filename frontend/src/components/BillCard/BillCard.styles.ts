import { CSSProperties } from "react";
import { colors, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },

  card: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "24px",
    backgroundColor: colors.neutral100,
    borderRadius: "8px 8px 0 0", // top-only (torn zigzag below); 8 to match the other cards on Book Appointment (radii.m)
    flex: 1,
  },

  zigzag: {
    width: "100%",
    // Deeper, sharper V-notches — 50% gradient stops push the white
    // triangles all the way to the top so the cut-outs are full Vs (no
    // flat bottom). Larger height + width makes each notch more evident.
    height: "20px",
    backgroundImage: `
      linear-gradient(135deg, ${colors.neutral100} 50%, transparent 50%),
      linear-gradient(225deg, ${colors.neutral100} 50%, transparent 50%)
    `,
    backgroundSize: "20px 20px",
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
    gap: "4px",
  },

  serviceItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: colors.neutral150,
    borderRadius: "4px",
    fontSize: fonts.size.m,
    fontFamily: fonts.family.primary,
    fontWeight: 400,
    color: colors.neutral900,
    lineHeight: "22px",
  },

  fieldsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    height: "40px",
  },

  label: {
    fontSize: fonts.size.m,
    fontWeight: 400,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    width: "65px",
    flexShrink: 0,
    lineHeight: "22px",
  },

  fieldValue: {
    flex: 1,
    minWidth: 0, // allow child inputs to shrink instead of overflowing the card
    display: "flex",
    alignItems: "center",
    gap: "0",
    borderBottom: `1px solid ${colors.neutral300}`,
    padding: "8px",
    fontSize: fonts.size.m,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    lineHeight: "22px",
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
    lineHeight: "22px",
  },

  totalRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    padding: "8px 12px",
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
    // 2×2 grid (Cash | Card / UPI | Waive). `auto auto` lets each column size
    // to its widest label, then centers the pair within the card. Since every
    // label puts the radio first, the two radios in each column line up
    // vertically across rows.
    display: "grid",
    gridTemplateColumns: "auto auto",
    columnGap: "32px",
    rowGap: "8px",
    justifyContent: "center",
  },

  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
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
    borderRadius: "6px",
    overflow: "hidden",
    flexShrink: 0,
  },

  toggleActive: {
    padding: "4px 10px",
    border: "none",
    // Inverted: black bg + cream/white symbol so the active state really pops.
    backgroundColor: colors.neutral900,
    color: colors.neutral100,
    fontSize: fonts.size.s,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
  },

  toggleInactive: {
    padding: "4px 10px",
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral700,
    fontSize: fonts.size.s,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
  },
};
