import { CSSProperties } from "react";
import { colors, radii, spacing } from "../../styles/theme";

// Segmented list/grid switch. A subtle grey track holds two icon buttons; the
// active one gets a white pill so the pair reads as a segmented control on any
// surface (white sheet or cream page).
export const styles: Record<string, CSSProperties> = {
  track: {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    padding: 2,
    backgroundColor: colors.neutral150,
    borderRadius: radii.m,
    flexShrink: 0,
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing["2xs"],
    border: "none",
    background: "transparent",
    borderRadius: radii.s,
    cursor: "pointer",
    color: colors.neutral900,
    lineHeight: 0,
  },
  buttonActive: {
    backgroundColor: colors.neutral100,
  },
};
