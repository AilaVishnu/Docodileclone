import { CSSProperties } from "react";
import { colors, radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    minHeight: "56vh",
    border: `0px solid ${colors.blindBlack}`,
    borderRadius: `0 ${radii.primary}px ${radii.primary}px ${radii.primary}px`,
    display: "flex",
    padding: spacing.xxl,
    gap: spacing.xl,
    boxSizing: "border-box",
    backgroundColor: colors.primary200,
  },

  leftPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    paddingRight: spacing.xxl,
  },

  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
};
