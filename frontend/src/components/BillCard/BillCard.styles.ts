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
    borderRadius: "16px 16px 0 0",
    flex: 1,
  },

  zigzag: {
    width: "100%",
    height: "16px",
    backgroundImage: `linear-gradient(135deg, ${colors.neutral100} 33.33%, transparent 33.33%),
      linear-gradient(225deg, ${colors.neutral100} 33.33%, transparent 33.33%)`,
    backgroundSize: "12px 16px",
    backgroundRepeat: "repeat-x",
  },

  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 600,
    textAlign: "center",
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
    lineHeight: "28px",
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
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    fontSize: "16px",
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
    fontSize: "16px",
    fontWeight: 400,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    width: "65px",
    flexShrink: 0,
    lineHeight: "22px",
  },

  fieldValue: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "0",
    borderBottom: `1px solid ${colors.neutral300}`,
    padding: "8px",
    fontSize: "16px",
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    lineHeight: "22px",
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "16px",
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
    fontSize: "16px",
    fontWeight: 600,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    lineHeight: 1,
  },

  totalValue: {
    fontSize: "32px",
    fontWeight: 400,
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
    lineHeight: 1,
  },

  methodRow: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
  },

  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "16px",
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
    backgroundColor: colors.active.shade100,
    color: colors.neutral900,
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
  },

  toggleInactive: {
    padding: "4px 10px",
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral700,
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
  },
};
