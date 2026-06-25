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

  // KPI strip — four equal Card(surface) tiles.
  kpis: { display: "flex", gap: spacing.m },
  kpiLabel: { fontSize: fonts.size.xs, fontWeight: fonts.weight.medium, letterSpacing: "0.03em", textTransform: "uppercase", color: colors.neutral500 },
  kpiValue: { fontSize: fonts.size.l, fontWeight: fonts.weight.semibold, color: colors.neutral900 },

  // Toolbar — search + status Tabs (left), period DateRangeDropdown (right).
  toolbar: { display: "flex", alignItems: "center", gap: spacing.m, justifyContent: "space-between" },
  toolbarLeft: { display: "flex", alignItems: "center", gap: spacing.m, flex: 1, minWidth: 0 },
  toolbarRight: { display: "flex", alignItems: "center", gap: spacing.m },

  // Table cell text.
  patient: { fontSize: fonts.size.m, fontWeight: fonts.weight.medium, color: colors.neutral900 },
  invText: { fontSize: fonts.size.m, fontWeight: fonts.weight.medium, color: colors.neutral900 },
  muted: { color: colors.neutral500, fontSize: fonts.size.s },
  due: { color: colors.red200, fontWeight: fonts.weight.medium },

  actions: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: spacing.xs },
  invCell: { display: "flex", flexDirection: "column", gap: 2 },
  emptyWrap: { padding: "48px 8px", textAlign: "center", color: colors.neutral500, fontSize: fonts.size.s },
};
