// ══════════════════════════════════════════════════════════════════════════════
// Storybook · BLOCKS — composed views (header, sidebar, sticky header, modals,
// login, chat). The header/sidebar/login specimens are built from the REAL CSS
// vars (--topnav-h, --sidenav-w, --login-card-w …) so they genuinely resize at
// the 1440 breakpoint. Modal renders the real component.
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Field } from "../../components/Field";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { ChevronDown } from "../../components/icons/ChevronDown";
import { Section, Sub, Row, Label, Rule, From, Stage, DetailTable, ResponsiveTable } from "./kit";

const dim = colors.neutral300;
const Bar = ({ w = 60, h = 8, c = dim }: { w?: number | string; h?: number; c?: string }) =>
  <div style={{ width: w, height: h, borderRadius: 4, background: c, flexShrink: 0 }} />;

// ── 14 · Header (TopNav) ────────────────────────────────────────────────────────
export function HeaderBlock() {
  return (
    <Section id="header" title="14 · Header (TopNav)"
      tldr={<>Top chrome: fixed-width <b>search</b> on the left, action cluster + avatar on the right; the <b>gap between them stretches/squeezes</b> with the window (search width is fixed, not fluid). Compacts at &lt;1440. Sits at <code>zIndex.sticky</code> (3000).</>}>
      <Stage>
        {/* genuinely resizes: heights/widths read the live CSS vars */}
        <div style={{ height: "var(--topnav-h, 70px)", display: "flex", alignItems: "center", gap: spacing.l,
          padding: `0 ${spacing.l}`, background: colors.neutral100, border: `${strokes.xs} solid ${colors.neutral200}`,
          borderRadius: radii.m }}>
          <div style={{ width: "var(--topnav-search-w, 360px)", height: 36, borderRadius: radii.full, background: colors.neutral150,
            display: "flex", alignItems: "center", padding: `0 ${spacing.s}`, gap: spacing.xs }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${colors.neutral400}` }} /><Bar w={120} />
          </div>
          <div style={{ flex: 1 }} />
          <Bar w={84} h={32} c={colors.secondary300} />
          <div style={{ width: "var(--topnav-avatar, 48px)", height: "var(--topnav-avatar, 48px)", borderRadius: "50%", background: colors.primary300 }} />
        </div>
      </Stage>
      <Rule>Resize the window across 1440 — the bar height + avatar + search width all step. The flexible gap (<code>flex:1</code>) is what absorbs the rest.</Rule>
      <ResponsiveTable rows={[
        ["--topnav-h", "70px", "56px"],
        ["--topnav-avatar", "48px", "36px"],
        ["--topnav-search-w", "360px", "300px"],
      ]} />
    </Section>
  );
}

// ── 15 · Left sidebar (SideNav) ──────────────────────────────────────────────────
export function SidebarBlock() {
  const items = ["Home","Appts","Rx Pad","Patients","Bills","Stats"];
  return (
    <Section id="sidebar" title="15 · Left sidebar (SideNav)"
      tldr={<>A <b>fixed 80px</b> icon rail (icon + short label under each), one form at every size — <b>no expand, no responsive step</b> (80px = 60px highlight + 10px gutters). Active item gets the cream highlight box. Sits at <code>zIndex.sticky</code> (3000).</>}>
      <Stage>
        <div style={{ width: "var(--sidenav-w, 80px)", display: "flex", flexDirection: "column", gap: spacing.xs,
          padding: `${spacing.s} 0`, background: colors.neutral100, border: `${strokes.xs} solid ${colors.neutral200}`, borderRadius: radii.m }}>
          {items.map((it, i) => (
            <div key={it} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 0" }}>
              <div style={{ width: 60, height: 40, borderRadius: radii.m, background: i === 0 ? colors.active.shade100 : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: i === 0 ? colors.active.shade600 : colors.neutral300 }} />
              </div>
              <div style={{ fontSize: 9, color: i === 0 ? colors.neutral900 : colors.neutral500 }}>{it}</div>
            </div>
          ))}
        </div>
      </Stage>
      <DetailTable rows={[["width", "80px (fixed, both tiers)"], ["item", "icon + label under"], ["active", "active.shade100 box"], ["z-index", "sticky (3000)"]]} />
    </Section>
  );
}

// ── 16 · Sticky header (PageHeader) ──────────────────────────────────────────────
// The inline box-pill dropdown that lives in the queue / Rx header titles.
const HeaderDatePill = ({ label }: { label: string }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", color: colors.neutral900,
    border: `1px solid ${colors.primary400}`, borderRadius: radii.m, padding: "4px 12px" }}>
    {label} <ChevronDown />
  </span>
);
// A small right-action icon button (printer-style glyph) for the prescription header.
const HeaderAction = ({ label }: { label: string }) => (
  <IconButton ariaLabel={label} size={32}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
    </svg>
  </IconButton>
);

export function StickyHeaderBlock() {
  return (
    <Section id="sticky-header" title="16 · Sticky header (PageHeader)"
      tldr={<><From>components/PageHeader</From> — ONE shared sticky app-bar with three zones: <b>back</b> (left) · <b>title</b> (centred — can hold an inline dropdown) · <b>actions</b> (right icons). Parks under the TopNav as the page scrolls (the page's <code>main</code> owns the scroll). Below are the two shapes it actually takes in the app.</>}>
      <Sub title="Queue header — centred title with an inline box dropdown" note="AppointmentQueue / PrescriptionQueue: the title is a clickable date box-pill (1px primary400 · radii.m · ChevronDown → DatePicker) plus a label word.">
        <Stage pad="0px">
          <PageHeader title={<><HeaderDatePill label="Wed, 11 Jun" /> Queue</>} />
        </Stage>
      </Sub>
      <Sub title="Prescription header — back arrow + title + right action icons" note="PrescriptionPage: a left back arrow, the centred patient/visit title, and one or more right-hand action icons.">
        <Stage pad="0px">
          <PageHeader onBack={() => {}} backLabel="Back" title="Aisha Rahman · Visit 3"
            actions={<Row gap={spacing.xs}><HeaderAction label="Print" /></Row>} />
        </Stage>
      </Sub>
      <DetailTable rows={[
        ["zones", "back (left) · title (centre) · actions (right)"],
        ["title", "ReactNode — plain text or an inline dropdown"],
        ["back", "optional onBack → 20px arrow"],
        ["actions", "optional right-aligned icons/buttons"],
        ["sticky", "page is its own scroll container → sits flush under TopNav"],
      ]} />
    </Section>
  );
}

// ── 17 · Modals ──────────────────────────────────────────────────────────────────
export function ModalsBlock() {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState("");
  return (
    <Section id="modals" title="17 · Modals"
      tldr={<><From>components/Modal</From> — one canonical shell: tokenised backdrop, <code>shadows.modal</code>, radius <code>radii.2xl</code>, <b>Esc-to-close + scroll-lock</b> by default. Sits ABOVE the sidebar via <code>zIndex.modal</code> (4000); a dialog opened from inside a modal uses <code>level="top"</code> (4100). Each modal keeps its own surface colour (<code>surface</code> prop).</>}>
      <Row>
        <Button variant="primary" onClick={() => setOpen(true)}>Open modal</Button>
        <DetailTable rows={[
          ["backdrop", "alphaBlack3 (tokenised)"],
          ["z-index", "modal 4000 · modalTop 4100"],
          ["shadow", "shadows.modal"],
          ["radius", "radii.2xl (16)"],
          ["behaviour", "Esc-close + scroll-lock"],
          ["surface", "per-modal (white / cream / tint)"],
        ]} />
      </Row>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <div style={{ padding: spacing.xl, minWidth: 320, maxWidth: 420 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.m }}>
            <div style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h6, color: colors.neutral900 }}>Edit patient</div>
            <IconButton ariaLabel="Close" onClick={() => setOpen(false)} />
          </div>
          <div style={{ marginTop: spacing.m }}><Label>Name</Label><Field variant="box" value={v} onChange={setV} placeholder="Patient name" /></div>
          <div style={{ marginTop: spacing.l, display: "flex", gap: spacing.s, justifyContent: "flex-end" }}>
            <Button variant="light" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => setOpen(false)}>Save</Button>
          </div>
        </div>
      </Modal>
    </Section>
  );
}

// ── 18 · Login form ──────────────────────────────────────────────────────────────
export function LoginBlock() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  return (
    <Section id="login" title="18 · Login form"
      tldr={<>Centered card on the splash, width <code>--login-card-w</code> (520 → 480 below 1440). Themed surface (<code>active.shade100</code>), radius 16, heavy padding. Built from the canonical <code>Field</code> + <code>Button</code>.</>}>
      <Stage pad={spacing.xl} bg={colors.neutral150}>
        <div style={{ width: "var(--login-card-w, 520px)", maxWidth: "100%", margin: "0 auto", background: colors.active.shade100,
          borderRadius: radii["2xl"], padding: spacing["3xl"], display: "flex", flexDirection: "column", gap: spacing.l }}>
          <div style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h4, color: colors.neutral900 }}>Welcome back</div>
          <div><Label>Email</Label><Field variant="box" value={email} onChange={setEmail} placeholder="you@clinic.com" /></div>
          <div><Label>Password</Label><Field variant="box" value={pw} onChange={setPw} placeholder="••••••••" /></div>
          <Button variant="secondary" size="md">Sign in</Button>
        </div>
      </Stage>
      <ResponsiveTable rows={[["--login-card-w", "520px", "480px"]]} />
    </Section>
  );
}

// ── 19 · Chat ─────────────────────────────────────────────────────────────────────
export function ChatBlock() {
  const [msg, setMsg] = useState("");
  const bubble = (text: string, mine: boolean) => (
    <div style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "75%",
      background: mine ? colors.active.shade600 : colors.neutral150, color: mine ? colors.neutral100 : colors.neutral900,
      borderRadius: radii.l, padding: `${spacing.xs} ${spacing.s}`, fontSize: fonts.size.s }}>{text}</div>
  );
  return (
    <Section id="chat" title="19 · Chat"
      tldr={<>Right-side slide-over panel: header with an <code>IconButton</code> close, a scrolling message list (mine right / theirs left), and a <code>Field</code> + send <code>Button</code> docked at the bottom.</>}>
      <Stage pad={spacing.s}>
        <div style={{ width: 340, maxWidth: "100%", height: 360, display: "flex", flexDirection: "column",
          background: colors.neutral100, border: `${strokes.xs} solid ${colors.neutral200}`, borderRadius: radii.l, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${spacing.s} ${spacing.m}`, borderBottom: `${strokes.xs} solid ${colors.neutral200}` }}>
            <div style={{ fontWeight: fonts.weight.semibold, color: colors.neutral900, fontSize: fonts.size.s }}>Dr. Mehta</div>
            <IconButton ariaLabel="Close chat" size={28} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: spacing.xs, padding: spacing.m, overflowY: "auto" }}>
            {bubble("Hi, is the report ready?", false)}
            {bubble("Yes — uploading now.", true)}
            {bubble("Thanks!", false)}
          </div>
          <div style={{ display: "flex", gap: spacing.xs, padding: spacing.s, borderTop: `${strokes.xs} solid ${colors.neutral200}` }}>
            <div style={{ flex: 1 }}><Field variant="pill" value={msg} onChange={setMsg} placeholder="Message…" /></div>
            <Button variant="primary" size="sm">Send</Button>
          </div>
        </div>
      </Stage>
    </Section>
  );
}
