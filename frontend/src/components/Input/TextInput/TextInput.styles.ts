import { CSSProperties } from "react";
import { colors, fonts } from "../../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "12px 0",
    borderBottom: `2px solid ${colors.blindBlack}`,
    width: "100%",
  },

  icon: {
    fontSize: 20,
    lineHeight: 1,
    color: colors.blindBlack,
    opacity: 0.8,
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.blindBlack,
  },
};
