// TEMP — /audit gallery · Category 3: Dropdowns / selects
// Faithful static reproductions of every open-menu surface + trigger box in the
// app. Each menu's style object is transcribed verbatim from its real source
// (cited under each Ctx). Off-token literals (shadow strings, "12px" radius,
// "#c0392b") are reproduced AS literals — that divergence is the whole point.
//
// HEADLINE: the canonical Select menu disagrees with every other menu. There is
// no `shadows` token, so each surface ships its own shadow string — 8+ variants
// across the app (4 distinct ones appear right here). Borders, radii, hover and
// selected colors all diverge too.
import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { Section, Sub, Tile, Ctx, Note } from "./shared";

// ── tiny chevron glyph (no real icon import) ───────────────────────────────────
const Chevron = ({ rotated, size = 16, color = colors.neutral700 }:
  { rotated?: boolean; size?: number; color?: string }) => (
  <span style={{
    display: "inline-flex", width: size, height: size, alignItems: "center",
    justifyContent: "center", color, transition: "transform 0.2s ease",
    transform: rotated ? "rotate(180deg)" : "rotate(0deg)", lineHeight: 1,
  }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

// A trigger button (so the menu has something to hang off of in each Ctx).
const Trigger = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ position: "relative", width: 240, ...style }}>{children}</div>
);

