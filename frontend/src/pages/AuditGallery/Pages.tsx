// TEMP — /audit gallery · Category 11: Pages that don't match
import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { Section, Sub, Ctx, Note } from "./shared";

// ──────────────────────────────────────────────────────────────────────────────
// Per-page conformance ratings. Three buckets:
//   on   — On-style (matches the app's look; minor nits are noted but pass)
//   warn — Drifting (mostly conformant but with off-token islands)
//   off  — Off-style (reuses ~zero shared components / hand-rolled palette)
// ──────────────────────────────────────────────────────────────────────────────
type Rating = "on" | "warn" | "off";

const RATING_STYLE: Record<Rating, { fg: string; bg: string; label: string }> = {
  on: { fg: colors.green200, bg: colors.greenAlpha10, label: "On-style" },
  warn: { fg: colors.yellow200, bg: colors.yellowAlpha10, label: "Drifting" },
  off: { fg: colors.red200, bg: colors.redAlpha10, label: "Off-style" },
};

interface PageRow {
  id: string;
  page: string;
  rating: Rating;
  reason: string;
  offender?: string;
}

const PAGE_ROWS: PageRow[] = [
  { id: "PAGE-stats", page: "Stats", rating: "on", reason: "Fully tokenized — 0 hex literals." },
  { id: "PAGE-ds", page: "DesignSystem", rating: "on", reason: "The reference page." },
  { id: "PAGE-login", page: "LoginPage", rating: "on", reason: "Reuses LoginCard; 1 documented backdrop hex." },
  { id: "PAGE-clinicsel", page: "ClinicSelectionPage", rating: "on", reason: "Delegates to ClinicCard." },
  { id: "PAGE-home", page: "Home", rating: "on", reason: "Shell + shared comps; hex are illustration.", offender: "HomePage.tsx:306 #666 (nit)" },
  { id: "PAGE-build", page: "BuildYourClinicPage", rating: "on", reason: "Composed from shared workspace comps." },
  { id: "PAGE-services", page: "Services", rating: "on", reason: "On-style (minor) — one off-token error red.", offender: "AddServiceModal.tsx:223 #b54040" },
  { id: "PAGE-files", page: "PatientFilesPage", rating: "on", reason: "On-style (minor) — 1 stray hex.", offender: "PatientFilesPage.tsx:741 #9a4a1c" },
  { id: "PAGE-settings", page: "Settings", rating: "on", reason: "Print subtree quarantined (buildPrintHtml.ts)." },
  { id: "PAGE-rx", page: "PrescriptionPage", rating: "warn", reason: "Shared PageHeader, but hand-rolls AI modal + amber banners off-token.", offender: "PrescriptionPage.tsx:3357-3396; .styles.ts:1758-1778" },
  { id: "PAGE-pharmacy", page: "Pharmacy", rating: "warn", reason: "Off-palette CSV-import drop zone.", offender: "PharmacyView.tsx:341-366" },
  { id: "PAGE-setup", page: "SetupPasswordPage", rating: "off", reason: "Reuses ZERO shared components; hand-rolled card/input/button; underline inputs; off-palette red.", offender: "SetupPasswordPage.tsx:111-178, :140, :271" },
];

// Colored rating chip ----------------------------------------------------------
const RatingChip = ({ rating }: { rating: Rating }) => {
  const r = RATING_STYLE[rating];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: spacing["3xs"],
        fontSize: 10,
        fontWeight: fonts.weight.bold,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        color: r.fg,
        background: r.bg,
        border: `${strokes.xs} solid ${r.fg}`,
        borderRadius: radii.full,
        padding: "2px 10px",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: radii.full, background: r.fg }} />
      {r.label}
    </span>
  );
};

