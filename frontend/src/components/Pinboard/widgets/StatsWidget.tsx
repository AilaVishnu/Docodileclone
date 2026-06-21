import React from "react";
import { colors, fonts, spacing } from "../../../styles/theme";
import { Card } from "../../Card";
import { Icon } from "../../Icon";

// Today's numbers at a glance — a board widget. Presentational: the caller
// supplies the counts (HomeView already derives these from the queue API).

export type TodayStats = {
  totalAppointments: number;
  newPatients: number;
  reviews: number;
  procedures: number;
};

export type StatsWidgetProps = {
  stats: TodayStats;
  style?: React.CSSProperties;
};

const ROWS: Array<{ key: keyof TodayStats; label: string }> = [
  { key: "totalAppointments", label: "Appointments" },
  { key: "newPatients", label: "New patients" },
  { key: "reviews", label: "Reviews" },
  { key: "procedures", label: "Procedures" },
];

export function StatsWidget({ stats, style }: StatsWidgetProps) {
  return (
    <Card variant="surface" elevation="raised" padding="m" style={{ ...styles.card, ...style }}>
      <div style={styles.header}>
        <span style={styles.title}>Today</span>
        <Icon name="appointments" size={16} tone="muted" />
      </div>
      <div style={styles.rows}>
        {ROWS.map(({ key, label }) => (
          <div key={key} style={styles.row}>
            <span style={styles.label}>{label}</span>
            <span style={styles.value}>{stats[key]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
  },
  rows: { display: "flex", flexDirection: "column", gap: spacing["3xs"], flex: 1, justifyContent: "center" },
  row: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.xs },
  label: { fontSize: fonts.size.xs, color: colors.neutral700 },
  value: { fontSize: fonts.size.l, fontWeight: fonts.weight.bold, color: colors.primary600 },
};
