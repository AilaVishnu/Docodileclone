import { CSSProperties } from "react";
import { colors, radii, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    border: `1px dashed ${colors.blindBlack}`,
    borderRadius: radii.primary,
    padding: 24,
    backgroundColor: "transparent",
    maxWidth: 280,
    textAlign: "center",
  },

  title: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.medium,
    color: colors.blindBlack,
    margin: "0 0 8px 0",
  },

  description: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.blindBlack,
    opacity: 0.7,
    margin: 0,
    lineHeight: 1.4,
  },
};
