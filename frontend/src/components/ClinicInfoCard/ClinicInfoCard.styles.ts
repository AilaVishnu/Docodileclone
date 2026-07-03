import { CSSProperties } from "react";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";

// ClinicInfoCard shares its visual language with ClinicCard (same card bg,
// padding, field pills, icon+text greys, tag style). Only the CONTENTS
// differ — here inputs replace the read-only spans.
// Keep tokens in sync with ClinicCard.styles.ts. If those change, update here.

export const styles: Record<string, CSSProperties> = {
  card: {
    // No bg, no padding — the form lives directly inside the workspace
    // container alongside the house; it shouldn't be its own card.
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    width: "100%",
    boxSizing: "border-box",
  },

  // ─── Domain box (same as ClinicCard.domainBox) ──────────────────────────
  domainBox: {
    display: "flex",
    alignItems: "center",
    border: `${strokes.xs} solid ${colors.neutral500}`,
    borderRadius: radii.m,
    overflow: "hidden",
    height: 42,
    backgroundColor: "transparent",
  },

  domainInput: {
    // matches ClinicCard.domainValue but as an editable input
    flex: 1,
    minWidth: 0,
    padding: `0 ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    // Typed value is near-black when editable; placeholder is auto-greyed
    // by the browser. styles.locked (opacity 0.6) handles the greyed look
    // when the field is locked.
    color: colors.neutral900,
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    textOverflow: "ellipsis",
  },

  // .docodile.app suffix — prominent (neutral900) when domain is editable
  domainSuffix: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    padding: `0 ${spacing.m}`,
    borderLeft: `${strokes.xs} solid ${colors.neutral500}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    height: "100%",
    whiteSpace: "nowrap",
  },

  // Muted variant when the domain field is locked (after save)
  domainSuffixLocked: {
    color: colors.neutral500,
  },

  // Small label above the domain field: "give a nick name to your clinic"
  domainLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    marginBottom: spacing["2xs"],
  },

  // Wraps the label + the domain box as one unit
  domainSection: {
    display: "flex",
    flexDirection: "column",
  },

  // ─── Field rows (icon + editable input) ─────────────────────────────────
  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
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
    color: colors.neutral500,
  },

  fieldInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    lineHeight: "24px",
    border: "none",
    outline: "none",
    background: "transparent",
    padding: 0,
  },

  fieldTextArea: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    lineHeight: "24px",
    border: "none",
    outline: "none",
    background: "transparent",
    padding: 0,
    resize: "none" as const,
    overflowWrap: "anywhere" as const,
    wordBreak: "break-word" as const,
    // Fixed height (~3 rows). Longer addresses scroll INSIDE this field
    // rather than expanding the row / pushing the form taller.
    height: 72,
    overflowY: "auto" as const,
  },

  fieldError: {
    border: `${strokes.xs} solid ${colors.red200}`,
  },

  // ─── Specialty row (icon + tags + add) ──────────────────────────────────
  specialtyRow: {
    display: "flex",
    // Center the icon + tags/input so the "Add department" placeholder sits
    // vertically centered in the row (not pinned to the top).
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
    alignItems: "center",
    minWidth: 0,
  },

  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.secondary700,
    color: colors.neutral100,
    borderRadius: radii.pill,
    padding: "3px 10px",
    fontSize: fonts.size.xs,
    fontFamily: fonts.family.primary,
    fontWeight: fonts.weight.medium,
  },

  tagRemove: {
    background: "none",
    border: "none",
    color: colors.neutral100,
    cursor: "pointer",
    padding: 0,
    fontSize: fonts.size.caption,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },

  specialtyAddInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral500,
    flex: 1,
    minWidth: 80,
    padding: 0,
  },

  // ─── Footer ─────────────────────────────────────────────────────────────
  buttonWrapper: {
    marginTop: "auto",
    paddingTop: spacing.s,
    display: "flex",
    gap: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },

  // Locked field wrapper — applied when the field is read-only after save
  locked: {
    pointerEvents: "none" as const,
    opacity: 0.6,
  },
};
