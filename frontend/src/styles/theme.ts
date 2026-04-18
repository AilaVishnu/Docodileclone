// ══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM — Docodile
// Source of truth: Figma "Docodile-Design-System" (file key stqYl0ZIBFzHgQXVidg8ne)
//
// RESPONSIVE RULES (applied across the app):
//
// Baseline viewport = 1440 × 1024. Designs should pixel-match at this size.
// Supported range = 1280 (laptops) → 2560 (wide desktops). Below 1280 is
// best-effort only.
//
// ┌────────────────────────────┬────────────────────────────────────────────┐
// │ Surface                    │ Behavior as viewport grows                 │
// ├────────────────────────────┼────────────────────────────────────────────┤
// │ Sidebar                    │ Static width (68 collapsed / ~220 expanded)│
// │ Top nav                    │ Static height; stretches horizontally      │
// │ Page overlay (outer shell) │ FLUID padding — breathes on large screens  │
// │ Content max-width          │ Caps at ~1440; extra space → outer gutter  │
// │ Cards with aesthetic ID    │ Static width (e.g. Bill ticket = 312)      │
// │ Form/input surfaces        │ minmax() — grow modestly for comfort       │
// │ Buttons / chips            │ Static padding — density stays consistent  │
// │ Form field heights         │ Static (40px) — grow horizontally only     │
// │ Icon sizes                 │ Static (24px)                              │
// │ Radii / strokes            │ Static (shape identity)                    │
// │ Typography                 │ FLUID via clamp (see fonts.size below)     │
// │ Illustrations              │ Expressive hex literals — NOT tokens       │
// └────────────────────────────┴────────────────────────────────────────────┘
//
// When to use each spacing export:
//   • `spacing.*`       — static inner padding/gap inside controls & cards
//   • `fluidSpacing.*`  — outer page shell, section gutters, fluid containers
//   • `layout.*`        — content max-widths, supported viewport floor
//
// Token naming: follows Figma exactly (2xs, xs, s, m, l, xl, 2xl, 3xl...).
// Legacy aliases (xxl, primary, pill) are kept for backward compatibility.
// ══════════════════════════════════════════════════════════════════════════════

