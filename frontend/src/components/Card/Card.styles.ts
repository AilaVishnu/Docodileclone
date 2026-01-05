import { CSSProperties } from "react";
import { radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    borderRadius: radii.xxl,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    marginTop: -1
  },
};
