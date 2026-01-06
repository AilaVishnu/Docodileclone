import { CSSProperties } from "react";
import { colors, radii, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "flex-end",
  },

  tab: {
    padding: "12px 36px",
    borderRadius: `${radii.primary}px ${radii.primary}px 0 0`,
    border: `1px solid ${colors.blindBlack}`,
    borderBottom: "none",
    backgroundColor: colors.yellowTeeth,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    cursor: "pointer",
    position: "relative",
  },

  activeTab: {
    backgroundColor: colors.yellowTeeth,
    borderBottom: "none",
    top: 1,
    zIndex: 2,
  },

  addClinic: {
    padding: "12px 24px",
    background: "none",
    border: "none",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    color: colors.blindBlack,
    opacity: 0.5,
    cursor: "pointer",
  },
};
