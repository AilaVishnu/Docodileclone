import { CSSProperties } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  // A pane surface — the form (left) and the tabs+house (right) are now two
  // distinct white cards on the page, separated by the workspace gap.
  pane: {
    backgroundColor: colors.primary200,
    borderRadius: radii.l,
    padding: spacing.xl,
    boxSizing: "border-box",
    // Drop the form so its top aligns with the right pane's house panel — the
    // right column's tabs sit above its panel, so offset by the tab-bar height
    // (12+12 vertical padding = spacing.xl, plus the size-m line-height).
    marginTop: `calc(${spacing.xl} + ${fonts.lineHeight.m})`,
  },

  page: {
    width: "100%",
    // Fill the viewport exactly and DON'T scroll — the workspace below flexes
    // to fit, absorbing height changes in its top/bottom padding.
    height: "100%",
    overflow: "hidden",
    // Fixed padding (no viewport scaling, per the app-wide no-scaling rule).
    padding: "24px",
    backgroundColor: colors.primary100,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "safe center",
    boxSizing: "border-box",
  },

  title: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h4,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
    marginBottom: spacing.s,
  },

  workspaceContainer: {
    width: "100%",
    maxWidth: "1220px",
    transition: "max-width 0.3s ease",
    display: "flex",
    flexDirection: "column",
    // Fill the vertical space between the title and footer so the workspace
    // can flex to the viewport height (no page scroll).
    flex: 1,
    minHeight: 0,
  },

  // Wrapper for the right column: the department tabs sit on top, attached to
  // the house panel below (the active tab shares the panel's fill).
  rightContainer: {
    display: "flex",
    flexDirection: "column",
  },
  // The panel the tabs attach to — top-left corner squared so the (leftmost)
  // active tab connects into it, like the existing clinic-tab system.
  housePanel: {
    backgroundColor: colors.primary200,
    borderRadius: `0 ${radii.l}px ${radii.l}px ${radii.l}px`,
    padding: `${spacing["7xl"]} ${spacing.xl}`,
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: spacing.m,
  },

  footer: {
    marginTop: spacing.l,
    display: "flex",
    gap: spacing["2xl"],
    justifyContent: "center",
    flexShrink: 0,
  },

  houseContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    position: "relative" as const,
  },

  roofImage: {
    width: "100%",
    height: "auto",
    display: "block",
    transform: "translateY(2px)", // Push the roof down slightly
    position: "relative" as const,
    zIndex: 2,
  },

  houseBody: {
    backgroundColor: colors.primary400,
    width: "100%",
    // top stays tight (roof sits flush just above). L/R/B bumped for breathing.
    padding: `${spacing.xs} ${spacing.xl} ${spacing.xl} ${spacing.xl}`,
    boxSizing: "border-box" as const,
    display: "flex",
    flexDirection: "column" as const,
    marginTop: -2,
    position: "relative" as const,
    zIndex: 1,
  },

  staffList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 105px)",
    gap: "10px 16px",
    width: "100%",
    justifyContent: "start",
  },

  staffCardWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    width: 105,
    // Window-to-name gap. Previously bumped from 2 → 8, felt slightly loose.
    // 4 (spacing.2xs) is tighter, keeps label visually tethered to the
    // window while the name/role stack stays readable.
    gap: spacing["2xs"],
  },

  staffCard: {
    width: 80,
    height: 68,
    borderRadius: "40px 40px 0 0",
    overflow: "hidden",
    cursor: "pointer",
    flexShrink: 0,
    backgroundColor: "transparent",
  },

  staffName: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
    color: colors.neutral900,
    textAlign: "left" as const,
    width: "100%",
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  },

  staffRole: {
    fontFamily: fonts.family.primary,
    // Was caption (10) — too small and created a big gap between name & role
    // in the hierarchy. xs (12) matches name size; hierarchy held by weight
    // (name medium, role regular) and colour (blindBlack vs neutral700).
    fontSize: fonts.size.xs,
    color: colors.neutral700,
    textAlign: "left" as const,
    width: "100%",
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  },

  addStaffCard: {
    width: 80,
    height: 68,
    borderRadius: "40px 40px 0 0",
    border: `2px dashed rgba(255,255,255,0.5)`,
    backgroundColor: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    color: "rgba(255,255,255,0.7)",
    boxSizing: "border-box" as const,
  },

  bushRight: {
    position: "absolute" as const,
    bottom: -5,
    right: -20,
    width: 60,
    height: 50,
    zIndex: 3,
    transform: "scaleX(-1)",
  },
};
