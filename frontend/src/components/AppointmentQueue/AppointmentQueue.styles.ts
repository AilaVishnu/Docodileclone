import { CSSProperties } from "react";
import { colors, fonts, rem } from "../../styles/theme";

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
    marginTop: rem(16),
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    fontWeight: 400,
    lineHeight: rem(34),
    color: colors.neutral900,
    margin: 0,
    fontStyle: "normal",
  },

  tableContainer: {
    backgroundColor: colors.primary100,
    borderRadius: `0 ${rem(24)} ${rem(24)} ${rem(24)}`,
    padding: rem(24),
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
    padding: `${rem(12)} ${rem(28)}`,
    borderBottom: `1px solid ${colors.primary300}`,
    color: colors.alphaBlack3,
    fontWeight: 400,
    fontSize: fonts.size.s,
    lineHeight: rem(20),
    letterSpacing: 0,
  },

  tr: {
    borderBottom: `1px solid ${colors.primary300}`,
    transition: "background-color 0.15s ease",
  },

  td: {
    padding: `${rem(14)} ${rem(28)}`,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    verticalAlign: "middle",
    fontWeight: 400,
    whiteSpace: "nowrap" as const,
  },

  // Serial number cell
  serialCell: {
    padding: `${rem(14)} ${rem(8)}`,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    verticalAlign: "middle",
    fontWeight: 400,
  },

  // Name cell with gender/age sub-detail
  nameCell: {
    padding: `${rem(14)} ${rem(8)}`,
    verticalAlign: "middle",
  },

  nameInner: {
    display: "flex",
    alignItems: "center",
    gap: rem(8),
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
    gap: rem(4),
  },

  nameMetaDot: {
    color: colors.neutral300,
    fontSize: fonts.size.xs,
  },

  // Status badge - filled pill
  statusBadge: {
    padding: `${rem(5)} ${rem(14)}`,
    borderRadius: "999px",
    fontSize: fonts.size.xs,
    fontWeight: 600,
    display: "inline-block",
    letterSpacing: "0.01em",
  },

  // Pay status cell (icon + text inline)
  payCell: {
    padding: `${rem(14)} ${rem(12)}`,
    verticalAlign: "middle",
  },

  payInner: {
    display: "inline-flex",
    alignItems: "center",
    gap: rem(5),
    fontSize: fonts.size.s,
    fontWeight: 600,
  },

  // Type badge (star icon + text) — Figma: Inter 12/16 regular, 4px gap, neutral900
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: rem(4),
    fontSize: fonts.size.s,
    lineHeight: rem(16),
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
    padding: `${rem(2)} ${rem(6)}`,
    borderRadius: rem(4),
    backgroundColor: colors.secondary100,
    color: colors.primary400,
    marginLeft: rem(8),
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
    padding: `${rem(6)} ${rem(8)}`,
    color: colors.neutral400,
    borderRadius: rem(6),
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
    borderRadius: rem(12),
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    zIndex: 100,
    minWidth: rem(200),
    padding: rem(8),
    border: `1px solid ${colors.neutral200}`,
  },

  actionMenuItem: {
    padding: `${rem(12)} ${rem(16)}`,
    cursor: "pointer",
    borderRadius: rem(8),
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
