import { CSSProperties } from "react";
import { colors, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  title: {
    fontFamily: 'Sorts Mill Goudy Regular',
    fontSize: fonts.size.m,
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
    fontSize: fonts.size.xxs,
    fontWeight: 500,
    color: colors.blindBlack,
    margin: 0,
  },

  domainWrapper: {
  width: "100%",          // keeps layout width consistent
  alignSelf: "center",
},

domainHidden: {
  visibility: "hidden",  // 👈 keeps space, hides content
  height: 0,
  margin: 0,
  padding: 0,
},
};
