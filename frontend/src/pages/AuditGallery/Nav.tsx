// ══════════════════════════════════════════════════════════════════════════════
// TEMP — /audit gallery · Category 5: Nav / tabs / headers
//
// Renders the EIGHT divergent tab implementations + THREE header patterns found
// across the app, each as a real tab bar / header bar (middle tab active) so the
// active-state divergence is visible side-by-side.
//
// Headline finding: a "white-pill" tab (radii.xl, inactive alphaBlack0/alphaBlack3,
// active neutral100/neutral900) is copy-pasted FIVE times — Tabs "block",
// PrescriptionQueue filter, Stats tabStrip, Prescription visit tabs (radii.m
// variant), and the canonical <Tabs variant="block">. Two systems diverge on the
// ACTIVE tone: Pharmacy togglePill INVERTS to a dark pill (neutral900 bg), and the
// Stats rangePill uses active.shade700. ClinicTabs (+ Tabs "connected") use a
// legacy trapezoid (radii.primary top corners only, active.shade100/200).
//
// All values reproduced from source. CSS-var tokens (--header-*, --btn-fs,
// --rx-content-max, --ctrl-fs-*, --search-fs, active.shade*) are kept as the
// real tokens where they resolve standalone, and inlined as literal fallbacks
// (the documented :root values) where the gallery renders outside the app shell.
// ══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { Section, Sub, Tile, Ctx, Note } from "./shared";
import { Tabs } from "../../components/Tabs";

