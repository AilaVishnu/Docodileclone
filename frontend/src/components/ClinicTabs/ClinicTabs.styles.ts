import { CSSProperties } from "react";
import { colors, radii, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "flex-end",
  },

  tab: {
    // Fixed width so tabs don't resize with different clinic names — each
    // tab is the same size regardless of content. Ellipsis on overflow.
    width: 180,
    padding: "12px 16px",
    borderRadius: `${radii.primary}px ${radii.primary}px 0 0`,
    border: `0px solid ${colors.blindBlack}`,
    borderBottom: "none",
    backgroundColor: colors.secondary100,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    cursor: "pointer",
    position: "relative",
    flexShrink: 0,
  },

  activeTab: {
    backgroundColor: colors.active.shade200,
    borderBottom: "none",
    top: 1,
    zIndex: 2,
  },

  addClinic: {
    padding: "12px 24px",
    background: "none",
    border: "none",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.blindBlack,
    opacity: 0.5,
    cursor: "pointer",
  },
};
