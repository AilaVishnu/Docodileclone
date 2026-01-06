import { CSSProperties } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderStyle: "solid",
    padding: "8px 16px",
    fontWeight: fonts.weight.regular,
    fontFamily: fonts.family.primary,
    cursor: "pointer",
    outline: "none",
    transition: "background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
  },

  smIcon: {
    fontSize: fonts.size.m,
    height: 40,
    padding: spacing.xs
  },

  mdIcon: {
    fontSize: fonts.size.l,
    height: 56,
    padding: spacing.xs
  },

  sm: {
    fontSize: fonts.size.m,
    height: 40
  },

  md: {
    fontSize: fonts.size.l,
    height: 56,
  },
};

export const variants = {
  dark: {
    default: {
      backgroundColor: colors.neutral900,
      borderColor: colors.neutral900,
      color: colors.neutral100,
    },
    hover: {
      backgroundColor: colors.neutral1000,
      borderColor: colors.neutral1000,
      color: colors.neutral100,
    },
    disabled: {
      backgroundColor: colors.neutralAlphaBlack,
      borderColor: colors.neutralAlphaBlack,
      color: colors.neutral300,
    },
  },

  light: {
    default: {
      borderColor: colors.neutral900,
      color: colors.neutral900,
      backgroundColor: "transparent",
    },
    hover: {
      backgroundColor: colors.neutralAlphaBlack,
      borderColor: colors.neutral900,
      color: colors.neutral900,
    },
    disabled: {
      borderColor: colors.neutral400,
      color: colors.neutral400,
    },
  },

  primary: {
    default: {
      backgroundColor: colors.primary700,
      borderColor: colors.primary700,
      color: colors.neutral100,
    },
    hover: {
      backgroundColor: colors.primary800,
      borderColor: colors.primary800,
      color: colors.neutral100,
    },
    disabled: {
      backgroundColor: colors.primary300,
      borderColor: colors.primary300,
      color: colors.neutral100,
    },
  },

  primaryLight: {
    default: {
      borderColor: colors.primary600,
      color: colors.primary600,
      backgroundColor: "transparent",
    },
    hover: {
      backgroundColor: colors.neutralAlphaBlack,
      borderColor: colors.primary700,
      color: colors.primary700,
    },
    disabled: {
      borderColor: colors.primary400,
      color: colors.primary400,
    },
  },

  secondary: {
    default: {
      backgroundColor: colors.secondary700,
      borderColor: colors.secondary700,
      color: colors.neutral100,
    },
    hover: {
      backgroundColor: colors.secondary800,
      borderColor: colors.secondary800,
      color: colors.neutral100,
    },
    disabled: {
      backgroundColor: colors.secondary300,
      color: colors.neutral100,
    },
  },

  secondaryLight: {
    default: {
      borderColor: colors.secondary600,
      color: colors.secondary600,
      backgroundColor: "transparent",
    },
    hover: {
      backgroundColor: colors.neutralAlphaBlack,
      borderColor: colors.secondary700,
      color: colors.secondary700,
    },
    disabled: {
      borderColor: colors.secondary400,
      color: colors.secondary400,
    },
  },
};