export const colors = {
  yellowTeeth: "#F9F9ED",
  skinColor: "#FFD0BF",
  paleBlue: "#ECF1FE",
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
  neutralAlphaBlack: "rgba(0, 0, 0, 0.04)",  // = Figma alpha-black-0
  alphaBlack0: "rgba(0, 0, 0, 0.04)",
  neutral100: "#FFFFFF",
  neutral150: "#F5F5F5",
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
  alphaWhite1: "rgba(255, 255, 255, 0.1)",
  alphaBlack1: "rgba(0, 0, 0, 0.1)",
  alphaBlack2: "rgba(0, 0, 0, 0.2)",
  alphaBlack3: "rgba(0, 0, 0, 0.3)",

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
  // ─── "Universal" fluid scale ─────────────────────────────────────────
  // Rates chosen so min is held across the full 1280–1920 CSS viewport
  // range. Formula: rate_vw = min_px / 19.2. At viewport ≤ 1920 the clamp
  // returns MIN (design baseline). Between 1920 and ~2300–2400 it grows to
  // the ceiling. Effect: 1280/1440/1536/1920 all render identical to the
  // Figma design; 2560 users get a mild scale-up, nothing dramatic.
  size: {
    h1: "clamp(60px, 3.125vw, 80px)",  // 60 up to 1920, 80 at 2560
    h2: "clamp(48px, 2.5vw, 64px)",    // 48 up to 1920, 64 at 2560
    h3: "clamp(40px, 2.08vw, 52px)",   // 40 up to 1920, 52 at 2500
    h4: "clamp(32px, 1.67vw, 42px)",   // 32 up to 1920, 42 at 2515
    h5: "clamp(24px, 1.25vw, 30px)",   // 24 up to 1920, 30 at 2400
    h6: "clamp(20px, 1.04vw, 24px)",   // 20 up to 1920, 24 at 2308
    l:  "clamp(20px, 1.04vw, 24px)",
    m:  "clamp(16px, 0.83vw, 18px)",   // 16 up to 1920, 18 at 2170
    s:  "clamp(14px, 0.73vw, 16px)",   // 14 up to 1920, 16 at 2192
    xs: "12px",
    caption: "10px",
  },
  lineHeight: {
    // Same pattern — min held to 1920, modest ceiling above.
    h1: "clamp(72px, 3.75vw, 96px)",
    h2: "clamp(56px, 2.92vw, 76px)",
    h3: "clamp(48px, 2.5vw, 64px)",
    h4: "clamp(44px, 2.29vw, 56px)",
    h5: "clamp(34px, 1.77vw, 42px)",
    h6: "clamp(28px, 1.46vw, 34px)",
    l:  "clamp(28px, 1.46vw, 32px)",
    m:  "clamp(22px, 1.15vw, 26px)",
    s:  "clamp(20px, 1.04vw, 22px)",
    xs: "16px",
    caption: "14px",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  style: {
    italic: "italic",
    semiBoldItalic: "italic",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CONTROL text — STATIC (non-fluid) font-sizes for UI chrome.
  //
  // RULE: Use `fonts.control.*` (not `fonts.size.*`) for anything where text
  // sits inside a fixed-height container with fixed padding — buttons, inputs,
  // form labels, menu items, tooltips, badges, tabs.
  //
  // WHY: Fluid body text scales nicely for reading. But when content scales
  // inside a control whose padding doesn't, the proportions break — at 2560
  // the text starts crowding the edges of a 40px-tall button and vertical
  // centering looks off. Industry standard (Material, Apple HIG, Carbon):
  // control text is static; only long-form content is fluid.
  // ──────────────────────────────────────────────────────────────────────────
  control: {
    lg: "18px",
    md: "16px",   // default button / input text
    sm: "14px",   // secondary label / small button
    xs: "12px",   // helper text / micro label
  },
};

export const radii = {
  none: 0,
  "2xs": 2,
  xs: 4,
  s: 6,
  m: 8,
  l: 10,
  xl: 12,
  "2xl": 16,
  xxl: 16,     // legacy alias for 2xl (do not remove — in use)
  primary: 20, // legacy (off-system, only used in LoginCard/ClinicCard)
  pill: 999,   // legacy alias for full
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
  "2xl": "32px",
  xxl: "32px",     // legacy alias for 2xl (do not remove — in use)
  "3xl": "40px",
  "4xl": "48px",
  "5xl": "56px",
  // Off-Figma: extending the scale — ask design to formalize these.
  "6xl": "64px",
  "7xl": "80px",
};

export const strokes = {
  xs: "1px",
  s: "1.5px",
  m: "2px",
  l: "4px",
}

export const paragraphSpacing = {
  h2: "48px",
  h4: "44px",
  h5: "34px",
  l: "24px",
  m: "22px",
  xs: "16px",
  caption: "14px",
};

// ──────────────────────────────────────────────────────────────────────────────
// Fluid spacing for responsive shells.
// RULE: Use these ONLY for outer page padding, section gutters, or content
// max-widths — never inside controls (buttons, inputs, chips) where static
// spacing preserves visual density.
// Baseline viewport = 1440px. Each clamp hits the baseline value at 1440
// and reaches the ceiling around 2560px.
// ──────────────────────────────────────────────────────────────────────────────
export const fluidSpacing = {
  // Outer page gutters (main content area padding)
  outerY: "clamp(24px, 1.25vw, 32px)",   // vertical: 24 → 32
  outerX: "clamp(40px, 2.19vw, 56px)",   // horizontal: 40 → 56

  // Section / card-to-card gutters (when stacking or grid-gapping)
  sectionGap: "clamp(16px, 1.11vw, 24px)",

  // Card outer horizontal padding (cards inside a viewport-scaled container)
  cardX: "clamp(16px, 1.11vw, 24px)",
};

// ──────────────────────────────────────────────────────────────────────────────
// Layout rules — max-widths and breakpoints.
// RULE: Apps are designed at 1440. Cap content at ~1440 and center.
// ──────────────────────────────────────────────────────────────────────────────
export const layout = {
  // Content max-width. Above this viewport, extra space becomes outer gutter.
  contentMaxWidth: "1440px",

  // Minimum supported viewport. Below this, layout may degrade.
  minViewport: "1280px",

  // Common breakpoints (for future media queries)
  breakpoints: {
    laptop: "1280px",
    desktop: "1440px",
    wide: "1920px",
    ultraWide: "2560px",
  },
};