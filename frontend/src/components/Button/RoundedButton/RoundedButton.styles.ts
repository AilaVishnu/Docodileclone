import { CSSProperties } from "react";
import { colors, fonts, radii } from "../../../styles/theme";


export const roundedButtonStyles: Record<string, CSSProperties> = {
  button: {
    backgroundColor: colors.blindBlack,
    color: colors.whiteTeeth,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
    borderRadius: radii.pill,
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s ease, opacity 0.2s ease",
  },
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};
