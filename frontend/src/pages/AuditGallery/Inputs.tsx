// ══════════════════════════════════════════════════════════════════════════════
// TEMP — /audit gallery · Category 2: Inputs
// Each ad-hoc field is transcribed from its real source style object and rendered
// inside a faithful ~360px "form row" mock so size + idiom are visually judgeable.
// Delete the whole AuditGallery folder when the review is done.
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { Section, Sub, Tile, Ctx, Note } from "./shared";
import { TextInput } from "../../components/Input/TextInput/TextInput";   // real, safe to import
import { Select } from "../../components/Input/Select/Select";            // real, safe to import

// ── Local helpers ──────────────────────────────────────────────────────────────

// A faithful labelled "form row": label line above + the field, fixed ~360px.
const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ width: 360, maxWidth: "100%", textAlign: "left" }}>
    <div style={{
      fontFamily: fonts.family.primary, fontSize: fonts.control.sm, fontWeight: fonts.weight.medium,
      color: colors.neutral800, marginBottom: spacing["2xs"],
    }}>{label}</div>
    {children}
  </div>
);

// ── Transcribed ad-hoc field styles (literal copies of the real source) ─────────

// PharmacyView.tsx:511 (also NewPrescriptionModal:520) — boxed h35
const box35: React.CSSProperties = {
  width: "100%", height: 35, boxSizing: "border-box",
  padding: `0 ${spacing.s}`,
  border: `1px solid ${colors.neutral300}`, borderRadius: radii.m,
  backgroundColor: colors.neutral150,
  fontFamily: fonts.family.primary, fontSize: fonts.control.sm,
  color: colors.neutral900, outline: "none",
};

// EditPatientModal.tsx:641 — boxed h40
const box40: React.CSSProperties = {
  width: "100%", height: 40, boxSizing: "border-box",
  padding: `0 ${spacing.s}`,
  border: `1px solid ${colors.neutral300}`, borderRadius: radii.m,
  backgroundColor: colors.neutral150,
  fontFamily: fonts.family.primary, fontSize: fonts.control.md,
  color: colors.neutral900, outline: "none",
};

// DomainInput.styles.ts — 54px box, neutralAlphaBlack bg
const domainBox: React.CSSProperties = {
  display: "flex", alignItems: "center",
  border: `1px solid ${colors.neutral300}`, borderRadius: radii.m,
  gap: spacing.xs, overflow: "hidden",
  backgroundColor: colors.neutralAlphaBlack, height: 54, width: "100%",
};
const domainInput: React.CSSProperties = {
  flex: 1, height: "100%", border: "none", outline: "none",
  padding: spacing.s, fontFamily: fonts.family.primary, fontSize: fonts.size.m,
  backgroundColor: "transparent", color: colors.neutral900,
};
const domainSuffix: React.CSSProperties = {
  height: "100%", display: "flex", alignItems: "center", padding: "0 24px",
  borderLeft: `1px solid ${colors.neutral300}`, fontFamily: fonts.family.primary,
  fontSize: fonts.size.m, color: colors.neutral900, whiteSpace: "nowrap",
};

// PatientPicker.styles.ts:42 — pill search, 48px, primary300 border
const pill48: React.CSSProperties = {
  width: "100%", height: 48, boxSizing: "border-box",
  padding: `0 ${spacing.l} 0 ${spacing.l}`,
  borderRadius: radii.full,
  border: `${strokes.xs} solid ${colors.primary300}`,
  backgroundColor: colors.neutral100,
  fontFamily: fonts.family.primary, fontSize: fonts.size.m, lineHeight: fonts.lineHeight.m,
  color: colors.neutral900, outline: "none",
};

// ── Invalid-state transcriptions ────────────────────────────────────────────────

// INV-2: Select-style full red200 border (Select.styles.ts errorContainer)
const selectErrBox: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: spacing.xs, padding: `0 ${spacing.xs}`,
  border: `${strokes.xs} solid ${colors.red200}`, borderRadius: radii.m,
  backgroundColor: colors.neutral100, height: 40, width: "100%", boxSizing: "border-box",
  color: colors.red200, fontFamily: fonts.family.primary, fontSize: fonts.control.md,
};

// INV-4: raw `border: "1px solid red"` (AddStaffModal:214 / StaffDetailsCard:85)
const rawRedGroup: React.CSSProperties = {
  display: "flex", gap: spacing.s, alignItems: "center",
  border: "1px solid red", borderRadius: "8px", padding: "8px",
  fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral900,
};

