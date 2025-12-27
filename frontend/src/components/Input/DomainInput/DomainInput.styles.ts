import { CSSProperties } from "react";
import { colors, radii, fonts } from "../../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    border: `1px solid ${colors.blindBlack}`,
    borderRadius: radii.primary,
    overflow: "hidden",
    backgroundColor: "transparent",
    height: 54,
    width: "100%",
  },

  input: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    padding: "0 24px",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.lg,
    backgroundColor: "transparent",
    color: colors.blindBlack,
  },

  suffix: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    borderLeft: `2px solid ${colors.blindBlack}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.lg,
    color: colors.blindBlack,
    backgroundColor: "transparent",
    whiteSpace: "nowrap",
  },
};
