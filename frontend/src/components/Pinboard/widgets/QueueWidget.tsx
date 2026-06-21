import React from "react";
import { colors, fonts, radii, spacing } from "../../../styles/theme";
import { Card } from "../../Card";
import { Icon } from "../../Icon";

// A compact live view of the appointment queue for the board. Presentational:
// the caller feeds entries (HomeView / Pinboard wire this to the queue API).

export type QueueState = "seeing" | "waiting";

export type QueueEntry = {
  id: string;
  name: string;
  /** Short context line, e.g. "room 2" or "walk-in". */
  note?: string;
  state: QueueState;
};

export type QueueWidgetProps = {
  entries?: QueueEntry[];
  /** Count of additional people queued beyond the listed entries. */
  moreWaiting?: number;
  live?: boolean;
  style?: React.CSSProperties;
};

const SAMPLE: QueueEntry[] = [
  { id: "1", name: "Bella", note: "room 2", state: "seeing" },
  { id: "2", name: "Max", note: "walk-in", state: "waiting" },
];

function initials(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

export function QueueWidget({ entries = SAMPLE, moreWaiting = 0, live = true, style }: QueueWidgetProps) {
  return (
    <Card variant="surface" elevation="raised" padding="s" style={{ ...styles.card, ...style }}>
      <div style={styles.header}>
        <span style={styles.title}>Queue</span>
        {live && (
          <span style={styles.live}>
            <Icon name="status-dot" size={12} color={colors.primary600} />
            live
          </span>
        )}
      </div>

      <div style={styles.list}>
        {entries.map((e) => {
          const seeing = e.state === "seeing";
          return (
            <div key={e.id} style={styles.row}>
              <span
                style={{
                  ...styles.avatar,
                  background: seeing ? colors.green100 : colors.neutral200,
                  color: seeing ? colors.neutral900 : colors.neutral700,
                }}
              >
                {initials(e.name)}
              </span>
              <div style={styles.meta}>
                <span style={styles.name}>
                  {e.name}
                  {e.note ? ` · ${e.note}` : ""}
                </span>
                <span style={styles.state}>{seeing ? "now seeing" : "waiting"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {moreWaiting > 0 && <div style={styles.more}>+{moreWaiting} in queue</div>}
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
  live: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["3xs"],
    fontSize: fonts.size.caption,
    color: colors.primary600,
  },
  list: { display: "flex", flexDirection: "column", gap: spacing.xs, flex: 1 },
  row: { display: "flex", alignItems: "center", gap: spacing.xs },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: fonts.size.caption,
    fontWeight: fonts.weight.semibold,
    flexShrink: 0,
  },
  meta: { display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 },
  name: { fontSize: fonts.size.xs, color: colors.neutral900 },
  state: { fontSize: fonts.size.caption, color: colors.neutral500 },
  more: {
    marginTop: spacing.xs,
    fontSize: fonts.size.caption,
    color: colors.neutral500,
  },
};
