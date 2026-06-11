// TEMP — /audit gallery · Category 9: Colors outside tokens
import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { Section, Sub, Note } from "./shared";

// ── inline primitives ────────────────────────────────────────────────────────
// A single colour chip with a label underneath. `value` is the literal/token
// value to paint; everything else is caption text rendered below the swatch.
const Swatch = ({
  value,
  name,
  sub,
  count,
  sites,
  border,
}: {
  value: string;
  name: string;
  sub?: string;
  count?: number;
  sites?: string;
  border?: boolean;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: spacing["3xs"], minWidth: 110, maxWidth: 150 }}>
    <div
      style={{
        height: 56,
        borderRadius: radii.s,
        background: value,
        border: border ? `${strokes.xs} solid ${colors.neutral300}` : `${strokes.xs} solid ${colors.neutral200}`,
      }}
    />
    <div style={{ fontSize: 11, fontWeight: fonts.weight.semibold, color: colors.neutral800, fontFamily: "monospace" }}>
      {name}
      {typeof count === "number" && count > 1 && (
        <span style={{ color: colors.neutral500, fontWeight: fonts.weight.regular }}> ×{count}</span>
      )}
    </div>
    {sub && <div style={{ fontSize: 10, color: colors.neutral600, fontFamily: "monospace" }}>{sub}</div>}
    {sites && <div style={{ fontSize: 10, color: colors.neutral500, lineHeight: 1.4 }}>{sites}</div>}
  </div>
);

// A "map OFF-TOKEN → TOKEN" approval card: off-token swatch on the left, an
// arrow, and the proposed token swatch on the right.
const Pair = ({
  id,
  off,
  token,
}: {
  id: string;
  off: { value: string; name: string; count?: number; sites?: string; border?: boolean };
  token: { value: string; name: string; sub?: string; border?: boolean };
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: spacing.xs,
      border: `${strokes.xs} solid ${colors.neutral200}`,
      borderRadius: radii.m,
      padding: spacing.s,
      background: colors.neutral100,
    }}
  >
    <span
      style={{
        alignSelf: "flex-start",
        fontSize: 10,
        fontWeight: fonts.weight.bold,
        letterSpacing: 0.4,
        color: colors.neutral700,
        background: colors.neutral150,
        borderRadius: radii.xs,
        padding: "1px 6px",
        fontFamily: "monospace",
      }}
    >
      {id}
    </span>
    <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
      <Swatch value={off.value} name={off.name} count={off.count} sites={off.sites} border={off.border} />
      <span style={{ fontSize: fonts.size.l, color: colors.neutral500, fontWeight: fonts.weight.bold }}>→</span>
      <Swatch value={token.value} name={token.name} sub={token.sub ?? token.value} border={token.border} />
    </div>
  </div>
);

// Warning-banner mock used by the amber sub (off-token vs proposed token).
const Banner = ({
  bg,
  border,
  text,
  label,
  caption,
}: {
  bg: string;
  border: string;
  text: string;
  label: string;
  caption: string;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], minWidth: 240, maxWidth: 320 }}>
    <div
      style={{
        background: bg,
        border: `${strokes.xs} solid ${border}`,
        borderRadius: radii.m,
        color: text,
        padding: `${spacing.xs} ${spacing.s}`,
        fontSize: fonts.size.s,
        fontWeight: fonts.weight.medium,
        fontFamily: fonts.family.primary,
      }}
    >
      ⚠ Some reports could not be saved.
    </div>
    <div style={{ fontSize: 11, fontWeight: fonts.weight.semibold, color: colors.neutral800 }}>{label}</div>
    <div style={{ fontSize: 10, color: colors.neutral600, fontFamily: "monospace", lineHeight: 1.5 }}>{caption}</div>
  </div>
);

