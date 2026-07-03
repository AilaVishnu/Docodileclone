import { CSSProperties } from "react";
import { spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    // Fill the available height instead of a fixed 700px, so the page never
    // scrolls. Content sits at its natural size, vertically centered — the
    // top/bottom padding (min 80px) is what stretches to absorb the slack.
    flex: 1,
    minHeight: 0,
    display: "flex",
    // Vertical padding gives the centering slack; the two panes carry their own
    // surfaces now, so the container itself is transparent (no unifying box).
    padding: `${spacing["7xl"]} ${spacing["4xl"]}`,
    gap: spacing["2xl"],
    boxSizing: "border-box",
    // Top-align both columns. The right column's tabs sit above its panel, so
    // the form (left) is offset down by the tab-bar height to line its top up
    // with the panel's top edge (see BuildYourClinicPage.styles `pane`).
    alignItems: "flex-start",
  },

  leftPanel: {
    flex: 0.8,
    display: "flex",
    flexDirection: "column",
    // Form anchored to panel top; only its bottom moves as content grows.
    justifyContent: "flex-start",
  },

  rightPanel: {
    flex: 1.6,
    display: "flex",
    flexDirection: "column",
  },
};
