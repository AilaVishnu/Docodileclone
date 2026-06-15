import { CSSProperties } from "react";
import { colors, radii, spacing } from "../../styles/theme";

// List/grid switch — two icon buttons, no background. The selected view reads
// in full neutral900; the other is muted, so the pair shows state by weight
// alone (no grey track / pill).
export const styles: Record<string, CSSProperties> = {
  track: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["2xs"],
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
    color: colors.neutral400,
    lineHeight: 0,
  },
  buttonActive: {
    color: colors.neutral900,
  },
};
