import type { CSSProperties } from "react";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";

// ProcedureCard — body-only styles. The header/collapse/surface chrome lives in
// <SectionBlock>; this is just the form layout (identity, note, the generic
// parameter rows, the before/after photo gallery, consent, aftercare).
export const styles: Record<string, CSSProperties> = {
  body: { display: "flex", flexDirection: "column", gap: spacing.l },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.m, alignItems: "start" },
  fieldWrap: { display: "flex", flexDirection: "column", gap: spacing["2xs"], minWidth: 0 },
  label: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    fontWeight: fonts.weight.medium,
    color: colors.neutral700,
  },
  hint: { fontFamily: fonts.family.primary, fontSize: fonts.control.xs, color: colors.neutral500 },

  group: { display: "flex", flexDirection: "column", gap: spacing.s },
  groupHead: { display: "flex", alignItems: "baseline", gap: spacing.xs },
  empty: { margin: 0, fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral500 },

  paramRow: { display: "flex", alignItems: "center", gap: spacing.s },
  paramLabel: { flex: 1.4, minWidth: 0 },
  paramValue: { flex: 0.8, minWidth: 0 },
  paramUnit: { width: 96, flexShrink: 0 },
  addRow: { alignSelf: "flex-start" },

  photoRow: { display: "flex", flexWrap: "wrap", gap: spacing.s },
  photoTile: { display: "flex", flexDirection: "column", gap: spacing["2xs"], width: 124 },
  photoBox: {
    position: "relative",
    width: 124,
    height: 92,
    borderRadius: radii.m,
    overflow: "hidden",
    background: colors.primary100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.neutral400,
  },
  photoImg: { width: "100%", height: "100%", objectFit: "cover" },
  photoRemove: { position: "absolute", top: 4, right: 4 },
  photoAdd: {
    width: 124,
    height: 92,
    borderRadius: radii.m,
    border: `${strokes.s} dashed ${colors.primary300}`,
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2xs"],
    color: colors.neutral500,
  },
  photoAddText: { fontFamily: fonts.family.primary, fontSize: fonts.control.xs, color: colors.neutral500 },

  consentRow: { display: "flex", alignItems: "center", gap: spacing.s },
  consentLabel: { fontFamily: fonts.family.primary, fontSize: fonts.control.md, color: colors.neutral900 },
};
