import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../../styles/theme";
import { Card } from "../../Card";
import { Icon } from "../../Icon";

// A 2×2 grid of launch tiles — the common "start something" actions for the
// clinic. Icon names are pulled from the shared registry.

export type QuickAction = { key: string; label: string; icon: string };

export type QuickActionsWidgetProps = {
  actions?: QuickAction[];
  onAction?: (key: string) => void;
  style?: React.CSSProperties;
};

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { key: "book", label: "Book", icon: "appointments" },
  { key: "patient", label: "New patient", icon: "user-check" },
  { key: "script", label: "Prescription", icon: "prescription" },
  { key: "records", label: "Records", icon: "patient-files" },
];

export function QuickActionsWidget({
  actions = DEFAULT_QUICK_ACTIONS,
  onAction,
  style,
}: QuickActionsWidgetProps) {
  return (
    <Card variant="surface" elevation="raised" padding="s" style={{ ...styles.card, ...style }}>
      <div style={styles.grid}>
        {actions.map((a) => (
          <button
            key={a.key}
            data-no-drag
            onClick={() => onAction?.(a.key)}
            style={styles.tile}
            title={a.label}
          >
            <Icon name={a.icon} size={20} color={colors.primary600} />
            <span style={styles.label}>{a.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { height: "100%", boxSizing: "border-box" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: spacing.xs,
    height: "100%",
  },
  tile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["3xs"],
    border: `${strokes.xs} solid ${colors.neutral300}`,
    borderRadius: radii.m,
    background: colors.neutral100,
    cursor: "pointer",
    padding: spacing.xs,
  },
  label: {
    fontSize: fonts.size.caption,
    color: colors.neutral700,
    textAlign: "center",
  },
};
