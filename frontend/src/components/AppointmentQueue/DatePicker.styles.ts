import { CSSProperties } from "react";
import { colors, radii, fonts, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },

  overlay: {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    marginTop: "16px",
  },

  container: {
    backgroundColor: colors.neutral100,
    width: "300px",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "2px 2px 12px 0px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  monthTitle: {
    fontWeight: 600,
    fontSize: fonts.size.m,
    color: "black",
    margin: 0,
  },

  navButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },

  weekDays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
    textAlign: "center",
  },

  weekDay: {
    fontSize: fonts.size.xs,
    color: colors.neutral500,
  },

  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
  },

  dayCell: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: fonts.size.xs,
    cursor: "pointer",
    borderRadius: "8px",
    transition: "background-color 0.2s",
  },

  emptyCell: {
    width: "32px",
    height: "32px",
  },

  selectedDay: {
    backgroundColor: colors.active.shade600,
    color: colors.neutral100,
    borderRadius: "999px",
  },

  today: {
    border: `1px solid ${colors.active.shade600}`,
  },

  disabledDay: {
    color: colors.neutral300,
    cursor: "not-allowed",
  },

  doneButton: {
    backgroundColor: colors.neutral900,
    color: colors.neutral100,
    border: "none",
    borderRadius: "999px",
    padding: "8px 24px",
    fontSize: fonts.size.m,
    cursor: "pointer",
    width: "100%",
    marginTop: "8px",
  }
};
