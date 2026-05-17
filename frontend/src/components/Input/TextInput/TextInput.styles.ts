import { CSSProperties } from "react";
import { colors, fonts, spacing } from "../../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    // Vertical padding is var-driven so 1024 compacts every TextInput row.
    padding: "var(--input-pady, 6px) 8px",
    borderBottom: `1px solid ${colors.neutral300}`,
    width: "100%",
  },

  icon: {
    fontSize: fonts.size.m,
    lineHeight: 1,
    color: colors.neutral900,
    opacity: 0.8,
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
  },
  errorContainer: {
    borderBottom: `1px solid ${colors.red200}`,
    backgroundColor: "rgba(255, 0, 0, 0.05)",
  },
};
