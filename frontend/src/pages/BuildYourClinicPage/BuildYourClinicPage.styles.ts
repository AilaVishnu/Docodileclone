import { CSSProperties } from "react";
import { colors, fonts, spacing } from "../../styles/theme";

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
    fontSize: fonts.size.h2,
    fontWeight: fonts.weight.regular,
    color: colors.blindBlack,
    marginBottom: 16,
  },

  workspaceContainer: {
    minWidth: "80vw",
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
    marginTop: spacing.xxl,
    display: "flex",
    gap: spacing.xl,
    justifyContent: "center",
  },

};
