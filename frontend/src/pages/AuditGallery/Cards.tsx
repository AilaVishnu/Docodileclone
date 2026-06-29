// TEMP — /audit gallery · Category 6: Cards
// Faithful reproductions of every named *Card surface. Data-bound cards are
// reproduced as styled <div> mocks (see RULES); only HintCard is imported real.
//
// HEADLINE (verified against sources):
// 11 named *Card components span radius 8/16/20, padding 20/24/32/40,
// bg secondary50/primary100/neutral100; only ONE (ClinicDisplayCard) has a
// shadow; legacy radii.primary(20) leaks to 3 extra places (HintCard,
// ClinicCard, LoginCard) beyond its "Login/Clinic only" comment; there is NO
// shadows token anywhere in theme.ts.
import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { Section, Sub, Tile, Ctx, Note } from "./shared";
import { HintCard } from "../../components/HintCard"; // real, safe — props: { title?, description }
import { cardSurface, CardVariant, CardElevation } from "../../components/Card/Card.styles"; // real shipped helper

// ── tiny content primitives so every card mock reads as a real card ──────────
const Line = ({ w = "100%", h = 10, bg = colors.neutral200, mt = 0 }:
  { w?: number | string; h?: number; bg?: string; mt?: number }) => (
  <div style={{ width: w, height: h, background: bg, borderRadius: 4, marginTop: mt, flexShrink: 0 }} />
);

const Heading = ({ children, serif }: { children: React.ReactNode; serif?: boolean }) => (
  <div style={{
    fontFamily: serif ? fonts.family.secondary : fonts.family.primary,
    fontSize: fonts.size.h6, color: colors.neutral900, fontWeight: fonts.weight.regular, lineHeight: 1.2,
  }}>{children}</div>
);

// Field-pill row used by clinic-family cards (alphaBlack0 fill + radii.m).
const Pill = ({ bg = colors.alphaBlack0 }: { bg?: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, background: bg,
    borderRadius: radii.m, padding: `${spacing.xs} ${spacing.s}`, minHeight: 36 }}>
    <div style={{ width: 18, height: 18, borderRadius: 4, background: colors.neutral300, flexShrink: 0 }} />
    <Line w="70%" h={8} bg={colors.neutral300} />
  </div>
);

// A small spec caption shown under each card mock.
const Spec = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 10, color: colors.neutral500, fontFamily: "monospace", marginTop: spacing.xs,
    maxWidth: 400, lineHeight: 1.5 }}>{children}</div>
);

// ID chip rendered above an in-context card mock (mirrors Tile/Ctx chip style).
const IdChip = ({ id, canonical, label }: { id: string; canonical?: boolean; label?: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, flexWrap: "wrap", marginBottom: spacing.xs }}>
    <span style={{ fontSize: 10, fontWeight: fonts.weight.bold, letterSpacing: 0.4, fontFamily: "monospace",
      color: canonical ? colors.secondary700 : colors.neutral700,
      background: canonical ? colors.secondary100 : colors.neutral150, borderRadius: radii.xs, padding: "1px 6px" }}>{id}</span>
    {canonical && <span style={{ fontSize: 10, color: colors.secondary700, fontWeight: fonts.weight.semibold }}>✓ canonical · live</span>}
    {label && <span style={{ fontSize: fonts.size.xs, color: colors.neutral800, fontWeight: fonts.weight.medium }}>{label}</span>}
  </div>
);