export function NavCategory() {
  return (
    <Section id="nav" title="5 · Nav / tabs / headers" status="shipped">
      <Note>
        <strong>✅ DECIDED &amp; built (tabs).</strong> The canonical white-pill <code>&lt;Tabs&gt;</code>
        (E) now has TWO sizes — <code>md</code> (the larger "E" tab) and <code>size="sm"</code> (the
        smaller "visit" tab) — and is RESPONSIVE: <code>md</code> compacts from 40px/r12 to 32px/r8
        BELOW 1440 (so at the lower tier everything reads like the visit size; above 1440 both
        sizes are available). The hand-rolled white-pill copies (Rx filter, Stats strip) were aligned
        to the same responsive height/radius vars, and <b>Pharmacy's dark toggle is now the white pill</b>
        too. KEPT as-is per your call: the legacy trapezoid tabs (C), the sort/range chips (B), and all
        three header patterns (D). The rows below are the BEFORE.
      </Note>
      <Note>
        Eight tab implementations, three conflicting active tones. The white-pill
        design (radii.xl · inactive <code>alphaBlack0/alphaBlack3</code> · active{" "}
        <code>neutral100/neutral900</code>) is copy-pasted <b>5×</b>. Pharmacy
        inverts to a dark pill (<code>neutral900</code> active). Stats range-pill
        uses <code>active.shade700</code>. ClinicTabs uses a legacy trapezoid.
        Every bar below renders the MIDDLE tab active so the divergence is visible.
      </Note>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* GROUP A — the five white-pill clones (SAME design, 5 copies)          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <Sub
        title="A · The white-pill family — same design, 5 independent copies"
        note={
          <>
            All five share: radii.xl (12) pill (radii.m on the visit strip),
            inactive <code>alphaBlack0</code> bg + <code>alphaBlack3</code> text,
            active <code>neutral100</code> bg + <code>neutral900</code> text. Only
            one (<code>&lt;Tabs variant="block"&gt;</code>) is a real component;
            the other four are hand-rolled clones.
          </>
        }
      >
        {/* TAB-block — Tabs "block" variant (the real component) */}
        <Ctx id="TAB-block" where='<Tabs variant="block"> — Tabs.styles.ts:75'>
          <Tabs
            variant="block"
            activeId="b"
            onSelect={() => {}}
            items={[
              { id: "a", label: "Overview" },
              { id: "b", label: "Details" },
              { id: "c", label: "History" },
            ]}
          />
        </Ctx>

        {/* TAB-rxfilter — PrescriptionQueue filter pills */}
        <Ctx id="TAB-rxfilter" where="PrescriptionQueue filter tabs — PrescriptionQueue.styles.ts:52">
          <div style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
            {["Queued", "In progress", "Done"].map((label, i) => (
              <button
                key={label}
                type="button"
                style={{
                  height: 40,
                  padding: `${spacing.xs} 16px`, // var(--rxq-tab-padx, 16px)
                  borderRadius: radii.xl,
                  border: "none",
                  fontFamily: fonts.family.primary,
                  fontSize: fonts.size.m,
                  lineHeight: fonts.lineHeight.m,
                  cursor: "pointer",
                  ...(i === 1
                    ? { backgroundColor: colors.neutral100, color: colors.neutral900 }
                    : { backgroundColor: colors.alphaBlack0, color: colors.alphaBlack3 }),
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </Ctx>

        {/* TAB-stats — Stats tabStrip (hand-rolled clone of TAB-block) */}
        <Ctx id="TAB-stats" where="Stats tabStrip — StatsPage.tsx:1516">
          <div style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
            {["Today", "This week", "This month"].map((label, i) => (
              <button
                key={label}
                type="button"
                style={{
                  height: 40,
                  padding: `${spacing.xs} ${spacing.m}`,
                  borderRadius: radii.xl,
                  border: "none",
                  fontFamily: fonts.family.primary,
                  fontSize: fonts.size.m,
                  lineHeight: fonts.lineHeight.m,
                  cursor: "pointer",
                  ...(i === 1
                    ? { backgroundColor: colors.neutral100, color: colors.neutral900 }
                    : { backgroundColor: colors.alphaBlack0, color: colors.alphaBlack3 }),
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </Ctx>

        {/* TAB-visit — Prescription visit tabs (radii.m / h32 white-pill variant) */}
        <Ctx id="TAB-visit" where="Prescription visit strip — PrescriptionPage.styles.ts:773">
          <div style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
            {["visit 1 · 12 May", "visit 2 · 19 May", "visit 3 · 02 Jun"].map((label, i) => (
              <button
                key={label}
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: spacing.xs,
                  padding: `${spacing["2xs"]} ${spacing.s}`,
                  borderRadius: radii.m, // 8 — narrower radius than the rest
                  height: 32,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: fonts.family.primary,
                  fontSize: fonts.size.s,
                  whiteSpace: "nowrap",
                  // inactive text is solid neutral500 here (not alphaBlack3 —
                  // see PrescriptionPage.styles.ts:793 tabInactive)
                  ...(i === 1
                    ? { backgroundColor: colors.neutral100, color: colors.neutral900 }
                    : { backgroundColor: colors.alphaBlack0, color: colors.neutral500 }),
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </Ctx>

        <Note>
          <b>TAB-visit</b> diverges in two small ways even within the white-pill
          family: radii.m (8) instead of xl (12), height 32 instead of 40, and its
          inactive text is solid <code>neutral500</code> rather than{" "}
          <code>alphaBlack3</code> (a deliberate fix for the washed-out look on the
          cream page tint). Active treatment is identical, so it still reads as the
          same design.
        </Note>
      </Sub>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* GROUP B — conflicting ACTIVE tones                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <Sub
        title="B · Conflicting active tones — dark-pill inversion & shade700"
        note={
          <>
            Same pill geometry, different active fill. These three tones
            (white · dark · shade700) all claim to be "the active tab."
          </>
        }
      >
        {/* TAB-pharmacy — Pharmacy togglePill (INVERTED dark pill) */}
        <Ctx id="TAB-pharmacy" where="Pharmacy filter toggle — Pharmacy.styles.ts:85 (INVERTED · dark pill)">
          <div style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
            {["All", "Low stock", "Expiring"].map((label, i) => (
              <button
                key={label}
                type="button"
                style={{
                  height: 36,
                  padding: `0 ${spacing.m}`,
                  borderRadius: radii.full, // 999 — fully round, unlike the xl family
                  border: "none",
                  fontFamily: fonts.family.primary,
                  fontSize: "14px", // fonts.control.sm → var(--ctrl-fs-sm, 14px)
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  // ACTIVE = neutral900 bg / neutral100 text — the inverse of the
                  // white-pill family.
                  ...(i === 1
                    ? { backgroundColor: colors.neutral900, color: colors.neutral100 }
                    : { backgroundColor: colors.alphaBlack0, color: colors.alphaBlack3 }),
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </Ctx>

        {/* CHIP-conflict — Pharmacy sortChip (neutral900) vs Stats rangePill (active.shade700) */}
        <Ctx id="CHIP-conflict" where="Pharmacy sortChip (neutral900) vs Stats rangePill (active.shade700) — two active tones, side by side">
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xl, flexWrap: "wrap" }}>
            {/* Pharmacy sortChip group — active = neutral900 */}
            <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], alignItems: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: spacing["3xs"],
                  backgroundColor: colors.neutral100,
                  borderRadius: radii.full,
                  padding: spacing["3xs"],
                }}
              >
                {["Name", "Stock", "Expiry"].map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    style={{
                      height: 28,
                      padding: `0 ${spacing.s}`,
                      borderRadius: radii.full,
                      border: "none",
                      fontFamily: fonts.family.primary,
                      fontSize: "14px", // fonts.control.sm
                      cursor: "pointer",
                      ...(i === 1
                        ? { backgroundColor: colors.neutral900, color: colors.neutral100 }
                        : { backgroundColor: "transparent", color: colors.neutral700 }),
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: colors.neutral600 }}>
                Pharmacy sortChip · active = neutral900
              </span>
            </div>

            {/* Stats rangePill group — active = active.shade700 */}
            <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  backgroundColor: colors.neutral100,
                  padding: 4,
                  borderRadius: radii.full,
                }}
              >
                {["Day", "Week", "Month"].map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    style={{
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: radii.full,
                      cursor: "pointer",
                      fontSize: fonts.size.xs,
                      fontWeight: 500,
                      fontFamily: "inherit",
                      ...(i === 1
                        ? { backgroundColor: colors.active.shade700, color: colors.neutral100 }
                        : { background: "transparent", color: colors.neutral700 }),
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: colors.neutral600 }}>
                Stats rangePill · active = active.shade700
              </span>
            </div>
          </div>
        </Ctx>

        <Note>
          <b>CHIP-conflict:</b> two sibling segmented-pill groups disagree on the
          active fill — Pharmacy's sortChip paints it <code>neutral900</code>{" "}
          (matching its dark togglePill), while the Stats rangePill paints it{" "}
          <code>active.shade700</code> (the theme accent, peach in primary mode).
          They sit on nearly identical white tracks, so the conflict is purely the
          active tone. One of these is wrong.
        </Note>
      </Sub>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* GROUP C — the legacy trapezoid pair                                   */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <Sub
        title="C · Legacy trapezoid tabs — radii.primary top corners, attached to panel"
        note={
          <>
            Two trapezoid systems with top-only radii.primary (20). They "attach"
            to a content panel below (no gap). Active fill is a theme tint
            (<code>active.shade100</code> / <code>active.shade200</code>), not a
            white pill.
          </>
        }
      >
        {/* TAB-connected — Tabs "connected" variant (real component) */}
        <Ctx id="TAB-connected" where='<Tabs variant="connected"> — Tabs.styles.ts:13'>
          <div style={{ width: "100%", maxWidth: 520 }}>
            <Tabs
              variant="connected"
              activeId="b"
              onSelect={() => {}}
              items={[
                { id: "a", label: "Summary" },
                { id: "b", label: "Visits" },
                { id: "c", label: "Billing" },
              ]}
            />
            {/* the panel the tabs attach to */}
            <div
              style={{
                background: colors.active.shade100,
                borderRadius: `0 ${radii.m}px ${radii.m}px ${radii.m}px`,
                height: 40,
                marginTop: -1,
              }}
            />
          </div>
        </Ctx>

        {/* TAB-clinic — ClinicTabs (fixed w180, active.shade200, top:1 lift) */}
        <Ctx id="TAB-clinic" where="ClinicTabs — ClinicTabs.styles.ts:10 (legacy · fixed-width trapezoid)">
          <div style={{ width: "100%", maxWidth: 600 }}>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              {["North Clinic", "Riverside Clinic", "Hilltop Clinic"].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  style={{
                    width: 180,
                    padding: "12px 16px",
                    borderRadius: `${radii.primary}px ${radii.primary}px 0 0`,
                    border: `0px solid ${colors.neutral900}`,
                    borderBottom: "none",
                    fontFamily: fonts.family.primary,
                    fontSize: "16px", // fonts.control.md → var(--ctrl-fs-md, 16px)
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    cursor: "pointer",
                    position: "relative",
                    flexShrink: 0,
                    color: colors.neutral900,
                    // active: active.shade200 + a 1px upward lift (top:1)
                    ...(i === 1
                      ? { backgroundColor: colors.active.shade200, top: 1, zIndex: 2 }
                      : { backgroundColor: colors.secondary100 }),
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              style={{
                background: colors.active.shade200,
                borderRadius: `0 ${radii.m}px ${radii.m}px ${radii.m}px`,
                height: 40,
              }}
            />
          </div>
        </Ctx>

        <Note>
          <b>TAB-connected</b> and <b>TAB-clinic</b> share the trapezoid silhouette
          but still diverge: connected uses fluid-width tabs with{" "}
          <code>active.shade100</code>; ClinicTabs hard-codes width 180,{" "}
          <code>active.shade200</code>, and nudges the active tab up by 1px
          (<code>top: 1</code>). Both are off-system (radii.primary = 20 is the
          legacy LoginCard/ClinicCard radius).
        </Note>
      </Sub>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* HEADERS — three full-width page-header bars                           */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <Sub
        title="D · Page headers — three patterns"
        note={
          <>
            The shared <code>PageHeader</code> (centered 3-zone bar) vs the
            Prescription page's bespoke left-aligned clone vs Settings (no bar at
            all — a centered serif heading). All rendered full-width.
          </>
        }
      >
        {/* HDR-pageheader — shared PageHeader, centered 3-zone */}
        <Ctx id="HDR-pageheader" where="shared PageHeader — PageHeader.styles.ts (centered 3-zone bar)" canonical>
          <div style={{ width: "100%" }}>
            <header
              style={{
                position: "relative",
                backgroundColor: colors.active.shade100, // var(--header-bg) = primary100 tint
                borderBottom: `1px solid transparent`, // var(--header-border) = transparent
                borderRadius: `${radii["2xl"]}px 0 0 0`,
                boxSizing: "border-box",
                width: "100%",
              }}
            >
              {/* back arrow pinned to far-left edge */}
              <button
                type="button"
                style={{
                  position: "absolute",
                  left: 8, // var(--header-back-inset)
                  top: 0,
                  bottom: 0,
                  width: 32,
                  border: "none",
                  background: "transparent",
                  color: colors.neutral900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                aria-label="Back"
              >
                <BackArrow />
              </button>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  gap: spacing.m,
                  width: "100%",
                  maxWidth: 1440,
                  margin: "0 auto",
                  paddingLeft: 40, // fluidSpacing.outerX
                  paddingRight: 40,
                  minHeight: 56, // var(--header-h)
                  paddingTop: 8, // var(--header-pad-y)
                  paddingBottom: 8,
                  boxSizing: "border-box",
                }}
              >
                <div />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "16px", // var(--btn-fs)
                      fontWeight: fonts.weight.semibold,
                      fontFamily: fonts.family.primary,
                      color: colors.neutral900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Patient record
                  </h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: spacing.xs }}>
                  <HeaderActionDot />
                  <HeaderActionDot />
                </div>
              </div>
            </header>
          </div>
        </Ctx>

        {/* HDR-rx — rxHeader, LEFT-aligned title, capped at --rx-content-max */}
        <Ctx id="HDR-rx" where="Prescription rxHeader — PrescriptionPage.styles.ts:244 (left-aligned clone)">
          <div style={{ width: "100%" }}>
            <header
              style={{
                position: "relative",
                backgroundColor: colors.active.shade100, // var(--header-bg)
                borderBottom: `1px solid transparent`, // var(--header-border)
                borderRadius: `${radii["2xl"]}px 0 0 0`,
                boxSizing: "border-box",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: "100%",
                  paddingLeft: 40, // fluidSpacing.outerX
                  paddingRight: 40,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.m,
                    width: "100%",
                    maxWidth: 1120, // var(--rx-content-max)
                    margin: "0 auto",
                    minHeight: 56, // var(--header-h)
                    paddingTop: 8, // var(--header-pad-y)
                    paddingBottom: 8,
                    boxSizing: "border-box",
                  }}
                >
                  {/* narrower back button — width 28 (vs 32 on the shared header) */}
                  <button
                    type="button"
                    style={{
                      width: 28,
                      border: "none",
                      background: "transparent",
                      color: colors.neutral900,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      flexShrink: 0,
                    }}
                    aria-label="Back"
                  >
                    <BackArrow />
                  </button>
                  {/* avatar + title — title is LEFT-aligned, not centered */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: radii.full,
                      background: colors.secondary200,
                      flexShrink: 0,
                    }}
                  />
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "16px", // matches --btn-fs density
                      fontWeight: fonts.weight.semibold,
                      fontFamily: fonts.family.primary,
                      color: colors.neutral900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Jordan Avery · New prescription
                  </h2>
                </div>
              </div>
            </header>
          </div>
        </Ctx>

        {/* HDR-settings — Settings: NO bar, centered serif h1 + subtitle */}
        <Ctx id="HDR-settings" where="Settings header — SettingsPage.tsx:38 (no bar · centered serif heading)">
          <div style={{ width: "100%", padding: `${spacing.l} 0` }}>
            <header style={{ textAlign: "center" }}>
              <h1
                style={{
                  margin: 0,
                  textAlign: "center",
                  fontFamily: fonts.family.secondary, // Libertinus serif
                  fontSize: fonts.size.h5,
                  lineHeight: fonts.lineHeight.h5,
                  fontWeight: fonts.weight.regular,
                  color: colors.neutral900,
                }}
              >
                Print template
              </h1>
              <p style={{ margin: "6px 0 0", fontSize: fonts.size.s, color: colors.neutral500 }}>
                Configure how prescriptions look when printed. Defaults to the
                template marked as default.
              </p>
            </header>
          </div>
        </Ctx>

        <Note>
          <b>HDR-pageheader</b> (the proposed canonical chrome) is a centered 3-zone
          bar. <b>HDR-rx</b> is a near-identical clone that left-aligns the title,
          caps at <code>--rx-content-max</code> (1120) instead of 1440, and uses a
          28px back button instead of 32. <b>HDR-settings</b> abandons the bar
          entirely for a centered serif <code>h5</code> heading — a third,
          structurally different header pattern.
        </Note>
      </Sub>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* CANONICAL — one white-pill tab system, single active treatment         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <Sub
        title="E · Proposed canonical tab"
        note={
          <>
            One white-pill tab bar with a single active treatment
            (<code>neutral100</code> bg / <code>neutral900</code> text). This is the
            real <code>&lt;Tabs variant="block"&gt;</code> component — adopt it
            everywhere the five clones in group A live, and reconcile the dark-pill
            / shade700 active tones into this one.
          </>
        }
      >
        <Ctx id="TAB-CANON" where='canonical — <Tabs variant="block"> (white pill, single active treatment)' canonical>
          <Tabs
            variant="block"
            activeId="b"
            onSelect={() => {}}
            items={[
              { id: "a", label: "Overview" },
              { id: "b", label: "Details" },
              { id: "c", label: "History" },
            ]}
          />
        </Ctx>
        <Note>
          Note: the brief named <code>variant="pill"</code> with a <code>size</code>{" "}
          prop, but <code>Tabs</code> only exposes{" "}
          <code>variant: "connected" | "block"</code> (no <code>size</code>). The{" "}
          <code>"block"</code> variant <i>is</i> the white pill, so it is used here
          as the canonical — see "not faithfully renderable" notes.
        </Note>
      </Sub>
    </Section>
  );
}

// ── Shared left-pointing back arrow (copied from PageHeader so we don't import it) ──
function BackArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── A small round "action" placeholder for the header right slot ──
function HeaderActionDot() {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: radii.full,
        background: colors.neutral150,
        border: `${strokes.xs} solid ${colors.neutral200}`,
        display: "inline-block",
      }}
    />
  );
}
