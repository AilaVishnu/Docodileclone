// ══════════════════════════════════════════════════════════════════════════════
// TEMP — shared layout primitives for the /audit gallery. Every category file
// imports these so the look + the ID/caption convention stay consistent.
// Delete the whole AuditGallery folder when the review is done.
//
// CONVENTION
//  • <Section id title> — one audit dimension. id must match the CATS nav id.
//  • <Sub title note?>  — a sub-group; children flow in a wrapping row.
//  • <Tile id label src? canonical?> — a compact side-by-side swatch (sample
//      centred on a primary100 chip). Use for pure primitives.
//  • <Ctx id where canonical?> — a FULL-WIDTH context row: the variant rendered
//      inside its real container, on a dimmed backdrop, with a "lives in" caption.
//      Use whenever scale / surroundings matter (close buttons, footers, cards…).
//  • <ModalMock width title subtitle? close footer?> — a faithful modal shell at
//      a real px width; drop a real close button / footer into it.
//  • <X s?> — a ✕ glyph.
// Each tile/row needs a stable ID (e.g. "INP-3"); reuse the IDs in chat verdicts.
// ══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";

export const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} style={{ scrollMarginTop: 84, marginBottom: spacing["4xl"] }}>
    <h2 style={{ fontSize: fonts.size.h5, fontWeight: fonts.weight.semibold, color: colors.neutral900,
      margin: `0 0 ${spacing.s} 0`, paddingBottom: spacing.xs, borderBottom: `${strokes.s} solid ${colors.neutral200}` }}>
      {title}
    </h2>
    {children}
  </section>
);

export const Sub = ({ title, note, children }: { title: string; note?: React.ReactNode; children: React.ReactNode }) => (
  <div style={{ margin: `${spacing.xl} 0` }}>
    <h3 style={{ fontSize: fonts.size.m, fontWeight: fonts.weight.semibold, color: colors.neutral800, margin: `0 0 ${spacing["3xs"]} 0` }}>{title}</h3>
    {note && <p style={{ fontSize: fonts.size.xs, color: colors.neutral600, margin: `0 0 ${spacing.s} 0`, maxWidth: 820, lineHeight: 1.5 }}>{note}</p>}
    <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.m, alignItems: "stretch" }}>{children}</div>
  </div>
);

export const Tile = ({ id, label, src, canonical, children }:
  { id: string; label: string; src?: string; canonical?: boolean; children: React.ReactNode }) => (
  <div style={{
    display: "flex", flexDirection: "column", gap: spacing.xs, minWidth: 150, maxWidth: 300,
    border: `${strokes.xs} solid ${canonical ? colors.secondary300 : colors.neutral200}`,
    borderRadius: radii.m, padding: spacing.s, background: colors.neutral100,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: spacing["2xs"], flexWrap: "wrap" }}>
      <span style={{
        fontSize: 10, fontWeight: fonts.weight.bold, letterSpacing: 0.4,
        color: canonical ? colors.secondary700 : colors.neutral700,
        background: canonical ? colors.secondary100 : colors.neutral150,
        borderRadius: radii.xs, padding: "1px 6px", fontFamily: "monospace",
      }}>{id}</span>
      {canonical && <span style={{ fontSize: 10, color: colors.secondary700, fontWeight: fonts.weight.semibold }}>✓ canonical</span>}
    </div>
    <div style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: 64, padding: spacing.s, borderRadius: radii.s, background: colors.primary100,
    }}>{children}</div>
    <div style={{ fontSize: fonts.size.xs, color: colors.neutral800, fontWeight: fonts.weight.medium }}>{label}</div>
    {src && <div style={{ fontSize: 10, color: colors.neutral500, fontFamily: "monospace" }}>{src}</div>}
  </div>
);

export const X = ({ s }: { s?: React.CSSProperties }) => <span style={s}>✕</span>;

export const ModalMock = ({ width, title, subtitle, close, footer }:
  { width: number; title: string; subtitle?: string; close: React.ReactNode; footer?: React.ReactNode }) => (
  <div style={{ width, maxWidth: "100%", background: colors.neutral100, borderRadius: radii["2xl"],
    border: `${strokes.xs} solid ${colors.neutral200}`, boxShadow: "0 12px 40px rgba(0,0,0,0.12)", overflow: "hidden", textAlign: "left" }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.m, padding: `${spacing.m} ${spacing.l} ${spacing.s}` }}>
      <div>
        <div style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h6, color: colors.neutral900, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: fonts.size.xs, color: colors.neutral500, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {close}
    </div>
    <div style={{ padding: `0 ${spacing.l} ${spacing.m}` }}>
      <div style={{ height: 8, background: colors.neutral150, borderRadius: 4, width: "85%", marginBottom: 8 }} />
      <div style={{ height: 8, background: colors.neutral150, borderRadius: 4, width: "55%" }} />
    </div>
    {footer && <div style={{ borderTop: `${strokes.xs} solid ${colors.neutral200}`, padding: `${spacing.s} ${spacing.l}`, display: "flex", width: "100%" }}>{footer}</div>}
  </div>
);

export const Ctx = ({ id, where, canonical, children }:
  { id: string; where: string; canonical?: boolean; children: React.ReactNode }) => (
  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: spacing.xs, padding: spacing.s,
    border: `${strokes.xs} dashed ${canonical ? colors.secondary300 : colors.neutral300}`, borderRadius: radii.m, marginBottom: spacing.s, background: colors.neutral100 }}>
    <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, flexWrap: "wrap" }}>
      <span style={{ fontSize: 10, fontWeight: fonts.weight.bold, letterSpacing: 0.4, fontFamily: "monospace",
        color: canonical ? colors.secondary700 : colors.neutral700, background: canonical ? colors.secondary100 : colors.neutral150, borderRadius: radii.xs, padding: "1px 6px" }}>{id}</span>
      {canonical && <span style={{ fontSize: 10, color: colors.secondary700, fontWeight: fonts.weight.semibold }}>✓ proposed canonical</span>}
      <span style={{ fontSize: fonts.size.xs, color: colors.neutral600 }}>{where}</span>
    </div>
    <div style={{ background: colors.neutral200, borderRadius: radii.m, padding: spacing.xl, display: "flex", justifyContent: "center" }}>
      {children}
    </div>
  </div>
);

// A simple titled band to separate sub-areas inside a category (optional).
export const Note = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: fonts.size.xs, color: colors.neutral600, margin: `0 0 ${spacing.s} 0`, maxWidth: 820, lineHeight: 1.5 }}>{children}</p>
);
