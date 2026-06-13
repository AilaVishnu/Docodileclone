import { CSSProperties } from "react";
import { colors, radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    // Fill the available height instead of a fixed 700px, so the page never
    // scrolls. Content sits at its natural size, vertically centered — the
    // top/bottom padding (min 80px) is what stretches to absorb the slack.
    flex: 1,
    minHeight: 0,
    border: `0px solid ${colors.neutral900}`,
    borderRadius: `0 ${radii["2xl"]}px ${radii["2xl"]}px ${radii["2xl"]}px`,
    display: "flex",
    // Vertical: 80 (7xl) min. Horizontal: 48 (4xl). Gap: 80 (7xl).
    padding: `${spacing["7xl"]} ${spacing["4xl"]}`,
    gap: spacing["7xl"],
    boxSizing: "border-box",
    backgroundColor: colors.primary200,
    alignItems: "center",
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