// Inline conformance table (styled grid — no heavy import) ----------------------
const RatingTable = ({ rows }: { rows: PageRow[] }) => (
  <div
    style={{
      border: `${strokes.xs} solid ${colors.neutral200}`,
      borderRadius: radii.m,
      overflow: "hidden",
      background: colors.neutral100,
    }}
  >
    {/* header */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(120px, 1fr) 110px minmax(220px, 2.4fr) minmax(160px, 1.4fr)",
        gap: spacing.s,
        alignItems: "center",
        padding: `${spacing.xs} ${spacing.m}`,
        background: colors.neutral150,
        borderBottom: `${strokes.xs} solid ${colors.neutral200}`,
        fontSize: 10,
        fontWeight: fonts.weight.bold,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        color: colors.neutral600,
      }}
    >
      <span>Page</span>
      <span>Rating</span>
      <span>Reason</span>
      <span>Worst offender</span>
    </div>

    {/* rows */}
    {rows.map((row, i) => (
      <div
        key={row.id}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(120px, 1fr) 110px minmax(220px, 2.4fr) minmax(160px, 1.4fr)",
          gap: spacing.s,
          alignItems: "center",
          padding: `${spacing.s} ${spacing.m}`,
          borderBottom: i === rows.length - 1 ? "none" : `${strokes.xs} solid ${colors.neutral150}`,
          background: row.rating === "off" ? colors.redAlpha10 : colors.neutral100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, minWidth: 0 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: fonts.weight.bold,
              fontFamily: "monospace",
              color: colors.neutral700,
              background: colors.neutral150,
              borderRadius: radii.xs,
              padding: "1px 5px",
              whiteSpace: "nowrap",
            }}
          >
            {row.id}
          </span>
          <span style={{ fontSize: fonts.size.s, fontWeight: fonts.weight.semibold, color: colors.neutral900 }}>{row.page}</span>
        </div>
        <RatingChip rating={row.rating} />
        <span style={{ fontSize: fonts.size.xs, color: colors.neutral700, lineHeight: 1.45 }}>{row.reason}</span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "monospace",
            color: row.offender ? colors.neutral600 : colors.neutral400,
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {row.offender ?? "—"}
        </span>
      </div>
    ))}
  </div>
);

// Small label above each side-by-side mock half --------------------------------
const MockLabel = ({ kind }: { kind: "drift" | "canonical" }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: fonts.weight.bold,
      letterSpacing: 0.4,
      textTransform: "uppercase",
      color: kind === "drift" ? colors.red200 : colors.secondary700,
      marginBottom: spacing.xs,
    }}
  >
    {kind === "drift" ? "✕ drift (as shipped)" : "✓ canonical equivalent"}
  </div>
);

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: spacing.l,
      width: "100%",
      maxWidth: 760,
      alignItems: "stretch",
    }}
  >
    {children}
  </div>
);

const Half = ({ kind, children }: { kind: "drift" | "canonical"; children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <MockLabel kind={kind} />
    <div
      style={{
        flex: 1,
        background: colors.neutral100,
        border: `${strokes.xs} solid ${kind === "drift" ? colors.red200 : colors.secondary300}`,
        borderRadius: radii.m,
        padding: spacing.m,
      }}
    >
      {children}
    </div>
  </div>
);

// ── PAGE-setup mocks ──────────────────────────────────────────────────────────
// Drift: SetupPasswordPage.tsx underline input (borderBottom 1px, no box),
// border:none button, error in #e53935. Canonical: bordered Input box + pill
// Button + red200 error.
const SetupDriftMock = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: spacing.s }}>
    {/* underline input — borderBottom 1px solid neutral300, no box (line :140) */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: spacing.xs,
        borderBottom: `1px solid ${colors.neutral300}`,
        padding: spacing.xs,
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: radii.xs, background: colors.neutral200, flexShrink: 0 }} />
      <span style={{ fontSize: fonts.control.md, color: colors.neutral400, fontFamily: fonts.family.primary }}>Enter new password</span>
    </div>
    {/* off-palette error #e53935 (line :271) */}
    <span style={{ fontSize: fonts.control.sm, color: "#e53935", fontFamily: fonts.family.primary }}>
      Passwords don't match.
    </span>
    {/* hand-built button, border:none, radii.pill (lines :154-166) */}
    <button
      type="button"
      style={{
        backgroundColor: colors.secondary500,
        color: colors.neutral100,
        border: "none",
        borderRadius: radii.pill,
        padding: `${spacing.xs} ${spacing.m}`,
        height: 40,
        width: "100%",
        fontFamily: fonts.family.primary,
        fontSize: fonts.control.md,
        cursor: "pointer",
      }}
    >
      Update
    </button>
  </div>
);

