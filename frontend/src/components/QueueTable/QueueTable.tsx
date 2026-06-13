import React from "react";
import { colors, fonts, spacing, strokes } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// QueueTable (DRAFT / Tier-2 mock) — the proposed shared component for the
// appointment + prescription queues. Captures the queue "thought" as explicit
// props instead of hand-rolled JSX:
//   • columns       — render-prop cells (status can be a badge OR a dropdown;
//                     last column a 3-dot menu OR a "View Pad" button)
//   • rowTone(row)  — status → row background (in-progress / done / cancelled)
//   • groupBy(row)  — a separator line is drawn when this key changes
//
// Responsiveness: CSS-GRID columns. Fixed columns take px (#, Time, Status,
// actions); flexible ones take fr via `grow`, so they squeeze/stretch with the
// container — the clean equivalent of the old spacer-column trick.
// ─────────────────────────────────────────────────────────────────────────────
export type QueueColumn<T> = {
  key: string;
  header: React.ReactNode;
  /** Fixed width in px (#, Time, Status, actions). */
  width?: number;
  /** Flexible weight (CSS grid fr). Used when no `width`. Default 1. */
  grow?: number;
  align?: "left" | "center" | "right";
  render: (row: T) => React.ReactNode;
};

type QueueTableProps<T> = {
  columns: QueueColumn<T>[];
  rows: T[];
  rowKey: (row: T) => React.Key;
  /** Per-row background tone (e.g. status colour). */
  rowTone?: (row: T) => string | undefined;
  /** Draw a separator when this key changes between consecutive rows. */
  groupBy?: (row: T) => string;
  /** Subtle hover highlight on rows that have no tone. */
  hover?: boolean;
};

export function QueueTable<T>({ columns, rows, rowKey, rowTone, groupBy, hover }: QueueTableProps<T>) {
  const template = columns
    .map((c) => (c.width != null ? `${c.width}px` : `minmax(0, ${c.grow ?? 1}fr)`))
    .join(" ");

  const rowGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: template,
    alignItems: "center",
    columnGap: spacing.s,
    padding: `${spacing.s} ${spacing.m}`,
  };
  const cell = (align?: QueueColumn<T>["align"]): React.CSSProperties => ({
    minWidth: 0,
    textAlign: align ?? "left",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
  });

  return (
    <div style={{ width: "100%" }}>
      <div style={{ ...rowGrid, borderBottom: `${strokes.s} solid ${colors.primary300}` }}>
        {columns.map((c) => (
          <div key={c.key} style={{ ...cell(c.align), fontSize: fonts.control.xs, color: colors.alphaBlack3 }}>
            {c.header}
          </div>
        ))}
      </div>

      {rows.map((row, i) => {
        const prev = i > 0 ? rows[i - 1] : undefined;
        const separate = !!(groupBy && prev && groupBy(row) !== groupBy(prev));
        const tone = rowTone?.(row);
        return (
          <React.Fragment key={rowKey(row)}>
            {separate && (
              <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 1.5, height: 20, backgroundColor: colors.primary300 }} />
              </div>
            )}
            <div
              style={{ ...rowGrid, backgroundColor: tone ?? "transparent", borderBottom: `${strokes.xs} solid ${colors.primary300}` }}
              onMouseEnter={hover && !tone ? (e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.018)"; } : undefined}
              onMouseLeave={hover && !tone ? (e) => { e.currentTarget.style.backgroundColor = "transparent"; } : undefined}
            >
              {columns.map((c) => (
                <div key={c.key} style={cell(c.align)}>{c.render(row)}</div>
              ))}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
