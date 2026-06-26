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
  greenAlpha20: "rgba(31, 193, 107, 0.2)",
  green200: "#1FC16B",
  green100: "#84EBB4",
  yellowAlpha10: "rgba(255, 219, 67, 0.1)",
  yellowAlpha20: "rgba(255, 219, 67, 0.2)",
  yellow300: "#A07A00",
  yellow200: "#DFB400",
  yellow100: "#FFDB43",
  redAlpha10: "rgba(251, 55, 72, 0.1)",
  redAlpha20: "rgba(251, 55, 72, 0.2)",
  red200: "#D00416",
  red100: "#FB3748",
  blueAlpha10: "rgba(116, 150, 212, 0.1)",
  blueAlpha20: "rgba(116, 150, 212, 0.2)",
  blue200: "#1D63C9",
  blue100: "#7496D4",
  maroonAlpha10: "rgba(155, 44, 44, 0.1)",
  maroonAlpha20: "rgba(155, 44, 44, 0.2)",
  maroon200: "#9B2C2C",
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

export const fonts = {
  family: {
    primary: "'Inter', sans-serif",
    secondary: "'Libertinus Serif', 'source-serif', serif",
  },
  // ─── Type scale ───────────────────────────────────────────────────────
  // Tokens are CSS-var-driven. Values live in globals.css as --fs-* and
  // --lh-* under :root (baseline = 1440 design, with clamps that grow
  // fluidly above 1920) and a 1024 compact tier in the media query.
  // Components keep reading fonts.size.h1 etc.; the value resolves per
  // viewport with no React re-renders.
  size: {
    h1: "var(--fs-h1)",
    h2: "var(--fs-h2)",
    h3: "var(--fs-h3)",
    h4: "var(--fs-h4)",
    h5: "var(--fs-h5)",
    h6: "var(--fs-h6)",
    l:  "var(--fs-l)",
    m:  "var(--fs-m)",
    s:  "var(--fs-s)",
    xs: "var(--fs-xs)",
    caption: "var(--fs-caption)",
  },
  lineHeight: {
    h1: "var(--lh-h1)",
    h2: "var(--lh-h2)",
    h3: "var(--lh-h3)",
    h4: "var(--lh-h4)",
    h5: "var(--lh-h5)",
    h6: "var(--lh-h6)",
    l:  "var(--lh-l)",
    m:  "var(--lh-m)",
    s:  "var(--lh-s)",
    xs: "var(--lh-xs)",
    caption: "var(--lh-caption)",
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
    lg: "var(--ctrl-fs-lg)",
    md: "var(--ctrl-fs-md)",   // default button / input text
    sm: "var(--ctrl-fs-sm)",   // secondary label / small button
    xs: "var(--ctrl-fs-xs)",   // helper text / micro label
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
  primary: 20, // legacy (off-system) — retired from all real components (→16, Cards/Login/Hint phases); only the AuditGallery dev pages still reference it.
  pill: 999,   // legacy alias for full
  full: 999,
};

// Canonical icon box. The shared <Icon> component defaults to `size`; `sizeSmall`
// is the 20px variant. Formalizes what used to be a bare `24` default (UI audit
// Category 8 — "make 24px a real token").
export const icon = {
  size: 24,
  sizeSmall: 20,
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

// ──────────────────────────────────────────────────────────────────────────────
// Elevation — one source of truth for shadows (was 8+ ad-hoc inline strings).
//   • menu  — dropdowns / popovers / autocompletes / pickers
//   • modal — dialogs / overlays
//   • card  — raised cards
// ──────────────────────────────────────────────────────────────────────────────
export const shadows = {
  menu: "0 4px 16px rgba(0, 0, 0, 0.08)",
  modal: "0 12px 40px rgba(0, 0, 0, 0.12)",
  card: "0 4px 20px rgba(0, 0, 0, 0.04)",
};

// ──────────────────────────────────────────────────────────────────────────────
// z-index scale — one source of truth for stacking (was ad-hoc 1000…4000).
// Modals sit ABOVE the fixed sidebar/top-nav (sticky:3000); a dialog opened from
// inside a modal uses `modalTop` so it stacks above its parent; toasts win.
// ──────────────────────────────────────────────────────────────────────────────
export const zIndex = {
  dropdown: 100,
  sticky: 3000,    // SideNav / TopNav
  modal: 4000,
  modalTop: 4100,  // a confirm/dialog opened from within a modal
  popover: 4500,   // portaled menus/dropdowns — must clear modals (4000/4100)
  toast: 5000,
};

// Responsive breakpoints — desktop-only scope (no phone / tablet).
//
// Two intervals, one threshold:
//   interval 1 (1200–1439) — "compact desktop": smaller laptops / scaled
//                             displays. Type + universal controls shrink.
//   interval 2 (1440+)      — "comfortable desktop": the design baseline.
// md (1200) is the minimum supported viewport (see #root min-width in
// globals.css); below it the app scrolls horizontally. lg (1440) is the
// only real style threshold.
//
// Used both in JS (via useMediaQuery) and as the literal numbers behind
// the @media rules in globals.css. Keep the two sources in sync — if you
// change a number here, update globals.css too.
export const breakpoints = {
  md: 1200,
  lg: 1440,
} as const;

export const paragraphSpacing = {
  h2: "var(--ps-h2)",
  h4: "var(--ps-h4)",
  h5: "var(--ps-h5)",
  l:  "var(--ps-l)",
  m:  "var(--ps-m)",
  xs: "var(--ps-xs)",
  caption: "var(--ps-caption)",
};

// ──────────────────────────────────────────────────────────────────────────────
// Outer shell spacing. Fixed px (no viewport scaling).
// RULE: Use these ONLY for outer page padding, section gutters, or content
// max-widths — never inside controls (buttons, inputs, chips).
// ──────────────────────────────────────────────────────────────────────────────
export const fluidSpacing = {
  // Outer page gutters (main content area padding)
  outerY: "24px",
  outerX: "40px",

  // Section / card-to-card gutters (when stacking or grid-gapping)
  sectionGap: "16px",

  // Card outer horizontal padding
  cardX: "16px",
};

// ──────────────────────────────────────────────────────────────────────────────
// Layout rules — max-widths and breakpoints.
// RULE: Apps are designed at 1440. Cap content at ~1440 and center.
// ──────────────────────────────────────────────────────────────────────────────
export const layout = {
  // Content max-width. Above this viewport, extra space becomes outer gutter.
  contentMaxWidth: "1440px",

  // Minimum supported viewport. Below this the app scrolls horizontally.
  minViewport: "1200px",

  // The two intervals (see `breakpoints` above).
  breakpoints: {
    laptop: "1200px",
    desktop: "1440px",
  },
};