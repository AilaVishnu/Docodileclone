import { CSSProperties } from "react";
import { colors, radii, fonts, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1050,
  },

  overlay: {
    position: "absolute",
    top: "50%",
    left: "calc(100% + 12px)",
    transform: "translateY(-50%)",
    zIndex: 1100,
  },

  container: {
    backgroundColor: colors.neutral100,
    width: "280px",
    padding: "16px",
    borderRadius: "20px",
    boxShadow: "2px 2px 16px 0px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  sectionLabel: {
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    fontWeight: 500,
    marginBottom: "6px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "4px",
  },

  cell: {
    padding: "8px 0",
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "6px",
    fontSize: fonts.size.s,
    color: colors.neutral700,
    border: `1px solid ${colors.neutral200}`,
    backgroundColor: "transparent",
    userSelect: "none",
  },

  selectedCell: {
    backgroundColor: colors.active.shade600,
    color: colors.neutral100,
    borderColor: colors.active.shade600,
  },

  header: {
    textAlign: "center",
  },

  title: {
    margin: 0,
    fontSize: fonts.size.m,
    fontWeight: 600,
    color: colors.neutral900,
  },

  selectors: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  column: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    alignItems: "center",
  },

  unitHeader: {
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    fontWeight: 500,
  },

  scrollBox: {
    height: "120px",
    overflowY: "auto",
    width: "50px",
    border: `1px solid ${colors.neutral200}`,
    borderRadius: "8px",
    padding: "4px",
    msOverflowStyle: "none", // IE and Edge
    scrollbarWidth: "none", // Firefox
  },

  // Hide scrollbar but keep scrollable
  hideScrollbar: {},

  item: {
    padding: "8px",
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "6px",
    fontSize: fonts.size.s,
    color: colors.neutral700,
  },

  selectedItem: {
    backgroundColor: colors.active.shade600,
    color: colors.neutral100,
  },

  separator: {
    fontSize: fonts.size.l,
    fontWeight: 600,
    paddingTop: "20px",
  },

  amPmToggle: {
    display: "flex",
    gap: "4px",
    marginTop: "4px",
  },

  toggleBtn: {
    flex: 1,
    padding: "8px",
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "6px",
    fontSize: fonts.size.s,
    color: colors.neutral700,
    border: "none",
    backgroundColor: "transparent",
  },

  activeToggleBtn: {
    backgroundColor: colors.active.shade600,
    color: colors.neutral100,
  },

  doneButton: {
    backgroundColor: colors.neutral900,
    color: colors.neutral100,
    border: "none",
    borderRadius: "999px",
    padding: "10px",
    fontSize: fonts.size.m,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    marginTop: "4px",
  },
};
