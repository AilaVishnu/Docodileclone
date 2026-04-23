import { CSSProperties } from "react";
import { colors, radii, fonts, spacing, rem } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    marginTop: rem(8),
  },

  container: {
    backgroundColor: colors.neutral100,
    width: rem(240),
    padding: rem(16),
    borderRadius: rem(20),
    boxShadow: "2px 2px 16px 0px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: rem(16),
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
    gap: rem(8),
  },

  column: {
    display: "flex",
    flexDirection: "column",
    gap: rem(4),
    alignItems: "center",
  },

  unitHeader: {
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    fontWeight: 500,
  },

  scrollBox: {
    height: rem(120),
    overflowY: "auto",
    width: rem(50),
    border: `1px solid ${colors.neutral200}`,
    borderRadius: rem(8),
    padding: rem(4),
    msOverflowStyle: "none", // IE and Edge
    scrollbarWidth: "none", // Firefox
  },

  // Hide scrollbar but keep scrollable
  hideScrollbar: {},

  item: {
    padding: rem(8),
    textAlign: "center",
    cursor: "pointer",
    borderRadius: rem(6),
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
    paddingTop: rem(20),
  },

  amPmToggle: {
    display: "flex",
    gap: rem(4),
    marginTop: rem(4),
  },

  toggleBtn: {
    flex: 1,
    padding: rem(8),
    textAlign: "center",
    cursor: "pointer",
    borderRadius: rem(6),
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
    padding: rem(10),
    fontSize: fonts.size.m,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    marginTop: rem(4),
  },
};