export function DropdownsCategory() {
  return (
    <Section id="dropdowns" title="3 · Dropdowns / selects">
      <Note>
        Every open dropdown panel below is a verbatim transcription of its real{" "}
        <code style={mono}>menu</code> style object. The proposed canonical
        (MENU-select, the Select component's own menu) is the OUTLIER: it is the
        only one with <em>no border</em> and a <code style={mono}>2px 2px 12px</code>{" "}
        offset shadow, while ~22 files use a 1px primary300 border + a centred{" "}
        <code style={mono}>0 4px 16px</code> shadow. There is no{" "}
        <code style={mono}>shadows</code> token — 4 distinct shadow strings appear
        in just these four menus, and 8+ exist app-wide. Borders, radii (m=8 vs the
        literal 12px), hover (neutral150 vs active.shade100/200 vs primary100) and
        selected (neutral200 vs primary100+primary700) all disagree.
      </Note>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MENUS — side by side so border / shadow / hover / selected diverge.   */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <Sub
        title="Open menu panels — 4 surfaces, 4 shadows, 0 shared border rule"
        note="Each is rendered as trigger + open panel with ~4 items (one hovered, one selected) so the full surface is visible. Compare the borders and drop shadows."
      >
        {/* MENU-select — CANONICAL CANDIDATE but the OUTLIER */}
        <Ctx id="MENU-select" where="Select.styles.ts:106-120 — canonical Select menu (the OUTLIER: no border, offset shadow)" canonical>
          <Trigger>
            <SelectTriggerBox open label="Amoxicillin 500mg" />
            <div style={selectMenu}>
              <SelectItem>Paracetamol 500mg</SelectItem>
              <SelectItem hovered>Ibuprofen 400mg</SelectItem>
              <SelectItem selected>Amoxicillin 500mg</SelectItem>
              <SelectItem>Cetirizine 10mg</SelectItem>
            </div>
          </Trigger>
        </Ctx>

        {/* MENU-primary — the primary300 panel used by ~22 files */}
        <Ctx id="MENU-primary" where="Autocomplete.tsx:127 + PopoverMenu.tsx:92 — the primary300 panel (~22 files)">
          <Trigger>
            <PlainTriggerBox open label="Family history" />
            <div style={primaryMenu}>
              <PrimaryItem>Diabetes</PrimaryItem>
              <PrimaryItem hovered>Hypertension</PrimaryItem>
              <PrimaryItem>Asthma</PrimaryItem>
              <PrimaryItem>Thyroid disorder</PrimaryItem>
            </div>
          </Trigger>
        </Ctx>

        {/* MENU-underline — UnderlineSelect, literal 12px radius + 0 4px 20px shadow */}
        <Ctx id="MENU-underline" where='UnderlineSelect.tsx:86-132 — borderRadius "12px" literal, shadow 0 4px 20px, hover active.shade200'>
          <Trigger>
            <UnderlineTriggerBox open label="June 2026" />
            <div style={underlineMenu}>
              <UnderlineItem>April 2026</UnderlineItem>
              <UnderlineItem>May 2026</UnderlineItem>
              <UnderlineItem hovered>June 2026</UnderlineItem>
              <UnderlineItem>July 2026</UnderlineItem>
            </div>
          </Trigger>
        </Ctx>

        {/* MENU-picker — Dosage/Duration/Frequency/When picker menu */}
        <Ctx id="MENU-picker" where="DosagePicker.tsx:198-232 (== When/Frequency) — primary300 border, selected primary100 + primary700 text">
          <Trigger>
            <PickerTriggerBox open label="When" />
            <div style={pickerMenu}>
              <PickerItem>Before Food</PickerItem>
              <PickerItem hovered>After Food</PickerItem>
              <PickerItem selected>Before Breakfast</PickerItem>
              <PickerItem>Empty Stomach</PickerItem>
            </div>
          </Trigger>
        </Ctx>
      </Sub>

      <Note>
        <strong>Off-token callout — PopoverMenu destructive item</strong>: the
        "destructive" action (Delete / Remove) hard-codes{" "}
        <code style={{ ...mono, color: "#c0392b" }}>#c0392b</code> for its text
        (PopoverMenu.tsx:133) — a one-off red that is in no palette. The token red
        is <code style={{ ...mono, color: colors.red200 }}>red200 {colors.red200}</code>.
        Shown in context:
      </Note>
      <Ctx id="MENU-destructive" where="PopoverMenu.tsx:53-133 — destructive item color literal #c0392b (off-token)">
        <Trigger style={{ width: 200 }}>
          <PlainTriggerBox open label="⋯ Actions" />
          <div style={{ ...primaryMenu, minWidth: 180 }}>
            <PrimaryItem>Edit details</PrimaryItem>
            <PrimaryItem>Duplicate</PrimaryItem>
            <PrimaryItem hovered>Move to…</PrimaryItem>
            <PrimaryItem destructive>Delete patient</PrimaryItem>
          </div>
        </Trigger>
      </Ctx>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TRIGGERS — the closed boxes + chevron-rotation convention clash.       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <Sub
        title="Trigger boxes (closed) — 3 conventions, including an inverted chevron"
        note="Select chevron rotates 180° when OPEN; the WhenPicker chevron rotates 180° when CLOSED (inverted). Native <select> ships the OS arrow."
      >
        <Tile id="TRIG-select" label="Select trigger — 1px neutral300, radii.m, active→neutral900" src="Select.styles.ts:16-103" canonical>
          <div style={{ width: 200 }}><SelectTriggerBox label="Select medicine" placeholder /></div>
        </Tile>

        <Tile id="TRIG-select-active" label="…hover/open: border + arrow → neutral900" src="Select.styles.ts:39-42">
          <div style={{ width: 200 }}><SelectTriggerBox label="Amoxicillin 500mg" open /></div>
        </Tile>

        <Tile id="TRIG-picker" label="Picker trigger — primary100 box, height 40 hardcoded, INVERTED chevron" src="WhenPicker.tsx:50, 83-94">
          <div style={{ width: 200 }}><PickerTriggerBox label="When" /></div>
        </Tile>

        <Tile id="TRIG-native" label="Real <select> — appearance:auto, native OS arrow" src="PharmacyView.tsx:671 / :519-526">
          <NativeSelect />
        </Tile>
      </Sub>

      <Note>
        <strong>Chevron convention clash:</strong> TRIG-select points the chevron{" "}
        <em>down when closed</em> and rotates it 180° (up) on open — the usual
        convention. TRIG-picker (WhenPicker.tsx:50) uses a chevron-UP asset and
        rotates it 180° (down) <em>when CLOSED</em>, i.e. the inverse, so the two
        components animate in opposite directions for the same open/close action.
      </Note>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MENU-CANON — one proposed unified surface.                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <Sub
        title="Proposed unified menu surface"
        note="One border (1px neutral200), one radius (radii.m=8), ONE shadow token (the single 0 4px 16px we'd promote to a `shadows.menu` token), one hover (neutral150), one selected (active.shade100). Drops the offset/blur-20/12px-radius variants."
      >
        <Ctx id="MENU-CANON" where="proposed — single shadows.menu token + radii.m + neutral200 border + neutral150 hover + active.shade100 selected" canonical>
          <Trigger>
            <SelectTriggerBox open label="Amoxicillin 500mg" />
            <div style={canonMenu}>
              <CanonItem>Paracetamol 500mg</CanonItem>
              <CanonItem hovered>Ibuprofen 400mg</CanonItem>
              <CanonItem selected>Amoxicillin 500mg</CanonItem>
              <CanonItem>Cetirizine 10mg</CanonItem>
            </div>
          </Trigger>
        </Ctx>
      </Sub>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TRIGGER BOXES
// ════════════════════════════════════════════════════════════════════════════

// Select trigger — Select.styles.ts container/containerActive. height var(--input-h).
function SelectTriggerBox({ label, open, placeholder }: { label: string; open?: boolean; placeholder?: boolean }) {
  const active = open || !placeholder; // filled or open → neutral900 border/arrow
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: spacing.xs, padding: `0 ${spacing.xs}`,
      border: `${strokes.xs} solid ${active ? colors.neutral900 : colors.neutral300}`,
      borderRadius: radii.m, backgroundColor: colors.neutral100,
      height: "var(--input-h, 40px)", width: "100%", position: "relative",
      cursor: "pointer", boxSizing: "border-box",
      color: active ? colors.neutral900 : colors.neutral300,
    }}>
      <span style={{
        flex: 1, fontFamily: fonts.family.primary, fontSize: fonts.control.md,
        color: placeholder ? colors.neutral400 : colors.neutral900,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{label}</span>
      <Chevron rotated={open} color="currentColor" size={24} />
    </div>
  );
}

// A generic neutral300 trigger box used to anchor the primary/popover menus.
function PlainTriggerBox({ label, open }: { label: string; open?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: spacing.xs, padding: `0 ${spacing.xs}`,
      border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m,
      backgroundColor: colors.neutral100, height: 40, width: "100%",
      boxSizing: "border-box", cursor: "pointer", color: colors.neutral700,
    }}>
      <span style={{
        flex: 1, fontFamily: fonts.family.primary, fontSize: fonts.control.sm,
        color: colors.neutral900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{label}</span>
      <Chevron rotated={open} />
    </div>
  );
}

// UnderlineSelect "chip" variant trigger — 1px primary400, radii.m, serif/sans.
function UnderlineTriggerBox({ label, open }: { label: string; open?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none",
      backgroundColor: "transparent", border: `1px solid ${colors.primary400}`,
      borderRadius: radii.m, padding: "4px 12px",
    }}>
      <span style={{
        fontFamily: fonts.family.primary, fontSize: fonts.size.h4,
        fontWeight: fonts.weight.semibold, color: colors.neutral900,
      }}>{label}</span>
      {/* UnderlineSelect uses <ChevronDown open={isOpen}/> — points up when open. */}
      <Chevron rotated={open} />
    </span>
  );
}

