import { CSSProperties } from "react";
import { colors, fonts, radii, spacing, fluidSpacing } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// PatientRecordHeader — the compact sticky record header (back · name · section
// nav · actions). Extracted from the prescription page so any patient-record
// style screen can reuse the same single-row chrome.
//
// Full-bleed: the bar cancels the page's horizontal gutter (fluidSpacing.outerX)
// so it paints edge-to-edge, while the inner re-centers content at `contentMax`
// — keeping the title edge-aligned to the body below at every width.
// ─────────────────────────────────────────────────────────────────────────────

export const styles: Record<string, CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    // Shared header chrome — see globals.css --header-* (matches PageHeader).
    backgroundColor: "var(--header-bg)",
    borderBottom: "1px solid var(--header-border)",
    // Full-bleed: cancel the page's horizontal padding so the bar paints
    // edge-to-edge; the inner re-centers content at the content width.
    marginLeft: `calc(-1 * ${fluidSpacing.outerX})`,
    marginRight: `calc(-1 * ${fluidSpacing.outerX})`,
    borderRadius: `${radii["2xl"]}px 0 0 0`,
    boxSizing: "border-box",
  },
  // Horizontal-padding wrapper — recreates the page's outer gutter so the inner
  // (capped at the content width) centers within the SAME box as the body
  // below, keeping the title edge-aligned to the content at every width.
  pad: {
    width: "100%",
    paddingLeft: fluidSpacing.outerX,
    paddingRight: fluidSpacing.outerX,
    boxSizing: "border-box",
  },
  inner: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
    width: "100%",
    maxWidth: "var(--rx-content-max)",
    marginLeft: "auto",
    marginRight: "auto",
    minHeight: "var(--header-h)",
    paddingTop: "var(--header-pad-y)",
    paddingBottom: "var(--header-pad-y)",
    boxSizing: "border-box",
  },
  // Back arrow pinned in the left gutter (absolute → outside the inner flow),
  // so the title is the first inner element and aligns to the content edge.
  backBtn: {
    position: "absolute",
    left: "var(--header-back-inset)",
    top: 0,
    bottom: 0,
    width: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral900,
    cursor: "pointer",
    padding: 0,
  },
  spacer: {
    flex: 1,
    minWidth: spacing.s,
  },
  title: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    flexShrink: 0,
  },
  // Title text — sans (Inter) at the CTA font size, like the other header
  // titles. LEFT-aligned (the prescription-file exception).
  titleText: {
    fontSize: "var(--btn-fs)",
    fontFamily: fonts.family.primary,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
    whiteSpace: "nowrap" as const,
  },

  // Section nav — full-height underline tabs. Stretched to the bar's full
  // height (cancelling the inner's vertical padding) so the active underline
  // lands flush on the header's bottom edge.
  nav: {
    display: "flex",
    alignItems: "stretch",
    alignSelf: "stretch",
    gap: spacing.m,
    flexWrap: "nowrap",
    marginTop: "calc(-1 * var(--header-pad-y))",
    marginBottom: "calc(-1 * var(--header-pad-y))",
  },
  // Underline tabs: every section shows icon + label; the active tab carries a
  // peach underline flush with the header's bottom edge (full-height tab).
  tab: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: "100%",
    padding: `0 ${spacing["2xs"]}`,
    border: "none",
    // Underline via inset boxShadow (sits at the very bottom of the full-height
    // tab) — avoids the border shorthand/longhand mix warning.
    boxShadow: "inset 0 -2px 0 transparent",
    backgroundColor: "transparent",
    color: colors.neutral600,
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  },
  // Active = peach underline + peach label, slightly bolder.
  tabActive: {
    color: colors.primary700,
    fontWeight: fonts.weight.medium,
    boxShadow: `inset 0 -2px 0 ${colors.active.shade600}`,
  },
  tabIcon: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Count badge — light tint with dark-peach text (sits beside the label).
  badge: {
    minWidth: 18,
    height: 18,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: radii.full,
    backgroundColor: colors.primary200,
    color: colors.primary700,
    fontSize: 11,
    lineHeight: "18px",
    textAlign: "center",
    boxSizing: "border-box",
  },
};
