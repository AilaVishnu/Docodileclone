import { CSSProperties } from "react";
import { colors, fonts, strokes } from "./theme";

// ──────────────────────────────────────────────────────────────────────────────
// Canonical table look — ONE source for the bits every table shares: the header
// text colour + weight and the row divider. Before this, 5 tables set these
// independently and the Stats overdue/dues table drifted (neutral500 / weight
// 500 vs everyone else's alphaBlack3 / 400).
//
// NOTE: per-table padding, font-size and card radius are intentionally NOT here
// — column density + the queue's tab-tuck corner are layout-specific and were
// left as-is. Each table spreads `tableHeadCell` into its `th` and uses
// `tableDivider` for its row/cell borders, then adds its own padding/size.
// ──────────────────────────────────────────────────────────────────────────────
export const tableDivider = `${strokes.xs} solid ${colors.primary300}`;

export const tableHeadCell: CSSProperties = {
  textAlign: "left",
  color: colors.alphaBlack3,
  fontWeight: fonts.weight.regular, // 400
  borderBottom: tableDivider,
};