// Picker trigger (WhenPicker.styles.trigger) — primary100 box, height 40 hardcoded,
// chevron-UP asset rotated 180° when CLOSED (the inverted convention).
function PickerTriggerBox({ label, open }: { label: string; open?: boolean }) {
  return (
    <div style={{
      position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
      height: 40, borderRadius: radii.m, overflow: "hidden", cursor: "pointer",
      backgroundColor: colors.primary100, padding: `0 ${spacing.m}`, width: "100%", boxSizing: "border-box",
    }}>
      <span style={{
        fontFamily: fonts.family.primary, fontSize: fonts.control.sm,
        color: label === "When" ? colors.neutral400 : colors.neutral900,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center",
      }}>{label}</span>
      <span style={{
        position: "absolute", right: spacing.xs, display: "flex", alignItems: "center",
        justifyContent: "center", color: colors.neutral700, lineHeight: 1,
      }}>
        {/* chevron-up asset: rotate(180) when CLOSED, rotate(0) when OPEN — inverted vs Select */}
        <span style={{ transform: open ? "rotate(0deg)" : "rotate(180deg)", display: "inline-flex" }}>
          <Chevron size={16} />
        </span>
      </span>
    </div>
  );
}

// Real native <select> — appearance:auto so the OS draws the arrow (PharmacyView ms.selectInput).
function NativeSelect() {
  return (
    <select
      defaultValue="amox"
      style={{
        width: 200, height: 35, boxSizing: "border-box", padding: `0 ${spacing.s}`,
        border: `1px solid ${colors.neutral300}`, borderRadius: radii.m,
        backgroundColor: colors.neutral150, fontFamily: fonts.family.primary,
        fontSize: fonts.control.sm, color: colors.neutral900, outline: "none",
        appearance: "auto", WebkitAppearance: "auto" as React.CSSProperties["WebkitAppearance"],
      }}
    >
      <option value="para">Paracetamol 500mg</option>
      <option value="ibu">Ibuprofen 400mg</option>
      <option value="amox">Amoxicillin 500mg</option>
    </select>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MENU PANEL STYLES (transcribed verbatim) + their item rows
// ════════════════════════════════════════════════════════════════════════════

// In the real app these menus float (position:absolute). In the gallery we
// render them IN-FLOW (stacked under the trigger) so each row contains its own
// open menu and they don't overlap the rows below — the surface styling (border,
// radius, shadow, item states) is what we're auditing, not the floating behavior.
const menuBase: React.CSSProperties = {
  position: "relative", marginTop: 4, width: "100%",
  backgroundColor: colors.neutral100, overflowY: "auto",
};

// MENU-select — Select.styles.ts:106-120. NO border. offset shadow. radii.m. pad 4px.
const selectMenu: React.CSSProperties = {
  ...menuBase,
  borderRadius: radii.m,
  boxShadow: "2px 2px 12px rgba(0,0,0,0.08)",
  maxHeight: 220,
  padding: spacing["2xs"], // 4px
};
function SelectItem({ children, hovered, selected }: { children: React.ReactNode; hovered?: boolean; selected?: boolean }) {
  return (
    <div style={{
      padding: `${spacing["2xs"]} ${spacing.xs}`, // 4/8
      minHeight: 28, display: "flex", alignItems: "center", gap: spacing.xs,
      cursor: "pointer", borderRadius: radii.m,
      fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral900,
      backgroundColor: selected ? colors.neutral200 : hovered ? colors.neutral150 : "transparent",
    }}>{children}</div>
  );
}

// MENU-primary — Autocomplete.tsx:127 / PopoverMenu.tsx:92. 1px primary300. 0 4px 16px.
const primaryMenu: React.CSSProperties = {
  ...menuBase, minWidth: 200,
  border: `${strokes.xs} solid ${colors.primary300}`,
  borderRadius: radii.m,
  padding: spacing["2xs"],
  display: "flex", flexDirection: "column",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  zIndex: 1000,
};
function PrimaryItem({ children, hovered, destructive }: { children: React.ReactNode; hovered?: boolean; destructive?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: spacing.xs, width: "100%", textAlign: "left",
      padding: `${spacing.xs} ${spacing.s}`, cursor: "pointer",
      fontFamily: fonts.family.primary, fontSize: fonts.size.s,
      // PopoverMenu destructive item hard-codes #c0392b (off-token).
      color: destructive ? "#c0392b" : colors.neutral900,
      borderRadius: radii.xs, whiteSpace: "nowrap",
      // Autocomplete/PopoverMenu hover = active.shade100 (consumers also use primary100).
      backgroundColor: hovered ? colors.active.shade100 : "transparent",
    }}>{children}</div>
  );
}

