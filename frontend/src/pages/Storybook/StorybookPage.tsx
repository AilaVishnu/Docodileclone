// ══════════════════════════════════════════════════════════════════════════════
// Storybook — THE single design-system reference (replaces the old "Design" page
// and the temp /audit gallery). Three groups: Foundations · Elements · Blocks.
// Every specimen is the real component; tokens read from theme.ts / globals.css.
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";
import { Label } from "./kit";
import { TypographySection, ColorsSection, IconsSection, SpacingSection } from "./Foundations";
import {
  ButtonsSection, InputsSection, DropdownsSection, TabsSection, CardsSection,
  ControlsSection, BadgesSection, TablesSection, ToastSection,
} from "./Elements";
import {
  HeaderBlock, SidebarBlock, StickyHeaderBlock, ModalsBlock, LoginBlock, ChatBlock,
} from "./Blocks";

const NAV: { group: string; items: [string, string][] }[] = [
  { group: "Foundations", items: [["typography","1 · Text"],["colors","2 · Color"],["icons","3 · Icons"],["spacing","4 · Spacing"]] },
  { group: "Elements", items: [["buttons","5 · Buttons"],["inputs","6 · Inputs"],["dropdowns","7 · Dropdowns"],["tabs","8 · Tabs"],["cards","9 · Cards"],["controls","10 · Tags/Switch"],["badges","11 · Badges"],["tables","12 · Tables"],["toast","13 · Toast/Date"]] },
  { group: "Blocks", items: [["header","14 · Header"],["sidebar","15 · Sidebar"],["sticky-header","16 · Sticky header"],["modals","17 · Modals"],["login","18 · Login"],["chat","19 · Chat"]] },
];

export function StorybookPage() {
  const [theme, setTheme] = useState<"primary" | "secondary">("primary");
  const applyTheme = (t: "primary" | "secondary") => {
    setTheme(t);
    if (t === "secondary") document.documentElement.setAttribute("data-theme", "secondary");
    else document.documentElement.removeAttribute("data-theme");
  };
  const themeBtn = (t: "primary" | "secondary", label: string) => (
    <button onClick={() => applyTheme(t)} style={{ cursor: "pointer", border: `${strokes.xs} solid ${colors.neutral300}`,
      borderRadius: radii.s, padding: "4px 10px", fontSize: fonts.size.xs,
      background: theme === t ? colors.neutral900 : colors.neutral100, color: theme === t ? colors.neutral100 : colors.neutral700 }}>{label}</button>
  );

  return (
    <div style={{ maxWidth: 1120 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.m, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: fonts.size.h4, fontWeight: fonts.weight.semibold, color: colors.neutral900, margin: 0 }}>Storybook</h1>
          <p style={{ color: colors.neutral600, fontSize: fonts.size.s, marginTop: spacing.xs, maxWidth: 760, lineHeight: 1.55 }}>
            The single source of truth for Docodile's design system — <b>Foundations</b> (tokens),{" "}
            <b>Elements</b> (components) and <b>Blocks</b> (composed views). Every specimen is the{" "}
            <b>real component rendered live</b>, so this page can't drift from production. Responsiveness
            decisions reference the <b>1440px</b> breakpoint (≥1440 baseline · 1200–1439 compact · 1200 min).
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, flexShrink: 0 }}>
          <Label>theme:</Label>{themeBtn("primary","Primary")}{themeBtn("secondary","Secondary")}
        </div>
      </div>

      {/* sticky grouped nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: colors.neutral150,
        padding: `${spacing.s} 0`, borderBottom: `${strokes.xs} solid ${colors.neutral200}`, marginTop: spacing.m }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.m, alignItems: "center" }}>
          {NAV.map(g => (
            <div key={g.group} style={{ display: "flex", alignItems: "center", gap: spacing["2xs"], flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: fonts.weight.bold, letterSpacing: 0.5, textTransform: "uppercase", color: colors.neutral400 }}>{g.group}</span>
              {g.items.map(([id, label]) => (
                <a key={id} href={`#${id}`} style={{ fontSize: fonts.size.xs, textDecoration: "none", color: colors.neutral700,
                  padding: "2px 8px", borderRadius: radii.xs, border: `${strokes.xs} solid ${colors.neutral200}`, background: colors.neutral100 }}>{label}</a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: spacing.xl }}>
        <TypographySection />
        <ColorsSection />
        <IconsSection />
        <SpacingSection />
        <ButtonsSection />
        <InputsSection />
        <DropdownsSection />
        <TabsSection />
        <CardsSection />
        <ControlsSection />
        <BadgesSection />
        <TablesSection />
        <ToastSection />
        <HeaderBlock />
        <SidebarBlock />
        <StickyHeaderBlock />
        <ModalsBlock />
        <LoginBlock />
        <ChatBlock />
      </div>

      <div style={{ marginTop: spacing["3xl"], padding: `${spacing.l} 0`, color: colors.neutral400, fontSize: fonts.size.xs, textAlign: "center" }}>
        End of Storybook · Foundations · Elements · Blocks
      </div>
    </div>
  );
}
