// ══════════════════════════════════════════════════════════════════════════════
// Storybook · FOUNDATIONS — Typography · Colors · Icons · Spacing/Radii/Shadows.
// Tokens read from theme.ts; the icon grid auto-discovers every asset in
// assets/icons so it can never go stale.
// ══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { colors, fonts, spacing, radii, strokes, shadows, fluidSpacing } from "../../styles/theme";
import { Section, Sub, Row, Label, Rule, From, ResponsiveTable } from "./kit";

// ── Typography ────────────────────────────────────────────────────────────────
export function TypographySection() {
  const headings = ["h1","h2","h3","h4","h5","h6"] as const;
  const body = ["l","m","s","xs","caption"] as const;
  const weights = ["regular","medium","semibold","bold"] as const;

  return (
    <Section id="typography" title="1 · Text styles"
      tldr={<>One scale in <From>fonts.size.*</From> (mirrors the <code>--fs-*</code> CSS vars). Hierarchy = h1→caption. <b>Headings step down one rung below 1440px</b>; body <code>m</code>/<code>s</code> and <code>xs</code>/<code>caption</code> hold across both tiers (the accessibility floor). Two families: <b>primary</b> (UI) and <b>secondary</b> (serif display).</>}>

      <Sub title="Hierarchy — fonts.size.* (rendered at the current viewport)">
        {headings.map(k => (
          <div key={k} style={{ display: "flex", alignItems: "baseline", gap: spacing.m, padding: `${spacing["3xs"]} 0` }}>
            <Label>{k}</Label>
            <div style={{ fontSize: fonts.size[k], lineHeight: 1.15, fontFamily: fonts.family.primary, color: colors.neutral900 }}>Aa — The quick brown fox</div>
            <code style={{ marginLeft: "auto", fontSize: 11, color: colors.neutral500, fontFamily: "monospace" }}>{fonts.size[k]}</code>
          </div>
        ))}
        {body.map(k => (
          <div key={k} style={{ display: "flex", alignItems: "baseline", gap: spacing.m, padding: `${spacing["3xs"]} 0` }}>
            <Label>{k}</Label>
            <div style={{ fontSize: fonts.size[k], lineHeight: 1.4, fontFamily: fonts.family.primary, color: colors.neutral900 }}>The quick brown fox jumps over the lazy dog</div>
            <code style={{ marginLeft: "auto", fontSize: 11, color: colors.neutral500, fontFamily: "monospace" }}>{fonts.size[k]}</code>
          </div>
        ))}
      </Sub>

      <Sub title="Responsiveness — the scale steps once at 1440px"
        note="font-size / line-height. Below 1440 headings drop one rung; m and s body text never change (one global body size); xs and caption hold as the floor.">
        <ResponsiveTable
          rows={[
            ["h1", "60 / 72", "48 / 60"],
            ["h2", "48 / 56", "40 / 48"],
            ["h3", "40 / 48", "32 / 40"],
            ["h4", "32 / 44", "26 / 36"],
            ["h5", "24 / 34", "20 / 28"],
            ["h6", "20 / 28", "18 / 24"],
            ["l", "20 / 28", "18 / 24"],
            ["m (body)", "16 / 22", "16 / 22 — holds"],
            ["s (body)", "14 / 20", "14 / 20 — holds"],
            ["xs / caption", "12 / 11", "holds (a11y floor)"],
          ]}
          caption={<>Driven by <code>--fs-*</code> / <code>--lh-*</code> in globals.css. Control text (buttons/inputs) uses <code>--ctrl-fs-*</code>: lg 18→16, md 16→14, sm 14→13.</>}
        />
      </Sub>

      <Sub title="Weights & families">
        <Row gap={spacing.xl}>
          {weights.map(w => (
            <div key={w} style={{ minWidth: 130 }}>
              <div style={{ fontSize: fonts.size.l, fontWeight: fonts.weight[w], fontFamily: fonts.family.primary, color: colors.neutral900 }}>Aa Weight</div>
              <Label>{w} · {fonts.weight[w]}</Label>
            </div>
          ))}
        </Row>
        <Row gap={spacing.xl}>
          <div><div style={{ fontSize: fonts.size.h5, fontFamily: fonts.family.primary, color: colors.neutral900 }}>Primary — UI text</div><Label>fonts.family.primary</Label></div>
          <div><div style={{ fontSize: fonts.size.h5, fontFamily: fonts.family.secondary, color: colors.neutral900 }}>Secondary — display</div><Label>fonts.family.secondary</Label></div>
        </Row>
      </Sub>
    </Section>
  );
}