const SetupCanonicalMock = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: spacing.s }}>
    {/* bordered Input-style box */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: spacing.xs,
        border: `${strokes.xs} solid ${colors.neutral300}`,
        borderRadius: radii.m,
        background: colors.neutral100,
        height: 40,
        padding: `0 ${spacing.s}`,
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: radii.xs, background: colors.neutral200, flexShrink: 0 }} />
      <span style={{ fontSize: fonts.control.md, color: colors.neutral400, fontFamily: fonts.family.primary }}>Enter new password</span>
    </div>
    {/* tokenized error red200 */}
    <span style={{ fontSize: fonts.control.sm, color: colors.red200, fontFamily: fonts.family.primary }}>
      Passwords don't match.
    </span>
    {/* pill Button */}
    <button
      type="button"
      style={{
        backgroundColor: colors.secondary500,
        color: colors.neutral100,
        border: `${strokes.xs} solid ${colors.secondary500}`,
        borderRadius: radii.full,
        padding: `${spacing.xs} ${spacing.m}`,
        height: 40,
        width: "100%",
        fontFamily: fonts.family.primary,
        fontSize: fonts.control.md,
        cursor: "pointer",
      }}
    >
      Update
    </button>
  </div>
);

// ── PAGE-pharmacy mocks ───────────────────────────────────────────────────────
// Drift: CSV drop zone with raw palette #bbb / #fafafa / #f1f8f3 / #2c6e49,
// raw fontSize 13. Canonical: tokenized neutrals + secondary accent.
const PharmacyDriftMock = () => (
  <div
    style={{
      border: `2px dashed #bbb`,
      borderRadius: 8,
      padding: 24,
      textAlign: "center",
      cursor: "pointer",
      background: "#fafafa",
      fontSize: 13,
      color: "#555",
    }}
  >
    <div style={{ fontWeight: 600, color: "#222" }}>Click to choose a CSV file</div>
    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>…or drag &amp; drop it here.</div>
  </div>
);

const PharmacyCanonicalMock = () => (
  <div
    style={{
      border: `${strokes.m} dashed ${colors.neutral300}`,
      borderRadius: radii.m,
      padding: spacing.xl,
      textAlign: "center",
      cursor: "pointer",
      background: colors.neutral150,
      fontSize: fonts.size.xs,
      color: colors.neutral700,
    }}
  >
    <div style={{ fontWeight: fonts.weight.semibold, color: colors.neutral900 }}>Click to choose a CSV file</div>
    <div style={{ fontSize: fonts.size.xs, color: colors.neutral600, marginTop: spacing["2xs"] }}>…or drag &amp; drop it here.</div>
  </div>
);

// ── PAGE-rx mocks ─────────────────────────────────────────────────────────────
// Drift: AI-SOAP modal — background #fff, borderRadius 12, fontSize 13/22,
// #666/#888 greys, #b54040 error. Canonical: tokenized modal shell.
const RxDriftMock = () => (
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      padding: 20,
      width: "100%",
      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>AI SOAP draft</h3>
      <button type="button" style={{ background: "none", border: "none", fontSize: 22, lineHeight: 1, cursor: "pointer", color: "#666" }}>×</button>
    </div>
    <p style={{ color: "#b54040", fontSize: 13, margin: 0 }}>AI unavailable: timeout</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
      <div style={{ minHeight: 32, padding: "8px 10px", background: "#fafafa", borderRadius: 6, fontSize: 13, color: "#888" }}>—</div>
      <p style={{ fontSize: 11, color: "#888", margin: 0 }}>AI-generated — review before applying.</p>
    </div>
  </div>
);

