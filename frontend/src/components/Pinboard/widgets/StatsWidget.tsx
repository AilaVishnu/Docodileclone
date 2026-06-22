import React from "react";
import { colors, fonts, radii, spacing } from "../../../styles/theme";
import { Card } from "../../Card";
import { Icon } from "../../Icon";

// Today's numbers — a board widget. Presentational: the caller supplies the
// counts (HomeView derives them from the appointments API). Several treatments.

export type TodayStats = {
  totalAppointments: number;
  newPatients: number;
  reviews: number;
  procedures: number;
};

export type StatsVariant = "list" | "bar" | "icons" | "spotlight";

export type StatsWidgetProps = {
  stats: TodayStats;
  variant?: StatsVariant;
  style?: React.CSSProperties;
};

// Breakdown categories (sum to total appointments). Monochromatic primary ramp
// keeps the bars/dots on-brand against the warm board.
const CATS = [
  { key: "newPatients", label: "New", longLabel: "New patients", icon: "user-check", color: colors.primary600 },
  { key: "reviews", label: "Reviews", longLabel: "Reviews", icon: "calendar-check", color: colors.primary400 },
  { key: "procedures", label: "Procedures", longLabel: "Procedures", icon: "capsule", color: colors.primary200 },
] as const;

// Proportional stacked bar of the breakdown.
function CompositionBar({ stats, height = 10 }: { stats: TodayStats; height?: number }) {
  const sum = CATS.reduce((a, c) => a + stats[c.key], 0) || 1;
  return (
    <div style={{ ...styles.bar, height }}>
      {CATS.map((c) =>
        stats[c.key] > 0 ? (
          <span key={c.key} style={{ flexGrow: stats[c.key] / sum, backgroundColor: c.color }} />
        ) : null
      )}
    </div>
  );
}

export function StatsWidget({ stats, variant = "list", style }: StatsWidgetProps) {
  const total = stats.totalAppointments;

  return (
    <Card variant="surface" elevation="raised" padding={variant === "icons" ? "s" : "m"} style={{ ...styles.card, ...style }}>
      {variant === "list" && (
        <>
          <div style={styles.header}>
            <span style={styles.title}>Today</span>
          </div>
          <div style={styles.rows}>
            <Row label="Appointments" value={total} strong />
            {CATS.map((c) => (
              <Row key={c.key} label={c.longLabel} value={stats[c.key]} dot={c.color} />
            ))}
          </div>
        </>
      )}

      {variant === "bar" && (
        <>
          <span style={styles.kicker}>Today</span>
          <div style={styles.bigRow}>
            <span style={styles.bigNum}>{total}</span>
            <span style={styles.unit}>appointments</span>
          </div>
          <CompositionBar stats={stats} />
          <div style={styles.legend}>
            {CATS.map((c) => (
              <span key={c.key} style={styles.legendItem}>
                <span style={{ ...styles.dot, backgroundColor: c.color }} />
                {c.label} <strong style={styles.legendVal}>{stats[c.key]}</strong>
              </span>
            ))}
          </div>
        </>
      )}

      {variant === "icons" && (
        <>
          <div style={styles.header}>
            <span style={styles.title}>Today</span>
            <span style={styles.totalPill}>{total}</span>
          </div>
          <div style={styles.iconRows}>
            {CATS.map((c) => (
              <div key={c.key} style={styles.iconRow}>
                <span style={styles.iconCircle}>
                  <Icon name={c.icon} size={16} color={colors.primary600} />
                </span>
                <span style={styles.iconLabel}>{c.longLabel}</span>
                <span style={styles.iconCount}>{stats[c.key]}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {variant === "spotlight" && (
        <>
          <div style={styles.spotlight}>
            <span style={styles.spotlightNum}>{total}</span>
            <span style={styles.spotlightText}>appointments today</span>
          </div>
          <CompositionBar stats={stats} height={8} />
          <div style={styles.breakdownLine}>
            {CATS.map((c, i) => (
              <React.Fragment key={c.key}>
                {i > 0 && <span style={styles.sep}> · </span>}
                <span>
                  {stats[c.key]} {c.label.toLowerCase()}
                </span>
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function Row({ label, value, strong, dot }: { label: string; value: number; strong?: boolean; dot?: string }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>
        {dot && <span style={{ ...styles.dot, backgroundColor: dot }} />}
        {label}
      </span>
      <span style={{ ...styles.rowValue, color: strong ? colors.primary600 : colors.neutral900 }}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xs },
  title: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  dot: { width: 7, height: 7, borderRadius: radii.pill, flexShrink: 0 },

  // list
  rows: { display: "flex", flexDirection: "column", gap: spacing["3xs"], flex: 1, justifyContent: "center" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.xs },
  rowLabel: { display: "inline-flex", alignItems: "center", gap: spacing["2xs"], fontSize: fonts.size.xs, color: colors.neutral700 },
  rowValue: { fontSize: fonts.size.l, fontWeight: fonts.weight.bold },

  // bar + spotlight shared
  kicker: { fontSize: fonts.size.xs, color: colors.neutral500, fontWeight: fonts.weight.medium },
  bigRow: { display: "flex", alignItems: "baseline", gap: spacing["2xs"], marginTop: spacing["3xs"], marginBottom: spacing.s },
  bigNum: { fontFamily: fonts.family.secondary, fontSize: fonts.size.h2, lineHeight: 1, color: colors.neutral900 },
  unit: { fontSize: fonts.size.s, color: colors.neutral600 },
  bar: { display: "flex", width: "100%", borderRadius: radii.pill, overflow: "hidden", backgroundColor: colors.neutral150 },
  legend: { display: "flex", flexWrap: "wrap", gap: spacing.s, marginTop: spacing.s },
  legendItem: { display: "inline-flex", alignItems: "center", gap: spacing["3xs"], fontSize: fonts.size.caption, color: colors.neutral600 },
  legendVal: { color: colors.neutral900, fontWeight: fonts.weight.semibold },

  // icons
  totalPill: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.bold,
    color: colors.primary700,
    backgroundColor: colors.primary100,
    borderRadius: radii.pill,
    padding: "1px 9px",
  },
  iconRows: { display: "flex", flexDirection: "column", gap: spacing["2xs"], flex: 1, justifyContent: "center" },
  iconRow: { display: "flex", alignItems: "center", gap: spacing.xs },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.primary100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconLabel: { fontSize: fonts.size.xs, color: colors.neutral700, flex: 1, minWidth: 0 },
  iconCount: { fontSize: fonts.size.l, fontWeight: fonts.weight.bold, color: colors.neutral900 },

  // spotlight
  spotlight: { display: "flex", alignItems: "baseline", gap: spacing["2xs"], flexWrap: "wrap", flex: 1, alignContent: "center" },
  spotlightNum: { fontFamily: fonts.family.secondary, fontSize: fonts.size.h1, lineHeight: 1, color: colors.primary600 },
  spotlightText: { fontSize: fonts.size.m, color: colors.neutral800 },
  breakdownLine: { marginTop: spacing.s, fontSize: fonts.size.xs, color: colors.neutral600 },
  sep: { color: colors.neutral400 },
};
