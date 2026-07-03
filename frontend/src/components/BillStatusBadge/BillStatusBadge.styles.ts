import { CSSProperties } from "react";
import { fonts, radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["2xs"],
    // Tighter on the left (icon side), a touch more top/bottom.
    padding: `6px ${spacing.s} 6px ${spacing.xs}`,
    borderRadius: radii.full,
    fontSize: fonts.size.s,
    lineHeight: 1,
    fontWeight: fonts.weight.medium,
    whiteSpace: "nowrap",
  },
};
