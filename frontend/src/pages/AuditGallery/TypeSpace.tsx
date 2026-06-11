// TEMP — /audit gallery · Category 10: Typography / spacing
// Shows the canonical type / spacing / radii scales side-by-side with the
// OFF-scale usages found in the codebase, so a human can approve cleanup.
// Delete the whole AuditGallery folder when the review is done.
import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { Section, Sub, Note } from "./shared";

// ── inline helpers ───────────────────────────────────────────────────────────

// A monospace ID pill (canonical = green, off-scale = neutral).
const Pill = ({ id, canonical }: { id: string; canonical?: boolean }) => (
  <span style={{
    fontSize: 10, fontWeight: fonts.weight.bold, letterSpacing: 0.4, fontFamily: "monospace",
    color: canonical ? colors.secondary700 : colors.neutral700,
    background: canonical ? colors.secondary100 : colors.neutral150,
    borderRadius: radii.xs, padding: "1px 6px", whiteSpace: "nowrap",
  }}>{id}</span>
);

// A small framed card; canonical cards get a green border, off-scale get amber.
const Card = ({ canonical, children, minWidth = 200, maxWidth = 360 }: {
  canonical?: boolean; children: React.ReactNode; minWidth?: number; maxWidth?: number;
}) => (
  <div style={{
    display: "flex", flexDirection: "column", gap: spacing.xs, minWidth, maxWidth,
    border: `${strokes.xs} solid ${canonical ? colors.secondary300 : colors.primary500}`,
    borderRadius: radii.m, padding: spacing.s, background: colors.neutral100,
  }}>
    {children}
  </div>
);

// A single text specimen line. size/lineHeight accept CSS-var strings or px numbers.
const Specimen = ({
  size, weight = fonts.weight.regular, family = fonts.family.primary, lineHeight, text = "Adelina the crocodile · 0123",
}: {
  size: string | number; weight?: number; family?: string; lineHeight?: string | number; text?: string;
}) => (
  <div style={{
    fontSize: size, fontWeight: weight, fontFamily: family, lineHeight: lineHeight ?? 1.2,
    color: colors.neutral900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  }}>{text}</div>
);

// Caption line under a specimen / ruler.
const Cap = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: fonts.size.xs, color: colors.neutral800, fontWeight: fonts.weight.medium }}>{children}</div>
);
const Src = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 10, color: colors.neutral500, fontFamily: "monospace", lineHeight: 1.5 }}>{children}</div>
);

// A horizontal ruler bar of a given px width, labelled with its value.
const Ruler = ({ px, canonical, label }: { px: number; canonical?: boolean; label?: string }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 92 }}>
    <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
      <div style={{
        width: px, height: 16, borderRadius: radii["2xs"],
        background: canonical ? colors.secondary400 : colors.primary500,
        flex: "0 0 auto",
      }} />
      <span style={{ fontSize: fonts.size.xs, color: colors.neutral700, fontFamily: "monospace" }}>{px}px</span>
    </div>
    {label && <Src>{label}</Src>}
  </div>
);

// A rounded box demonstrating a radius value.
const RadiusBox = ({ px, canonical, label }: { px: number; canonical?: boolean; label?: string }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 96 }}>
    <div style={{
      width: 72, height: 56, borderRadius: px === 999 ? 999 : px,
      background: canonical ? colors.secondary100 : colors.primary200,
      border: `${strokes.s} solid ${canonical ? colors.secondary400 : colors.primary600}`,
    }} />
    <span style={{ fontSize: fonts.size.xs, color: colors.neutral700, fontFamily: "monospace" }}>{px === 999 ? "999 (full)" : `${px}px`}</span>
    {label && <Src>{label}</Src>}
  </div>
);

// ── data ─────────────────────────────────────────────────────────────────────

