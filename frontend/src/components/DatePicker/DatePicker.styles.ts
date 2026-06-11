import { CSSProperties } from "react";
import { colors, radii, fonts, spacing, zIndex } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    // Dim the page like the time picker so date selection has the same
    // modal weight + obvious dismiss target.
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    // Above modals (4000/4100) so a date picker opened from inside a modal
    // isn't hidden behind it.
    zIndex: zIndex.popover,
  },

  overlay: {
    // Center on the viewport (was anchored to the parent chip, which could
    // push the popup off-screen on narrower viewports like 1024).
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: zIndex.popover + 1,
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
    fontFamily: fonts.family.primary,
    // Pin the weight so day cells never inherit a bold weight from the host
    // (the sticky-header renders this inside an <h2> at 600). The month title
    // sets its own 600 below.
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
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
    gap: "6px", // +2px breathing room between dates
  },

  dayCell: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: fonts.size.s,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
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
    color: colors.neutral200,
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
