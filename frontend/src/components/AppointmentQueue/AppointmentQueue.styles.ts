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
    fontSize: "24px",
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
    borderCollapse: "collapse",
    textAlign: "left",
  },

  th: {
    padding: "12px 12px",
    borderBottom: `1px solid ${colors.primary300}`,
    color: colors.neutral900,
    fontWeight: 500,
    fontSize: "13px",
    letterSpacing: "0.01em",
  },

  tr: {
    borderBottom: `1px solid ${colors.primary300}`,
    transition: "background-color 0.15s ease",
  },

  td: {
    padding: "14px 12px",
    fontSize: "14px",
    color: colors.blindBlack,
    verticalAlign: "middle",
    fontWeight: 400,
    whiteSpace: "nowrap" as const,
  },

  // Serial number cell
  serialCell: {
    padding: "14px 12px",
    fontSize: "14px",
    color: colors.neutral500,
    verticalAlign: "middle",
    fontWeight: 500,
  },

  // Name cell with gender/age sub-detail
  nameCell: {
    padding: "14px 12px",
    verticalAlign: "middle",
  },

  nameInner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap" as const,
  },

  namePrimary: {
    fontSize: "14px",
    fontWeight: 600,
    color: colors.blindBlack,
    lineHeight: "1.3",
    whiteSpace: "nowrap" as const,
  },

  nameMeta: {
    fontSize: "12px",
    color: colors.neutral500,
    fontWeight: 400,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },

  nameMetaDot: {
    color: colors.neutral300,
    fontSize: "12px",
  },

  // Status badge - filled pill
  statusBadge: {
    padding: "5px 14px",
    borderRadius: "999px",
    fontSize: "12px",
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
    fontSize: "14px",
    fontWeight: 600,
  },

  // Type badge (star icon + text) — Figma: Inter 12/16 regular, 4px gap, neutral900
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "4px",
    width: "70px",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 400,
    color: colors.neutral900,
  },

  // Time
  time: {
    fontWeight: 600,
    fontSize: "14px",
    color: colors.neutral800,
  },

  walkinBadge: {
    fontSize: "10px",
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
    backgroundColor: "#fff",
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
    color: colors.blindBlack,
    transition: "background-color 0.15s",
  },
};

// ── Status badge colours ────────────────────────────────────────────────────
export const getStatusStyle = (status: string): CSSProperties => {
  switch (status?.toUpperCase()) {
    case "WAITING":
      // Figma: amber/yellow filled pill
      return { backgroundColor: "#FFDB43", color: "#7A5800" };
    case "IN_PROGRESS":
      return { backgroundColor: "#DBEAFE", color: "#1D4ED8" };
    case "COMPLETED":
      return { backgroundColor: "#DCFCE7", color: "#166534" };
    case "NO_SHOW":
      return { backgroundColor: "#F3F4F6", color: "#6B7280" };
    case "CANCELLED":
      return { backgroundColor: "#FFE4E6", color: "#9F1239" };
    default:
      return { backgroundColor: "#F3F4F6", color: "#6B7280" };
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
    case "PAID":    return { color: "#16A34A" };  // green
    case "DUE":     return { color: "#D97706" };  // amber – matches ⚠ warning
    case "NO PAY":  return { color: "#9CA3AF" };  // muted
    default:        return { color: "#9CA3AF" };
  }
};
