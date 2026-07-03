import { CSSProperties } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";

// Read-only receipt tile for the Bills grid — mirrors the New Appointment
// BillCard aesthetic (top-rounded white card + grey total band + torn zigzag
// foot), but shows a settled bill's summary instead of editable fields.
export const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    // drop-shadow (not box-shadow) so the elevation follows the torn zigzag
    // silhouette rather than a square box.
    filter: "drop-shadow(0 4px 20px rgba(0, 0, 0, 0.05))",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
    padding: spacing.l,
    backgroundColor: colors.neutral100,
    borderRadius: "8px 8px 0 0",
  },
  // Torn receipt edge — full V-notches (same construction as BillCard.zigzag).
  zigzag: {
    width: "100%",
    height: "16px",
    backgroundImage: `
      linear-gradient(135deg, ${colors.neutral100} 50%, transparent 50%),
      linear-gradient(225deg, ${colors.neutral100} 50%, transparent 50%)
    `,
    backgroundSize: "16px 16px",
    backgroundRepeat: "repeat-x",
  },

  head: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.s },
  idCol: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 },
  name: { fontSize: fonts.size.m, fontWeight: fonts.weight.semibold, color: colors.neutral900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  sub: { fontSize: fonts.size.s, color: colors.neutral500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },

  rows: { display: "flex", flexDirection: "column", gap: spacing["2xs"] },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: fonts.size.m, fontFamily: fonts.family.primary },
  rowLabel: { color: colors.neutral500 },
  rowValue: { color: colors.neutral900, fontVariantNumeric: "tabular-nums" },

  totalRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: colors.neutral150,
    borderRadius: radii.m,
    marginTop: spacing["2xs"],
  },
  totalLabel: { fontSize: fonts.size.m, fontWeight: 600, color: colors.neutral900, lineHeight: 1 },
  totalValue: { fontSize: fonts.size.h4, fontFamily: fonts.family.secondary, fontWeight: fonts.weight.regular, color: colors.neutral900, lineHeight: 1, fontVariantNumeric: "tabular-nums" },

  foot: { display: "flex", alignItems: "center", gap: spacing.xs, fontSize: fonts.size.s, color: colors.neutral500 },
};
