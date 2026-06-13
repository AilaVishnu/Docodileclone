import React, { CSSProperties } from "react";
import { colors, fonts } from "../../styles/theme";
import { tableHeadCell, tableDivider } from "../../styles/tableStyles";

// DataGrid — the shared, Catalog-styled table. Columns are render-prop based,
// so a cell can be plain text (read-only, e.g. the Catalog list) OR an editor
// (inputs / comboboxes, e.g. the Bill modal's line items). Header uses the
// shared tableHeadCell look; rows divide with tableDivider. Non-name columns
// centre by default; pass align:"left" for the name column.
export type GridColumn<T> = {
  key: string;
  header?: React.ReactNode;
  /** Fixed column width (colgroup). Omit for the flexible column. */
  width?: number | string;
  align?: "left" | "center" | "right";
  headerPadding?: string;
  cellPadding?: string;
  render: (row: T, index: number) => React.ReactNode;
};

export function DataGrid<T>({ columns, rows, rowKey, size = "m", tdPadding, thPadding, minWidth }: {
  columns: GridColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => React.Key;
  /** Cell font size — "m" matches Catalog; "s" is denser (e.g. inside a modal). */
  size?: "m" | "s";
  /** Grid-wide cell/header padding overrides (a column's own padding still wins). */
  tdPadding?: string;
  thPadding?: string;
  /** Min table width (px). Wraps in a horizontal scroller for wide tables. */
  minWidth?: number;
}) {
  const fs = size === "s" ? fonts.size.s : fonts.size.m;
  const th = (c: GridColumn<T>): CSSProperties => ({ ...tableHeadCell, fontSize: fonts.control.xs, fontWeight: fonts.weight.regular, padding: c.headerPadding ?? thPadding ?? "12px 10px", whiteSpace: "nowrap", textAlign: c.align ?? "center" });
  const td = (c: GridColumn<T>): CSSProperties => ({ fontSize: fs, color: colors.neutral900, padding: c.cellPadding ?? tdPadding ?? "12px 10px", borderBottom: tableDivider, verticalAlign: "middle", textAlign: c.align ?? "center" });
  const table = (
    <table style={{ width: "100%", minWidth, borderCollapse: "collapse", tableLayout: "fixed" }}>
      <colgroup>
        {columns.map((c) => (
          <col key={c.key} style={c.width != null ? { width: typeof c.width === "number" ? `${c.width}px` : c.width } : undefined} />
        ))}
      </colgroup>
      <thead>
        <tr>{columns.map((c) => <th key={c.key} style={th(c)}>{c.header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={rowKey(r, i)}>{columns.map((c) => <td key={c.key} style={td(c)}>{c.render(r, i)}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
  return minWidth != null ? <div style={{ overflowX: "auto" }}>{table}</div> : table;
}
