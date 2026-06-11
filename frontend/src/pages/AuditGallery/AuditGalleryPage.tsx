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

// status: "shipped" = finalised + live in the app · "review" = not decided yet.
const CATS: [string, string, "shipped" | "review"][] = [
  ["buttons", "1 · Buttons", "shipped"],
  ["inputs", "2 · Inputs", "shipped"],
  ["dropdowns", "3 · Dropdowns", "shipped"],
  ["modals", "4 · Modals", "shipped"],
  ["nav", "5 · Nav / Tabs", "shipped"],
  ["cards", "6 · Cards", "shipped"],
  ["tables", "7 · Tables", "review"],
  ["icons", "8 · Icons", "review"],
  ["colors", "9 · Colors", "review"],
  ["type", "10 · Type / Space", "review"],
  ["pages", "11 · Pages", "review"],
];

// `embedded` = rendered inside the app shell (a HomePage tab) rather than the
// standalone /audit route. Embedded mode lets the app's <main> own the scroll
// (no inner 100vh / overflow) so the sticky header parks under the TopNav.
export function AuditGalleryPage({ embedded = false }: { embedded?: boolean } = {}) {
  const [theme, setTheme] = useState<"primary" | "secondary">("primary");
  const applyTheme = (t: "primary" | "secondary") => {
    setTheme(t);
    if (t === "secondary") document.documentElement.setAttribute("data-theme", "secondary");
    else document.documentElement.removeAttribute("data-theme");
  };
  return (
    <div style={embedded
      ? { background: colors.neutral150, fontFamily: fonts.family.primary }
      : { height: "100vh", overflowY: "auto", background: colors.neutral150, fontFamily: fonts.family.primary }}>
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
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: spacing["2xs"], marginTop: spacing.xs }}>
          {CATS.map(([id, label, status]) => (
            <a key={id} href={`#${id}`} style={{ fontSize: fonts.size.xs, textDecoration: "none", borderRadius: radii.xs, padding: "2px 8px",
              color: status === "shipped" ? colors.secondary700 : colors.neutral700,
              background: status === "shipped" ? colors.secondary100 : colors.neutral150,
              fontWeight: status === "shipped" ? fonts.weight.semibold : fonts.weight.regular }}>
              {status === "shipped" ? "✅ " : ""}{label}
            </a>
          ))}
          <span style={{ fontSize: fonts.size.xs, color: colors.neutral500, marginLeft: spacing.xs }}>
            ✅ green = finalised &amp; live · grey = still under review
          </span>
        </div>
      </div>

      {/* body */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: `${spacing.xl} ${spacing.xl} ${spacing["7xl"]}` }}>
        <div style={{ margin: `0 0 ${spacing.xl}`, padding: spacing.m, borderRadius: radii.m, background: colors.neutral100,
          border: `${strokes.xs} solid ${colors.neutral200}`, maxWidth: 900 }}>
          <div style={{ fontSize: fonts.size.s, fontWeight: fonts.weight.semibold, color: colors.neutral900, marginBottom: spacing.xs }}>How to read this page</div>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], fontSize: fonts.size.xs, color: colors.neutral700, lineHeight: 1.6 }}>
            <div><span style={{ display: "inline-block", width: 110, fontWeight: fonts.weight.semibold, color: colors.secondary700 }}>✅ FINALISED</span> — green tiles / a green section badge = <b>the decided, correct version, now LIVE in the app</b>. This is what we keep.</div>
            <div><span style={{ display: "inline-block", width: 110, fontWeight: fonts.weight.semibold, color: colors.neutral600 }}>existing / before</span> — plain (grey-border) tiles = <b>what used to be in the app</b> (the messy variants), kept only so you can see what changed.</div>
            <div><span style={{ display: "inline-block", width: 110, fontWeight: fonts.weight.semibold, color: colors.neutral600 }}>🔍 under review</span> — grey category in the top bar = <b>not decided yet</b>; we'll go through it together.</div>
          </div>
          <div style={{ fontSize: fonts.size.xs, color: colors.neutral500, marginTop: spacing.xs }}>
            Each tile has a short <b>ID</b> (the monospace chip) — reply by ID to give a verdict. Rows marked <b>“where”</b> show a variant inside its real container at real size.
          </div>
        </div>
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
