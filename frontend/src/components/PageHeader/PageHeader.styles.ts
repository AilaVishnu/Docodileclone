import { CSSProperties } from "react";
import { colors, fonts, radii, spacing, strokes, fluidSpacing, layout } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// PAGE HEADER — shared sticky app-bar
//
// A reusable header bar for full-page views that live inside the scrolling
// `overlay` shell (position: absolute + overflowY: auto). It:
//   • sticks to the top of the scroll container as content scrolls under it
//   • paints a full-bleed white rectangle edge-to-edge of the overlay
//   • lays out three zones — back (left) | title (center) | actions (right)
//
// FULL-BLEED TRICK: the page overlay has top padding (var(--page-pad-top)) and
// horizontal padding (fluidSpacing.outerX). To span the whole width AND hug the
// very top, the bar cancels those paddings with negative margins, then re-adds
// the horizontal padding internally so its content lines up with the page grid.
// Pages whose shell uses different padding can override `bar` via the `style`
// prop on <PageHeader/>.
// ─────────────────────────────────────────────────────────────────────────────

export const styles: Record<string, CSSProperties> = {
  bar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    // Shared header chrome — white, no hairline (see globals.css --header-*).
    backgroundColor: "var(--header-bg)",
    borderBottom: "1px solid var(--header-border)",
    // Full-bleed horizontally: cancel the scroll container's side padding, then
    // re-add it on `inner` so the back arrow can sit at the bar's true left edge.
    //
    // IMPORTANT (vertical): this bar must be the FIRST child of the page's
    // scroll container, and that container must have NO top padding. A sticky
    // element is clamped to its containing block, so a negative top margin can't
    // "escape" the container's top padding — the bar would get re-clamped below
    // it, leaving a gap. Hosts move their top spacing onto the content below the
    // header instead. See BookAppointment overlay (paddingTop: 0).
    marginLeft: `calc(-1 * ${fluidSpacing.outerX})`,
    marginRight: `calc(-1 * ${fluidSpacing.outerX})`,
    // Preserve the overlay's top-left curve where content meets the sidebar.
    borderRadius: `${radii["2xl"]}px 0 0 0`,
    boxSizing: "border-box",
  },

  // Inner row: capped at content width and centered, with the page's horizontal
  // padding re-added here so the centered title / right actions align with the
  // page grid below. The back arrow is positioned outside this row, at the bar
  // edge.
  inner: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: spacing.m,
    width: "100%",
    maxWidth: layout.contentMaxWidth,
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: fluidSpacing.outerX,
    paddingRight: fluidSpacing.outerX,
    minHeight: "var(--header-h)",
    paddingTop: "var(--header-pad-y)",
    paddingBottom: "var(--header-pad-y)",
    boxSizing: "border-box",
  },

  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0, // let long titles ellipsis/shrink instead of pushing the cells
  },

  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },

  // Bare arrow pinned to the bar's far-left edge, vertically centered. No circle
  // / border — just the icon.
  backButton: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: "var(--header-back-inset)",
    top: 0,
    bottom: 0,
    width: "32px",
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral900,
    padding: 0,
  },

  title: {
    margin: 0,
    // Match the New Prescription CTA: sans (Inter) at the button font size.
    fontSize: "var(--btn-fs)",
    fontWeight: fonts.weight.semibold,
    fontFamily: fonts.family.primary,
    color: colors.neutral900,
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    whiteSpace: "nowrap",
  },
};
