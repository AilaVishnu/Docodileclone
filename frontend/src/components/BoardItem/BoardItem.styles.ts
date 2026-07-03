import React from "react";
import { colors, radii, shadows } from "../../styles/theme";

export const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "absolute",
    boxSizing: "border-box",
    touchAction: "none", // let pointer drag own the gesture
  },
  // Small circular remove control, top-right, outside the normal flow.
  removeBtn: {
    position: "absolute",
    top: "-9px",
    right: "-9px",
    width: "20px",
    height: "20px",
    borderRadius: radii.pill,
    border: "none",
    backgroundColor: colors.neutral900,
    color: colors.neutral100,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    lineHeight: 1,
    boxShadow: shadows.menu,
    zIndex: 2,
  },
};