// Field mock used by the invalid-field sub.
const FieldMock = ({
  fill,
  label,
  caption,
}: {
  fill: string;
  label: string;
  caption: string;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], minWidth: 220, maxWidth: 300 }}>
    <input
      readOnly
      value="07700 900000"
      style={{
        height: 40,
        borderRadius: radii.m,
        border: `${strokes.xs} solid ${colors.red100}`,
        background: fill,
        color: colors.neutral900,
        padding: `0 ${spacing.s}`,
        fontSize: fonts.size.s,
        fontFamily: fonts.family.primary,
        outline: "none",
      }}
    />
    <div style={{ fontSize: 11, fontWeight: fonts.weight.semibold, color: colors.neutral800 }}>{label}</div>
    <div style={{ fontSize: 10, color: colors.neutral600, fontFamily: "monospace", lineHeight: 1.5 }}>{caption}</div>
  </div>
);

export function ColorsCategory() {
  return (
    <Section id="colors" title="9 · Colors outside tokens">
      <Note>
        Each card shows an OFF-TOKEN colour found in the codebase (hex + usage count + a site or two) next to the nearest
        existing token it should map to. Approve a row to mean “replace the literal with this token”.
      </Note>

      {/* ── CLR-grey ─────────────────────────────────────────────────────── */}
      <Sub
        title="Off-token grey ramp → neutral*"
        note="Hand-typed greys scattered across PharmacyView.tsx:341-366, PrescriptionPage.tsx:3357-3396 and HomePage.tsx:306. Each maps to its nearest neutral token."
      >
        <Pair
          id="CLR-grey-1"
          off={{ value: "#222222", name: "#222", sites: "PrescriptionPage.tsx:3357" }}
          token={{ value: colors.neutral900, name: "neutral900" }}
        />
        <Pair
          id="CLR-grey-2"
          off={{ value: "#444444", name: "#444", sites: "PrescriptionPage.tsx:3370" }}
          token={{ value: colors.neutral800, name: "neutral800" }}
        />
        <Pair
          id="CLR-grey-3"
          off={{ value: "#555555", name: "#555", sites: "HomePage.tsx:306" }}
          token={{ value: colors.neutral700, name: "neutral700" }}
        />
        <Pair
          id="CLR-grey-4"
          off={{ value: "#666666", name: "#666", count: 7, sites: "PharmacyView.tsx:341, PrescriptionPage.tsx:3388" }}
          token={{ value: colors.neutral600, name: "neutral600" }}
        />
        <Pair
          id="CLR-grey-5"
          off={{ value: "#888888", name: "#888", count: 3, sites: "PrescriptionPage.tsx:3396" }}
          token={{ value: colors.neutral500, name: "neutral500" }}
        />
        <Pair
          id="CLR-grey-6"
          off={{ value: "#999999", name: "#999", sites: "PharmacyView.tsx:352" }}
          token={{ value: colors.neutral500, name: "neutral500" }}
        />
        <Pair
          id="CLR-grey-7"
          off={{ value: "#AAAAAA", name: "#AAA", sites: "PharmacyView.tsx:360" }}
          token={{ value: colors.neutral400, name: "neutral400" }}
        />
        <Pair
          id="CLR-grey-8"
          off={{ value: "#BBBBBB", name: "#BBB", sites: "PrescriptionPage.tsx:3392" }}
          token={{ value: colors.neutral300, name: "neutral300 / 400", sub: "≈ #C7C7C7 / #ABABAB" }}
        />
        <Pair
          id="CLR-grey-9"
          off={{ value: "#FAFAFA", name: "#FAFAFA", sites: "PharmacyView.tsx:341", border: true }}
          token={{ value: colors.neutral150, name: "neutral150", border: true }}
        />
      </Sub>

      {/* ── CLR-amber ────────────────────────────────────────────────────── */}
      <Sub
        title="Off-token amber warning → yellow*"
        note="Two warning banners hand-rolled with literal amber palettes. Proposed: a single tokenized banner using yellowAlpha10 fill / yellow200 border / neutral900 text."
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.l, alignItems: "flex-start" }}>
          <Banner
            bg="#FFF3CD"
            border="#FFEAA7"
            text="#856404"
            label="CLR-amber-1 · off-token"
            caption={"AddReportModal.tsx:656\nbg #FFF3CD · border #FFEAA7 · text #856404"}
          />
          <Banner
            bg="#FFF8E6"
            border="#F5C842"
            text="#B07C00"
            label="CLR-amber-2 · off-token"
            caption={"PrescriptionPage.styles.ts:1758\nbg #FFF8E6 · border #F5C842 · text #B07C00"}
          />
          <Banner
            bg={colors.yellowAlpha10}
            border={colors.yellow200}
            text={colors.neutral900}
            label="CLR-amber-3 · ✓ proposed token"
            caption={"yellowAlpha10 · yellow200 (#DFB400) · neutral900 (#202020)"}
          />
        </div>
      </Sub>

      {/* ── CLR-red ──────────────────────────────────────────────────────── */}
      <Sub
        title="Off-token clinical reds → red100/200"
        note="Assorted error/danger reds. Map the brighter ones to red100 (#FB3748) and the deeper ones to red200 (#D00416)."
      >
        <Pair
          id="CLR-red-1"
          off={{ value: "#E53E3E", name: "#E53E3E", sites: "FileViewer.tsx:35" }}
          token={{ value: colors.red100, name: "red100" }}
        />
        <Pair
          id="CLR-red-2"
          off={{ value: "#E53935", name: "#E53935", sites: "SetupPasswordPage.tsx:271" }}
          token={{ value: colors.red100, name: "red100" }}
        />
        <Pair
          id="CLR-red-3"
          off={{ value: "#C0392B", name: "#C0392B", sites: "PopoverMenu.tsx:133" }}
          token={{ value: colors.red200, name: "red200" }}
        />
        <Pair
          id="CLR-red-4"
          off={{
            value: "#B54040",
            name: "#B54040",
            count: 3,
            sites: "AddServiceModal:223, PrescriptionPage:3388, PharmacyView:366",
          }}
          token={{ value: colors.red200, name: "red200" }}
        />
      </Sub>

      {/* ── CLR-invalidfill ──────────────────────────────────────────────── */}
      <Sub
        title="Invalid-field tint → colors.redAlpha10"
        note="Invalid form fields are tinted with a literal rgba(255,0,0,0.05) in 7 places. colors.redAlpha10 is the same kind of tint — the two mocks below should look identical, which is exactly the point: use the token."
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.l, alignItems: "flex-start" }}>
          <FieldMock
            fill="rgba(255,0,0,0.05)"
            label="CLR-invalidfill-1 · off-token"
            caption={"literal rgba(255,0,0,0.05) ×7\nTextInput.styles.ts:33, BookAppointment.tsx:649, …"}
          />
          <FieldMock
            fill={colors.redAlpha10}
            label="CLR-invalidfill-2 · ✓ proposed token"
            caption={"colors.redAlpha10\nrgba(251,55,72,0.1)"}
          />
        </div>
      </Sub>

      {/* ── CLR-green ────────────────────────────────────────────────────── */}
      <Sub
        title="Pharmacy CSV greens → secondary*/green200"
        note="The pharmacy CSV summary uses two greens that aren't in the palette at all (PharmacyView.tsx:341-366). Closest existing tokens are the secondary olive ramp and green200."
      >
        <Pair
          id="CLR-green-1"
          off={{ value: "#2C6E49", name: "#2C6E49", sites: "PharmacyView.tsx:344 (text)" }}
          token={{ value: colors.secondary600, name: "secondary600", sub: "#6C8145 · or green200 #1FC16B" }}
        />
        <Pair
          id="CLR-green-2"
          off={{ value: "#F1F8F3", name: "#F1F8F3", sites: "PharmacyView.tsx:341 (fill)", border: true }}
          token={{ value: colors.secondary50, name: "secondary50", sub: "#F1F6E7", border: true }}
        />
        <Pair
          id="CLR-green-3"
          off={{ value: "#2C6E49", name: "#2C6E49", sites: "PharmacyView.tsx:366 (accent)" }}
          token={{ value: colors.green200, name: "green200", sub: "#1FC16B" }}
        />
      </Sub>

      <Note>
        Excluded as intentionally literal: illustration / art files (HomeView, MedIllustration, StaffIllustration,
        StaffWindow, MemoBoard) and the print stylesheet (buildPrintHtml.ts). Their expressive hex values are by design,
        not token drift.
      </Note>
    </Section>
  );
}
