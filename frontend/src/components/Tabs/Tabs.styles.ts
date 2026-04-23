import { CSSProperties } from "react";
import { colors, radii, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "flex-end",
    width: "100%",
  },

  tab: {
    padding: "12px 36px",
    borderRadius: `${radii.primary}px ${radii.primary}px 0 0`,
    border: 0,
    borderBottom: 0,
    backgroundColor: colors.secondary100,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    cursor: "pointer",
    position: "relative",
    color: colors.neutral700,
    transition: "all 0.2s ease",
    outline: "none",
    boxShadow: "none",
    maxWidth: 200,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  activeTab: {
    backgroundColor: colors.active.shade100,
    color: colors.neutral900,
    fontWeight: fonts.weight.medium,
    zIndex: 2,
  },

  actionsContainer: {
    display: "flex",
    marginLeft: "auto",
    alignItems: "center",
  },

  actionButton: {
    padding: "12px 24px",
    background: "none",
    border: "none",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    color: colors.neutral900,
    opacity: 0.5,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};
