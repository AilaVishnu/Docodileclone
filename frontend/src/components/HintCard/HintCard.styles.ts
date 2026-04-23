import { CSSProperties } from "react";
import { colors, radii, fonts, rem } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    border: `1px dashed ${colors.neutral900}`,
    borderRadius: radii.primary,
    padding: rem(24),
    backgroundColor: "transparent",
    maxWidth: rem(280),
    textAlign: "center",
  },

  title: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.h3,
    fontWeight: fonts.weight.medium,
    color: colors.neutral900,
    margin: `0 0 ${rem(8)} 0`,
  },

  description: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.h5,
    color: colors.neutral900,
    opacity: 0.7,
    margin: 0,
    lineHeight: 1.4,
  },
};
