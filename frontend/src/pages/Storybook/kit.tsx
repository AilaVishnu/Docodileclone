// ══════════════════════════════════════════════════════════════════════════════
// Storybook — shared layout primitives.
// The ONE design-system reference. Every specimen renders the REAL component and
// every token reads from theme.ts / globals.css, so this page can't drift from
// production. Responsiveness facts come straight from globals.css (breakpoint
// 1440: ≥1440 = baseline, 1200–1439 = compact, 1200 = min supported width).
// ══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";

export const Section = ({ id, title, tldr, children }:
  { id: string; title: string; tldr?: React.ReactNode; children: React.ReactNode }) => (
  <section id={id} style={{ scrollMarginTop: 72, marginBottom: spacing["4xl"] }}>
    <h2 style={{ fontSize: fonts.size.h5, fontWeight: fonts.weight.semibold, color: colors.neutral900, margin: `0 0 ${spacing.xs} 0` }}>{title}</h2>
    {tldr && (
      <div style={{ fontSize: fonts.size.s, color: colors.neutral600, lineHeight: 1.55, maxWidth: 840,
        margin: `0 0 ${spacing.m} 0`, paddingBottom: spacing.m, borderBottom: `${strokes.xs} solid ${colors.neutral200}` }}>
        <b style={{ color: colors.neutral800 }}>TL;DR&nbsp;&nbsp;</b>{tldr}
      </div>
    )}
    {children}
  </section>
);

export const Sub = ({ title, note, children }:
  { title: string; note?: React.ReactNode; children: React.ReactNode }) => (
  <div style={{ margin: `${spacing.xl} 0` }}>
    <h3 style={{ fontSize: fonts.size.m, fontWeight: fonts.weight.semibold, color: colors.neutral800, margin: `0 0 ${spacing["3xs"]} 0` }}>{title}</h3>
    {note && <p style={{ fontSize: fonts.size.xs, color: colors.neutral600, margin: `0 0 ${spacing.s} 0`, maxWidth: 840, lineHeight: 1.5 }}>{note}</p>}
    {children}
  </div>
);

export const Row = ({ children, wrap = true, align = "center", gap = spacing.m }:
  { children: React.ReactNode; wrap?: boolean; align?: React.CSSProperties["alignItems"]; gap?: string }) => (
  <div style={{ display: "flex", flexWrap: wrap ? "wrap" : "nowrap", gap, alignItems: align }}>{children}</div>
);

export const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: fonts.size.xs, color: colors.neutral500, fontFamily: fonts.family.primary }}>{children}</div>
);

// One-line "when to use / canonical rule" caption.
export const Rule = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: fonts.size.xs, color: colors.neutral600, lineHeight: 1.5, maxWidth: 840, margin: `0 0 ${spacing.s} 0` }}>{children}</div>
);

// Import-path / token-name chip.
export const From = ({ children }: { children: React.ReactNode }) => (
  <code style={{ fontSize: 11, color: colors.neutral500, fontFamily: "monospace", background: colors.neutral150, borderRadius: radii.xs, padding: "1px 6px" }}>{children}</code>
);

// A neutral stage so a specimen sits on a real surface.
export const Stage = ({ children, bg = colors.neutral100, pad = spacing.l }:
  { children: React.ReactNode; bg?: string; pad?: string }) => (
  <div style={{ background: bg, border: `${strokes.xs} solid ${colors.neutral200}`, borderRadius: radii.m, padding: pad }}>{children}</div>
);

