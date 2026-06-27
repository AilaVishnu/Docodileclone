import React, { CSSProperties, useMemo, useState } from "react";
import { colors, fonts } from "../../styles/theme";
import { tableHeadCell, tableDivider } from "../../styles/tableStyles";

// DataGrid — the shared, Catalog-styled table. Columns are render-prop based,
// so a cell can be plain text (read-only, e.g. the Catalog list) OR an editor
// (inputs / comboboxes, e.g. the Bill modal's line items). Header uses the
// shared tableHeadCell look; rows divide with tableDivider. Non-name columns
// centre by default; pass align:"left" for the name column.
//
// Sorting is OPT-IN per column: give a column a `sortAccessor` and its header
// becomes clickable — click cycles ascending → descending → unsorted. Columns
// without a `sortAccessor` (the default everywhere else) are unaffected.
export type GridColumn<T> = {
  key: string;
  header?: React.ReactNode;
  /** Fixed column width (colgroup). Omit for the flexible column. */
  width?: number | string;
  align?: "left" | "center" | "right";
  headerPadding?: string;
  cellPadding?: string;
  render: (row: T, index: number) => React.ReactNode;
  /** Make this column sortable — returns the comparable value for a row.
      Numbers sort numerically; everything else by locale (numeric-aware).
      null/undefined sort last. Omit to keep the column unsortable. */
  sortAccessor?: (row: T) => string | number | null | undefined;
};

type SortState = { key: string; dir: "asc" | "desc" };

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
  const [sort, setSort] = useState<SortState | null>(null);

  // Click a sortable header → cycle: (this col asc) → (this col desc) → off.
  // Clicking a different column always starts a fresh ascending sort.
  const toggleSort = (c: GridColumn<T>) => {
    if (!c.sortAccessor) return;
    setSort((prev) => {
      if (!prev || prev.key !== c.key) return { key: c.key, dir: "asc" };
      if (prev.dir === "asc") return { key: c.key, dir: "desc" };
      return null;
    });
  };

  // Sorted view of the incoming rows. When no sort is active the rows are left
  // in the order they were given (e.g. the page's grouping order).
  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortAccessor) return rows;
    const acc = col.sortAccessor;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = acc(a);
      const vb = acc(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1; // nulls last, regardless of direction
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb), undefined, { numeric: true }) * dir;
    });
  }, [rows, sort, columns]);

  const th = (c: GridColumn<T>): CSSProperties => ({
    ...tableHeadCell,
    fontSize: cellFontSize ?? fonts.control.sm,
    fontWeight: fonts.weight.regular,
    padding: c.headerPadding ?? thPadding ?? "12px 10px",
    whiteSpace: "nowrap",
    textAlign: c.align ?? "center",
    ...(c.sortAccessor ? { cursor: "pointer", userSelect: "none" } : null),
  });
  const td = (c: GridColumn<T>): CSSProperties => ({ fontSize: cellFontSize ?? fs, color: colors.neutral900, padding: c.cellPadding ?? tdPadding ?? "12px 10px", borderBottom: tableDivider, verticalAlign: tdVerticalAlign ?? "middle", textAlign: c.align ?? "center" });

  // Header label + sort caret. Sortable columns always show a (dim) caret so
  // they read as sortable; the active column's caret is solid and directional.
  const headerInner = (c: GridColumn<T>) => {
    if (!c.sortAccessor) return c.header;
    const active = sort?.key === c.key;
    const glyph = active ? (sort!.dir === "asc" ? "↑" : "↓") : "↕";
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, verticalAlign: "middle" }}>
        {c.header}
        <span style={{ fontSize: "0.9em", lineHeight: 1, color: active ? colors.neutral800 : colors.neutral400 }}>{glyph}</span>
      </span>
    );
  };

  const table = (
    <table style={{ width: "100%", minWidth, borderCollapse: "collapse", tableLayout: "fixed" }}>
      <colgroup>
        {columns.map((c) => (
          <col key={c.key} style={c.width != null ? { width: typeof c.width === "number" ? `${c.width}px` : c.width } : undefined} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              style={th(c)}
              onClick={c.sortAccessor ? () => toggleSort(c) : undefined}
              tabIndex={c.sortAccessor ? 0 : undefined}
              onKeyDown={c.sortAccessor ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSort(c); } } : undefined}
              aria-sort={c.sortAccessor ? (sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none") : undefined}
            >
              {headerInner(c)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((r, i) => (
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
