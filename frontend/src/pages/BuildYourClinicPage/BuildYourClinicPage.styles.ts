import { CSSProperties } from "react";
import { colors, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    minWidth: "100vw",
    padding: "48px 24px",
    backgroundColor: colors.yellowTeeth,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h1,
    fontWeight: 500,
    color: colors.blindBlack,
    marginBottom: 16,
  },

  workspacePlaceholder: {
    minHeight: 360,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.blindBlack,
    opacity: 0.5,
    fontSize: 18,
  },

  workspaceContainer: {
    minWidth: "60vw",  
    transition: "max-width 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },

  rightContainer: {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 24,
  height: "100%",
},

  footer: {
    marginTop: 32,
    display: "flex",
    gap: 16,
    justifyContent: "center",
  },

};
