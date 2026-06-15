import { CSSProperties } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

// Patient-details card styles — lifted from BookAppointment so the card is a
// reusable component. The --book-* vars keep BookAppointment's responsive
// behaviour when rendered there; the fallbacks make it render standalone too.
export const styles: Record<string, CSSProperties> = {
  card: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    border: `${strokes.xs} solid ${colors.neutral100}`,
    boxSizing: "border-box",
    width: "100%",
    padding: `${spacing.m} ${spacing.xl} var(--book-form-pad-bottom, 16px) ${spacing.xl}`,
  },
  // Flat variant — no surface/border/padding/radius. For use inside a modal
  // that already provides its own background + inset (e.g. EditPatientModal).
  cardBare: {
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 0,
    marginTop: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    boxSizing: "border-box",
    width: "100%",
    padding: 0,
  },
  row: { display: "flex", gap: spacing.m, alignItems: "center", width: "100%" },
  iconField: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: `var(--book-input-pady, 8px) ${spacing.xs}`,
    borderBottom: `${strokes.xs} solid ${colors.neutral300}`,
    width: "100%",
  },
  iconFieldIcon: { color: colors.neutral900, width: "24px", height: "24px", flexShrink: 0 },
  iconFieldInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: fonts.size.m,
    color: colors.neutral900,
    backgroundColor: "transparent",
    padding: 0,
    fontFamily: fonts.family.primary,
  },
  inlineLabel: { fontSize: fonts.size.m, color: colors.neutral900 },
  error: { color: colors.red200, fontSize: fonts.size.xs, marginTop: 2, marginLeft: 4 },
  clearLink: {
    background: "none",
    border: "none",
    color: colors.red200,
    cursor: "pointer",
    fontSize: fonts.size.xs,
    textDecoration: "underline",
    padding: 0,
  },
  suggestions: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 2000,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    marginTop: 4,
    padding: spacing["2xs"],
  },
};
