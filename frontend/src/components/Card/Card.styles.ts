import { CSSProperties } from "react";
import { colors, radii, spacing, shadows } from "../../styles/theme";

// ──────────────────────────────────────────────────────────────────────────────
// Canonical card surface — ONE source of truth for the "paper" look every
// *Card draws. Before this, 11 named cards disagreed on radius (8/16/20),
// background (sage/cream/white) and shadow (only one card had one).
//   • variant   → paper colour ("plain" = the transparent layout shell)
//   • elevation → flat, or the single soft card shadow (shadows.card)
//   • radius    → always radii.2xl (16). The legacy radii.primary(20) is retired
//                 from cards.
// ──────────────────────────────────────────────────────────────────────────────
export type CardVariant = "plain" | "surface" | "sage" | "cream";
export type CardElevation = "none" | "raised";

const CARD_BG: Record<CardVariant, string | undefined> = {
  plain: undefined,            // transparent layout shell (legacy Card behaviour)
  surface: colors.neutral100,  // white  — bills / stat tiles
  sage: colors.secondary50,    // #F1F6E7 — clinic cards
  cream: colors.primary100,    // #F9F9ED — staff / queue cards
};

export function cardSurface(
  variant: CardVariant = "plain",
  elevation: CardElevation = "none",
): CSSProperties {
  return {
    backgroundColor: CARD_BG[variant],
    borderRadius: radii["2xl"], // 16 — one card radius (was 8 / 16 / 20)
    boxShadow: elevation === "raised" ? shadows.card : undefined,
  };
}

export const styles: Record<string, CSSProperties> = {
  // Legacy transparent layout shell — wraps page sections. Unchanged: still
  // a flex+gap column with no surface of its own (radii.xxl === 16).
  card: {
    borderRadius: radii["2xl"],
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    marginTop: -1,
  },
};
