import { CSSProperties } from "react";
import { colors, radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    backgroundColor: colors.secondary50,
    borderRadius: radii.xxl,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    marginTop: -1
  },
};