// Proposed canonical invalid: red200 border + redAlpha10 fill
const canonInvalid: React.CSSProperties = {
  width: "100%", height: 40, boxSizing: "border-box",
  padding: `0 ${spacing.s}`,
  border: `${strokes.xs} solid ${colors.red200}`, borderRadius: radii.m,
  backgroundColor: colors.redAlpha10,
  fontFamily: fonts.family.primary, fontSize: fonts.control.md,
  color: colors.neutral900, outline: "none",
};

const errMsg: React.CSSProperties = {
  fontFamily: fonts.family.primary, fontSize: fonts.control.xs,
  color: colors.red200, marginTop: 2,
};

// ── Proposed canonical <Field> (mock spec for the audit) ────────────────────────
type FieldVariant = "underline" | "box" | "pill";
type FieldSize = "sm" | "md" | "lg";
const FIELD_H: Record<FieldSize, number> = { sm: 35, md: 40, lg: 48 };

function Field({
  variant, size = "md", error, placeholder, value, onChange,
}: {
  variant: FieldVariant; size?: FieldSize; error?: boolean;
  placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  const h = FIELD_H[size];
  const base: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", height: h,
    fontFamily: fonts.family.primary, fontSize: fonts.control.md,
    color: colors.neutral900, outline: "none",
    backgroundColor: error ? colors.redAlpha10 : "transparent",
  };
  let shape: React.CSSProperties;
  if (variant === "underline") {
    shape = {
      border: "none",
      borderBottom: `${strokes.xs} solid ${error ? colors.red200 : colors.neutral300}`,
      borderRadius: 0, padding: `0 ${spacing.xs}`,
    };
  } else if (variant === "pill") {
    shape = {
      border: `${strokes.xs} solid ${error ? colors.red200 : colors.neutral300}`,
      borderRadius: radii.full, padding: `0 ${spacing.l}`,
      backgroundColor: error ? colors.redAlpha10 : colors.neutral100,
    };
  } else {
    shape = {
      border: `${strokes.xs} solid ${error ? colors.red200 : colors.neutral300}`,
      borderRadius: radii.m, padding: `0 ${spacing.s}`,
      backgroundColor: error ? colors.redAlpha10 : colors.neutral150,
    };
  }
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} style={{ ...base, ...shape }} />
  );
}

// ════════════════════════════════════════════════════════════════════════════════

