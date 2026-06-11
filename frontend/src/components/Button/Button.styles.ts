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

  // Button text uses STATIC control sizes within a breakpoint, but steps
  // down at <1440 via CSS vars (see globals.css --btn-sm-h, --btn-md-h,
  // --btn-fs). 1440 baseline preserved: --btn-sm-h:40, --btn-md-h:42,
  // --btn-fs:16. Below 1440: 32 / 34 / 14.
  smIcon: {
    fontSize: "var(--btn-fs)",
    height: "var(--btn-sm-h)",
    padding: spacing.xs
  },

  mdIcon: {
    fontSize: "var(--btn-fs)",
    height: "var(--btn-md-h)",
    padding: spacing.xs
  },

  sm: {
    fontSize: "var(--btn-fs)",
    height: "var(--btn-sm-h)"
  },

  md: {
    fontSize: "var(--btn-fs)",
    height: "var(--btn-md-h)",
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
      backgroundColor: colors.neutral200,
      borderColor: colors.neutral200,
      color: colors.neutral500,
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
      backgroundColor: colors.neutral200,
      borderColor: colors.neutral200,
      color: colors.neutral500,
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
      borderColor: colors.neutral400,
      color: colors.neutral400,
    },
  },

  // secondary — solid green CTA (e.g. "New Prescription"). Resting at
  // secondary/700, darkening to secondary/800 on hover (mirrors how primary
  // darkens). Merged from the old secondary/secondarySolid pair (2026-06-11).
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
      backgroundColor: colors.neutral200,
      borderColor: colors.neutral200,
      color: colors.neutral500,
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
      borderColor: colors.neutral400,
      color: colors.neutral400,
    },
  },

};