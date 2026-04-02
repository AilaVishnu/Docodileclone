import { CSSProperties } from "react";
import { colors, radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    flex: 1,
    minHeight: 0,
    border: `0px solid ${colors.blindBlack}`,
    borderRadius: `0 ${radii.primary}px ${radii.primary}px ${radii.primary}px`,
    display: "flex",
    padding: `${spacing.l} ${spacing.xxl}`,
    gap: spacing.xxl,
    boxSizing: "border-box",
    backgroundColor: colors.primary200,
    alignItems: "center",
  },

  leftPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  rightPanel: {
    flex: 1.2,
    display: "flex",
    flexDirection: "column",
  },
};
