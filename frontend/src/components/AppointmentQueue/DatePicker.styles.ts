import { CSSProperties } from "react";
import { colors, radii, fonts, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    marginTop: "8px",
  },

  container: {
    backgroundColor: "white",
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
    fontSize: "16px",
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
    fontSize: "12px",
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
    fontSize: "12px",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "background-color 0.2s",
  },

  emptyCell: {
    width: "32px",
    height: "32px",
  },

  selectedDay: {
    backgroundColor: colors.primary600,
    color: "white",
    borderRadius: "999px",
  },

  today: {
    border: `1px solid ${colors.primary600}`,
  },

  doneButton: {
    backgroundColor: colors.neutral900,
    color: "white",
    border: "none",
    borderRadius: "999px",
    padding: "8px 24px",
    fontSize: "16px",
    cursor: "pointer",
    width: "100%",
    marginTop: "8px",
  }
};
