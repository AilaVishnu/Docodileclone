// TEMP — /audit gallery · Category 4: Modals / dialogs
//
// Faithful STATIC mocks of every overlay shell in the app. The real components
// rely on portals / state / Esc handlers, so we reproduce just the visual shell:
// a dimmed "backdrop band" at the modal's REAL backdrop opacity, with the card
// centred inside it carrying its REAL surface colour, radius, shadow and close
// treatment. Each caption (in <Ctx where>) records z-index + backdrop + source.
//
// DO NOT use the shared <ModalMock> here — it forces white + radii.2xl + a fixed
// shadow, which would hide exactly the drift this category is meant to surface.
import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { Section, Sub, Ctx, Note } from "./shared";

// ── local shell primitives ──────────────────────────────────────────────────

// A capped "backdrop band": a ~520px-tall area painted at the modal's REAL
// backdrop colour, with the card centred inside. This is the dimmed context the
// modal really floats on, so surface/radius/shadow read against the right tone.
const Band = ({ backdrop, children }: { backdrop: string; children: React.ReactNode }) => (
  <div
    style={{
      width: "100%",
      maxHeight: 520,
      minHeight: 220,
      background: backdrop,
      borderRadius: radii.s,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
      boxSizing: "border-box",
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

// A faithful card shell. Every visual prop is passed in raw so off-token
// literals stay literal (z-index is captioned, not styled).
const Card = ({
  surface,
  radius,
  shadow,
  width,
  titleFont,
  title,
  close,
  children,
}: {
  surface: string;
  radius: number | string;
  shadow: string;
  width: number | string;
  titleFont?: string;
  title: string;
  close: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div
    style={{
      width,
      maxWidth: "100%",
      background: surface,
      borderRadius: radius,
      boxShadow: shadow || "none",
      padding: spacing.xl,
      boxSizing: "border-box",
      textAlign: "left",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.m,
        marginBottom: spacing.s,
      }}
    >
      <div
        style={{
          fontFamily: titleFont ?? fonts.family.secondary,
          fontSize: fonts.size.h6,
          fontWeight: fonts.weight.regular,
          color: colors.neutral900,
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      {close}
    </div>
    {children ?? (
      <>
        <div style={{ height: 8, background: colors.alphaBlack1, borderRadius: 4, width: "82%", marginBottom: 8 }} />
        <div style={{ height: 8, background: colors.alphaBlack1, borderRadius: 4, width: "54%" }} />
      </>
    )}
  </div>
);

// ── the four distinct close treatments, reproduced exactly ───────────────────

// (a) inline SVG path ✕ (18px, stroke 2) — Bill + AddService
const SvgClose = ({ color }: { color: string }) => (
  <button
    type="button"
    aria-label="Close"
    style={{
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color,
      padding: 0,
      width: 28,
      height: 28,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  </button>
);

// (b) raw "×" character, fontSize 22, color #666 — AI SOAP draft (fully off-token)
const CharClose = () => (
  <button
    type="button"
    style={{ background: "none", border: "none", fontSize: 22, lineHeight: 1, cursor: "pointer", color: "#666" }}
  >
    ×
  </button>
);

// (c) no close glyph at all — caption explains how the real modal dismisses
const NoClose = ({ hint }: { hint: string }) => (
  <span style={{ fontSize: fonts.size.xs, color: colors.neutral500, fontStyle: "italic" }}>{hint}</span>
);

export function ModalsCategory() {
  return (
    <Section id="modals" title="4 · Modals / dialogs">
      <Note>
        Nine overlay shells in the app: <strong>4 backdrop opacities</strong> (0.35 / 0.45 / 0.5 plus the
        canonical 0.35), <strong>6 z-index values</strong> (1000 / 1100 / 1200 / 1300 / 1500 / 2000 — the
        base <code>&lt;Modal&gt;</code> sits at 1000, UNDER its own confirm dialogs at 1100), <strong>5 shadows</strong>{" "}
        (none ×2, 0.18, 0.2, 0.15), <strong>4 close styles</strong> (caller-supplied / inline-SVG path / raw
        "×" char / none), and <strong>3 surface colours</strong> (active-tint, white, cream). Each card below sits
        on its REAL backdrop tone so the surface and shadow read in context.
      </Note>

      <Sub
        title="Canonical shell"
        note="The shared <Modal> primitive — every other overlay should route through this. Note it ships NO shadow and an off-system radius (20), with the close button supplied by the caller, which is exactly why callers reinvent it."
      >
        <Ctx
          id="MOD-canon"
          where="zIndex 1000 · backdrop rgba(0,0,0,0.35) · surface active.shade200 (tint) · radius 20 · no shadow · close = caller-supplied · components/Modal/Modal.styles.ts"
        >
          <Band backdrop="rgba(0,0,0,0.35)">
            <Card
              surface={colors.active.shade200}
              radius={radii.primary}
              shadow=""
              width={420}
              title="Modal title"
              close={<NoClose hint="✕ supplied by caller" />}
            />
          </Band>
        </Ctx>
      </Sub>

      <Sub
        title="Eight roll-your-own overlays"
        note="Each was hand-built instead of wrapping <Modal>, so every visual axis drifted. Read against the canonical above."
      >
        {/* MOD-print — PrintPreviewModal */}
        <Ctx
          id="MOD-print"
          where="zIndex 1300 · backdrop rgba(0,0,0,0.35) · surface #fff · radius 12 (radii.xl) · shadow 0 16px 48px rgba(0,0,0,0.18) · close = Esc / Cancel (no glyph) · components/PrintPreviewModal/PrintPreviewModal.styles.ts"
        >
          <Band backdrop="rgba(0, 0, 0, 0.35)">
            <Card
              surface={colors.neutral100}
              radius={radii.xl}
              shadow="0 16px 48px rgba(0, 0, 0, 0.18)"
              width={520}
              titleFont={fonts.family.primary}
              title="Print preview"
              close={<NoClose hint="Esc / Cancel — no ✕" />}
            />
          </Band>
        </Ctx>

        {/* MOD-bill — BillMedicinesModal */}
        <Ctx
          id="MOD-bill"
          where="zIndex 1500 · backdrop rgba(0,0,0,0.5) · surface #fff · radius 16 (CARD_RADIUS literal) · no shadow · close = inline SVG path ✕ · components/AppointmentQueue/BillMedicinesModal.tsx:368"
        >
          <Band backdrop="rgba(0, 0, 0, 0.5)">
            <Card
              surface={colors.neutral100}
              radius={16}
              shadow=""
              width={500}
              title="Bill medicines"
              close={<SvgClose color={colors.neutral500} />}
            />
          </Band>
        </Ctx>

        {/* MOD-service — AddServiceModal */}
        <Ctx
          id="MOD-service"
          where="zIndex 1000 · backdrop rgba(0,0,0,0.35) · surface #fff · radius 16 (radii.2xl) · no shadow · close = inline SVG path ✕ · pages/Services/AddServiceModal.styles.ts:5"
        >
          <Band backdrop="rgba(0,0,0,0.35)">
            <Card
              surface={colors.neutral100}
              radius={radii["2xl"]}
              shadow=""
              width={440}
              titleFont={fonts.family.primary}
              title="Add service"
              close={<SvgClose color={colors.neutral500} />}
            />
          </Band>
        </Ctx>

        {/* MOD-presets — SchedulePresetsModal */}
        <Ctx
          id="MOD-presets"
          where="zIndex 1200 · backdrop rgba(0,0,0,0.45) · surface primary100 (cream) · radius 16 (radii.xxl) · shadow 0 12px 36px rgba(0,0,0,0.2) · in-tree (no portal) · close = none (Skip button) · components/DoctorSchedule/SchedulePresetsModal.tsx:50"
        >
          <Band backdrop="rgba(0, 0, 0, 0.45)">
            <Card
              surface={colors.primary100}
              radius={radii.xxl}
              shadow="0 12px 36px rgba(0, 0, 0, 0.2)"
              width={420}
              title="Set your hours"
              close={<NoClose hint="no ✕ — 'Skip for now'" />}
            />
          </Band>
        </Ctx>

        {/* MOD-confirm — AddStaff delete-confirm */}
        <Ctx
          id="MOD-confirm"
          where="zIndex 1100 · backdrop rgba(0,0,0,0.5) · surface primary100 (cream) · radius 16 (radii.xxl) · shadow 0 4px 24px rgba(0,0,0,0.15) · close = none (actions only) · components/AddStaffModal/AddStaffModal.styles.ts:59"
        >
          <Band backdrop="rgba(0, 0, 0, 0.5)">
            <Card
              surface={colors.primary100}
              radius={radii.xxl}
              shadow="0 4px 24px rgba(0,0,0,0.15)"
              width={320}
              title="Delete staff member?"
              close={<NoClose hint="no ✕ — actions only" />}
            />
          </Band>
        </Ctx>

        {/* MOD-slot — slot picker (Prescription) */}
        <Ctx
          id="MOD-slot"
          where="zIndex 1100 · backdrop rgba(0,0,0,0.35) · surface primary100 (cream) · radius 16 (radii.2xl) · shadow 0 12px 40px rgba(0,0,0,0.18) · close = none (pick a slot) · pages/PrescriptionPage/PrescriptionPage.tsx:3256"
        >
          <Band backdrop="rgba(0,0,0,0.35)">
            <Card
              surface={colors.primary100}
              radius={radii["2xl"]}
              shadow="0 12px 40px rgba(0,0,0,0.18)"
              width={420}
              title="Choose an appointment slot"
              close={<NoClose hint="no ✕ — pick a slot" />}
            />
          </Band>
        </Ctx>

        {/* MOD-ai — AI SOAP draft (fully off-token) */}
        <Ctx
          id="MOD-ai"
          where='zIndex 2000 · backdrop rgba(0,0,0,0.45) · surface "#fff" · borderRadius 12 (literal) · padding 20 · shadow 0 8px 32px rgba(0,0,0,0.15) · close = "×" char fontSize 22 color "#666" · pages/PrescriptionPage/PrescriptionPage.tsx:3374-3388'
        >
          <Band backdrop="rgba(0,0,0,0.45)">
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                width: "min(560px, 92vw)",
                maxWidth: "100%",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                boxSizing: "border-box",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>AI SOAP draft</h3>
                <CharClose />
              </div>
              <div style={{ minHeight: 32, padding: "8px 10px", background: "#fafafa", borderRadius: 6, fontSize: 13, color: "#888" }}>
                Subjective / Objective / Assessment / Plan…
              </div>
            </div>
          </Band>
        </Ctx>
      </Sub>

      <Sub
        title="Proposed canonical"
        note="One tokenized overlay everything should route through: a single dimmed backdrop token, one radius, one shadow token, and a single ✕ IconButton baked into the shell (not left to the caller)."
      >
        <Ctx
          id="MOD-CANON-PROPOSED"
          canonical
          where="zIndex = modal layer of a real scale · backdrop colors.alphaBlack3 (rgba(0,0,0,0.3)) · surface neutral100 · radius radii.2xl (16) · shadow 0 12px 40px rgba(0,0,0,0.12) · close = ✕ IconButton (built in)"
        >
          <Band backdrop={colors.alphaBlack3}>
            <Card
              surface={colors.neutral100}
              radius={radii["2xl"]}
              shadow="0 12px 40px rgba(0,0,0,0.12)"
              width={440}
              titleFont={fonts.family.primary}
              title="Dialog title"
              close={
                <button
                  type="button"
                  aria-label="Close"
                  style={{
                    border: `${strokes.xs} solid ${colors.neutral200}`,
                    background: colors.neutral100,
                    cursor: "pointer",
                    color: colors.neutral700,
                    width: 32,
                    height: 32,
                    borderRadius: radii.m,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: fonts.size.s,
                  }}
                >
                  ✕
                </button>
              }
            />
          </Band>
        </Ctx>
        <Note>
          + a real zIndex scale (modal / confirm / popover / toast) so a confirm dialog reliably stacks ABOVE its
          parent modal instead of every shell hand-picking a raw integer.
        </Note>
      </Sub>
    </Section>
  );
}
