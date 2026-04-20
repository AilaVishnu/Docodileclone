export const colors = {
  yellowTeeth: "#F9F9ED",
  skinColor: "#FFD0BF",
  paleBlue: "ECF1FE",
  whiteTeeth: "#FCFCFC",
  blindBlack: "#122525",
  primary100: "#F9F9ED",
  primary200: "#F3F3DC",
  primary300: "#EDDFBA",
  primary400: "#EDCA99",
  primary500: "#ECA66D",
  primary600: "#E48647",
  primary700: "#CF6F2F",
  primary800: "#AE561A",
  secondary50: "#F1F6E7",
  secondary100: "#E3EAD7",
  secondary200: "#C8D4B0",
  secondary300: "#ACBF88",
  secondary400: "#98B06C",
  secondary500: "#849D54",
  secondary600: "#6C8145",
  secondary700: "#556536",
  secondary800: "#3D4927",
  neutralAlphaBlack: "rgba(0, 0, 0, 0.04)",
  neutral100: "#FFFFFF",
  neutral200: "#E3E3E3",
  neutral300: "#C7C7C7",
  neutral400: "#ABABAB",
  neutral500: "#8F8F8F",
  neutral600: "#747474",
  neutral700: "#585858",
  neutral800: "#3C3C3C",
  neutral900: "#202020",
  neutral1000: "#040404",
  greenAlpha10: "rgba(31, 193, 107, 0.1)",
  green200: "#1FC16B",
  green100: "#84EBB4",
  yellowAlpha10: "rgba(255, 219, 67, 0.1)",
  yellow200: "#DFB400",
  yellow100: "#FFDB43",
  redAlpha10: "rgba(251, 55, 72, 0.1)",
  red200: "#D00416",
  red100: "#FB3748",

  // Global Active Theme Colors
  active: {
    shade50: "var(--active-shade-50)",
    shade100: "var(--active-shade-100)",
    shade200: "var(--active-shade-200)",
    shade300: "var(--active-shade-300)",
    shade400: "var(--active-shade-400)",
    shade500: "var(--active-shade-500)",
    shade600: "var(--active-shade-600)",
    shade700: "var(--active-shade-700)",
    shade800: "var(--active-shade-800)",
  },
};



export type ThemeMode = "primary" | "secondary";

export const getThemePalette = (mode: ThemeMode) => {
  if (mode === "primary") {
    return {
      shade100: colors.primary100,
      shade200: colors.primary200,
      shade300: colors.primary300,
      shade400: colors.primary400,
      shade500: colors.primary500,
      shade600: colors.primary600,
      shade700: colors.primary700,
      shade800: colors.primary800,
    };
  } else {
    return {
      shade100: colors.secondary100,
      shade200: colors.secondary200,
      shade300: colors.secondary300,
      shade400: colors.secondary400,
      shade500: colors.secondary500,
      shade600: colors.secondary600,
      shade700: colors.secondary700,
      shade800: colors.secondary800,
    };
  }
};

export const gradients = {
  primary: "linear-gradient(135deg, #142726 0%, #1F3D3B 100%)",
  secondary: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
  danger: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
  sunset: "linear-gradient(135deg, #F9F9ED 0%, #FFD0BF 100%)",
  sunrise: "linear-gradient(135deg, #F9F9ED 0%, #ECF1FE 100%)",
};

export const fonts = {
  family: {
    primary: "'Inter', sans-serif",
    secondary: "'Libertinus Serif', 'source-serif', serif",
  },
  size: {
    h1: "60px",
    h2: "48px",
    h3: "40px",
    h4: "32px",
    h5: "24px",
    h6: "20px",
    caption: "10px",
    xs: "12px",
    s: "14px",
    m: "16px",
    l: "20px",
  },
  lineHeight: {
    caption: "14px",
    xs: "16px",
    s: "20px",
    m: "22px",
    h5: "34px",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },
};

export const radii = {
  none: 0,
  xs: 4,
  m: 8,
  xl: 12,
  xxl: 16,
  primary: 20,
  pill: 999,
  full: 999,
};

export const spacing = {
  "3xs": "2px",
  "2xs": "4px",
  xs: "8px",
  s: "12px",
  m: "16px",
  l: "20px",
  xl: "24px",
  xxl: "32px",
};

export const strokes = {
  xs: "1px"
}