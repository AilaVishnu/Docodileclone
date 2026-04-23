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
    // Pill buttons should never wrap their label — if content is too long for
    // the container, button will overflow visibly (fix container) rather than
    // silently break onto two lines.
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  // Button text uses STATIC control sizes (fonts.control.*) so proportions
  // don't drift at larger viewports. See theme.ts `fonts.control` comment.
  smIcon: {
    fontSize: fonts.control.md,
    height: 40,
    padding: spacing.xs
  },

  mdIcon: {
    fontSize: fonts.control.md,
    height: 42,
    padding: spacing.xs
  },

  sm: {
    fontSize: fonts.control.md,
    height: 40
  },

  md: {
    fontSize: fonts.control.md,
    height: 42,
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
      backgroundColor: colors.active.shade700,
      borderColor: colors.active.shade700,
      color: colors.neutral100,
    },
    hover: {
      backgroundColor: colors.active.shade800,
      borderColor: colors.active.shade800,
      color: colors.neutral100,
    },
    disabled: {
      backgroundColor: colors.active.shade300,
      borderColor: colors.active.shade300,
      color: colors.neutral100,
    },
  },

  primaryLight: {
    default: {
      borderColor: colors.active.shade600,
      color: colors.active.shade600,
      backgroundColor: "transparent",
    },
    hover: {
      backgroundColor: colors.neutralAlphaBlack,
      borderColor: colors.active.shade700,
      color: colors.active.shade700,
    },
    disabled: {
      borderColor: colors.active.shade400,
      color: colors.active.shade400,
    },
  },

  secondary: {
    default: {
      backgroundColor: colors.secondary800,
      borderColor: colors.secondary800,
      color: colors.neutral100,
    },
    hover: {
      backgroundColor: colors.secondary700,
      borderColor: colors.secondary700,
      color: colors.neutral100,
    },
    disabled: {
      backgroundColor: colors.secondary300,
      borderColor: colors.secondary300,
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

  dangerLight: {
    default: {
      borderColor: colors.red200,
      color: colors.red200,
      backgroundColor: "transparent",
    },
    hover: {
      backgroundColor: colors.redAlpha10,
      borderColor: colors.red200,
      color: colors.red200,
    },
    disabled: {
      borderColor: colors.red100,
      color: colors.red100,
    },
  },
};