import type { CSSProperties } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";

// Exact note-card body styles lifted from PrescriptionPage.styles.ts so the
// note blocks (Complaints / Diagnosis / Tests / Notes / Private) mirror the page
// 1:1 — a cream field box with a transparent inner input and the dictate icons
// docked bottom-right.
export const noteCardField = (tall: boolean): CSSProperties => ({
  position: "relative",
  backgroundColor: colors.primary100,
  borderRadius: radii.m,
  padding: spacing.xs,
  minHeight: tall ? 123 : undefined,
  display: "flex",
});

export const noteCardTextarea: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: "none",
  outline: "none",
  resize: "none",
  backgroundColor: "transparent",
  fontSize: fonts.size.s,
  lineHeight: fonts.lineHeight.s,
  fontFamily: fonts.family.primary,
  color: colors.neutral900,
  minHeight: 80,
};

export const noteCardDictate: CSSProperties = {
  position: "absolute",
  right: spacing.xs,
  bottom: spacing.xs,
  display: "inline-flex",
  alignItems: "center",
  gap: spacing.xs,
  color: colors.neutral700,
};

// AutocompleteTags container override — transparent inside the cream wrapper,
// reserving room on the right for the dictate icons.
export const noteTagbox = (tall: boolean): CSSProperties => ({
  backgroundColor: "transparent",
  borderRadius: 0,
  padding: 0,
  alignItems: "flex-start",
  alignContent: "flex-start",
  paddingRight: 64,
  width: "100%",
  minHeight: tall ? 80 : undefined,
});
