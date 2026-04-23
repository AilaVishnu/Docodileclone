import { CSSProperties } from "react";
import { colors, fonts } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    fontWeight: 400,
    lineHeight: "34px",
    color: colors.neutral900,
    margin: 0,
    fontStyle: "normal",
  },

  tableContainer: {
    backgroundColor: colors.primary100,
    borderRadius: "0 24px 24px 24px",
    padding: "24px",
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
    padding: "12px 28px",
    borderBottom: `1px solid ${colors.primary300}`,
    color: colors.alphaBlack3,
    fontWeight: 400,
    fontSize: fonts.size.s,
    lineHeight: "20px",
    letterSpacing: 0,
  },

  tr: {
    borderBottom: `1px solid ${colors.primary300}`,
    transition: "background-color 0.15s ease",
  },

  td: {
    padding: "14px 28px",
    fontSize: fonts.size.s,
    color: colors.neutral900,
    verticalAlign: "middle",
    fontWeight: 400,
    whiteSpace: "nowrap" as const,
  },

  // Serial number cell
  serialCell: {
    padding: "14px 8px",
    fontSize: fonts.size.s,
    color: colors.neutral900,
    verticalAlign: "middle",
    fontWeight: 400,
  },

  // Name cell with gender/age sub-detail
  nameCell: {
    padding: "14px 8px",
    verticalAlign: "middle",
  },

  nameInner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap" as const,
  },

  namePrimary: {
    fontSize: fonts.size.s,
    fontWeight: 400,
    color: colors.neutral900,
    lineHeight: "1.3",
    whiteSpace: "nowrap" as const,
  },

  nameMeta: {
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    fontWeight: 400,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },

  nameMetaDot: {
    color: colors.neutral300,
    fontSize: fonts.size.xs,
  },

  // Status badge - filled pill
  statusBadge: {
    padding: "5px 14px",
    borderRadius: "999px",
    fontSize: fonts.size.xs,
    fontWeight: 600,
    display: "inline-block",
    letterSpacing: "0.01em",
  },

  // Pay status cell (icon + text inline)
  payCell: {
    padding: "14px 12px",
    verticalAlign: "middle",
  },

  payInner: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: fonts.size.s,
    fontWeight: 600,
  },

  // Type badge (star icon + text) — Figma: Inter 12/16 regular, 4px gap, neutral900
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    fontSize: fonts.size.s,
    lineHeight: "16px",
    fontWeight: 400,
    color: colors.neutral900,
  },

  // Time
  time: {
    fontWeight: 400,
    fontSize: fonts.size.s,
    color: colors.neutral800,
  },

  walkinBadge: {
    fontSize: fonts.size.caption,
    padding: "2px 6px",
    borderRadius: "4px",
    backgroundColor: colors.secondary100,
    color: colors.primary400,
    marginLeft: "8px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
  },

  payStatus: {
    fontWeight: 500,
  },

  actionButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px 8px",
    color: colors.neutral400,
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.15s ease",
  },

  actionMenu: {
    position: "absolute" as const,
    left: "100%",
    top: 0,
    backgroundColor: colors.neutral100,
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    zIndex: 100,
    minWidth: "200px",
    padding: "8px",
    border: `1px solid ${colors.neutral200}`,
  },

  actionMenuItem: {
    padding: "12px 16px",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: fonts.size.m,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    transition: "background-color 0.15s",
  },
};

// ── Status badge colours ────────────────────────────────────────────────────
// Figma design system has no blue/rose/slate — mapping to nearest theme tokens
// to keep one brand palette. Mirrors StatusBadge.tsx STATUS_CONFIG.
export const getStatusStyle = (status: string): CSSProperties => {
  switch (status?.toUpperCase()) {
    case "WAITING":
      return { backgroundColor: colors.yellow100, color: colors.neutral900 };
    case "IN_PROGRESS":
      // no blue in design system — use primary (warm) like BOOKED in StatusBadge
      return { backgroundColor: colors.primary200, color: colors.neutral900 };
    case "COMPLETED":
      return { backgroundColor: colors.green100, color: colors.secondary800 };
    case "NO_SHOW":
      return { backgroundColor: colors.neutral150, color: colors.neutral600 };
    case "CANCELLED":
      return { backgroundColor: colors.redAlpha10, color: colors.red200 };
    default:
      return { backgroundColor: colors.neutral150, color: colors.neutral600 };
  }
};

// ── Status display label (title-cased) ─────────────────────────────────────
export const getStatusLabel = (status: string): string => {
  switch (status?.toUpperCase()) {
    case "WAITING":      return "Waiting";
    case "IN_PROGRESS":  return "In Progress";
    case "COMPLETED":    return "Completed";
    case "NO_SHOW":      return "No Show";
    case "CANCELLED":    return "Cancelled";
    default:             return status;
  }
};

// ── Pay status colours ──────────────────────────────────────────────────────
export const getPayStyle = (status: string): CSSProperties => {
  switch (status?.toUpperCase()) {
    case "PAID":    return { color: colors.green200 };   // brand green
    case "DUE":     return { color: colors.primary700 }; // warm warning — no amber in system
    case "NO PAY":  return { color: colors.neutral400 };
    default:        return { color: colors.neutral400 };
  }
};
