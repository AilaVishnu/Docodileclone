// ══════════════════════════════════════════════════════════════════════════════
// TEMP — /audit gallery · Category 8: Icons
//
// Headline: 3 PARALLEL ICON SYSTEMS coexist —
//   (1) SVGR-imported .svg assets   (2) a shared React component (<ChevronDown>)
//   (3) inline-redrawn <svg> glyphs hand-copied into feature files.
// Plus: 9+ duplicate assets (incl. one BYTE-IDENTICAL pair), ~11 dead files,
// 11 baked-colour SVGs that can't theme, ad-hoc sizes 9–32px, and "24px" that
// lives only as a comment in theme.ts — never an enforced token.
//
// This file only RENDERS what already exists in the repo so a human can judge
// what to consolidate. Delete the whole AuditGallery folder when review is done.
// ══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { Section, Sub, Tile, Note } from "./shared";

// ── (system 1) real SVGR assets — confirmed to exist via `ls assets/icons` ──
import { ReactComponent as ChevronUp } from "../../assets/icons/chevron-up.svg";
import { ReactComponent as CircleOutline } from "../../assets/icons/circle-outline.svg";
import { ReactComponent as CircleOutline2 } from "../../assets/icons/circle-outline-2.svg";
import { ReactComponent as ChevronDownDark } from "../../assets/icons/chevron-down-dark.svg";
import { ReactComponent as ChevronDownLight } from "../../assets/icons/chevron-down-light.svg";
import { ReactComponent as Restart } from "../../assets/icons/restart.svg";
import { ReactComponent as Restart24 } from "../../assets/icons/restart-24.svg";
import { ReactComponent as BillCheck } from "../../assets/icons/bill-check.svg";
import { ReactComponent as BillCheckSmall } from "../../assets/icons/bill-check-small.svg";
import { ReactComponent as UsersGroup } from "../../assets/icons/users-group.svg";
import { ReactComponent as UsersGroupRounded } from "../../assets/icons/users-group-rounded.svg";
import { ReactComponent as Star } from "../../assets/icons/star.svg";
import { ReactComponent as Trash } from "../../assets/icons/trash.svg";
import { ReactComponent as User } from "../../assets/icons/user.svg";
import { ReactComponent as Plus } from "../../assets/icons/plus.svg";

// ── (system 2) the one real shared component — takes size/open/color ──
import { ChevronDown } from "../../components/icons/ChevronDown";

// Dead (unreferenced anywhere outside this audit) asset files proposed for deletion.
const DEAD_FILES = [
  "circle-outline.svg",
  "circle-outline-2.svg",
  "chevron-down-dark.svg",
  "chevron-down-light.svg",
  "bill-check-small.svg",
  "users-group-rounded.svg",
  "horizontal-line-short-2.svg",
  "vertical-line-tall.svg",
  "stethoscope-cup.svg",
  "paid-stamp.svg",
  "curved-connector.svg",
];

const mono: React.CSSProperties = { fontFamily: "monospace", fontSize: 10, color: colors.neutral500 };

// A neutral wrapper so SVGR assets that *do* use currentColor inherit a colour.
const Ink = ({ color, children }: { color?: string; children: React.ReactNode }) => (
  <span style={{ color: color ?? colors.neutral800, display: "inline-flex", alignItems: "center" }}>{children}</span>
);

