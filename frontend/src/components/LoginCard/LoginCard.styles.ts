import { CSSProperties } from "react";
import { colors } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  title: {
    fontFamily: 'Sorts Mill Goudy Regular',
    fontSize: 28,
    fontWeight: 500,
    color: colors.blindBlack,
    margin: 0,
  },

  footer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  footertext: {
    fontFamily: 'Neue Haas Display Thin',
    fontSize: 18,
    fontWeight: 500,
    color: colors.blindBlack,
    margin: 0,
  }
};
