import type { CSSProperties } from "react";
import { colors, spacing } from "../../styles/theme";

// VisitForm — the bento layout for a visit. Borderless white block cards
// (surface from <Card>) on the warm visit page, separated by gaps. A 2-column
// grid: full-width blocks span the row, half-width blocks pair up.
export const styles: Record<string, CSSProperties> = {
  page: { background: colors.primary200, padding: spacing.xl },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.m, alignItems: "start" },
  full: { gridColumn: "1 / -1", minWidth: 0 },
  half: { minWidth: 0 },
  addRow: { gridColumn: "1 / -1", display: "flex" },
};
