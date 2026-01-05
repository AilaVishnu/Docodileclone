import { CSSProperties } from "react";
import { colors, radii, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "stretch",
    marginLeft: "2vw"
  },

  tab: {
    padding: "12px 36px",
    borderRadius: `${radii.primary}px ${radii.primary}px 0 0`,
    border: `1px solid ${colors.blindBlack}`,
    borderBottom: "none",
    backgroundColor: colors.yellowTeeth,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.h4,
    cursor: "pointer",
  },

  activeTab: {
    backgroundColor: colors.yellowTeeth,
    fontWeight: 600,
  },

  addClinic: {
    padding: "10px 16px",
    background: "none",
    border: "none",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.h4,
    color: colors.blindBlack,
    opacity: 0.5,
    cursor: "pointer",
  },
};
