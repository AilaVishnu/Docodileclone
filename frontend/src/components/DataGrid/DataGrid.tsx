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

export function DataGrid<T>({ columns, rows, rowKey, size = "m", tdPadding, thPadding, minWidth, onRowClick, rowStyle, tdVerticalAlign, cellFontSize }: {
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
  /** Make rows clickable (pointer cursor + keyboard activation). A cell that
      needs its own click (e.g. an action button) should stopPropagation. */
  onRowClick?: (row: T, index: number) => void;
  /** Per-row style override (e.g. tint an out-of-stock bill line red). */
  rowStyle?: (row: T, index: number) => CSSProperties | undefined;
  /** Cell vertical alignment. Default "middle"; use "top" when a cell can grow
      a second line (e.g. the bill's "Not in stock" label) so inputs stay aligned. */
  tdVerticalAlign?: CSSProperties["verticalAlign"];
  /** Override the font size for BOTH header and body cells (e.g.
      `var(--ctrl-fs-md)` to put header + rows on the same 14→16 ramp). When
      unset, header uses control.sm and body uses the `size` token. */
  cellFontSize?: string;
}) {
  const fs = size === "s" ? fonts.size.s : fonts.size.m;
  const th = (c: GridColumn<T>): CSSProperties => ({ ...tableHeadCell, fontSize: cellFontSize ?? fonts.control.sm, fontWeight: fonts.weight.regular, padding: c.headerPadding ?? thPadding ?? "12px 10px", whiteSpace: "nowrap", textAlign: c.align ?? "center" });
  const td = (c: GridColumn<T>): CSSProperties => ({ fontSize: cellFontSize ?? fs, color: colors.neutral900, padding: c.cellPadding ?? tdPadding ?? "12px 10px", borderBottom: tableDivider, verticalAlign: tdVerticalAlign ?? "middle", textAlign: c.align ?? "center" });
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
          <tr
            key={rowKey(r, i)}
            onClick={onRowClick ? () => onRowClick(r, i) : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onKeyDown={onRowClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRowClick(r, i); } } : undefined}
            style={{ ...(onRowClick ? { cursor: "pointer" } : null), ...rowStyle?.(r, i) }}
          >
            {columns.map((c) => <td key={c.key} style={td(c)}>{c.render(r, i)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
  return minWidth != null ? <div style={{ overflowX: "auto" }}>{table}</div> : table;
}