// ── Colors ────────────────────────────────────────────────────────────────────
export function ColorsSection() {
  const groups: { name: string; note?: string; keys: string[] }[] = [
    { name: "Neutrals", keys: ["neutral100","neutral150","neutral200","neutral300","neutral400","neutral500","neutral600","neutral700","neutral800","neutral900","neutral1000"] },
    { name: "Primary (cream)", keys: ["primary100","primary200","primary300","primary400","primary500","primary600","primary700","primary800"] },
    { name: "Secondary (sage/olive)", keys: ["secondary50","secondary100","secondary200","secondary300","secondary400","secondary500","secondary600","secondary700","secondary800"] },
    { name: "Alerts", note: "red = danger/error · green = success · yellow = warning", keys: ["red100","red200","green100","green200","yellow100","yellow200"] },
    { name: "Alphas (overlays / tints)", keys: ["alphaBlack0","alphaBlack1","alphaBlack2","alphaBlack3","redAlpha10","greenAlpha10","yellowAlpha10"] },
  ];
  const Swatch = ({ name, value }: { name: string; value: string }) => {
    const isAlpha = name.toLowerCase().includes("alpha");
    return (
      <div title={`Click to copy ${value}`} onClick={() => navigator.clipboard?.writeText(value)}
        style={{ cursor: "pointer", minWidth: 116 }}>
        <div style={{ height: 56, borderRadius: radii.m, border: `${strokes.xs} solid ${colors.neutral200}`,
          backgroundImage: isAlpha ? "repeating-conic-gradient(#e9e9e9 0% 25%, #fff 0% 50%) 50% / 12px 12px" : undefined }}>
          <div style={{ width: "100%", height: "100%", borderRadius: radii.m, backgroundColor: value }} />
        </div>
        <div style={{ fontSize: 11, fontWeight: fonts.weight.semibold, color: colors.neutral800, fontFamily: "monospace", marginTop: 4 }}>{name}</div>
        <div style={{ fontSize: 10, color: colors.neutral600, fontFamily: "monospace" }}>{value}</div>
      </div>
    );
  };
  return (
    <Section id="colors" title="2 · Color system"
      tldr={<>The full palette lives in <From>colors</From> (theme.ts). Use a <b>token name</b>, never a raw hex — every off-token colour was migrated out. Click any swatch to copy its value. Alpha tokens sit on a checkerboard so transparency shows.</>}>
      {groups.map(g => (
        <Sub key={g.name} title={g.name} note={g.note}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(116px, 1fr))", gap: spacing.m }}>
            {g.keys.map(k => <Swatch key={k} name={k} value={(colors as unknown as Record<string, string>)[k]} />)}
          </div>
        </Sub>
      ))}
      <Sub title="Active theme — colors.active.* (themable via CSS vars)"
        note="The accent ramp the app re-points per theme (primary cream vs secondary sage). Use the theme toggle in the header to see these shift.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(116px, 1fr))", gap: spacing.m }}>
          {Object.entries(colors.active).map(([k, v]) => <Swatch key={k} name={`active.${k}`} value={v as string} />)}
        </div>
      </Sub>
    </Section>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