// A single card mock + its chip + spec, as a column (used inside Sub rows).
const CardMock = ({ id, canonical, label, spec, capWidth = 360, children }:
  { id: string; canonical?: boolean; label: string; spec: React.ReactNode; capWidth?: number; children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", maxWidth: capWidth }}>
    <IdChip id={id} canonical={canonical} label={label} />
    {children}
    <Spec>{spec}</Spec>
  </div>
);

export function CardsCategory() {
  return (
    <Section id="cards" title="6 · Cards" status="shipped">
      <Note>
        <b>SHIPPED.</b> Every card surface now draws from ONE source —{" "}
        <code>cardSurface(variant, elevation)</code> in <code>Card.styles.ts</code>:{" "}
        radius <b>16 everywhere</b> (legacy <code>radii.primary(20)</code> retired from cards),
        the 3 paper colours <b>kept as variants</b> (sage = clinic · cream = staff/queue ·
        white = bills/stats), and the lone soft shadow promoted to the{" "}
        <code>shadows.card</code> token. The three near-twin pairs —{" "}
        <b>clinic</b> (Clinic + ClinicDisplay), <b>staff</b> (Staff + AdditionalStaff) and{" "}
        <b>queue-sidebar</b> (DoctorStatus + Heatmap) — now share that surface.
      </Note>
      <Note>
        <i>Before:</i> 11 cards spanned radius <b>8 / 16 / 20</b>, bg{" "}
        <b>secondary50 / primary100 / neutral100</b>, only ClinicDisplayCard had a shadow, and{" "}
        <code>radii.primary(20)</code> leaked to HintCard plus the literal <code>"20px"</code> in
        the two queue cards. Data-bound cards below are styled <code>div</code> mocks; only
        HintCard is the real component.
      </Note>

      {/* ── radius spread, front and center ─────────────────────────────── */}
      <Sub title="Radius spread — 8 vs 16 vs 20"
        note="Three radii in play for the card-surface family. radii.m(8) for staff/kpi, radii.2xl(16) for Card/ClinicDisplay, radii.primary(20)/literal 20px for clinic/login/queue. 4px swings are visible side by side.">
        <Tile id="CARD-R8" label="radii.m = 8" src="staff · kpi">
          <div style={{ width: 84, height: 56, background: colors.neutral100, border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.m }} />
        </Tile>
        <Tile id="CARD-R16" label="radii.2xl = 16" src="Card · ClinicDisplay" canonical>
          <div style={{ width: 84, height: 56, background: colors.neutral100, border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii["2xl"] }} />
        </Tile>
        <Tile id="CARD-R20" label="radii.primary = 20" src="clinic · login · queue (literal)">
          <div style={{ width: 84, height: 56, background: colors.neutral100, border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.primary }} />
        </Tile>
      </Sub>

      {/* ── bg spread ───────────────────────────────────────────────────── */}
      <Sub title="Background spread — secondary50 vs primary100 vs neutral100"
        note="Three surface fills, no shared rule. secondary50(#F1F6E7 sage) = clinic cards; primary100(#F9F9ED cream) = staff/queue; neutral100(#FFFFFF) = bill/kpi. Same component family, three different paper colors.">
        <Tile id="CARD-BG-SAGE" label="secondary50 #F1F6E7" src="Clinic · ClinicDisplay">
          <div style={{ width: 96, height: 56, background: colors.secondary50, borderRadius: radii.m, border: `${strokes.xs} solid ${colors.neutral200}` }} />
        </Tile>
        <Tile id="CARD-BG-CREAM" label="primary100 #F9F9ED" src="Staff · DoctorStatus · Heatmap">
          <div style={{ width: 96, height: 56, background: colors.primary100, borderRadius: radii.m, border: `${strokes.xs} solid ${colors.neutral200}` }} />
        </Tile>
        <Tile id="CARD-BG-WHITE" label="neutral100 #FFFFFF" src="Bill · kpi">
          <div style={{ width: 96, height: 56, background: colors.neutral100, borderRadius: radii.m, border: `${strokes.xs} solid ${colors.neutral200}` }} />
        </Tile>
      </Sub>

      {/* ── CARD-canon: the Card shell ──────────────────────────────────── */}
      <Sub title="CARD-canon · Card — the layout shell"
        note="components/Card/Card.styles.ts — transparent, radii.xxl(=16), NO padding, NO shadow, gap spacing.xl, marginTop:-1. It's really just a flex+gap column wrapper; the visible 'card' look comes from whatever child you drop inside. Rendered here over a dimmed backdrop so the transparent surface is visible.">
        <Ctx id="CARD-canon" where="components/Card/Card.styles.ts — wraps page sections (transparent shell)">
          <div style={{ borderRadius: radii.xxl, width: 320, display: "flex", flexDirection: "column", gap: spacing.xl, marginTop: -1, background: "transparent" }}>
            <div style={{ border: `${strokes.xs} dashed ${colors.neutral400}`, borderRadius: radii.xs, padding: spacing.s }}>
              <Heading>Child block A</Heading>
              <Line w="80%" h={8} mt={8} />
            </div>
            <div style={{ border: `${strokes.xs} dashed ${colors.neutral400}`, borderRadius: radii.xs, padding: spacing.s }}>
              <Heading>Child block B</Heading>
              <Line w="60%" h={8} mt={8} />
            </div>
          </div>
        </Ctx>
        <Note>Real width: 100% (fills parent). Surface = transparent + radius 16 only; nothing else. The dashed boxes are the children, not part of the Card.</Note>
      </Sub>

      {/* ── CARD-bill ───────────────────────────────────────────────────── */}
      <Sub title="CARD-bill · BillCard — payment ticket"
        note="components/BillCard/BillCard.styles.ts:11 — bg neutral100, top-only literal radius '12px 12px 0 0' (the zigzag torn edge sits below), pad 24, ~312px wide. The only card with an asymmetric radius.">
        <CardMock id="CARD-bill" label="BillCard" capWidth={312}
          spec={<>bg neutral100 · radius "12px 12px 0 0" (literal) · pad 24 · w≈312 · no shadow · BillCard.styles.ts:11</>}>
          <div style={{ width: 312, maxWidth: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "24px", backgroundColor: colors.neutral100, borderRadius: "12px 12px 0 0" }}>
              <div style={{ textAlign: "center", fontFamily: fonts.family.secondary, fontSize: fonts.size.h6, color: colors.neutral900 }}>Invoice</div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: colors.neutral150, borderRadius: 4 }}>
                <Line w={90} h={8} bg={colors.neutral300} /><Line w={40} h={8} bg={colors.neutral300} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: colors.neutral150, borderRadius: 4 }}>
                <Line w={70} h={8} bg={colors.neutral300} /><Line w={40} h={8} bg={colors.neutral300} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "8px 12px", background: colors.primary100 }}>
                <span style={{ fontSize: fonts.size.s, fontWeight: 600, color: colors.neutral900 }}>Total</span>
                <span style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h5, color: colors.neutral900 }}>₹1,240</span>
              </div>
            </div>
            {/* torn zigzag edge — the reason the radius is top-only */}
            <div style={{ width: "100%", height: 20,
              backgroundImage: `linear-gradient(135deg, ${colors.neutral100} 50%, transparent 50%), linear-gradient(225deg, ${colors.neutral100} 50%, transparent 50%)`,
              backgroundSize: "20px 20px", backgroundRepeat: "repeat-x" }} />
          </div>
        </CardMock>
      </Sub>

      {/* ── CARD-clinic + CARD-clinicdisplay — #1 MERGE candidate ───────── */}
      <Sub title="CARD-clinic + CARD-clinicdisplay · ClinicCard vs ClinicDisplayCard — #1 MERGE candidate"
        note="Near-identical clinic summaries. ClinicCard: secondary50 / radii.primary(20) / pad spacing.2xl(32) / w384 / NO shadow. ClinicDisplayCard: secondary50 / radii.2xl(16) / pad 32 / w373 / shadow '0 4px 20px rgba(0,0,0,0.04)'. They differ ONLY by a 4px radius, an 11px width, and one shadow. ClinicInfoCard (CARD-clinicinfo) is the editable sibling — same visual language, but bg/padding stripped so it lives inline in the workspace.">
        <CardMock id="CARD-clinic" label="ClinicCard (read-only)" capWidth={384}
          spec={<>bg secondary50 · radii.primary(20) · pad spacing.2xl(32) · w384 · NO shadow · ClinicCard.styles.ts</>}>
          <div style={{ backgroundColor: colors.secondary50, borderRadius: radii.primary, padding: spacing["2xl"], display: "flex", flexDirection: "column", gap: spacing.s, width: 384, maxWidth: "100%", boxSizing: "border-box" }}>
            <div style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h5, color: colors.neutral900, marginBottom: spacing["2xs"] }}>Sunrise Vet Clinic</div>
            <div style={{ display: "flex", alignItems: "center", border: `${strokes.xs} solid ${colors.neutral500}`, borderRadius: radii.m, overflow: "hidden", height: 42 }}>
              <span style={{ flex: 1, padding: `0 ${spacing.s}`, fontSize: fonts.size.s, color: colors.neutral500 }}>sunrise</span>
              <span style={{ padding: `0 ${spacing.m}`, borderLeft: `${strokes.xs} solid ${colors.neutral500}`, fontSize: fonts.size.s, color: colors.neutral500, height: "100%", display: "flex", alignItems: "center" }}>.docodile.app</span>
            </div>
            <Pill /><Pill />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Dental", "Surgery"].map((t) => (
                <span key={t} style={{ background: colors.secondary700, color: colors.neutral100, borderRadius: radii.full, padding: "4px 8px", fontSize: fonts.size.s }}>{t}</span>
              ))}
            </div>
          </div>
        </CardMock>

        <CardMock id="CARD-clinicdisplay" label="ClinicDisplayCard" capWidth={373}
          spec={<>bg secondary50 · radii.2xl(16) · pad 32 · w373 · shadow "0 4px 20px rgba(0,0,0,0.04)" · ClinicDisplayCard.styles.ts</>}>
          <div style={{ backgroundColor: colors.secondary50, borderRadius: radii.xxl, padding: spacing.xxl, width: 373, maxWidth: "100%", display: "flex", flexDirection: "column", gap: spacing.xl, position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", boxSizing: "border-box" }}>
            <div style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h4, color: colors.neutral900 }}>Sunrise Vet Clinic</div>
            <div style={{ display: "flex", width: "100%", height: 40, borderRadius: radii.m, overflow: "hidden", border: `${strokes.xs} solid ${colors.neutral300}` }}>
              <span style={{ flex: 1, display: "flex", alignItems: "center", padding: `0 ${spacing.xs}`, background: colors.neutralAlphaBlack, fontSize: fonts.size.m, color: colors.neutral500 }}>sunrise</span>
              <span style={{ width: 125, display: "flex", alignItems: "center", justifyContent: "center", background: colors.neutralAlphaBlack, borderLeft: `${strokes.xs} solid ${colors.neutral300}`, fontSize: fonts.size.m, color: colors.neutral500 }}>.docodile.app</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.s }}>
              <div style={{ display: "flex", gap: spacing.xs, padding: spacing.xs, background: colors.neutralAlphaBlack, borderRadius: 4 }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, background: colors.neutral300 }} /><Line w="60%" h={8} bg={colors.neutral300} />
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {["Dental", "Surgery"].map((t) => (
                <span key={t} style={{ background: colors.secondary300, color: colors.neutral100, borderRadius: radii.pill, padding: "4px 12px", fontSize: fonts.size.xs }}>{t}</span>
              ))}
            </div>
          </div>
        </CardMock>
      </Sub>

      {/* ── CARD-clinicinfo — the editable sibling ──────────────────────── */}
      <Sub title="CARD-clinicinfo · ClinicInfoCard — editable sibling (context only)"
        note="components/ClinicInfoCard/ClinicInfoCard.styles.ts — deliberately NO bg + NO padding (its comment: 'the form lives directly inside the workspace; it shouldn't be its own card'). Same field pills + tags as ClinicCard, but tags use secondary300 (like ClinicDisplay) not secondary700 (like ClinicCard). Flagged as part of the clinic merge family.">
        <Ctx id="CARD-clinicinfo" where="components/ClinicInfoCard/ClinicInfoCard.styles.ts — inline in clinic-setup workspace (no surface of its own)">
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.m, width: 360, maxWidth: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", border: `${strokes.xs} solid ${colors.neutral500}`, borderRadius: radii.m, overflow: "hidden", height: 42 }}>
              <span style={{ flex: 1, padding: `0 ${spacing.s}`, fontSize: fonts.size.s, color: colors.neutral900 }}>sunrise</span>
              <span style={{ padding: `0 ${spacing.m}`, borderLeft: `${strokes.xs} solid ${colors.neutral500}`, fontSize: fonts.size.s, color: colors.neutral900, height: "100%", display: "flex", alignItems: "center" }}>.docodile.app</span>
            </div>
            <Pill /><Pill />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <span style={{ background: colors.secondary300, color: colors.neutral100, borderRadius: radii.pill, padding: "3px 10px", fontSize: fonts.size.xs }}>Dental</span>
            </div>
          </div>
        </Ctx>
      </Sub>

      {/* ── CARD-hint — real HintCard ───────────────────────────────────── */}
      <Sub title="CARD-hint · HintCard (real component)"
        note="components/HintCard/HintCard.styles.ts — transparent, 1px DASHED neutral900, radii.primary(20), pad 24, maxW280. The ONLY dashed-border card, and a 3rd leak of radii.primary beyond the 'Login/Clinic only' comment. Imported live below.">
        <CardMock id="CARD-hint" label="HintCard (imported real)" capWidth={280}
          spec={<>transparent · 1px dashed neutral900 · radii.primary(20) · pad 24 · maxW280 · HintCard.styles.ts</>}>
          <HintCard title="Get started" description="Add your first clinic to begin booking appointments." />
        </CardMock>
      </Sub>

      {/* ── CARD-staff + CARD-addstaff — MERGE pair ─────────────────────── */}
      <Sub title="CARD-staff + CARD-addstaff · StaffDetailsCard vs AdditionalStaffDetailsCard — MERGE pair"
        note="Identical surface: both primary100 / radii.m(8) / pad spacing.l(20) / minWidth 25vw. The only delta is inner gap (StaffDetails uses spacing.s, Additional uses spacing.m) — pure content spacing, not surface. Sources StaffDetailsCard.styles.ts:5 + AdditionalStaffDetailsCard.styles.ts:5. 25vw capped to ~360 here.">
        <CardMock id="CARD-staff" label="StaffDetailsCard" capWidth={360}
          spec={<>bg primary100 · radii.m(8) · pad spacing.l(20) · minWidth 25vw · StaffDetailsCard.styles.ts:5</>}>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.s, borderRadius: radii.m, padding: spacing.l, backgroundColor: colors.primary100, width: 320, maxWidth: "100%" }}>
            <Heading>Staff details</Heading>
            <Line w="85%" h={10} mt={4} /><Line w="60%" h={10} mt={4} />
            <div style={{ display: "flex", gap: 24, marginTop: 4, alignItems: "center" }}>
              <Line w={60} h={8} bg={colors.neutral300} /><Line w={60} h={8} bg={colors.neutral300} />
            </div>
          </div>
        </CardMock>
        <CardMock id="CARD-addstaff" label="AdditionalStaffDetailsCard" capWidth={360}
          spec={<>bg primary100 · radii.m(8) · pad spacing.l(20) · minWidth 25vw · AdditionalStaffDetailsCard.styles.ts:5 (gap spacing.m)</>}>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.m, borderRadius: radii.m, padding: spacing.l, backgroundColor: colors.primary100, width: 320, maxWidth: "100%" }}>
            <Heading>Additional details</Heading>
            <Line w="85%" h={10} mt={4} /><Line w="60%" h={10} mt={4} />
            <div style={{ display: "flex", gap: 16, marginTop: 4, alignItems: "center" }}>
              <Line w={70} h={8} bg={colors.neutral300} /><Line w={70} h={8} bg={colors.neutral300} />
            </div>
          </div>
        </CardMock>
      </Sub>

      {/* ── CARD-docstatus + CARD-heatmap — MERGE pair ──────────────────── */}
      <Sub title="CARD-docstatus + CARD-heatmap · DoctorStatusCard vs HeatmapCard — MERGE pair (queue sidebar)"
        note="Both primary100 / borderRadius '20px' LITERAL (not the token) / width var(--queue-side-w,246px) / var-driven horizontal padding. They stack in the queue sidebar. The '20px' literal is the 4th leak of the radii.primary value, bypassing the token entirely. NB: DoctorStatusCard's 2.5px solid primary400 border (off the strokes scale: xs1/s1.5/m2/l4) is on the AVATAR ring, not the card surface — the card itself is border:none. Sources DoctorStatusCard.tsx:164 + HeatmapCard.tsx:154.">
        <CardMock id="CARD-docstatus" label="DoctorStatusCard" capWidth={246}
          spec={<>bg primary100 · borderRadius "20px" literal · w var(--queue-side-w,246px) · pad "40px ?px 20px" · card border:none · avatar ring 2.5px solid primary400 (off-scale) · DoctorStatusCard.tsx:164</>}>
          <div style={{ backgroundColor: colors.primary100, borderRadius: "20px", border: "none", padding: "40px 20px 20px", display: "flex", flexDirection: "column", gap: 2, width: 246, maxWidth: "100%", position: "relative", alignItems: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2.5px solid " + colors.primary400, background: colors.neutral100, marginTop: -50, marginBottom: 8 }} />
            <div style={{ fontSize: fonts.size.m, fontWeight: 600, color: colors.neutral900 }}>Dr. Mehta</div>
            <div style={{ height: 1, width: "100%", background: colors.primary300, margin: "8px 0" }} />
            <Line w="70%" h={8} bg={colors.neutral300} mt={4} />
          </div>
        </CardMock>
        <CardMock id="CARD-heatmap" label="HeatmapCard" capWidth={246}
          spec={<>bg primary100 · borderRadius "20px" literal · w var(--queue-side-w,246px) · pad "20px ?px" · marginTop 16 · HeatmapCard.tsx:154</>}>
          <div style={{ backgroundColor: colors.primary100, borderRadius: "20px", padding: "20px", width: 246, maxWidth: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: fonts.size.m, fontWeight: 600, color: colors.neutral900 }}>Today's load</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
              {[colors.primary200, colors.primary400, colors.primary600, colors.primary800, colors.primary200,
                colors.primary400, colors.primary200, colors.primary600, colors.primary400, colors.primary800].map((c, i) => (
                <div key={i} style={{ height: 18, borderRadius: 3, background: c }} />
              ))}
            </div>
          </div>
        </CardMock>
      </Sub>

      {/* ── CARD-login ──────────────────────────────────────────────────── */}
      <Sub title="CARD-login · LoginCard"
        note="components/LoginCard/LoginCard.styles.ts — bg active.shade100 (theme var), radii.primary(20), pad spacing.3xl(40), maxW560. Heaviest padding of any card. active.shade100 resolves to a CSS variable, so it renders with the gallery's current active theme.">
        <CardMock id="CARD-login" label="LoginCard" capWidth={420}
          spec={<>bg active.shade100 (var) · radii.primary(20) · pad spacing.3xl(40) · maxW560 · LoginCard.styles.ts</>}>
          <div style={{ backgroundColor: colors.active.shade100, borderRadius: radii.primary, padding: 40, width: 420, maxWidth: "100%", display: "flex", flexDirection: "column", gap: spacing.xl, position: "relative", boxSizing: "border-box" }}>
            <div style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h4, color: colors.neutral900 }}>Welcome back</div>
            <div style={{ height: 40, borderRadius: radii.m, border: `${strokes.xs} solid ${colors.neutral300}`, background: colors.neutral100 }} />
            <div style={{ height: 40, borderRadius: radii.m, border: `${strokes.xs} solid ${colors.neutral300}`, background: colors.neutral100 }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <Line w={80} h={8} bg={colors.neutral300} /><Line w={60} h={8} bg={colors.neutral300} />
            </div>
          </div>
        </CardMock>
      </Sub>

      {/* ── CARD-kpi ────────────────────────────────────────────────────── */}
      <Sub title="CARD-kpi · StatsPage kpiCard (inline-styled)"
        note="pages/Stats/StatsPage.tsx:1541 — bg neutral100, radii.m(8), pad spacing.m(16), minHeight 110. A bare inline-styled stat tile; not a named component, but a card surface duplicated across the KPI grid.">
        <CardMock id="CARD-kpi" label="StatsPage.kpiCard" capWidth={220}
          spec={<>bg neutral100 · radii.m(8) · pad spacing.m(16) · minHeight 110 · StatsPage.tsx:1541</>}>
          <div style={{ backgroundColor: colors.neutral100, borderRadius: radii.m, padding: spacing.m, display: "flex", flexDirection: "column", gap: 6, minHeight: 110, width: 200, maxWidth: "100%", border: `${strokes.xs} solid ${colors.neutral200}` }}>
            <div style={{ fontSize: fonts.size.s, color: colors.neutral500, fontWeight: 500 }}>Appointments today</div>
            <div style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h4, color: colors.neutral900, lineHeight: 1.1 }}>128</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: "auto" }}>
              <span style={{ fontSize: fonts.size.s, fontWeight: 600, color: colors.secondary500 }}>+12%</span>
              <span style={{ fontSize: fonts.size.xs, color: colors.neutral500 }}>vs last week</span>
            </div>
          </div>
        </CardMock>
      </Sub>

      {/* ── CARD-CANON · the shipped surface ────────────────────────────── */}
      <Sub title="CARD-CANON · cardSurface(variant, elevation) — LIVE"
        note="Shipped: ONE surface source — cardSurface() in Card.styles.ts. radius always radii.2xl(16); variant → bg (surface=neutral100 white · sage=secondary50 · cream=primary100); elevation → flat or the shadows.card token. The three cards below render the REAL helper (imported), and every *Card now spreads it. <Card variant elevation> also accepts these as props, defaulting to the legacy transparent shell.">
        <CardMock id="CARD-CANON" canonical label="cardSurface('sage','raised')" capWidth={300}
          spec={<>bg secondary50 · radii.2xl(16) · shadows.card — Clinic + ClinicDisplay now share this</>}>
          <ProposedCard variant="sage" elevation="raised" title="Sage · raised" />
        </CardMock>
        <CardMock id="CARD-CANON" canonical label="cardSurface('cream','none')" capWidth={300}
          spec={<>bg primary100 · radii.2xl(16) · flat — Staff + AdditionalStaff + the two queue cards share this</>}>
          <ProposedCard variant="cream" elevation="none" title="Cream · flat" />
        </CardMock>
        <CardMock id="CARD-CANON" canonical label="cardSurface('surface','none')" capWidth={300}
          spec={<>bg neutral100 (white) · radii.2xl(16) · flat — bills / stat tiles</>}>
          <ProposedCard variant="surface" elevation="none" title="Surface · flat" />
        </CardMock>
      </Sub>
    </Section>
  );
}

// ── canonical Card — renders the SHIPPED cardSurface() helper directly, so the
// gallery shows live code rather than a mock of it.
function ProposedCard({ variant, elevation, title }:
  { variant: CardVariant; elevation: CardElevation; title: string }) {
  return (
    <div style={{
      ...cardSurface(variant, elevation), // the real helper from Card.styles.ts
      padding: spacing.xl,
      display: "flex", flexDirection: "column", gap: spacing.s,
      width: 280, maxWidth: "100%", boxSizing: "border-box",
      border: `${strokes.xs} solid ${colors.neutral200}`,
    }}>
      <Heading serif>{title}</Heading>
      <Line w="85%" h={9} mt={4} />
      <Line w="60%" h={9} mt={4} />
    </div>
  );
}
