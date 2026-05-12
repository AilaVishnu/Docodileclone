import { CSSProperties } from "react";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    width: "100%",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: spacing.m,
    marginTop: spacing.m,
  },

  title: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },

  subtitle: {
    fontSize: fonts.size.s,
    color: colors.alphaBlack3,
    marginTop: spacing["2xs"],
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
  },

  searchWrapper: {
    flex: 1,
    maxWidth: "360px",
    display: "flex",
    alignItems: "center",
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.full,
    padding: `${spacing.xs} ${spacing.m}`,
    gap: spacing.xs,
  },

  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: fonts.size.s,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
  },

  tableContainer: {
    backgroundColor: colors.primary100,
    borderRadius: "24px",
    padding: "24px",
    overflow: "visible",
  },

  table: {
    width: "100%",
    maxWidth: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    tableLayout: "fixed",
  },

  th: {
    padding: "12px 28px",
    borderBottom: `1px solid ${colors.primary300}`,
    color: colors.alphaBlack3,
    fontWeight: 400,
    fontSize: fonts.size.s,
    lineHeight: "20px",
    letterSpacing: 0,
    whiteSpace: "nowrap",
  },

  thRight: {
    textAlign: "right",
  },

  tr: {
    borderBottom: `1px solid ${colors.primary300}`,
  },

  td: {
    padding: "14px 28px",
    fontSize: fonts.size.s,
    color: colors.neutral900,
    verticalAlign: "middle",
    fontWeight: 400,
    whiteSpace: "nowrap",
    borderBottom: `1px solid ${colors.primary300}`,
  },

  tdName: {
    fontWeight: fonts.weight.medium,
  },

  tdMuted: {
    color: colors.alphaBlack3,
  },

  tdRight: {
    textAlign: "right",
  },

  codeBadge: {
    display: "inline-block",
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral700,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.s,
    padding: `2px ${spacing.xs}`,
    letterSpacing: "0.04em",
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },

  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    border: "none",
    backgroundColor: "transparent",
    borderRadius: radii.full,
    cursor: "pointer",
    color: colors.neutral700,
  },

  iconBtnDanger: {
    color: colors.red200,
  },

  empty: {
    padding: "48px",
    textAlign: "center",
    color: colors.neutral500,
    fontSize: fonts.size.s,
  },

  emptyTitle: {
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
    marginBottom: spacing["2xs"],
  },
};
