import { CSSProperties } from "react";
import { colors, radii, spacing } from "../../styles/theme";

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
    backgroundColor: colors.active.shade200,
    borderRadius: radii.primary,
    padding: spacing["2xl"], // was 24, bumped to 32 for more generous interior
    minWidth: 420,
    maxWidth: "90vw",
  },
};
