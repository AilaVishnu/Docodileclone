import { CSSProperties } from "react";
import { colors, radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    borderRadius: radii.m,
    padding: spacing.xl,
    backgroundColor: colors.primary100,
    minWidth: "25vw",
  },
};