export function IconsCategory() {
  return (
    <Section id="icons" title="8 · Icons">
      <Note>
        Three parallel icon systems live in the app at once: <strong>(1)</strong> SVGR-imported{" "}
        <code style={mono}>.svg</code> assets, <strong>(2)</strong> one shared React component
        (<code style={mono}>&lt;ChevronDown&gt;</code>), and <strong>(3)</strong> inline <code style={mono}>&lt;svg&gt;</code>
        {" "}glyphs hand-redrawn directly inside feature files. The asset folder holds 9+ duplicate
        glyphs — including one <strong>byte-identical</strong> pair (md5 match) — and ~11 dead files.
        11 assets bake a hex colour so they ignore <code style={mono}>color</code>; sizes range 9–32px
        with no enforced standard. The "Icon sizes → Static (24px)" line in <code style={mono}>theme.ts</code>
        {" "}is only a comment, never a token. Proposed fix: one <code style={mono}>&lt;Icon name size color&gt;</code>
        {" "}at 24px default + <code style={mono}>currentColor</code>, normalize every asset to
        {" "}<code style={mono}>viewBox 0 0 24 24</code>, delete the dead files.
      </Note>

      {/* ─────────────────────────── ICON-dups ─────────────────────────── */}
      <Sub
        title="ICON-dups · duplicate asset files"
        note="Same glyph shipped two (or more) ways. Render side by side at the same box so the duplication is obvious. UNUSED = dead file (delete); LIVE = referenced in a real screen."
      >
        <Tile id="ICON-dups-1a" label="circle-outline.svg" src="UNUSED · md5 333769…">
          <Ink color={colors.neutral500}><CircleOutline width={24} height={24} /></Ink>
        </Tile>
        <Tile id="ICON-dups-1b" label="circle-outline-2.svg" src="UNUSED · BYTE-IDENTICAL ⇒ delete">
          <Ink color={colors.neutral500}><CircleOutline2 width={24} height={24} /></Ink>
        </Tile>

        <Tile id="ICON-dups-2a" label="chevron-down-dark.svg" src="UNUSED · baked #202020">
          <ChevronDownDark width={24} height={24} />
        </Tile>
        <Tile id="ICON-dups-2b" label="chevron-down-light.svg" src="UNUSED · same path, baked #C7C7C7">
          <ChevronDownLight width={24} height={24} />
        </Tile>

        <Tile id="ICON-dups-3a" label="restart.svg" src="LIVE · 18px, no stroke-width">
          <Ink><Restart width={24} height={24} /></Ink>
        </Tile>
        <Tile id="ICON-dups-3b" label="restart-24.svg" src="LIVE · 24px, stroke-width 1.5">
          <Ink><Restart24 width={24} height={24} /></Ink>
        </Tile>

        <Tile id="ICON-dups-4a" label="bill-check.svg" src="24px source">
          <Ink><BillCheck width={24} height={24} /></Ink>
        </Tile>
        <Tile id="ICON-dups-4b" label="bill-check-small.svg" src="UNUSED · 20px redraw">
          <Ink><BillCheckSmall width={24} height={24} /></Ink>
        </Tile>

        <Tile id="ICON-dups-5a" label="users-group.svg" src="20px · baked #EDCA99 fills">
          <Ink color={colors.red100}><UsersGroup width={24} height={24} /></Ink>
        </Tile>
        <Tile id="ICON-dups-5b" label="users-group-rounded.svg" src="UNUSED · 24px · currentColor">
          <Ink color={colors.red100}><UsersGroupRounded width={24} height={24} /></Ink>
        </Tile>
      </Sub>
      <Note>
        ICON-dups-1a/1b are <strong>md5-identical</strong> (<code style={mono}>333769454e2ea2…</code>) — pure
        copy. ICON-dups-2a/2b share one path string; the only difference is a baked stroke hex, which is exactly
        what a <code style={mono}>color</code> prop should carry. ICON-dups-5: the red wrapper proves the point —
        the rounded variant follows <code style={mono}>currentColor</code>, the original stays peach because its
        fills are hardcoded.
      </Note>

      {/* ─────────────────────────── ICON-chevron ─────────────────────────── */}
      <Sub
        title="ICON-chevron · the down-chevron drawn 3 ways"
        note="One glyph, three independent implementations across the codebase. They drift on stroke width, colour and geometry."
      >
        <Tile id="ICON-chevron-1" label="<ChevronDown> component" src="components/icons/ChevronDown.tsx" canonical>
          <ChevronDown size={24} color={colors.neutral800} />
        </Tile>
        <Tile id="ICON-chevron-2" label="inline <svg> polyline" src="EditPatientModal.tsx:33 (hand-redrawn)">
          {/* literal copy of the inline redraw — same polyline, separate source of truth */}
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.neutral800}
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </Tile>
        <Tile id="ICON-chevron-3" label="chevron-up.svg rotated 180°" src="assets/icons/chevron-up.svg">
          <Ink color={colors.neutral800}>
            <ChevronUp width={24} height={24} style={{ transform: "rotate(180deg)" }} />
          </Ink>
        </Tile>
      </Sub>
      <Note>
        Three sources for one affordance: the shared component (✓ canonical candidate — already used by every
        header selector chip), a hand-pasted <code style={mono}>polyline</code> in EditPatientModal, and an
        up-asset flipped with a transform. Note chevron-up.svg uses <code style={mono}>stroke-width 1.5</code>
        {" "}while the component/inline use <code style={mono}>2</code> — they don't even match visually.
      </Note>

      {/* ─────────────────────────── ICON-close ─────────────────────────── */}
      <Sub
        title="ICON-close · the ✕ hand-drawn 4 ways"
        note="No close-icon asset exists, so every modal/panel redraws ✕ inline. Same glyph, four different paths/sizes/stroke widths."
      >
        <Tile id="ICON-close-1" label='path "M18 6L6 18M6 6l12 12"' src="AddServiceModal · BillMedicinesModal">
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.neutral700}
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </Tile>
        <Tile id="ICON-close-2" label='path "M18 6L6 18" (half)' src="ChatPanel.tsx (only one diagonal)">
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.neutral700}
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" />
          </svg>
        </Tile>
        <Tile id="ICON-close-3" label="two crossed <line>s" src="ad-hoc lines variant">
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.neutral700}
            strokeWidth={1.5} strokeLinecap="round">
            <line x1={6} y1={6} x2={18} y2={18} />
            <line x1={18} y1={6} x2={6} y2={18} />
          </svg>
        </Tile>
        <Tile id="ICON-close-4" label="Tag's ✕ (text glyph)" src="Tag chip · unicode character">
          <span style={{ fontSize: 18, lineHeight: 1, color: colors.neutral700, fontWeight: fonts.weight.medium }}>✕</span>
        </Tile>
      </Sub>
      <Note>
        ICON-close-2 is a real bug surfaced by the audit: ChatPanel's close only draws one diagonal
        (<code style={mono}>"M18 6L6 18"</code>) — it renders as a <em>slash</em>, not an ✕. One canonical asset
        would have prevented it.
      </Note>

      {/* ─────────────────────────── ICON-size ─────────────────────────── */}
      <Sub
        title="ICON-size · one icon at the ad-hoc sizes actually used"
        note="The same trash.svg rendered at the literal sizes found across the app. theme.ts says 'Icon sizes → Static (24px)' but it's a comment, not a token — nothing enforces it."
      >
        {[12, 16, 18, 20, 24, 32].map((s) => (
          <Tile
            key={s}
            id={`ICON-size-${s}`}
            label={`${s}px`}
            src={s === 24 ? "the only 'spec' size" : "ad-hoc in the wild"}
            canonical={s === 24}
          >
            <Ink color={colors.neutral800}><Trash width={s} height={s} /></Ink>
          </Tile>
        ))}
      </Sub>

      {/* ─────────────────────────── ICON-color ─────────────────────────── */}
      <Sub
        title="ICON-color · baked hex vs currentColor (parent color: red)"
        note="Each sample sits inside a parent with color: red. A baked-colour asset ignores it; a currentColor asset follows it. 11 assets in the folder bake their colour and can never be themed."
      >
        <Tile id="ICON-color-1" label="star.svg — stroke #202020" src="baked · ignores parent">
          <span style={{ color: colors.red100 }}><Star width={24} height={24} /></span>
        </Tile>
        <Tile id="ICON-color-2" label="trash.svg — #202020 + #1C274C" src="baked (two hexes!) · ignores parent">
          <span style={{ color: colors.red100 }}><Trash width={24} height={24} /></span>
        </Tile>
        <Tile id="ICON-color-3" label="user.svg — fill #DFB400" src="baked · ignores parent">
          <span style={{ color: colors.red100 }}><User width={24} height={24} /></span>
        </Tile>
        <Tile id="ICON-color-4" label="plus.svg — currentColor" src="follows parent ✓" canonical>
          <span style={{ color: colors.red100 }}><Plus width={24} height={24} /></span>
        </Tile>
      </Sub>
      <Note>
        Samples 1–3 stay black/yellow despite <code style={mono}>color: red</code>; only plus.svg
        (<code style={mono}>currentColor</code>) turns red. trash.svg is the worst case — it bakes{" "}
        <em>two different</em> hexes (<code style={mono}>#202020</code> and a stray{" "}
        <code style={mono}>#1C274C</code>), so it can never be a single themeable colour.
      </Note>

      {/* ─────────────────────────── ICON-CANON ─────────────────────────── */}
      <Sub
        title="ICON-CANON · proposed single <Icon name size color />"
        note="One component, one registry. Default 24px, currentColor by default so it themes for free; every asset normalized to viewBox 0 0 24 24. Below: the same glyphs rendered the canonical way."
      >
        <Tile id="ICON-CANON-1" label='<Icon name="chevron-down" />' src="size=24, currentColor (default)" canonical>
          <ChevronDown size={24} color={colors.neutral800} />
        </Tile>
        <Tile id="ICON-CANON-2" label='<Icon name="users" />' src="single users asset, themeable" canonical>
          <Ink color={colors.secondary600}><UsersGroupRounded width={24} height={24} /></Ink>
        </Tile>
        <Tile id="ICON-CANON-3" label='<Icon name="restart" />' src="one size, normalized box" canonical>
          <Ink color={colors.secondary600}><Restart24 width={24} height={24} /></Ink>
        </Tile>
        <Tile id="ICON-CANON-4" label='<Icon name="plus" color="…" />' src="currentColor inherits" canonical>
          <span style={{ color: colors.secondary600 }}><Plus width={24} height={24} /></span>
        </Tile>
      </Sub>
      <Note>
        Migration: collapse the duplicate pairs to one asset each, convert the {DEAD_FILES.length} dead files
        out of the build, replace every inline ✕ / chevron redraw with the shared component, and rewrite the 11
        baked-colour assets to <code style={mono}>currentColor</code> on a <code style={mono}>0 0 24 24</code> box.
        <br />
        <strong>Dead files proposed for deletion ({DEAD_FILES.length}):</strong>{" "}
        <code style={mono}>{DEAD_FILES.join("  ·  ")}</code>
      </Note>
    </Section>
  );
}
