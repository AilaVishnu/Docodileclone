import { CSSProperties } from "react";
import { colors, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 28,
  },

  header: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  clinicName: {
    fontFamily: fonts.family.secondaryI,
    fontSize: fonts.size.l,
    fontWeight: fonts.weight.medium,
    color: colors.blindBlack,
    margin: 0,
  },

  location: {
    fontFamily: fonts.family.secondaryI,
    fontSize: fonts.size.xs,
    color: colors.blindBlack,
    opacity: 0.8,
    margin: 0,
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  sectionTitle: {
    fontFamily: fonts.family.primary,
    fontSize: 16,
    fontWeight: 500,
    color: colors.blindBlack,
    marginBottom: 4,
  },

  item: {
    fontFamily: fonts.family.primary,
    fontSize: 14,
    color: colors.blindBlack,
    margin: 0,
  },

  empty: {
    fontFamily: fonts.family.primary,
    fontSize: 14,
    color: colors.blindBlack,
    opacity: 0.4,
    margin: 0,
  },

  nameInput: {
    fontSize: 28,
    border: "1px solid #122525",
    borderRadius: 6,
    padding: "4px 8px",
    outline: "none",
    fontFamily: "inherit",
  },

};
