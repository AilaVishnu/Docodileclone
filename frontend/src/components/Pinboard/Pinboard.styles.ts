import React from "react";
import { colors, fonts, radii, shadows, spacing, strokes } from "../../styles/theme";

export const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100%",
    height: "100%",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },

  // The board fills its whole area — no frame, no border. Background is the
  // page's primary shade with a dot grid on top (the canvas itself).
  board: {
    position: "relative",
    width: "100%",
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.primary100,
    backgroundImage: `radial-gradient(${colors.primary400} 1px, transparent 1px)`,
    backgroundSize: "16px 16px",
    backgroundPosition: "8px 8px",
    overflow: "hidden",
  },
  empty: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    pointerEvents: "none",
    textAlign: "center",
    padding: spacing.xl,
  },

  // Add palette — pops UP from the Add button in the floating bar.
  addWrap: { position: "relative", display: "inline-flex" },
  menu: {
    position: "absolute",
    bottom: "calc(100% + 10px)",
    left: "50%",
    transform: "translateX(-50%)",
    minWidth: 184,
    background: colors.neutral100,
    border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.m,
    boxShadow: shadows.menu,
    padding: spacing["3xs"],
    display: "flex",
    flexDirection: "column",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: `${spacing.xs} ${spacing.xs}`,
    borderRadius: radii.s,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral900,
    textAlign: "left",
    width: "100%",
  },
};
