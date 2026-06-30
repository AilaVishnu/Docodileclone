import React from "react";
import { colors, fonts, radii, spacing } from "../styles/theme";

// Placeholder body for visit sections not yet extracted into real blocks. It
// gives the bento card a faint field area so the layout reads true, and is
// swapped for the section's real body as each is built (Phase 2). Conforms
// structurally to BlockComponentProps (it ignores value/onChange).
export function SectionStub() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
      <span style={{ fontFamily: fonts.family.primary, fontSize: fonts.control.xs, color: colors.neutral400 }}>
        Section fields
      </span>
      <div style={{ height: 44, borderRadius: radii.m, background: colors.primary100 }} />
    </div>
  );
}
