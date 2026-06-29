import { CSSProperties } from "react";
import { colors, fonts, spacing, fluidSpacing } from "../../styles/theme";

// Layout only — the heavy UI is carried by reused components (Card, Tabs,
// DateRangeDropdown, DataGrid, PageHeader). Mirrors the Pharmacy module shell.
export const styles: Record<string, CSSProperties> = {
  // Own scroll container, same as PharmacyView.page.
  page: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    padding: `0 ${fluidSpacing.outerX} ${fluidSpacing.outerY}`,
    overflowY: "auto",
  },
  content: {
    width: "100%",
    minWidth: 0,
    marginTop: "var(--main-gap, 24px)",
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
  },

  // KPI strip — four equal Card(surface) tiles. Matches the Stats metric-tile
  // convention: a plain medium label, and the value in the secondary serif
  // display font (no bold) — not semibold sans.
  kpis: { display: "flex", gap: spacing.m },
  // Darker + medium weight so it stays legible on the warm-tan KPI fill (AA).
  kpiLabel: { fontSize: fonts.size.s, fontWeight: fonts.weight.medium, color: colors.neutral700 },
  kpiValue: { fontFamily: fonts.family.secondary, fontSize: fonts.size.h4, lineHeight: 1.1, color: colors.neutral900 },

  // Toolbar — search + status Tabs (left), period DateRangeDropdown (right).
  toolbar: { display: "flex", alignItems: "center", gap: spacing.m, justifyContent: "space-between" },
  toolbarLeft: { display: "flex", alignItems: "center", gap: spacing.m, flex: 1, minWidth: 0 },
  toolbarRight: { display: "flex", alignItems: "center", gap: spacing.m },

  // Table cell text — patient / invoice no / method use the plain DataGrid
  // default (regular, neutral900), like the Billed column; only the date
  // subtitle and the "–" placeholders are muted.
  muted: { color: colors.neutral500, fontSize: fonts.size.s },
  due: { color: colors.red200, fontWeight: fonts.weight.medium },

  actions: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: spacing.xs },
  invCell: { display: "flex", flexDirection: "column", gap: 2 },
  emptyWrap: { padding: "48px 8px", textAlign: "center", color: colors.neutral500, fontSize: fonts.size.s },

  // Grid view — responsive receipt tiles; rows stay top-aligned (tiles vary in
  // height with their content).
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: spacing.m, alignItems: "start" },
};
