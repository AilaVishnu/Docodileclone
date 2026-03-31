import { CSSProperties } from "react";

export const windowColors = [
  "#3D2B1F",  // dark brown
  "#1B5E5E",  // teal
  "#8B4513",  // saddle brown
  "#2E4A2E",  // dark green
  "#4A3728",  // warm brown
];

export const styles: Record<string, CSSProperties> = {
  window: {
    width: 90,
    height: 80,
    borderRadius: 16,
    border: "3px solid",
    overflow: "hidden",
    cursor: "pointer",
    flexShrink: 0,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  dashedWindow: {
    border: "2px dashed rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    color: "rgba(255,255,255,0.7)",
  },
};
