import { CSSProperties } from "react";
import { colors, radii } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    minHeight: 420,
    border: `1px solid ${colors.blindBlack}`,
    borderRadius: radii.primary,
    display: "flex",
    padding: 32,
    boxSizing: "border-box",
    backgroundColor: "transparent",
  },

  leftPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 24,
    paddingRight: 32,
  },

  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
