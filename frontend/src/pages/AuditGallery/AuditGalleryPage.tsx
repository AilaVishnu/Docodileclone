// ══════════════════════════════════════════════════════════════════════════════
// TEMP — UI audit gallery. Reachable at /audit (bypasses the login gate).
// Puts canonical components next to the ad-hoc variants found in the wild, each
// shown IN CONTEXT (real container, real width) so they can be visually judged.
// Every tile/row has a stable ID (e.g. CLOSE-3) — use the IDs in chat verdicts.
// DELETE THIS FOLDER + its <Route> in App.tsx when the review is done.
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { ButtonsCategory } from "./Buttons";
import { InputsCategory } from "./Inputs";
import { DropdownsCategory } from "./Dropdowns";
import { ModalsCategory } from "./Modals";
import { NavCategory } from "./Nav";
import { CardsCategory } from "./Cards";
import { TablesCategory } from "./Tables";
import { IconsCategory } from "./Icons";
import { ColorsCategory } from "./Colors";
import { TypeCategory } from "./TypeSpace";
import { PagesCategory } from "./Pages";

const CATS: [string, string][] = [
  ["buttons", "1 · Buttons"],
  ["inputs", "2 · Inputs"],
  ["dropdowns", "3 · Dropdowns"],
  ["modals", "4 · Modals"],
  ["nav", "5 · Nav / Tabs"],
  ["cards", "6 · Cards"],
  ["tables", "7 · Tables"],
  ["icons", "8 · Icons"],
  ["colors", "9 · Colors"],
  ["type", "10 · Type / Space"],
  ["pages", "11 · Pages"],
];

export function AuditGalleryPage() {
  const [theme, setTheme] = useState<"primary" | "secondary">("primary");
  const applyTheme = (t: "primary" | "secondary") => {
    setTheme(t);
    if (t === "secondary") document.documentElement.setAttribute("data-theme", "secondary");
    else document.documentElement.removeAttribute("data-theme");
  };
  return (
    <div style={{ height: "100vh", overflowY: "auto", background: colors.neutral150, fontFamily: fonts.family.primary }}>
      {/* sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: colors.neutral100,
        borderBottom: `${strokes.xs} solid ${colors.neutral200}`, padding: `${spacing.s} ${spacing.xl}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.m }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: spacing.s }}>
            <span style={{ fontSize: fonts.size.l, fontWeight: fonts.weight.bold, color: colors.neutral900 }}>UI Audit Gallery</span>
            <span style={{ fontSize: fonts.size.xs, color: colors.neutral500 }}>temp · /audit · delete when done</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
            <span style={{ fontSize: fonts.size.xs, color: colors.neutral600 }}>theme:</span>
            <button onClick={() => applyTheme("primary")} style={{ cursor: "pointer", border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.s, padding: "4px 10px",
              background: theme === "primary" ? colors.neutral900 : colors.neutral100, color: theme === "primary" ? colors.neutral100 : colors.neutral700, fontSize: fonts.size.xs }}>Primary</button>
            <button onClick={() => applyTheme("secondary")} style={{ cursor: "pointer", border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.s, padding: "4px 10px",
              background: theme === "secondary" ? colors.neutral900 : colors.neutral100, color: theme === "secondary" ? colors.neutral100 : colors.neutral700, fontSize: fonts.size.xs }}>Secondary</button>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing["2xs"], marginTop: spacing.xs }}>
          {CATS.map(([id, label]) => (
            <a key={id} href={`#${id}`} style={{ fontSize: fonts.size.xs, color: colors.neutral800, textDecoration: "none", background: colors.primary200, borderRadius: radii.xs, padding: "2px 8px" }}>{label}</a>
          ))}
        </div>
      </div>

      {/* body */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: `${spacing.xl} ${spacing.xl} ${spacing["7xl"]}` }}>
        <p style={{ fontSize: fonts.size.s, color: colors.neutral700, margin: `0 0 ${spacing.xl}`, lineHeight: 1.6, maxWidth: 860 }}>
          Each tile/row has an <b>ID</b> (the monospace chip). Tiles with a green border + <b>✓ canonical</b> are the proposed
          source of truth; rows marked <b>where</b> show the variant inside its real container at real width. Tell me, by ID,
          which is correct and which should be fixed or removed — I'll record it in the decision sheet, and nothing in the real
          app changes until you approve a fix phase. Duplicate / merge candidates are flagged inline within each category.
        </p>
        <ButtonsCategory />
        <InputsCategory />
        <DropdownsCategory />
        <ModalsCategory />
        <NavCategory />
        <CardsCategory />
        <TablesCategory />
        <IconsCategory />
        <ColorsCategory />
        <TypeCategory />
        <PagesCategory />
      </div>
    </div>
  );
}