// Canonical type scale (1440 px design values, for the caption only).
const TYPE_SCALE: { id: string; name: string; size: string; lh: string; px: number }[] = [
  { id: "TYPE-1",  name: "h1",      size: fonts.size.h1,      lh: fonts.lineHeight.h1,      px: 60 },
  { id: "TYPE-2",  name: "h2",      size: fonts.size.h2,      lh: fonts.lineHeight.h2,      px: 48 },
  { id: "TYPE-3",  name: "h3",      size: fonts.size.h3,      lh: fonts.lineHeight.h3,      px: 40 },
  { id: "TYPE-4",  name: "h4",      size: fonts.size.h4,      lh: fonts.lineHeight.h4,      px: 32 },
  { id: "TYPE-5",  name: "h5",      size: fonts.size.h5,      lh: fonts.lineHeight.h5,      px: 24 },
  { id: "TYPE-6",  name: "h6",      size: fonts.size.h6,      lh: fonts.lineHeight.h6,      px: 20 },
  { id: "TYPE-7",  name: "l",       size: fonts.size.l,       lh: fonts.lineHeight.l,       px: 20 },
  { id: "TYPE-8",  name: "m",       size: fonts.size.m,       lh: fonts.lineHeight.m,       px: 16 },
  { id: "TYPE-9",  name: "s",       size: fonts.size.s,       lh: fonts.lineHeight.s,       px: 14 },
  { id: "TYPE-10", name: "xs",      size: fonts.size.xs,      lh: fonts.lineHeight.xs,      px: 12 },
  { id: "TYPE-11", name: "caption", size: fonts.size.caption, lh: fonts.lineHeight.caption, px: 11 },
];

// Canonical control sizes.
const CTRL_SCALE: { id: string; name: string; size: string; px: number }[] = [
  { id: "TYPE-12", name: "control.lg", size: fonts.control.lg, px: 18 },
  { id: "TYPE-13", name: "control.md", size: fonts.control.md, px: 16 },
  { id: "TYPE-14", name: "control.sm", size: fonts.control.sm, px: 14 },
  { id: "TYPE-15", name: "control.xs", size: fonts.control.xs, px: 12 },
];

// Off-scale font sizes found, each with its nearest canonical token + sites.
const TYPE_OFF: { id: string; px: number; nearest: string; sites: string[] }[] = [
  { id: "TYPE-16", px: 9,  nearest: "caption 11 / xs 12", sites: ["HeatmapCard.tsx:193"] },
  {
    id: "TYPE-17", px: 10, nearest: "caption 11 / xs 12",
    sites: [
      "HeatmapCard.tsx:210", "MyHoursCalendar.tsx:361", "StatsPage.tsx:1110",
      "EditPatientModal.tsx:736", "PrescriptionPage.styles.ts:186", "(×7 total)",
    ],
  },
  { id: "TYPE-18", px: 15, nearest: "m 16 / s 14", sites: ["ChatPanel.tsx:238"] },
  {
    id: "TYPE-19", px: 22, nearest: "h6 20 / h5 24",
    sites: [
      "charts.tsx:236", "Pharmacy.styles.ts:383", "AddReportModal.tsx:522",
      "PrescriptionPage.styles.ts:363", "PrescriptionPage.tsx:3384", "(×5 total)",
    ],
  },
];

// Canonical spacing px scale.
const SPACE_SCALE = [2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80];

// Off-scale spacing values, each with the two tokens it sits between + volume.
const SPACE_OFF: { id: string; px: number; between: string; count?: string }[] = [
  { id: "SPACE-1", px: 3,  between: "between 2 and 4" },
  { id: "SPACE-2", px: 5,  between: "between 4 and 8" },
  { id: "SPACE-3", px: 6,  between: "between 4 and 8", count: "×47" },
  { id: "SPACE-4", px: 7,  between: "between 4 and 8" },
  { id: "SPACE-5", px: 10, between: "between 8 and 12", count: "×56" },
  { id: "SPACE-6", px: 14, between: "between 12 and 16" },
  { id: "SPACE-7", px: 22, between: "between 20 and 24" },
  { id: "SPACE-8", px: 28, between: "between 24 and 32" },
  { id: "SPACE-9", px: 36, between: "between 32 and 40" },
];

// Canonical radii scale.
const RAD_SCALE = [2, 4, 6, 8, 10, 12, 16, 20, 999];

// Off-scale radii found, with sites.
const RAD_OFF: { id: string; px: number; sites: string }[] = [
  { id: "RAD-1", px: 3,  sites: "HeatmapCard:218, StatsPage:1569" },
  { id: "RAD-2", px: 9,  sites: "ChatPanel:884" },
  { id: "RAD-3", px: 24, sites: "AppointmentQueue:570, Pharmacy:152" },
  { id: "RAD-4", px: 40, sites: "BuildYourClinicPage:112" },
  { id: "RAD-5", px: 55, sites: "TopNav:87, Pharmacy:63, PatientFilesPage:986" },
];

// ── component ────────────────────────────────────────────────────────────────

