import { CSSProperties } from "react";
import { colors, radii } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  content: {
    backgroundColor: colors.yellowTeeth,
    borderRadius: radii.primary,
    padding: 32,
    minWidth: 420,
    maxWidth: "90vw",
  },
};
