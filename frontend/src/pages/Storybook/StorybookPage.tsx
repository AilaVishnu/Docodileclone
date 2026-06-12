// ══════════════════════════════════════════════════════════════════════════════
// Storybook — THE single design-system reference (replaces the old "Design" page
// and the temp /audit gallery). Three groups: Foundations · Elements · Blocks.
// Every specimen is the real component; tokens read from theme.ts / globals.css.
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";
import { Label } from "./kit";
import { TypographySection, ColorsSection, IconsSection, SpacingSection, LayeringSection } from "./Foundations";
import {
  ButtonsSection, InputsSection, DropdownsSection, TabsSection, CardsSection,
  ControlsSection, BadgesSection, TablesSection, ToastSection,
} from "./Elements";
import {
  IconButtonSection, MeasureFieldSection, FillInputSection, DataGridSection,
  PageHeaderSection, PopoverMenuSection, UploadModalSection,
} from "./Components";
import {
  HeaderBlock, SidebarBlock, StickyHeaderBlock, ModalsBlock, LoginBlock, ChatBlock,
} from "./Blocks";
import { PrinciplesSection, ModalRulebookSection, AccessibilitySection, ChangelogSection } from "./Guidelines";

const NAV: { group: string; items: [string, string][] }[] = [
  { group: "Foundations", items: [["typography","1 · Text"],["colors","2 · Color"],["icons","3 · Icons"],["spacing","4 · Spacing"],["layering","5 · Layering"]] },
  { group: "Components", items: [["buttons","6 · Buttons"],["inputs","7 · Inputs"],["dropdowns","8 · Dropdowns"],["tabs","9 · Tabs"],["cards","10 · Cards"],["controls","11 · Tags/Switch"],["badges","12 · Badges"],["tables","13 · Tables"],["toast","14 · Toast/Date"],["iconbutton","15 · IconButton"],["measurefield","16 · MeasureField"],["fillinput","17 · FillInput"],["datagrid","18 · DataGrid"],["pageheader","19 · PageHeader"],["popovermenu","20 · PopoverMenu"],["uploadmodal","21 · UploadModal"]] },
  { group: "Patterns", items: [["header","22 · Header"],["sidebar","23 · Sidebar"],["sticky-header","24 · Sticky header"],["modals","25 · Modals"],["login","26 · Login"],["chat","27 · Chat"]] },
  { group: "Guidelines", items: [["principles","28 · Principles"],["modal-rulebook","29 · Modal rules"],["accessibility","30 · A11y"],["changelog","31 · Changelog"]] },
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
            <b>Components</b> (every shared component, with variants · states · props), <b>Patterns</b>{" "}
            (composed views) and <b>Guidelines</b> (the written rules). Every specimen is the{" "}
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
        {/* Foundations */}
        <TypographySection />
        <ColorsSection />
        <IconsSection />
        <SpacingSection />
        <LayeringSection />
        {/* Components */}
        <ButtonsSection />
        <InputsSection />
        <DropdownsSection />
        <TabsSection />
        <CardsSection />
        <ControlsSection />
        <BadgesSection />
        <TablesSection />
        <ToastSection />
        <IconButtonSection />
        <MeasureFieldSection />
        <FillInputSection />
        <DataGridSection />
        <PageHeaderSection />
        <PopoverMenuSection />
        <UploadModalSection />
        {/* Patterns */}
        <HeaderBlock />
        <SidebarBlock />
        <StickyHeaderBlock />
        <ModalsBlock />
        <LoginBlock />
        <ChatBlock />
        {/* Guidelines */}
        <PrinciplesSection />
        <ModalRulebookSection />
        <AccessibilitySection />
        <ChangelogSection />
      </div>

      <div style={{ marginTop: spacing["3xl"], padding: `${spacing.l} 0`, color: colors.neutral400, fontSize: fonts.size.xs, textAlign: "center" }}>
        End of Storybook · Foundations · Components · Patterns · Guidelines
      </div>
    </div>
  );
}
