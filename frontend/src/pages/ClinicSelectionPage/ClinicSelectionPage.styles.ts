import { colors, fonts, spacing } from "../../styles/theme";

export const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: colors.secondary200,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: `${spacing.xxl} 40px`,
  },
  grid: {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    gap: "32px",
    maxWidth: "1200px",
    width: "100%",
  },
  loaderArea: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: fonts.size.l,
    color: colors.neutral700,
  }
} as const;