// Detail table — key / value rows (colour, padding, size, font…).
export const DetailTable = ({ rows }: { rows: [string, React.ReactNode][] }) => (
  <table style={{ borderCollapse: "collapse", fontSize: fonts.size.xs, fontFamily: fonts.family.primary, marginTop: spacing.s, minWidth: 300 }}>
    <tbody>
      {rows.map(([k, v], i) => (
        <tr key={i} style={{ borderBottom: `${strokes.xs} solid ${colors.neutral150}` }}>
          <td style={{ padding: "6px 16px 6px 0", color: colors.neutral500, whiteSpace: "nowrap", verticalAlign: "top" }}>{k}</td>
          <td style={{ padding: "6px 0", color: colors.neutral900, fontFamily: "monospace" }}>{v}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Responsiveness table — token / baseline (≥1440) / compact (1200–1439).
export const ResponsiveTable = ({ rows, caption }:
  { rows: [React.ReactNode, React.ReactNode, React.ReactNode][]; caption?: React.ReactNode }) => (
  <div style={{ marginTop: spacing.s, overflowX: "auto" }}>
    <table style={{ borderCollapse: "collapse", fontSize: fonts.size.xs, fontFamily: fonts.family.primary, minWidth: 440 }}>
      <thead>
        <tr style={{ borderBottom: `${strokes.s} solid ${colors.neutral200}` }}>
          <th style={{ textAlign: "left", padding: "6px 16px 6px 0", color: colors.neutral500, fontWeight: fonts.weight.medium }}>token</th>
          <th style={{ textAlign: "left", padding: "6px 16px", color: colors.neutral700, fontWeight: fonts.weight.semibold }}>≥ 1440 · baseline</th>
          <th style={{ textAlign: "left", padding: "6px 0", color: colors.neutral700, fontWeight: fonts.weight.semibold }}>1200–1439 · compact</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([t, a, b], i) => (
          <tr key={i} style={{ borderBottom: `${strokes.xs} solid ${colors.neutral150}` }}>
            <td style={{ padding: "6px 16px 6px 0", color: colors.neutral600, fontFamily: "monospace", whiteSpace: "nowrap" }}>{t}</td>
            <td style={{ padding: "6px 16px", color: colors.neutral900, fontFamily: "monospace" }}>{a}</td>
            <td style={{ padding: "6px 0", color: colors.neutral900, fontFamily: "monospace" }}>{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
    {caption && <div style={{ fontSize: 11, color: colors.neutral500, marginTop: spacing["2xs"], maxWidth: 780, lineHeight: 1.5 }}>{caption}</div>}
  </div>
);

// Two-column "specimen on the left, detail table on the right" layout.
export const Specimen = ({ children, details }: { children: React.ReactNode; details: React.ReactNode }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.xl, alignItems: "flex-start" }}>
    <div style={{ flex: "1 1 320px", minWidth: 280 }}>{children}</div>
    <div style={{ flex: "0 1 auto" }}>{details}</div>
  </div>
);

// Props/API table — the canonical per-component reference (Medium-depth template).
export const PropsTable = ({ rows }: { rows: { name: string; type: string; def?: React.ReactNode; desc: React.ReactNode }[] }) => (
  <div style={{ marginTop: spacing.s, overflowX: "auto" }}>
    <table style={{ borderCollapse: "collapse", fontSize: fonts.size.xs, fontFamily: fonts.family.primary, minWidth: 520, width: "100%" }}>
      <thead>
        <tr style={{ borderBottom: `${strokes.s} solid ${colors.neutral200}` }}>
          {["Prop", "Type", "Default", "Notes"].map((h, i) => (
            <th key={i} style={{ textAlign: "left", padding: "6px 16px 6px 0", color: colors.neutral500, fontWeight: fonts.weight.medium, whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderBottom: `${strokes.xs} solid ${colors.neutral150}`, verticalAlign: "top" }}>
            <td style={{ padding: "6px 16px 6px 0", color: colors.neutral900, fontFamily: "monospace", whiteSpace: "nowrap" }}>{r.name}</td>
            <td style={{ padding: "6px 16px 6px 0", color: colors.secondary700, fontFamily: "monospace", whiteSpace: "nowrap" }}>{r.type}</td>
            <td style={{ padding: "6px 16px 6px 0", color: colors.neutral500, fontFamily: "monospace", whiteSpace: "nowrap" }}>{r.def ?? "—"}</td>
            <td style={{ padding: "6px 0", color: colors.neutral600, lineHeight: 1.5 }}>{r.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// State / variant grid — each cell is a live specimen with a caption below it,
// so a component's states (default · hover · disabled · error…) and variants sit
// side by side on one neutral stage.
export const StateGrid = ({ items, bg = colors.neutral100, minCol = 150 }:
  { items: { label: React.ReactNode; node: React.ReactNode }[]; bg?: string; minCol?: number }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${minCol}px, 1fr))`, gap: spacing.m,
    background: bg, border: `${strokes.xs} solid ${colors.neutral200}`, borderRadius: radii.m, padding: spacing.l }}>
    {items.map((it, i) => (
      <div key={i} style={{ display: "flex", flexDirection: "column", gap: spacing.xs, alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", minHeight: 40 }}>{it.node}</div>
        <div style={{ fontSize: 11, color: colors.neutral500, fontFamily: fonts.family.primary }}>{it.label}</div>
      </div>
    ))}
  </div>
);
