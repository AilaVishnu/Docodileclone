import { CSSProperties } from "react";
import { colors, fonts, fluidSpacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  // Acts as its OWN scroll container (mirroring BookAppointment.overlay) so the
  // sticky <PageHeader/> below can hug the very top of main. If we let main be
  // the scroll container, its 40px paddingTop pushes any sticky child down by
  // 40px — sticky positions against the scroll container's content box, not
  // its padding edge. By absolute-filling main with paddingTop: 0 here, the
  // header sits flush against the TopNav.
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    // No flex `gap` here: it would also space the doctor tab away from the
    // table below it (the tab is a "folder tab" that visually connects to the
    // table). The header's own `marginBottom` provides the only intended gap —
    // between the sticky bar and the Tabs.
    padding: `0 ${fluidSpacing.outerX} ${fluidSpacing.outerY}`,
    overflowY: "auto",
    overflowX: "hidden",
  },

  // (Old inline header style — kept for any stragglers but no longer rendered;
  // safe to remove once nothing references it.)
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
  },

  title: {
    margin: 0,
    textAlign: "center" as const,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },

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
    padding: "12px var(--queue-cell-padx, 28px)",
    borderBottom: `1px solid ${colors.primary300}`,
    color: colors.alphaBlack3,
    fontWeight: 400,
    fontSize: fonts.size.m,
    lineHeight: "20px",
    letterSpacing: 0,
  },

  tr: {
    borderBottom: `1px solid ${colors.primary300}`,
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

  // Name cell with gender/age sub-detail
  nameCell: {
    // left 0 to tighten the gap to the # column; overflow hidden so long
    // names truncate at the 256px column cap (set in QueueTable colgroup).
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
    padding: "10px 12px",
    verticalAlign: "middle",
  },

  payInner: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: fonts.size.m,
    fontWeight: 600,
  },

  // Type badge (star icon + text) — Figma: Inter 12/16 regular, 4px gap, neutral900
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    fontSize: fonts.size.m,
    lineHeight: "16px",
    fontWeight: 400,
    color: colors.neutral900,
  },

  // Time
  time: {
    fontWeight: 400,
    fontSize: fonts.size.m,
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
    padding: "6px 0",
    color: "#000",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.15s ease",
  },

  // Unified menu spec — see also TopNav.dropdown and StatusDropdown (inline).
  // No border, radii.m (8) corners, soft shadow, padding spacing.xs (8).
  actionMenu: {
    position: "absolute" as const,
    left: "100%",
    top: 0,
    backgroundColor: colors.neutral100,
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    zIndex: 100,
    minWidth: "200px",
    padding: "12px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  actionMenuItem: {
    padding: "10px 16px",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: fonts.size.s,
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
    case "IN_PROGRESS":  return "At Doc";
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