export function TypeCategory() {
  return (
    <Section id="type" title="10 · Typography / spacing">
      <Note>
        Left of every off-scale row is the canonical token scale (green border, ✓). Off-scale
        usages get an amber border and list the file:line sites. Reviewer picks the nearest token
        for each.
      </Note>

      {/* ── TYPE-scale (canonical reference) ─────────────────────────────── */}
      <Sub
        title="Type scale — canonical reference"
        note="One specimen per fonts.size token (1440 px design value shown), then the four static control sizes. These are the reference; nothing here needs cleanup."
      >
        <Card canonical minWidth={520} maxWidth={760}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, marginBottom: spacing["3xs"] }}>
            <Pill id="TYPE-scale" canonical /><span style={{ fontSize: 10, color: colors.secondary700, fontWeight: fonts.weight.semibold }}>✓ canonical</span>
          </div>
          {TYPE_SCALE.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "baseline", gap: spacing.s, padding: "2px 0" }}>
              <Pill id={t.id} canonical />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Specimen size={t.size} lineHeight={t.lh} weight={t.name.startsWith("h") ? fonts.weight.semibold : fonts.weight.regular} />
              </div>
              <Cap>fonts.size.{t.name} · {t.px}px</Cap>
            </div>
          ))}
          <div style={{ height: strokes.xs, background: colors.secondary200, margin: `${spacing.xs} 0` }} />
          {CTRL_SCALE.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "baseline", gap: spacing.s, padding: "2px 0" }}>
              <Pill id={t.id} canonical />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Specimen size={t.size} />
              </div>
              <Cap>fonts.{t.name} · {t.px}px</Cap>
            </div>
          ))}
        </Card>
      </Sub>

      {/* ── TYPE-offsize ─────────────────────────────────────────────────── */}
      <Sub
        title="Off-scale font sizes"
        note="Hard-coded px font sizes that miss the scale. Each specimen is rendered at its raw px next to its nearest token candidate(s)."
      >
        {TYPE_OFF.map((o) => (
          <Card key={o.id}>
            <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
              <Pill id={o.id} /><span style={{ fontSize: 10, color: colors.primary700, fontWeight: fonts.weight.semibold }}>{o.px}px (off-scale)</span>
            </div>
            <div style={{
              minHeight: 44, display: "flex", alignItems: "center", padding: spacing.xs,
              borderRadius: radii.s, background: colors.primary100,
            }}>
              <Specimen size={o.px} />
            </div>
            <Cap>nearest token: {o.nearest}</Cap>
            <Src>{o.sites.join(", ")}</Src>
          </Card>
        ))}
      </Sub>

      {/* ── TYPE-weight ──────────────────────────────────────────────────── */}
      <Sub
        title="Font weight"
        note="fontWeight 300 is the only off-scale weight in the app. The sanctioned ladder is 400 / 500 / 600 / 700."
      >
        <Card minWidth={220}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
            <Pill id="TYPE-20" /><span style={{ fontSize: 10, color: colors.primary700, fontWeight: fonts.weight.semibold }}>weight 300 (off-scale)</span>
          </div>
          <div style={{ minHeight: 40, display: "flex", alignItems: "center", padding: spacing.xs, borderRadius: radii.s, background: colors.primary100 }}>
            <Specimen size={fonts.size.l} weight={300} text="Light 300" />
          </div>
          <Src>MemoBoard.tsx:433</Src>
        </Card>
        <Card canonical minWidth={260}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
            <Pill id="TYPE-21" canonical /><span style={{ fontSize: 10, color: colors.secondary700, fontWeight: fonts.weight.semibold }}>✓ canonical 400–700</span>
          </div>
          {([
            ["regular", fonts.weight.regular],
            ["medium", fonts.weight.medium],
            ["semibold", fonts.weight.semibold],
            ["bold", fonts.weight.bold],
          ] as [string, number][]).map(([name, w]) => (
            <div key={name} style={{ display: "flex", alignItems: "baseline", gap: spacing.s }}>
              <Specimen size={fonts.size.l} weight={w} text={`${w}`} />
              <Cap>{name}</Cap>
            </div>
          ))}
        </Card>
      </Sub>

      {/* ── TYPE-family ──────────────────────────────────────────────────── */}
      <Sub
        title="Font family"
        note="The two sanctioned families. Use fonts.family.* rather than hard-coded font stacks."
      >
        <Card canonical minWidth={260}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
            <Pill id="TYPE-22" canonical /><span style={{ fontSize: 10, color: colors.secondary700, fontWeight: fonts.weight.semibold }}>✓ primary</span>
          </div>
          <div style={{ minHeight: 44, display: "flex", alignItems: "center", padding: spacing.xs, borderRadius: radii.s, background: colors.primary100 }}>
            <Specimen size={fonts.size.h6} family={fonts.family.primary} text="Inter — Adelina 0123" />
          </div>
          <Cap>fonts.family.primary · Inter</Cap>
        </Card>
        <Card canonical minWidth={260}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
            <Pill id="TYPE-23" canonical /><span style={{ fontSize: 10, color: colors.secondary700, fontWeight: fonts.weight.semibold }}>✓ secondary</span>
          </div>
          <div style={{ minHeight: 44, display: "flex", alignItems: "center", padding: spacing.xs, borderRadius: radii.s, background: colors.primary100 }}>
            <Specimen size={fonts.size.h6} family={fonts.family.secondary} text="Libertinus — Adelina 0123" />
          </div>
          <Cap>fonts.family.secondary · Libertinus serif</Cap>
        </Card>
        <Note>
          Monospace appears only in the dev viewport bar + the home illustration (out of scope).
          Three files hard-code <code>'Inter, sans-serif'</code> instead of <code>fonts.family.primary</code>:
          SideNavItem:46, TextInput:106, PrescriptionPage:1935.
        </Note>
      </Sub>

      {/* ── SPACE-scale (canonical) ──────────────────────────────────────── */}
      <Sub
        title="Spacing scale — canonical reference"
        note="The fixed px spacing ladder (spacing.* tokens), drawn as labelled bars."
      >
        <Card canonical minWidth={520} maxWidth={760}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs }}>
            <Pill id="SPACE-scale" canonical /><span style={{ fontSize: 10, color: colors.secondary700, fontWeight: fonts.weight.semibold }}>✓ canonical</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"] }}>
            {SPACE_SCALE.map((px) => (
              <Ruler key={px} px={px} canonical />
            ))}
          </div>
        </Card>
      </Sub>

      {/* ── SPACE-offscale ───────────────────────────────────────────────── */}
      <Sub
        title="Off-scale spacing"
        note="Raw-px spacing assignments that fall between tokens. Each bar is drawn at its true width next to the gap it occupies so the in-between values are visible."
      >
        {SPACE_OFF.map((o) => (
          <Card key={o.id} minWidth={170} maxWidth={220}>
            <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
              <Pill id={o.id} />
              {o.count && <span style={{ fontSize: 10, color: colors.primary700, fontWeight: fonts.weight.bold }}>{o.count}</span>}
            </div>
            <div style={{ padding: `${spacing.xs} 0`, borderRadius: radii.s, background: colors.primary100, display: "flex", justifyContent: "center" }}>
              <Ruler px={o.px} />
            </div>
            <Cap>{o.between}</Cap>
          </Card>
        ))}
        <Note>
          High volume: 721 raw-px spacing assignments total across the app, densest in Stats /
          Prescription / Pharmacy. The two worst offenders are 6px (×47) and 10px (×56).
        </Note>
      </Sub>

      {/* ── RAD-scale + RAD-offscale ─────────────────────────────────────── */}
      <Sub
        title="Radii scale — canonical reference"
        note="The radii.* token scale as rounded boxes."
      >
        <Card canonical minWidth={520} maxWidth={760}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs }}>
            <Pill id="RAD-scale" canonical /><span style={{ fontSize: 10, color: colors.secondary700, fontWeight: fonts.weight.semibold }}>✓ canonical</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.s }}>
            {RAD_SCALE.map((px) => (
              <RadiusBox key={px} px={px} canonical />
            ))}
          </div>
        </Card>
      </Sub>

      <Sub
        title="Off-scale radii"
        note="Corner radii that miss the token scale, drawn as rounded boxes with their sites."
      >
        {RAD_OFF.map((o) => (
          <Card key={o.id} minWidth={140} maxWidth={200}>
            <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
              <Pill id={o.id} /><span style={{ fontSize: 10, color: colors.primary700, fontWeight: fonts.weight.semibold }}>{o.px}px</span>
            </div>
            <div style={{ padding: spacing.xs, borderRadius: radii.s, background: colors.primary100, display: "flex", justifyContent: "center" }}>
              <RadiusBox px={o.px} />
            </div>
            <Src>{o.sites}</Src>
          </Card>
        ))}
      </Sub>
    </Section>
  );
}
