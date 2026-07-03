import { CSSProperties } from "react";
import { colors, fonts } from "../../styles/theme";
import { tableHeadCell, tableDivider } from "../../styles/tableStyles";

// Patient-files table look. These cells used to be borrowed from
// AppointmentQueue.styles (a cross-page coupling — the patient-files page
// reaching into a sibling component's styles). They now live here, composed
// from the same shared primitives (`tableHeadCell` / `tableDivider`) the queue
// uses, so the rendered look is identical without the dependency. Values mirror
// the queue's table cells verbatim.
export const tableStyles: Record<string, CSSProperties> = {
  tableContainer: {
    backgroundColor: colors.primary100,
    borderRadius: "0 24px 24px 24px",
    padding: "var(--queue-table-pad, 24px)",
    overflow: "visible",
  },

  table: {
    width: "100%",
    maxWidth: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    tableLayout: "fixed" as const,
  },

  th: {
    ...tableHeadCell, // shared: alphaBlack3 / 400 / primary300 divider
    padding: "12px var(--queue-cell-padx, 28px)",
    fontSize: fonts.size.m,
    lineHeight: "20px",
    letterSpacing: 0,
  },

  tr: {
    borderBottom: tableDivider,
    transition: "background-color 0.15s ease",
  },

  td: {
    padding: "10px var(--queue-cell-padx, 28px)",
    fontSize: fonts.size.m,
    color: colors.neutral900,
    verticalAlign: "middle",
    fontWeight: 400,
    whiteSpace: "nowrap" as const,
  },

  // Serial number cell — no horizontal padding so the "#" hugs the row edge.
  serialCell: {
    padding: "10px 0",
    fontSize: fonts.size.m,
    color: colors.neutral900,
    verticalAlign: "middle",
    fontWeight: 400,
  },

  // Name cell — left padding 0 to tighten the gap to the # column; overflow
  // hidden so long names truncate at the column cap.
  nameCell: {
    padding: "10px 4px 10px 0",
    verticalAlign: "middle",
    overflow: "hidden",
  },

  nameInner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap" as const,
    minWidth: 0,
  },

  namePrimary: {
    fontSize: fonts.size.m,
    fontWeight: 400,
    color: colors.neutral900,
    lineHeight: "1.3",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    minWidth: 0,
  },
};
