import { CSSProperties } from "react";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";

export const styles: Record<string, CSSProperties> = {
  card: {
    // Figma: card fill is Secondary/50 (#F1F6E7). Was primary100.
    backgroundColor: colors.secondary50,
    borderRadius: radii.primary,
    padding: spacing["2xl"],
    display: "flex",
    flexDirection: "column",
    // gap handles inter-field spacing so individual rows don't need marginTop
    gap: spacing.s,
    width: 384, // was 320 — +20% for more comfortable field widths
    boxSizing: "border-box",
  },

  clinicName: {
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    fontWeight: fonts.weight.regular,
    // Figma: Neutral/900 (#202020). Was blindBlack.
    color: colors.neutral900,
    margin: 0,
    // slightly more room below the name than the field-to-field gap
    marginBottom: spacing["2xs"],
  },

  domainBox: {
    display: "flex",
    alignItems: "center",
    // Figma: Neutral/500 stroke, transparent fill. Was neutral200 + alphaBlack.
    border: `${strokes.xs} solid ${colors.neutral500}`,
    borderRadius: radii.m,
    overflow: "hidden",
    height: 42,
    backgroundColor: "transparent",
  },

  domainValue: {
    flex: 1,
    minWidth: 0, // allow shrink below content-width so long names don't push suffix out
    padding: `0 ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  domainSuffix: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0, // guarantee the suffix keeps its full width
    padding: `0 ${spacing.m}`,
    // All strokes on this card = neutral500, per Figma.
    borderLeft: `${strokes.xs} solid ${colors.neutral500}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    height: "100%",
    whiteSpace: "nowrap",
  },

  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    // Figma: field fill = alpha-black-0 (rgba(0,0,0,0.04)).
    backgroundColor: colors.alphaBlack0,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
    minHeight: 36,
  },

  fieldRowMultiline: {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.alphaBlack0,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
    minHeight: 36,
  },

  fieldIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 24,
    height: 24,
    // Figma: icons are the SAME neutral500 as field text. No dimming.
    color: colors.neutral500,
  },

  fieldText: {
    flex: 1,
    minWidth: 0, // allow the text to shrink inside flex rows
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    lineHeight: "24px",
    overflowWrap: "anywhere", // break long unbroken strings (e.g. addresses without spaces)
    wordBreak: "break-word",
  },

  specialtyRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.alphaBlack0,
    borderRadius: radii.m,
    padding: `${spacing.xs} ${spacing.s}`,
    minHeight: 36,
  },

  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },

  // Filled specialty pill — Figma 2392:5347. Dark sage secondary/700 bg
  // with white text so the chip pops against the cream card.
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["2xs"],
    backgroundColor: colors.secondary700,
    color: colors.neutral100,
    borderRadius: radii.full,
    padding: `${spacing["3xs"]} ${spacing["2xs"]} ${spacing["3xs"]} ${spacing.xs}`,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    fontFamily: fonts.family.primary,
    fontWeight: fonts.weight.regular,
  },

  tagX: {
    fontSize: fonts.size.caption,
    color: colors.neutral100,
    opacity: 0.8,
  },

  buttonWrapper: {
    // marginTop: auto pushes the footer to the bottom of the card, so across
    // a row of cards with varying content heights, all footers align.
    marginTop: "auto",
    paddingTop: spacing.s, // minimum visual breathing room above footer
    display: "flex",
    gap: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
};
