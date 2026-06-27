import { CSSProperties } from "react";

export const styles: Record<string, CSSProperties> = {
  page: {
    // Viewport-locked layer: fixed + inset:0 makes the login fill the screen
    // at ANY width, independent of the global #root min-width:1200 floor
    // (fixed positioning is relative to the viewport, not #root). overflow
    // hidden guarantees the illustration never scrolls in either direction.
    position: "fixed",
    inset: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },
};
