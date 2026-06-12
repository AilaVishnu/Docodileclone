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
  render: (row: T, index: number) => React.ReactNode;
};

export function DataGrid<T>({ columns, rows, rowKey, size = "m" }: {
  columns: GridColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => React.Key;
  /** Cell font size — "m" matches Catalog; "s" is denser (e.g. inside a modal). */
  size?: "m" | "s";
}) {
  const fs = size === "s" ? fonts.size.s : fonts.size.m;
  const th = (a?: GridColumn<T>["align"]): CSSProperties => ({ ...tableHeadCell, fontSize: fs, fontWeight: fonts.weight.regular, padding: "10px 6px", whiteSpace: "nowrap", textAlign: a ?? "center" });
  const td = (a?: GridColumn<T>["align"]): CSSProperties => ({ fontSize: fs, color: colors.neutral900, padding: "6px", borderBottom: tableDivider, verticalAlign: "middle", textAlign: a ?? "center" });
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
      <colgroup>
        {columns.map((c) => (
          <col key={c.key} style={c.width != null ? { width: typeof c.width === "number" ? `${c.width}px` : c.width } : undefined} />
        ))}
      </colgroup>
      <thead>
        <tr>{columns.map((c) => <th key={c.key} style={th(c.align)}>{c.header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={rowKey(r, i)}>{columns.map((c) => <td key={c.key} style={td(c.align)}>{c.render(r, i)}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}
