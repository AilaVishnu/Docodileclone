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
    width: 105,
    height: 90,
    borderRadius: "35px 35px 0 0",
    border: "none",
    overflow: "hidden",
    cursor: "pointer",
    flexShrink: 0,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  dashedWindow: {
    border: "2px dashed #F3F3DC",
    backgroundColor: "transparent",
    alignItems: "center",
    color: "#F3F3DC",
  },
};
