import { CSSProperties } from "react";
import { colors, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))",
    height: "100%",
  },

  card: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    padding: "28px 28px 24px",
    backgroundColor: colors.active.shade100,
    borderRadius: "16px 16px 0 0",
    flex: 1,
  },

  zigzag: {
    width: "100%",
    height: "16px",
    backgroundImage: `linear-gradient(135deg, ${colors.active.shade100} 33.33%, transparent 33.33%),
      linear-gradient(225deg, ${colors.active.shade100} 33.33%, transparent 33.33%)`,
    backgroundSize: "12px 16px",
    backgroundRepeat: "repeat-x",
  },

  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    textAlign: "center",
    fontFamily: fonts.family.secondary,
    color: colors.blindBlack,
  },

  methodRow: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
  },

  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: fonts.size.s,
    fontFamily: fonts.family.primary,
    cursor: "pointer",
    color: colors.blindBlack,
    whiteSpace: "nowrap",
  },

  radioInput: {
    margin: 0,
    cursor: "pointer",
    accentColor: colors.blindBlack,
  },

  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    borderBottom: `1px solid ${colors.neutral200}`,
    paddingBottom: "8px",
  },

  label: {
    fontSize: fonts.size.s,
    fontWeight: 600,
    fontFamily: fonts.family.primary,
    color: colors.blindBlack,
    width: "80px",
    flexShrink: 0,
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: fonts.size.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral700,
    backgroundColor: "transparent",
    padding: 0,
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

  totalRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    borderBottom: `1px solid ${colors.neutral200}`,
    paddingBottom: "8px",
    paddingTop: "4px",
  },

  totalLabel: {
    fontSize: fonts.size.s,
    fontWeight: 700,
    fontFamily: fonts.family.primary,
    color: colors.blindBlack,
    width: "80px",
    flexShrink: 0,
  },

  totalValue: {
    flex: 1,
    fontSize: fonts.size.s,
    fontWeight: 600,
    fontFamily: fonts.family.primary,
    color: colors.blindBlack,
  },
};
