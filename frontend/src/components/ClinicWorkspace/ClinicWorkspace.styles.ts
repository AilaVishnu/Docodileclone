import { CSSProperties } from "react";
import { colors, radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    // Fixed height sized so the full form fits comfortably without scrolling,
    // even with multiple specialties + long address. Switching tabs doesn't
    // resize the workspace.
    height: 700,
    border: `0px solid ${colors.neutral900}`,
    borderRadius: `0 ${radii.primary}px ${radii.primary}px ${radii.primary}px`,
    display: "flex",
    // Vertical: 80 (7xl, off-Figma scale). Horizontal: 48 (4xl). Gap: 80 (7xl).
    padding: `${spacing["7xl"]} ${spacing["4xl"]}`,
    gap: spacing["7xl"],
    boxSizing: "border-box",
    backgroundColor: colors.primary200,
    alignItems: "stretch",
  },

  leftPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    // Form anchored to panel top; only its bottom moves as content grows.
    justifyContent: "flex-start",
  },

  rightPanel: {
    flex: 1.2,
    display: "flex",
    flexDirection: "column",
  },
};
