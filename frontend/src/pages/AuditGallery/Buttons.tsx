// TEMP — /audit gallery · Category 1: Buttons & controls
import React, { useState } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Tag } from "../../components/Tag";
import { Switch } from "../../components/Switch";
import { Section, Sub, Tile, Ctx, ModalMock, X } from "./shared";

// ad-hoc styles transcribed verbatim from the cited sources
const adhoc: Record<string, React.CSSProperties> = {
  ctaPrimaryEdit: { fontFamily: fonts.family.primary, fontSize: fonts.control.md, color: colors.neutral100,
    backgroundColor: colors.primary700, border: "none", borderRadius: radii.full, padding: "10px 20px", cursor: "pointer" },
  ctaSaveService: { backgroundColor: colors.neutral900, color: colors.neutral100, border: "none",
    borderRadius: radii.full, padding: `${spacing.xs} ${spacing.l}`, fontSize: fonts.size.s, fontWeight: fonts.weight.medium, fontFamily: fonts.family.primary, cursor: "pointer" },
  ctaGhostEdit: { fontFamily: fonts.family.primary, fontSize: fonts.control.md, color: colors.neutral900,
    background: "transparent", border: `1px solid ${colors.primary300}`, borderRadius: radii.full, padding: "10px 20px", cursor: "pointer" },
  ctaCancelLink: { border: "none", background: "transparent", color: colors.neutral700, fontSize: fonts.size.s,
    fontWeight: fonts.weight.medium, cursor: "pointer", padding: `${spacing.xs} ${spacing.m}`, textDecoration: "underline", fontFamily: fonts.family.primary },
  ctaArchiveLink: { fontFamily: fonts.family.primary, fontSize: fonts.control.md, fontWeight: fonts.weight.medium,
    color: colors.red100, background: "transparent", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" },
  closeCircle: { width: 28, height: 28, borderRadius: "50%", color: colors.neutral700, border: "none", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  closeSquare: { width: 28, height: 28, color: colors.neutral500, border: "none", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  closeGlyphM: { fontSize: fonts.size.m, color: colors.neutral900, border: "none", background: "transparent", cursor: "pointer" },
  close22: { fontSize: 22, color: "#666", border: "none", background: "transparent", cursor: "pointer" },
  sbStart: { height: 40, borderRadius: radii.full, background: colors.green200, color: colors.neutral100, border: "none", padding: "0 20px", cursor: "pointer", fontFamily: fonts.family.primary, fontSize: fonts.size.s },
  sbPause: { height: 40, borderRadius: radii.full, background: colors.yellow200, color: colors.neutral900, border: "none", padding: "0 20px", cursor: "pointer", fontFamily: fonts.family.primary, fontSize: fonts.size.s },
  sbStop: { height: 32, width: 32, borderRadius: radii.xs, background: colors.red100, color: colors.neutral100, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  sbIcon: { height: 32, width: 32, borderRadius: radii.xs, background: colors.neutralAlphaBlack, color: colors.neutral800, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  closeCircleCanon: { width: 32, height: 32, borderRadius: radii.full, color: colors.neutral700, border: "none", background: colors.neutralAlphaBlack, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: fonts.size.s },
};

// Base style for the small inline mock below (the removed-dangerLight demo).
const btnBase: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
  borderRadius: radii.full, borderWidth: 1.5, borderStyle: "solid",
  padding: "8px 16px", fontWeight: fonts.weight.regular, fontFamily: fonts.family.primary,
  height: "var(--btn-md-h)", fontSize: "var(--btn-fs)", cursor: "not-allowed", whiteSpace: "nowrap",
};

export function ButtonsCategory() {
  const [sw1, setSw1] = useState(true);
  const [sw2, setSw2] = useState(false);
  // The 6-variant set — now SHIPPED in the real Button component.
  const RESOLVED: { v: any; name: string; note: string }[] = [
    { v: "primary", name: "primary", note: "unchanged" },
    { v: "dark", name: "dark", note: "hover → neutral1000" },
    { v: "secondary", name: "secondary", note: "✅ merged · 700→800" },
    { v: "primaryLight", name: "primaryLight", note: "dormant · 0 uses · reserved" },
    { v: "secondaryLight", name: "secondaryLight", note: "unchanged" },
    { v: "light", name: "light", note: "unchanged" },
  ];
  return (
    <Section id="buttons" title="1 · Buttons & controls">
      <Sub title="BTN — canonical set · 6 variants · ✅ SHIPPED"
        note="The final set, now live in the real Button component: secondarySolid merged into secondary (700 → 800 on hover), dangerLight removed (its 8 Cancel buttons are now neutral 'light'). Toggle the theme to confirm primary / primaryLight / secondaryLight follow it.">
        {RESOLVED.map(({ v, name, note }) => (
          <Tile key={name} id={`BTN/${name}`} label={name} src={note} canonical>
            <Button variant={v}>Button</Button>
          </Tile>
        ))}
        <Tile id="BTN/sizes" label="sm · md · icon sizes" canonical>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Button size="sm">sm</Button><Button size="md">md</Button>
            <Button size="mdIcon" iconLeft={<span>＋</span>} />
          </div>
        </Tile>
      </Sub>

      <Sub title="BTN-disabled · ✅ SHIPPED — grey, legible, no stroke"
        note="Now live in the real Button: filled (primary/dark/secondary) → neutral200 fill + neutral500 text + no stroke; outline (primaryLight/secondaryLight/light) → neutral400 border + matching text. These are the REAL disabled buttons.">
        {RESOLVED.map(({ v, name }) => (
          <Tile key={name} id={`BTN-dis/${name}`} label={`${name} · disabled`} canonical>
            <Button variant={v} disabled>Button</Button>
          </Tile>
        ))}
      </Sub>

      <Sub title="BTN-responsive — scaling + the size scale · ✅ SHIPPED"
        note="Buttons step down one tier <1440 via --btn-* vars (fs 16→14); padding, radius, border, icon size stay fixed — resize via the viewport bar (try 1280) to see it. SHIPPED: sm 40/32 unchanged; md now 44/36 (+2px) for a real 4px gap. These are the REAL buttons.">
        <Tile id="BTN-sz/sm" label="sm · h40 (→32) — unchanged" src="32 usages"><Button size="sm">Small</Button></Tile>
        <Tile id="BTN-sz/md" label="md · h44 (→36) — +2px shipped" src="was 42/34" canonical><Button size="md">Medium</Button></Tile>
        <Tile id="BTN-sz/cmp" label="sm 40 vs md 44 — the 4px gap"><div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}><Button size="sm">sm</Button><Button size="md">md</Button></div></Tile>
      </Sub>

      <Sub title="Removed / merged — leaving the set"
        note="Shown only to record what changed. secondarySolid's look survives AS secondary; dangerLight is deleted and its Cancel / Nope buttons switch to neutral 'light' (the destructive confirm stays dark).">
        <Tile id="BTN-x/secondarySolid" label="secondarySolid → merged into 'secondary' ✓" src="done"><Button variant="secondary">Button</Button></Tile>
        <Tile id="BTN-x/dangerLight" label="dangerLight → REMOVED (Cancel → light)" src="8 sites repointed ✓"><button style={{ ...btnBase, color: colors.red200, borderColor: colors.red200, background: "transparent", cursor: "default", opacity: 0.6 }}>Cancel</button></Tile>
      </Sub>

      <Sub title="CTA — modal footers · ✅ IMPLEMENTED (CTA-CANON shipped)"
        note="✅ DONE: modal footers now use <Button variant='light'>Cancel + <Button variant='primary'>Save (CTA-CANON), with the 'Archive patient' underline link RETAINED. The CTA-1/2 rows below are the BEFORE (ad-hoc btnPrimary primary700 / neutral-dark saveBtn) — kept here for the record. Converted in EditPatient / AddReport / NewPrescription / AddService / Pharmacy / ImportData footers.">
        <Ctx id="CTA-1 · 3 · 5" where="Edit patient modal · 520px · Rx → patient name → Edit">
          <ModalMock width={520} title="Edit patient" subtitle="Demographics & contact"
            close={<button style={adhoc.closeGlyphM}><X /></button>}
            footer={<div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
              <button style={adhoc.ctaArchiveLink}>Archive patient</button>
              <div style={{ display: "flex", gap: spacing.s }}>
                <button style={adhoc.ctaGhostEdit}>Cancel</button>
                <button style={adhoc.ctaPrimaryEdit}>Save changes</button>
              </div></div>} />
        </Ctx>
        <Ctx id="CTA-2 · 4" where="Add service modal · 440px · Services → Add service">
          <ModalMock width={440} title="Add service" subtitle="Create a billable service"
            close={<button style={adhoc.closeSquare}><X /></button>}
            footer={<div style={{ display: "flex", gap: spacing.s, width: "100%", justifyContent: "flex-end" }}>
              <button style={adhoc.ctaCancelLink}>Cancel</button>
              <button style={adhoc.ctaSaveService}>Save</button></div>} />
        </Ctx>
        <Ctx id="CTA-CANON" canonical where="✅ SHIPPED — light Cancel + primary Save + real IconButton close. Optional left-side Archive link retained where used.">
          <ModalMock width={480} title="Any modal" subtitle="Consistent footer everywhere"
            close={<IconButton ariaLabel="Close" />}
            footer={<div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
              <button style={adhoc.ctaArchiveLink}>Archive patient</button>
              <div style={{ display: "flex", gap: spacing.s }}>
                <Button variant="light">Cancel</Button>
                <Button variant="primary">Save changes</Button></div></div>} />
        </Ctx>
      </Sub>

      <Sub title="CLOSE — the ✕ · ✅ IMPLEMENTED (shared IconButton everywhere)"
        note="✅ DONE: ~12 modal/panel close buttons across the app now use the shared <IconButton> (CLOSE-CANON — 32px circle, neutral700, hover tint). CLOSE-1…5 below are the BEFORE (circle / square / bare glyph / off-token #666) kept for the record. Chip-remove ✕ (Tag/Autocomplete) and field-clear ✕ were intentionally left — separate follow-up.">
        <Ctx id="CLOSE-1" where="Assistant panel · 340px · circle, neutral700 · ChatPanel.tsx:762">
          <ModalMock width={340} title="Assistant" close={<button style={adhoc.closeCircle}><X /></button>} />
        </Ctx>
        <Ctx id="CLOSE-2" where="Bill medicines modal · 1000px · square, neutral500 · BillMedicinesModal.tsx:576">
          <ModalMock width={1000} title="Bill & medicines" subtitle="Itemised receipt" close={<button style={adhoc.closeSquare}><X /></button>} />
        </Ctx>
        <Ctx id="CLOSE-3" where="Add service modal · 440px · square, neutral500 · AddServiceModal.styles.ts:40">
          <ModalMock width={440} title="Add service" close={<button style={adhoc.closeSquare}><X /></button>} />
        </Ctx>
        <Ctx id="CLOSE-4" where="Add report modal · 560px · bare glyph size.m, neutral900 · AddReportModal.tsx:491">
          <ModalMock width={560} title="Add report" close={<button style={adhoc.closeGlyphM}><X /></button>} />
        </Ctx>
        <Ctx id="CLOSE-5" where="AI SOAP draft · 560px · glyph 22px, #666 OFF-TOKEN · PrescriptionPage.tsx:3384">
          <ModalMock width={560} title="AI SOAP draft" close={<button style={adhoc.close22}>×</button>} />
        </Ctx>
        <Ctx id="CLOSE-CANON" canonical where="✅ SHIPPED — the real <IconButton> (components/IconButton), now used by every modal/panel close">
          <ModalMock width={480} title="Any modal" close={<IconButton ariaLabel="Close" />} />
        </Ctx>
      </Sub>

      <Sub title="SB — SessionBar controls, in the real bar"
        note="The live-consult bar. Start/Pause are h40 pills; Stop/restart are h32 radii.xs squares — neither matches the canonical icon-button size (40/42). The colours (green/yellow/red) are correct semantic tokens; only the sizing/radius is the drift. Compare the two bars.">
        <Ctx id="SB-start · pause · stop · icon" where="SessionBar · appears during an active consult">
          <div style={{ display: "flex", alignItems: "center", gap: spacing.s, background: colors.active.shade100, borderRadius: radii.xl, padding: `${spacing.s} ${spacing.m}`, width: 560, maxWidth: "100%" }}>
            <span style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.m, color: colors.neutral900 }}>Dr. Asha · 12:30</span>
            <div style={{ flex: 1 }} />
            <button style={adhoc.sbIcon}>↺</button>
            <button style={adhoc.sbStop}>■</button>
            <button style={adhoc.sbPause}>❚❚ Pause</button>
            <button style={adhoc.sbStart}>▶ Start</button>
          </div>
        </Ctx>
        <Ctx id="SB-vs" canonical where="Same bar with canonical buttons (icon 40/42 pill · primary CTA)">
          <div style={{ display: "flex", alignItems: "center", gap: spacing.s, background: colors.active.shade100, borderRadius: radii.xl, padding: `${spacing.s} ${spacing.m}`, width: 560, maxWidth: "100%" }}>
            <span style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.m, color: colors.neutral900 }}>Dr. Asha · 12:30</span>
            <div style={{ flex: 1 }} />
            <Button size="mdIcon" variant="light" iconLeft={<span>↺</span>} />
            <Button size="mdIcon" variant="dark" iconLeft={<span>■</span>} />
            <Button size="md" variant="primary">▶ Start</Button>
          </div>
        </Ctx>
      </Sub>

      <Sub title="TAG / SW — Tag & Switch (real components)"
        note="These are already shared components — confirm they're correct as-is (and note the Tag remove-✕ should reuse whatever canonical IconButton is chosen above).">
        <Tile id="TAG/outline" label="Tag — outline + remove" src="Tag.tsx" canonical><Tag label="Complaint" onRemove={() => {}} removeLabel="x" /></Tile>
        <Tile id="TAG/filled" label="Tag — filled + remove" src="Tag.tsx" canonical><Tag label="Cardiology" variant="filled" onRemove={() => {}} removeLabel="x" /></Tile>
        <Tile id="SW/md" label="Switch — md (on)" src="Switch.tsx" canonical><Switch checked={sw1} onChange={setSw1} /></Tile>
        <Tile id="SW/sm" label="Switch — sm (off)" src="Switch.tsx" canonical><Switch size="sm" checked={sw2} onChange={setSw2} /></Tile>
      </Sub>
    </Section>
  );
}
