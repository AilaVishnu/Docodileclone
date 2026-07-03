import { CSSProperties } from "react";
import { colors, fonts, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  // Pill-shaped, borderless — the shared toolbar search idiom (Pharmacy /
  // Services / Patient Files / Bills). Height + font follow the responsive vars.
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    width: "100%",
    height: "var(--search-h, 40px)",
    padding: `0 ${spacing.s} 0 ${spacing.m}`,
    backgroundColor: colors.neutral100,
    borderRadius: 55,
    boxSizing: "border-box",
  },
  icon: { color: colors.neutral500, flexShrink: 0 },
  input: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: fonts.family.primary,
    fontSize: "var(--search-fs, 14px)",
    color: colors.neutral900,
  },
};
