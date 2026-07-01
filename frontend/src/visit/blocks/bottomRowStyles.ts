import type { CSSProperties } from "react";
import { colors, fonts, radii, spacing, strokes, shadows, zIndex } from "../../styles/theme";

// Bottom-row block styles lifted VERBATIM from PrescriptionPage.styles.ts so the
// compact labelled rows (Tests / Refer to / Review) mirror the page 1:1 — a
// fixed-width icon+label on the left, the field/control on the right, and (for
// Tests) the dictate icons + reorder kebab. Mirrors noteCardStyles.ts: the page
// owns the state; these blocks own the markup + styling.

// Row shell: fixed-width label + control, centred.
export const noteRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.m,
};
export const noteLabel: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.xs,
  width: 120,
  flexShrink: 0,
  color: colors.neutral900,
  fontSize: fonts.size.m,
};
export const noteLabelText: CSSProperties = {
  fontFamily: fonts.family.primary,
  fontSize: fonts.size.m,
  lineHeight: fonts.lineHeight.m,
  fontWeight: fonts.weight.regular,
  color: colors.neutral900,
};
// Field wrapper for dictatable rows (Tests / Advice / Complaints / Examination).
// Figma: cream primary100 fill, radii.m, 36 height, inline mic + rewind icons.
export const noteFieldWrap: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  backgroundColor: colors.primary100,
  borderRadius: radii.m,
  padding: `0 ${spacing.xs}`,
  minHeight: 40,
};
export const dictateIcons: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: spacing.xs,
  color: colors.neutral700,
  flexShrink: 0,
};
// Figma node 2071:2962 — Linear/Essentional,UI/Reorder. Drag handle that
// sits to the RIGHT of the dictate field (outside the cream wrapper).
export const reorderHandle: CSSProperties = {
  flexShrink: 0,
  color: colors.neutral900,
  cursor: "grab",
};
// Icon shown left of the row label (24px, neutral900) — same as the page's
// sectionIcon.
export const sectionIcon: CSSProperties = {
  width: 24,
  height: 24,
  color: colors.neutral900,
};

// Tests row — single-line field that grows vertically as chips wrap. Override
// AutocompleteTags' default cream pill: the noteFieldWrap already provides cream.
export const TESTS_TAGBOX_STYLE: CSSProperties = {
  backgroundColor: "transparent",
  borderRadius: 0,
  padding: 0,
  width: "100%",
};

// ── Refer to — custom click-outside dropdown of clinic doctors ──────────────
export const referDropdown: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 40,
  backgroundColor: colors.primary100,
  borderRadius: radii.m,
  overflow: "hidden",
  cursor: "pointer",
};
export const referText: CSSProperties = {
  display: "flex",
  alignItems: "center",
  minWidth: 160,
  padding: `0 ${spacing.s}`,
  fontSize: fonts.control.sm,
  lineHeight: fonts.lineHeight.s,
  fontFamily: fonts.family.primary,
  color: colors.neutral400,
};
export const referChevron: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: `0 ${spacing.s} 0 0`,
  color: colors.neutral700,
};
// Dropdown menu of clinic doctors, opens below the Refer-To pill.
export const referMenu: CSSProperties = {
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  minWidth: 200,
  backgroundColor: colors.neutral100,
  border: `${strokes.xs} solid ${colors.primary300}`,
  borderRadius: radii.m,
  padding: spacing["2xs"],
  display: "flex",
  flexDirection: "column",
  boxShadow: shadows.menu,
  zIndex: zIndex.popover,
  maxHeight: 240,
  overflowY: "auto",
};
export const referMenuEmpty: CSSProperties = {
  padding: `${spacing.xs} ${spacing.s}`,
  fontFamily: fonts.family.primary,
  fontSize: fonts.size.xs,
  lineHeight: fonts.lineHeight.xs,
  color: colors.neutral500,
  fontStyle: "italic",
};
export const referMenuItem: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: spacing["3xs"],
  width: "100%",
  padding: `${spacing.xs} ${spacing.s}`,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontFamily: fonts.family.primary,
  color: colors.neutral900,
  borderRadius: radii.xs,
  textAlign: "left",
};
export const referMenuItemName: CSSProperties = {
  fontSize: fonts.size.s,
  lineHeight: fonts.lineHeight.s,
  color: colors.neutral900,
};
export const referMenuItemMeta: CSSProperties = {
  fontSize: fonts.size.xs,
  lineHeight: fonts.lineHeight.xs,
  color: colors.neutral500,
};

// ── Review — custom date-picker chip + "or ___ days" + notes ────────────────
export const reviewRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.s,
  flex: 1,
  minWidth: 0,
};
// Figma node 2057:6522 — date chip: calendar icon 24px + "Select Date"
// placeholder. primary300 border, radii.m, padding xs, gap xs.
export const reviewDate: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.xs,
  flexShrink: 0,
  height: 40,
  border: `${strokes.xs} solid ${colors.primary300}`,
  borderRadius: radii.m,
  padding: spacing.xs,
  backgroundColor: colors.neutral100,
  color: colors.neutral900,
  cursor: "pointer",
};
export const reviewDateText: CSSProperties = {
  fontSize: fonts.control.sm,
  fontFamily: fonts.family.primary,
  color: colors.neutral400,
  whiteSpace: "nowrap",
};
export const reviewLong: CSSProperties = {
  flex: 1,
  minWidth: 0,
  height: 40,
  border: "none",
  backgroundColor: colors.primary100,
  borderRadius: radii.m,
  padding: spacing.xs,
  fontSize: fonts.size.s,
  lineHeight: fonts.lineHeight.s,
  color: colors.neutral900,
  outline: "none",
  fontFamily: fonts.family.primary,
};
// Next Review — "or ___ days" segment between the date chip and the notes
// input. The number input has a thin underline; "days" sits as a label.
export const reviewOr: CSSProperties = {
  flexShrink: 0,
  fontSize: fonts.size.s,
  lineHeight: fonts.lineHeight.s,
  color: colors.neutral500,
  fontFamily: fonts.family.primary,
};
export const reviewDaysWrap: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing.xs,
  flexShrink: 0,
};
export const reviewDaysInput: CSSProperties = {
  width: 56,
  height: 32,
  border: "none",
  borderBottom: `${strokes.xs} solid ${colors.neutral300}`,
  backgroundColor: "transparent",
  outline: "none",
  fontSize: fonts.size.s,
  lineHeight: fonts.lineHeight.s,
  fontFamily: fonts.family.primary,
  color: colors.neutral900,
  textAlign: "center",
};
export const reviewDaysLabel: CSSProperties = {
  fontSize: fonts.size.s,
  lineHeight: fonts.lineHeight.s,
  color: colors.neutral500,
  fontFamily: fonts.family.primary,
};
