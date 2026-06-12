// ══════════════════════════════════════════════════════════════════════════════
// Storybook · GUIDELINES — the written rules behind the system: principles, the
// modal rulebook, accessibility basics and a changelog. Pure reference (no live
// components).
// ══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";
import { Section, Sub, DetailTable } from "./kit";

const Li = ({ children }: { children: React.ReactNode }) => (
  <li style={{ marginBottom: spacing.xs, lineHeight: 1.6 }}>{children}</li>
);
const Ul = ({ children }: { children: React.ReactNode }) => (
  <ul style={{ margin: `${spacing.xs} 0`, paddingLeft: spacing.l, fontSize: fonts.size.s, color: colors.neutral700, maxWidth: 840 }}>{children}</ul>
);

// ── 27 · Principles ───────────────────────────────────────────────────────────
export function PrinciplesSection() {
  return (
    <Section id="principles" title="28 · Principles"
      tldr={<>How we decide. When a choice isn’t obvious, these break the tie.</>}>
      <Ul>
        <Li><b>One canonical component per job.</b> If two things do the same job, merge them. The system shrinks over time, it doesn’t grow.</Li>
        <Li><b>Tokens, never literals.</b> Colour, spacing, radius, shadow, z-index all come from <code>theme.ts</code>. An inline <code>#hex</code> or <code>0 4px 16px…</code> is a bug.</Li>
        <Li><b>Real components only.</b> Every specimen on this page is the production component — the guide can’t drift from the app.</Li>
        <Li><b>Desktop-first, two tiers.</b> Designed at 1440; compacts once at 1200–1439 via <code>--input-h</code> / type vars. No phone layout.</Li>
        <Li><b>Quiet by default.</b> Light surfaces, one accent, generous space. Colour and weight earn attention — they aren’t the baseline.</Li>
      </Ul>
    </Section>
  );
}

// ── 28 · Modal rulebook ───────────────────────────────────────────────────────
export function ModalRulebookSection() {
  return (
    <Section id="modal-rulebook" title="29 · Modal rulebook"
      tldr={<>Three modal types, one set of rules (revised 2026-06-12). See <b>25 · Modals</b> for the live gallery.</>}>
      <Sub title="The three types">
        <DetailTable rows={[
          ["Confirm", "yes/no · delete · “are you sure?” — centred title, ~400 (S), buttons centred"],
          ["Form", "create / edit records — white surface, left title, 480 (M) / 560 (L)"],
          ["Workbench", "wide editors / receipts — white, padding 0 + internal layout, 1040 (XL)"],
        ]} />
      </Sub>
      <Sub title="Universal (every modal)">
        <Ul>
          <Li>Radius <code>radii.2xl</code> (16) · backdrop <code>rgba(0,0,0,0.35)</code> · <code>shadows.modal</code>.</Li>
          <Li>Close is <b>always</b> a top-right <code>IconButton</code> ✕ (24px, 1.5 stroke) — never a raw × or one-off square.</Li>
          <Li>Heading left, except confirm-type dialogs are centred. Title = serif (secondary) h5, weight 400.</Li>
          <Li>Width scale: <b>S 400 · M 480 · L 560 · XL 1040</b>. Pick the nearest; don’t invent numbers.</Li>
          <Li>Surface: forms + confirms = white (<code>neutral100</code>); <b>Add staff</b> is the lone cream exception; the torn-edge receipt is transparent.</Li>
          <Li>z-index from the scale: modal <code>4000</code> / modalTop <code>4100</code> (a dialog opened from a modal).</Li>
        </Ul>
      </Sub>
    </Section>
  );
}

// ── 29 · Accessibility ────────────────────────────────────────────────────────
export function AccessibilitySection() {
  return (
    <Section id="accessibility" title="30 · Accessibility"
      tldr={<>The non-negotiables every component already follows — keep them when you build new ones.</>}>
      <Ul>
        <Li>Icon-only buttons carry an <code>ariaLabel</code> (IconButton enforces it); decorative icons are <code>aria-hidden</code>.</Li>
        <Li>Inputs pair with a visible <code>&lt;label&gt;</code>; the invalid state is border + tint, never colour alone.</Li>
        <Li>Modals close on <b>Esc</b> and lock body scroll; focus returns to the trigger.</Li>
        <Li>Interactive targets are ≥ 32px; text on a colour uses the darkest shade of that ramp, not black.</Li>
        <Li>Selected/active states read by more than hue (fill + weight), for colour-vision safety.</Li>
      </Ul>
    </Section>
  );
}

// ── 30 · Changelog ────────────────────────────────────────────────────────────
export function ChangelogSection() {
  const log: [string, React.ReactNode][] = [
    ["2026-06-12", "Modal consolidation: rulebook + live gallery; shared UploadModal (Add file + Import CSV); Add Service / Add stock onto shared Field + MeasureField; IconButton ✕ → 24px/1.5; Field box → white; MeasureField unitFilled variant."],
    ["2026-06-12", "Module sticky headers (Catalog/Meds/Bills/Stats); DataGrid, FillInput, DateRangeDropdown, RangeCalendar, ComingSoon added; Stats date dropdown."],
    ["2026-06-11", "Foundations consolidated into one Storybook; shadows / zIndex scales added; Tabs block variant; cardSurface(); MeasureField; canonical Modal + IconButton + Field."],
  ];
  return (
    <Section id="changelog" title="31 · Changelog"
      tldr={<>What changed in the system, newest first. Add an entry whenever a token or shared component changes.</>}>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.s, maxWidth: 840 }}>
        {log.map(([date, body], i) => (
          <div key={i} style={{ display: "flex", gap: spacing.m, fontSize: fonts.size.s, lineHeight: 1.55, paddingBottom: spacing.s, borderBottom: `${strokes.xs} solid ${colors.neutral150}` }}>
            <code style={{ flexShrink: 0, color: colors.neutral500, fontFamily: "monospace", background: colors.neutral150, borderRadius: radii.xs, padding: "1px 6px", height: "fit-content" }}>{date}</code>
            <span style={{ color: colors.neutral700 }}>{body}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