export function InputsCategory() {
  const [ti, setTi] = useState("Amoxicillin 500mg");
  const [tiErr, setTiErr] = useState("12");
  const [sel, setSel] = useState("");
  const [dom, setDom] = useState("clinic-north");
  const [b35, setB35] = useState("Paracetamol");
  const [b40, setB40] = useState("Jane Doe");
  const [pill, setPill] = useState("");
  const [c1, setC1] = useState("Underline");
  const [c2, setC2] = useState("Boxed value");
  const [c3, setC3] = useState("Search…");
  const [cErr, setCErr] = useState("bad value");

  return (
    <Section id="inputs" title="2 · Inputs" status="shipped">
      <Note>
        <strong>✅ FINALISED &amp; live.</strong> There is now ONE shared{" "}
        <code>&lt;Field&gt;</code> component with three looks — <code>underline</code>{" "}
        (where underline is used today), <code>box</code> (where box is used today), and{" "}
        <code>pill</code> (search inputs only). Every Field is RESPONSIVE via{" "}
        <code>--input-h</code> (40px → 32px on the 1200–1439 tier) and shares ONE error
        look (red border + soft red tint). <code>TextInput</code> is now a thin alias of{" "}
        <code>&lt;Field variant="underline"&gt;</code>; DomainInput, the patient-search
        pill, and the boxed form inputs all compact correctly now too.
      </Note>
      <Note>
        The rows below show the BEFORE — the five hand-rolled idioms whose heights used to
        scatter <strong>35 / 40 / 48 / 54</strong> with no shared rhythm. Kept for the record.
      </Note>

      {/* ─────────────── Swatch overview ─────────────── */}
      <Sub
        title="Field idioms at a glance"
        note="Side-by-side primitives. The four boxed/pill variants are all someone's hand-rolled <input>; only INP-CANON is the shared component. Heights below: 40 / 54 / 35 / 40 / 48."
      >
        <Tile id="INP-CANON" label="TextInput · underline" src="TextInput.styles.ts" canonical>
          <div style={{ width: 180 }}>
            <TextInput value="Underline" onChange={() => {}} />
          </div>
        </Tile>
        <Tile id="INP-domain" label="DomainInput · 54px box" src="DomainInput.styles.ts">
          <div style={{ ...domainBox, width: 180, height: 40 }}>
            <span style={{ ...domainInput, fontSize: fonts.control.sm }}>clinic</span>
            <span style={{ ...domainSuffix, padding: "0 8px", fontSize: fonts.control.xs }}>.doco</span>
          </div>
        </Tile>
        <Tile id="INP-box35" label="Boxed · h35" src="PharmacyView.tsx:511">
          <div style={{ ...box35, width: 160 }}>Boxed 35</div>
        </Tile>
        <Tile id="INP-box40" label="Boxed · h40" src="EditPatientModal.tsx:641">
          <div style={{ ...box40, width: 160, display: "flex", alignItems: "center" }}>Boxed 40</div>
        </Tile>
        <Tile id="INP-pill" label="Pill search · h48" src="PatientPicker.styles.ts:42">
          <div style={{ ...pill48, width: 180, display: "flex", alignItems: "center" }}>Search…</div>
        </Tile>
      </Sub>

      {/* ─────────────── In-context form rows ─────────────── */}
      <Sub
        title="In context — same field, real container"
        note="Each variant inside a ~360px form row (label above + field). Stack them mentally: no two share a height, background, or border treatment. Decision: pick ONE field idiom + height and migrate the rest."
      >
        {/* canonical */}
        <Ctx id="INP-CANON" where="Design-system TextInput · underline · reads --input-pady · TextInput.styles.ts" canonical>
          <FieldRow label="Medication name">
            <TextInput value={ti} onChange={setTi} placeholder="Start typing…" />
          </FieldRow>
        </Ctx>

        {/* Select — the other --input-h honoring control */}
        <Ctx id="INP-select" where="Design-system Select · honors --input-h (40px) · Select.styles.ts">
          <FieldRow label="Form / route">
            <Select
              value={sel}
              onChange={setSel}
              placeholder="Select route…"
              options={["Oral", "Topical", "Injection", "Inhaled"]}
            />
          </FieldRow>
        </Ctx>

        {/* DomainInput 54px */}
        <Ctx id="INP-domain" where="Clinic onboarding · DomainInput · 54px box · neutralAlphaBlack fill · DomainInput.styles.ts">
          <FieldRow label="Clinic subdomain">
            <div style={domainBox}>
              <input value={dom} onChange={(e) => setDom(e.target.value)} style={domainInput} placeholder="your-clinic" />
              <span style={domainSuffix}>.docodile.app</span>
            </div>
          </FieldRow>
        </Ctx>

        {/* boxed 35 */}
        <Ctx id="INP-box35" where="Pharmacy add-stock · 35px box · neutral150 fill · PharmacyView.tsx:511">
          <FieldRow label="Drug name">
            <input value={b35} onChange={(e) => setB35(e.target.value)} style={box35} placeholder="e.g. Paracetamol" />
          </FieldRow>
        </Ctx>

        {/* boxed 40 */}
        <Ctx id="INP-box40" where="Edit-patient modal · 40px box · neutral150 fill · EditPatientModal.tsx:641">
          <FieldRow label="Patient full name">
            <input value={b40} onChange={(e) => setB40(e.target.value)} style={box40} placeholder="Full name" />
          </FieldRow>
        </Ctx>

        {/* pill 48 */}
        <Ctx id="INP-pill" where="Patient picker search · 48px pill · primary300 border · PatientPicker.styles.ts:42">
          <FieldRow label="Find a patient">
            <input value={pill} onChange={(e) => setPill(e.target.value)} style={pill48} placeholder="Search by name or ID…" />
          </FieldRow>
        </Ctx>
      </Sub>

      {/* ─────────────── Invalid-state divergence ─────────────── */}
      <Sub
        title="Invalid-state treatments — the same field, 5 ways"
        note="When a field is invalid, the app does five different things (or nothing). One uses an underline tint, one a full red border, the boxed inputs do NOTHING, and two screens hand-roll a literal `1px solid red`. Decision: adopt one canonical invalid treatment (proposed: red200 border + redAlpha10 fill)."
      >
        {/* INV-1 TextInput invalid */}
        <Ctx id="INV-1" where="TextInput invalid · red200 underline + rgba(255,0,0,0.05) fill · TextInput.styles.ts:31-33">
          <FieldRow label="Quantity">
            <TextInput value={tiErr} onChange={setTiErr} error errorMessage="Must be a whole number" />
          </FieldRow>
        </Ctx>

        {/* INV-2 Select invalid */}
        <Ctx id="INV-2" where="Select invalid · full red200 border + red200 arrow/text · Select.styles.ts errorContainer">
          <FieldRow label="Form / route">
            <div style={selectErrBox}>
              <span>Select route…</span>
              <svg width="14" height="6" viewBox="0 0 14 6" fill="none" style={{ flexShrink: 0 }}>
                <path d="M1 1L7 5L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={errMsg}>Please choose a route</div>
          </FieldRow>
        </Ctx>

        {/* INV-3 boxed = no error styling */}
        <Ctx id="INV-3" where="Boxed inputs · NO error styling at all — invalid looks identical to valid · PharmacyView.tsx:511">
          <FieldRow label="Drug name (invalid, but unchanged)">
            <input value="" onChange={() => {}} style={box35} placeholder="(required)" />
            <div style={errMsg}>Required — yet the field gives no visual cue</div>
          </FieldRow>
        </Ctx>

        {/* INV-4 raw 1px solid red */}
        <Ctx id="INV-4" where="Raw `border: 1px solid red` wrapper · AddStaffModal.tsx:214 / StaffDetailsCard.tsx:85">
          <FieldRow label="Role">
            <div style={rawRedGroup}>
              <label style={{ display: "flex", gap: spacing["2xs"], alignItems: "center" }}>
                <input type="radio" readOnly checked={false} /> Doctor
              </label>
              <label style={{ display: "flex", gap: spacing["2xs"], alignItems: "center" }}>
                <input type="radio" readOnly checked={false} /> Nurse
              </label>
            </div>
            <div style={errMsg}>Pick a role (off-token literal red)</div>
          </FieldRow>
        </Ctx>

        {/* Proposed canonical invalid */}
        <Ctx id="INV-CANON" where="Proposed canonical invalid · red200 border + redAlpha10 fill + control.xs message" canonical>
          <FieldRow label="Quantity">
            <input value={cErr} onChange={(e) => setCErr(e.target.value)} style={canonInvalid} />
            <div style={errMsg}>Must be a whole number</div>
          </FieldRow>
        </Ctx>
      </Sub>

      {/* ─────────────── Proposed canonical <Field> ─────────────── */}
      <Sub
        title="Proposed canonical — one <Field variant size error />"
        note="A single component that absorbs all five idioms: variant ∈ underline | box | pill, size ∈ sm(35) | md(40) | lg(48), and a shared error treatment (red200 border/underline + redAlpha10 fill). The mocks below are that one component in each mode."
      >
        <Ctx id="INP-FIELD" where="Field variant='underline' size='md' · the default — replaces TextInput call sites" canonical>
          <FieldRow label="Underline (md / 40)">
            <Field variant="underline" size="md" value={c1} onChange={setC1} placeholder="Underline…" />
          </FieldRow>
        </Ctx>
        <Ctx id="INP-FIELD-box" where="Field variant='box' size='md' · replaces the h35/h40 boxed inputs" canonical>
          <FieldRow label="Box (md / 40)">
            <Field variant="box" size="md" value={c2} onChange={setC2} placeholder="Boxed…" />
          </FieldRow>
        </Ctx>
        <Ctx id="INP-FIELD-pill" where="Field variant='pill' size='lg' · replaces the PatientPicker search" canonical>
          <FieldRow label="Pill (lg / 48)">
            <Field variant="pill" size="lg" value={c3} onChange={setC3} placeholder="Search…" />
          </FieldRow>
        </Ctx>
        <Ctx id="INP-FIELD-err" where="Field variant='box' size='md' error · the one shared invalid look" canonical>
          <FieldRow label="Box · error state">
            <Field variant="box" size="md" error value="bad value" onChange={() => {}} />
            <div style={errMsg}>Shared red200 + redAlpha10 across every variant</div>
          </FieldRow>
        </Ctx>
      </Sub>
    </Section>
  );
}