const RxCanonicalMock = () => (
  <div
    style={{
      background: colors.neutral100,
      borderRadius: radii.xl,
      padding: spacing.l,
      width: "100%",
      border: `${strokes.xs} solid ${colors.neutral200}`,
      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: spacing.s }}>
      <h3 style={{ margin: 0, fontSize: fonts.size.h6, fontFamily: fonts.family.secondary, color: colors.neutral900 }}>AI SOAP draft</h3>
      <button type="button" style={{ background: "none", border: "none", fontSize: 22, lineHeight: 1, cursor: "pointer", color: colors.neutral600 }}>×</button>
    </div>
    <p style={{ color: colors.red200, fontSize: fonts.size.xs, margin: 0 }}>AI unavailable: timeout</p>
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.s, marginTop: spacing.s }}>
      <div style={{ minHeight: 32, padding: `${spacing.xs} ${spacing.s}`, background: colors.neutral150, borderRadius: radii.s, fontSize: fonts.size.xs, color: colors.neutral500 }}>—</div>
      <p style={{ fontSize: fonts.size.caption, color: colors.neutral500, margin: 0 }}>AI-generated — review before applying.</p>
    </div>
  </div>
);

export function PagesCategory() {
  return (
    <Section id="pages" title="11 · Pages that don't match">
      <Note>
        Per-page conformance roll-up. Most pages are On-style because they compose shared components
        (LoginCard, ClinicCard, PageHeader, Input, Button, workspace primitives). Two pages drift via
        off-token islands, and one is fully hand-rolled. Sanctioned legacy islands — <code>radii.primary</code>{" "}
        on the Login / ClinicSelection cards and the Settings print stylesheet — are NOT counted as drift.
      </Note>

      <Sub
        title="Per-page conformance"
        note="One row per page. The worst-offender column points at the highest-priority drift to fix (file:line)."
      >
        <RatingTable rows={PAGE_ROWS} />
      </Sub>

      <Sub
        title="Worst-offender drift, in context"
        note="The 3 lowest-conforming pages, each showing the shipped drift next to its tokenized canonical equivalent."
      >
        <Ctx id="PAGE-setup" where="SetupPasswordPage.tsx — hand-rolled form (lines 111-178, :140 underline input, :271 error red)">
          <Pair>
            <Half kind="drift">
              <SetupDriftMock />
            </Half>
            <Half kind="canonical">
              <SetupCanonicalMock />
            </Half>
          </Pair>
        </Ctx>

        <Ctx id="PAGE-pharmacy" where="PharmacyView.tsx — CSV-import drop zone (lines 341-366)">
          <Pair>
            <Half kind="drift">
              <PharmacyDriftMock />
            </Half>
            <Half kind="canonical">
              <PharmacyCanonicalMock />
            </Half>
          </Pair>
        </Ctx>

        <Ctx id="PAGE-rx" where="PrescriptionPage.tsx — AI-SOAP modal (lines 3374-3396)">
          <Pair>
            <Half kind="drift">
              <RxDriftMock />
            </Half>
            <Half kind="canonical">
              <RxCanonicalMock />
            </Half>
          </Pair>
        </Ctx>
      </Sub>

      <Note>
        A full visual page review needs the live app (login wall + backend), so full pages can't render here —
        these mocks isolate the specific drift instead. Sanctioned legacy islands (<code>radii.primary</code> on the
        Login / ClinicSelection cards; the Settings print stylesheet) are NOT drift.
      </Note>
    </Section>
  );
}
