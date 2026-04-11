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
    fontSize: "24px",
    fontWeight: 600,
    color: colors.blindBlack,
    margin: 0,
  },

  tableContainer: {
    backgroundColor: colors.active.shade50,
    borderRadius: "0 0 24px 24px",
    padding: "24px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.03)",
    overflow: "visible",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },

  th: {
    padding: "16px 12px",
    borderBottom: `1px solid ${colors.neutral200}`,
    color: colors.neutral700,
    fontWeight: 500,
    fontSize: "14px",
  },

  tr: {
    borderBottom: `1px solid ${colors.neutral100}`,
  },

  td: {
    padding: "16px 12px",
    fontSize: "15px",
    color: colors.blindBlack,
    verticalAlign: "middle",
  },

  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
  },

  time: {
    fontWeight: 600,
    color: colors.active.shade400,
  },

  walkinBadge: {
    fontSize: "10px",
    padding: "2px 6px",
    borderRadius: "4px",
    backgroundColor: colors.secondary100,
    color: colors.primary400,
    marginLeft: "8px",
    fontWeight: 700,
    textTransform: "uppercase",
  },

  payStatus: {
    fontWeight: 500,
  },

  actionButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    color: colors.neutral500,
  },
  actionMenu: {
    position: "absolute" as const,
    left: 0,
    top: "100%",
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

export const getStatusStyle = (status: string): CSSProperties => {
  switch (status?.toUpperCase()) {
    case "WAITING":
      return { backgroundColor: "#FFF4E5", color: "#B76E00" };
    case "IN_PROGRESS":
      return { backgroundColor: "#E6F6FF", color: "#0070B7" };
    case "COMPLETED":
      return { backgroundColor: "#E6FFF1", color: "#008A45" };
    case "NO_SHOW":
      return { backgroundColor: "#F5F5F5", color: "#666666" };
    case "CANCELLED":
      return { backgroundColor: "#FFE6E6", color: "#B70000" };
    default:
      return { backgroundColor: "#F5F5F5", color: "#666666" };
  }
};

export const getPayStyle = (status: string): CSSProperties => {
  switch (status?.toUpperCase()) {
    case "PAID":
      return { color: "#008A45" };
    case "DUE":
      return { color: "#B70000" };
    case "NO PAY":
      return { color: "#666666" };
    default:
      return { color: "#666666" };
  }
};
