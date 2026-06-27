import { CSSProperties } from "react";
import { colors, radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    display: "flex",
    // Center vertically; overlay scrolls when a tall modal (pharmacy Edit
    // batch etc) exceeds the viewport so nothing gets clipped.
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "8vh",
    paddingBottom: "4vh",
    overflowY: "auto",
    zIndex: 1000,
  },

  content: {
    backgroundColor: colors.active.shade200,
    borderRadius: radii["2xl"],
    padding: spacing["2xl"], // was 24, bumped to 32 for more generous interior
    minWidth: 420,
    maxWidth: "90vw",
  },
};