// Auto-discover every asset so the library never goes stale. Robust to either
// CRA SVGR return shape (module object with .ReactComponent, or a URL string).
const iconsCtx = (require as unknown as { context: (p: string, d: boolean, r: RegExp) => any }).context("../../assets/icons", false, /\.svg$/);
const ALL_ICONS: { name: string; mod: any }[] = iconsCtx.keys().sort().map((k: string) => ({
  name: k.replace(/^\.\//, "").replace(/\.svg$/, ""),
  mod: iconsCtx(k),
}));

export function IconsSection() {
  return (
    <Section id="icons" title={`3 · Icons (${ALL_ICONS.length})`}
      tldr={<>Every <code>.svg</code> in <From>assets/icons</From>, one place — auto-listed, so new icons appear here for free. Canonical render box is <b>24×24</b>; sizes 16/20/24 are used in the wild. Colour: assets on <code>currentColor</code> inherit the parent (themable); a few still bake a hex (those stay their own colour). Hover for the filename.</>}>
      <Sub title="Library" note="Rendered at 24px on a neutral parent. Click to copy the name.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))", gap: spacing.s }}>
          {ALL_ICONS.map(({ name, mod }) => {
            const Comp = mod && mod.ReactComponent;
            const url = mod && (mod.default || mod);
            return (
              <div key={name} title={`${name}.svg — click to copy`} onClick={() => navigator.clipboard?.writeText(name)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing["2xs"],
                  padding: spacing.s, border: `${strokes.xs} solid ${colors.neutral200}`, borderRadius: radii.m,
                  background: colors.neutral100, cursor: "pointer" }}>
                <span style={{ color: colors.neutral800, height: 24, display: "inline-flex", alignItems: "center" }}>
                  {Comp ? <Comp width={24} height={24} /> : <img src={url} width={24} height={24} alt={name} />}
                </span>
                <div style={{ fontSize: 9, color: colors.neutral500, fontFamily: "monospace", textAlign: "center",
                  width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
              </div>
            );
          })}
        </div>
      </Sub>
      <Sub title="Sizes & colour">
        <Row gap={spacing.xl} align="flex-end">
          {[16, 20, 24].map(s => {
            const Comp = ALL_ICONS.find(i => i.name === "heart-pulse")?.mod?.ReactComponent;
            return (
              <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing["2xs"] }}>
                <span style={{ color: colors.neutral800 }}>{Comp ? <Comp width={s} height={s} /> : null}</span>
                <Label>{s}px{s === 24 ? " · canonical" : ""}</Label>
              </div>
            );
          })}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing["2xs"] }}>
            <span style={{ color: colors.red200 }}>{ALL_ICONS.find(i => i.name === "trash")?.mod?.ReactComponent
              ? React.createElement(ALL_ICONS.find(i => i.name === "trash")!.mod.ReactComponent, { width: 24, height: 24 }) : null}</span>
            <Label>currentColor</Label>
          </div>
        </Row>
      </Sub>
    </Section>
  );
}

// ── Spacing · Radii · Strokes · Shadows ─────────────────────────────────────────
export function SpacingSection() {
  const spaceKeys = ["3xs","2xs","xs","s","m","l","xl","2xl","3xl","4xl","5xl"] as const;
  return (
    <Section id="spacing" title="4 · Spacing · Radii · Strokes · Shadows"
      tldr={<>Static scales from <From>theme.ts</From>: <code>spacing</code> (4→56px), <code>radii</code>, <code>strokes</code>, and the <code>shadows</code> elevation set. Cards use radius <b>16</b>; the only card shadow is <code>shadows.card</code>. <code>fluidSpacing.*</code> is reserved for the outer page shell.</>}>
      <Sub title="Spacing — spacing.*">
        <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"] }}>
          {spaceKeys.map(k => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: spacing.m }}>
              <Label>{k}</Label>
              <div style={{ width: spacing[k], height: 12, backgroundColor: colors.secondary500, borderRadius: radii.xs }} />
              <code style={{ fontSize: 11, color: colors.neutral500, fontFamily: "monospace" }}>{spacing[k]}</code>
            </div>
          ))}
        </div>
      </Sub>
      <Sub title="Radii — radii.*">
        <Row gap={spacing.l}>
          {(["xs","s","m","l","xl","2xl","full"] as const).map(k => (
            <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing["2xs"] }}>
              <div style={{ width: 56, height: 56, backgroundColor: colors.secondary300, borderRadius: radii[k] }} />
              <Label>{k} · {radii[k]}px</Label>
            </div>
          ))}
        </Row>
      </Sub>
      <Sub title="Strokes — strokes.*">
        <Row gap={spacing.l}>
          {(["xs","s","m","l"] as const).map(k => (
            <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing["2xs"] }}>
              <div style={{ width: 80, height: 40, border: `${strokes[k]} solid ${colors.neutral900}`, borderRadius: radii.s }} />
              <Label>{k} · {strokes[k]}</Label>
            </div>
          ))}
        </Row>
      </Sub>
      <Sub title="Shadows — shadows.*" note="menu = dropdowns/popovers · modal = dialogs · card = raised cards. Use the token, never an inline shadow string.">
        <Row gap={spacing.xl}>
          {(["menu","modal","card"] as const).map(k => (
            <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing.xs, padding: spacing.s }}>
              <div style={{ width: 120, height: 60, background: colors.neutral100, borderRadius: radii.m, boxShadow: shadows[k] }} />
              <Label>shadows.{k}</Label>
            </div>
          ))}
        </Row>
        <div style={{ fontSize: 11, color: colors.neutral500, marginTop: spacing.xs }}>
          Reserved: <code>fluidSpacing.*</code> (outer shell) — outerY {fluidSpacing.outerY}, outerX {fluidSpacing.outerX}, sectionGap {fluidSpacing.sectionGap}.
        </div>
      </Sub>
    </Section>
  );
}