// MENU-underline — UnderlineSelect.tsx:86-132. literal 12px radius, 0 4px 20px shadow, 10px16px items.
const underlineMenu: React.CSSProperties = {
  ...menuBase, right: "auto",
  backgroundColor: colors.neutral100,
  borderRadius: "12px", // literal — off-token (radii has no 12 except radii.xl=12; used as string here)
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  zIndex: 1000, minWidth: "200px", maxHeight: "260px",
  padding: "12px 8px", display: "flex", flexDirection: "column", gap: "4px",
};
function UnderlineItem({ children, hovered }: { children: React.ReactNode; hovered?: boolean }) {
  return (
    <div style={{
      padding: "10px 16px", cursor: "pointer", borderRadius: "8px", // literal radius too
      fontFamily: fonts.family.primary, fontSize: fonts.size.s, color: colors.neutral900,
      // hover = active.shade200 (set via onMouseEnter in source)
      backgroundColor: hovered ? colors.active.shade200 : "transparent",
    }}>{children}</div>
  );
}

// MENU-picker — DosagePicker/WhenPicker. same shell as primary; selected = primary100 + primary700.
const pickerMenu: React.CSSProperties = {
  ...menuBase, minWidth: 200,
  border: `${strokes.xs} solid ${colors.primary300}`,
  borderRadius: radii.m,
  padding: spacing["2xs"],
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  zIndex: 1200, display: "flex", flexDirection: "column", gap: 2, maxHeight: 220,
};
function PickerItem({ children, hovered, selected }: { children: React.ReactNode; hovered?: boolean; selected?: boolean }) {
  return (
    <div style={{
      width: "100%", textAlign: "left", padding: `${spacing.xs} ${spacing.s}`,
      fontSize: fonts.control.sm, fontFamily: fonts.family.primary,
      color: selected ? colors.primary700 : colors.neutral900,
      cursor: "pointer", borderRadius: radii.xs,
      // hover sets primary100 via onMouseEnter; selected = primary100 bg + primary700 text.
      backgroundColor: selected ? colors.primary100 : hovered ? colors.primary100 : "transparent",
    }}>{children}</div>
  );
}

// MENU-CANON — proposed unified surface.
const canonMenu: React.CSSProperties = {
  ...menuBase,
  border: `${strokes.xs} solid ${colors.neutral200}`,
  borderRadius: radii.m,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)", // the one shadow we'd promote to shadows.menu
  padding: spacing["2xs"],
  maxHeight: 220,
};
function CanonItem({ children, hovered, selected }: { children: React.ReactNode; hovered?: boolean; selected?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: spacing.xs, width: "100%",
      padding: `${spacing.xs} ${spacing.s}`, minHeight: 28, cursor: "pointer",
      borderRadius: radii.s, fontFamily: fonts.family.primary, fontSize: fonts.control.sm,
      color: colors.neutral900,
      backgroundColor: selected ? colors.active.shade200 : hovered ? colors.active.shade100 : "transparent",
    }}>{children}</div>
  );
}

const mono: React.CSSProperties = {
  fontFamily: "monospace", fontSize: 11, background: colors.neutral150,
  borderRadius: radii.xs, padding: "1px 4px",
};
