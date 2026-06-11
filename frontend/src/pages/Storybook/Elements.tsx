// ══════════════════════════════════════════════════════════════════════════════
// Storybook · ELEMENTS — the atomic canonical components, rendered live, each
// with its states + (where relevant) a responsiveness table and detail table.
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { colors, fonts, spacing, radii } from "../../styles/theme";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Field } from "../../components/Field";
import { MeasureField } from "../../components/MeasureField";
import { TextInput } from "../../components/Input/TextInput";
import { Select } from "../../components/Input/Select/Select";
import { UnderlineSelect } from "../../components/Input/UnderlineSelect/UnderlineSelect";
import { Tabs } from "../../components/Tabs";
import { ChevronDown } from "../../components/icons/ChevronDown";
import { Card } from "../../components/Card";
import { HintCard } from "../../components/HintCard";
import { Tag } from "../../components/Tag";
import { Switch } from "../../components/Switch";
import { StatusBadge, PayBadge } from "../../components/AppointmentQueue/StatusBadge";
import { Toast } from "../../components/Toast";
import { tableHeadCell, tableDivider } from "../../styles/tableStyles";
import { Section, Sub, Row, Label, Rule, From, Specimen, DetailTable, ResponsiveTable } from "./kit";

// ── 5 · Buttons ─────────────────────────────────────────────────────────────
export function ButtonsSection() {
  const variants = ["primary","primaryLight","secondary","secondaryLight","dark","light"] as const;
  return (
    <Section id="buttons" title="5 · Buttons"
      tldr={<><From>components/Button</From> — 6 variants × 2 sizes. <b>primary</b> main action · <b>dark</b> destructive confirm (filled black, not red) · <b>secondary</b> themed solid · <b>primaryLight/secondaryLight</b> themed outline · <b>light</b> neutral cancel. Disabled is grey everywhere; text colour = the outline colour.</>}>

      <Sub title="Variants × size × state" note="Hover any button to see its hover state.">
        <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr 1fr", gap: spacing.m, alignItems: "center" }}>
          <div />
          <div style={{ textAlign: "center" }}><Label>sm</Label></div>
          <div style={{ textAlign: "center" }}><Label>md</Label></div>
          <div style={{ textAlign: "center" }}><Label>disabled (md)</Label></div>
          {variants.map(v => (
            <React.Fragment key={v}>
              <div><Label>{v}</Label></div>
              <div style={{ display: "flex", justifyContent: "center" }}><Button variant={v} size="sm">Button</Button></div>
              <div style={{ display: "flex", justifyContent: "center" }}><Button variant={v} size="md">Button</Button></div>
              <div style={{ display: "flex", justifyContent: "center" }}><Button variant={v} size="md" disabled>Button</Button></div>
            </React.Fragment>
          ))}
        </div>
      </Sub>

      <Sub title="Spec & responsiveness">
        <Specimen
          details={<DetailTable rows={[
            ["radius", "radii.full (pill)"],
            ["font", "16px → 14px <1440 (--btn-fs)"],
            ["height sm", "40 → 32"],
            ["height md", "44 → 36"],
            ["padding", "fixed (does not step)"],
            ["disabled", "neutral200 fill / neutral500 text / no stroke (outline → neutral400)"],
          ]} />}>
          <Rule>Buttons step down <b>one tier below 1440</b> — height and font shrink; padding, radius, border and icon size stay fixed. Driven by <code>--btn-*</code> in globals.css.</Rule>
          <ResponsiveTable rows={[
            ["--btn-sm-h", "40px", "32px"],
            ["--btn-md-h", "44px", "36px"],
            ["--btn-fs", "16px", "14px"],
          ]} />
        </Specimen>
      </Sub>

      <Sub title="IconButton" note="components/IconButton — canonical icon-only button (32px circle, neutral700, hover tint). Defaults to ✕; every modal/panel close uses it.">
        <Row>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing["2xs"] }}><IconButton ariaLabel="Close" onClick={() => {}} /><Label>default ✕</Label></div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing["2xs"] }}><IconButton ariaLabel="Disabled" disabled /><Label>disabled</Label></div>
        </Row>
      </Sub>
    </Section>
  );
}

// ── 6 · Input fields ─────────────────────────────────────────────────────────
export function InputsSection() {
  const [a, setA] = useState("Jane Doe");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [e, setE] = useState("bad value");
  const [m, setM] = useState("First line\nSecond line");
  const [price, setPrice] = useState("1,200");
  const [dur, setDur] = useState("15");
  const [wt, setWt] = useState("68"); const [wtU, setWtU] = useState("kg");
  const [tmp, setTmp] = useState("37.0"); const [tmpU, setTmpU] = useState("°C");
  const [sys, setSys] = useState("120"); const [dia, setDia] = useState("80"); const [bpU, setBpU] = useState("mmHg");
  return (
    <Section id="inputs" title="6 · Input fields"
      tldr={<><From>components/Field</From> is the ONE text input — three looks by context: <b>underline</b> (most forms) · <b>box</b> (boxed forms) · <b>pill</b> (search only). One invalid state. <code>TextInput</code> is a thin alias of <code>Field variant="underline"</code>.</>}>
      <Sub title="Field — variants & states">
        <Specimen
          details={<DetailTable rows={[
            ["height", "40px → 32px <1440 (--input-h)"],
            ["pad-y", "6px → 3px (--input-pady)"],
            ["font", "fonts.size.m (16)"],
            ["error", "red200 border + redAlpha10 fill"],
            ["radius", "underline none · box/pill radii.m / full"],
          ]} />}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.m, maxWidth: 560 }}>
            <div><Label>underline (default)</Label><Field variant="underline" value={a} onChange={setA} placeholder="Patient name" /></div>
            <div><Label>box</Label><Field variant="box" value={b} onChange={setB} placeholder="Boxed input" /></div>
            <div><Label>pill (search)</Label><Field variant="pill" value={c} onChange={setC} placeholder="Search…" /></div>
            <div><Label>error</Label><Field variant="box" value={e} onChange={setE} error errorMessage="Required field" /></div>
            <div style={{ gridColumn: "1 / -1" }}><Label>multiline (TextInput alias)</Label><TextInput value={m} onChange={setM} placeholder="Notes" multiline /></div>
          </div>
        </Specimen>
        <Rule>Heights are responsive via <code>--input-h</code> — every field compacts together at &lt;1440 (40→32). This is the same primitive Select &amp; the pickers read.</Rule>
      </Sub>

      <Sub title="MeasureField — value + unit chip (NEW · live)"
        note="components/MeasureField — the shared input behind vitals, price (₹ prefix) and quantity/duration. The unit chip is FIXED (grey) or SWITCHABLE (highlighted — pass onToggleUnit; the parent owns the unit + value conversion). BP is a variant (two inputs + '/'). Try editing the values and clicking the highlighted chips.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(120px, 1fr))", gap: spacing.m, maxWidth: 780 }}>
          <div><Label>box · price (form)</Label><MeasureField box prefix="₹" value={price} onChange={setPrice} inputMode="decimal" /></div>
          <div><Label>box · duration (form)</Label><MeasureField box value={dur} onChange={setDur} unit="mins" /></div>
          <div><Label>cream · weight (vitals)</Label><MeasureField value={wt} onChange={setWt} unit={wtU} onToggleUnit={() => setWtU(u => u === "kg" ? "lb" : "kg")} /></div>
          <div><Label>switchable · temp</Label><MeasureField value={tmp} onChange={setTmp} unit={tmpU} onToggleUnit={() => setTmpU(u => u === "°C" ? "°F" : "°C")} inputMode="decimal" /></div>
          <div><Label>BP variant</Label><MeasureField bp value={sys} onChange={setSys} value2={dia} onChange2={setDia} unit={bpU} onToggleUnit={() => setBpU(u => u === "mmHg" ? "kPa" : "mmHg")} ariaLabel="Systolic" ariaLabel2="Diastolic" /></div>
        </div>
        <Rule><b>box</b> variant (white) = form fields (price/qty) · <b>cream</b> (default) = the vitals grid. Highlighted chip = <b>switchable</b> (click to toggle units); grey = <b>fixed</b>. One component covers both.</Rule>
      </Sub>

      <Sub title="DomainInput — white input · transparent suffix (APPLIED)"
        note="components/Input/DomainInput. Editable = WHITE input + transparent .docodile.app suffix (login / sign-up). Read-only = the input goes transparent too (display only — used on the ClinicCard). available / taken are sign-up states (kept). Shown on a cream card so the transparency reads.">
        <div style={{ background: colors.active.shade100, borderRadius: radii.m, padding: spacing.l, maxWidth: 560, display: "flex", flexDirection: "column", gap: spacing.m }}>
          <span style={{ alignSelf: "flex-start", fontSize: 10, fontWeight: fonts.weight.bold, letterSpacing: 0.4,
            color: colors.secondary700, background: colors.secondary100, borderRadius: radii.xs, padding: "1px 6px" }}>APPLIED</span>
          <div><Label>default (empty) · editable</Label><MockDomain value="" /></div>
          <div><Label>filled · editable</Label><MockDomain value="sunrise" /></div>
          <div><Label>read-only (clinic card) — transparent input</Label><MockDomain value="skin care" readOnly /></div>
          <div><Label>available (sign-up)</Label><MockDomain value="sunrise" border={colors.secondary700} status="Available" statusColor={colors.secondary700} /></div>
          <div><Label>taken / error (sign-up)</Label><MockDomain value="acme-clinic" border={colors.red200} status="Already taken" statusColor={colors.red200} /></div>
        </div>
      </Sub>
    </Section>
  );
}

// Mock of DomainInput — white input box + transparent suffix (read-only = transparent input).
function MockDomain({ value, border, status, statusColor, readOnly }: { value: string; border?: string; status?: string; statusColor?: string; readOnly?: boolean }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", height: "var(--input-h, 40px)", borderRadius: radii.m, overflow: "hidden",
        border: `1px solid ${border || colors.neutral300}`, background: "transparent" }}>
        <input readOnly value={value} placeholder="your-clinic-domain" style={{ flex: 1, minWidth: 0, height: "100%", border: "none",
          outline: "none", padding: "0 12px", background: readOnly ? "transparent" : colors.neutral100, fontFamily: fonts.family.primary, fontSize: fonts.size.m, color: colors.neutral900 }} />
        <div style={{ height: "100%", display: "flex", alignItems: "center", padding: "0 24px", borderLeft: `1px solid ${colors.neutral300}`,
          background: "transparent", fontFamily: fonts.family.primary, fontSize: fonts.size.m, color: colors.neutral900, whiteSpace: "nowrap" }}>.docodile.app</div>
      </div>
      {status && <div style={{ fontSize: fonts.size.xs, color: statusColor, marginTop: 4, marginLeft: 4 }}>{status}</div>}
    </div>
  );
}

// ── 7 · Dropdowns ─────────────────────────────────────────────────────────────
export function DropdownsSection() {
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("Hydrafacial");
  const [u, setU] = useState("");
  return (
    <Section id="dropdowns" title="7 · Dropdowns"
      tldr={<>Triggers share ONE menu surface: thin <code>primary300</code> border + <code>shadows.menu</code>, cream hover, <code>primary100</code> selected, canonical <code>ChevronDown</code> @16. Three trigger styles: <b>Select</b> (box · forms) · <b>inline header pill</b> (box · the date/scope dropdown in the sticky <code>PageHeader</code>) · <b>UnderlineSelect</b> (the booking form). Heights compact via <code>--input-h</code>.</>}>
      <Sub title="Select — box trigger">
        <Specimen
          details={<DetailTable rows={[
            ["trigger h", "40 → 32 (--input-h)"],
            ["menu border", "1px primary300"],
            ["menu shadow", "shadows.menu"],
            ["hover", "active.shade100 (cream)"],
            ["selected", "primary100 + primary700 text"],
            ["chevron", "ChevronDown @ 16"],
          ]} />}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.m, maxWidth: 560 }}>
            <div><Label>empty</Label><Select options={["Consultation","Hydrafacial","Laser Hair Removal"]} value={s1} onChange={setS1} placeholder="+ Add Service" /></div>
            <div><Label>selected</Label><Select options={["Consultation","Hydrafacial","Laser Hair Removal"]} value={s2} onChange={setS2} /></div>
          </div>
        </Specimen>
      </Sub>
      <Sub title="Inline header pill — box trigger (sticky PageHeader)"
        note="The recurring date/scope dropdown inside the queue & Rx sticky headers. Hand-rolled inline: 1px primary400 border, radii.m, ChevronDown — opens a DatePicker. (Same markup in two files — a merge candidate.)">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", color: colors.neutral900,
          border: `1px solid ${colors.primary400}`, borderRadius: radii.m, padding: "4px 12px", fontFamily: fonts.family.primary, fontSize: fonts.size.m }}>
          Wed, 11 Jun <ChevronDown />
        </span>
      </Sub>
      <Sub title="UnderlineSelect — booking form"
        note="Underline trigger, used inside BookAppointment. NOT the sticky header anymore (that uses the box styles above).">
        <div style={{ maxWidth: 360 }}>
          <UnderlineSelect options={["Dr. Vinay","Dr. Rahul","Dr. Priya"]} value={u} onChange={setU} placeholder="Select doctor" />
        </div>
      </Sub>
    </Section>
  );
}

// ── 8 · Tabs ───────────────────────────────────────────────────────────────────
export function TabsSection() {
  const [a, setA] = useState("today");
  return (
    <Section id="tabs" title="8 · Tabs"
      tldr={<><From>components/Tabs</From> — white-pill tabs in two sizes: <b>md</b> (large) and <b>sm</b> (compact). md <b>compacts to sm</b> below 1440 (40/r12 → 32/r8).</>}>
      <Sub title="md (default)">
        <div style={{ maxWidth: 520 }}>
          <Tabs items={[{ id: "today", label: "Today" }, { id: "upcoming", label: "Upcoming" }, { id: "past", label: "Past" }]} activeId={a} onSelect={setA} />
        </div>
      </Sub>
      <ResponsiveTable rows={[
        ["--tab-md-h", "40px", "32px"],
        ["--tab-md-r", "12px", "8px"],
      ]} caption={<>Below 1440 the md tab reads like the sm "visit" size. The sm size is always compact.</>} />
    </Section>
  );
}

// ── 9 · Cards ───────────────────────────────────────────────────────────────────
export function CardsSection() {
  const body = (t: string, x: string) => (
    <>
      <div style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.m, color: colors.neutral900 }}>{t}</div>
      <div style={{ marginTop: spacing.xs, color: colors.neutral600, fontSize: fonts.size.s }}>{x}</div>
    </>
  );
  return (
    <Section id="cards" title="9 · Cards"
      tldr={<>ONE surface from <From>cardSurface(variant, elevation)</From>. Colour by context: <b>surface</b> (white) · <b>sage</b> (clinic) · <b>cream</b> (staff/queue). <code>elevation="raised"</code> = the single soft card shadow; radius always 16. Default <code>variant="plain"</code> = transparent layout shell.</>}>
      <Row align="stretch">
        <Card variant="surface" elevation="none" padding="xl" style={{ width: 240 }}>{body("surface · flat", "White — bills, stat tiles.")}</Card>
        <Card variant="sage" elevation="raised" padding="xl" style={{ width: 240 }}>{body("sage · raised", "Clinic cards — the one shadow.")}</Card>
        <Card variant="cream" elevation="none" padding="xl" style={{ width: 240 }}>{body("cream · flat", "Staff & queue cards.")}</Card>
      </Row>
      <Sub title="HintCard" note="components/HintCard — dashed-border card for tips, empty states, onboarding.">
        <HintCard title="HintCard" description="Dashed-border card used for tips, empty states and onboarding hints." />
      </Sub>
    </Section>
  );
}

// ── 10 · Tags & Switch ──────────────────────────────────────────────────────────
export function ControlsSection() {
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);
  const [sm, setSm] = useState(true);
  return (
    <Section id="controls" title="10 · Tags & Switch"
      tldr={<><From>components/Tag</From> — pill chip, <b>outline</b> (filters) or <b>filled</b> (specialty), optional remove ✕. <From>components/Switch</From> — on/off toggle in two sizes; track turns the active theme colour when on.</>}>
      <Sub title="Tag">
        <Row>
          <Tag label="Outline" />
          <Tag label="Removable" onRemove={() => {}} removeLabel="Remove tag" />
          <Tag label="Filled" variant="filled" />
          <Tag label="Filled · removable" variant="filled" onRemove={() => {}} removeLabel="Remove tag" />
        </Row>
      </Sub>
      <Sub title="Switch">
        <Row>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], alignItems: "flex-start" }}><Switch checked={on} onChange={setOn} ariaLabel="md on" /><Label>md · on</Label></div>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], alignItems: "flex-start" }}><Switch checked={off} onChange={setOff} ariaLabel="md off" /><Label>md · off</Label></div>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], alignItems: "flex-start" }}><Switch checked={sm} onChange={setSm} size="sm" ariaLabel="sm" /><Label>sm</Label></div>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], alignItems: "flex-start" }}><Switch checked disabled onChange={() => {}} ariaLabel="disabled" /><Label>disabled</Label></div>
        </Row>
      </Sub>
    </Section>
  );
}

// ── 11 · Badges ──────────────────────────────────────────────────────────────────
export function BadgesSection() {
  const statuses = ["BOOKED","WAITING","ARRIVED","IN_PROGRESS","COMPLETED","NO_SHOW","CANCELLED"];
  return (
    <Section id="badges" title="11 · Status badges"
      tldr={<><From>components/AppointmentQueue/StatusBadge</From> — ONE badge for both queues (4px radius, solid pastel, dark text). Pass <code>started</code> → "Ongoing" on sage; the appointment queue passes <code>sessionStartedAt</code> → a live timer counting from the backend session start. <b>PayBadge</b> shows paid/due as an icon.</>}>
      <Sub title="StatusBadge">
        <Row>
          {statuses.map(s => <StatusBadge key={s} status={s} />)}
          <StatusBadge status="IN_PROGRESS" started />
        </Row>
      </Sub>
      <Sub title="PayBadge" note="Two states only: paid (check) and due (triangle). DUE / UNPAID / NO PAY all render the same due triangle.">
        <Row>{["PAID","DUE"].map(s => <PayBadge key={s} status={s} />)}</Row>
      </Sub>
    </Section>
  );
}

// ── 12 · Tables ──────────────────────────────────────────────────────────────────
export function TablesSection() {
  const rows = [
    { n: "01", name: "Aisha Rahman", status: "WAITING" },
    { n: "02", name: "Diego Marín", status: "IN_PROGRESS" },
    { n: "03", name: "Mei-Ling Chen", status: "COMPLETED" },
  ];
  return (
    <Section id="tables" title="12 · Tables"
      tldr={<>Shared header look from <From>styles/tableStyles</From>: <code>tableHeadCell</code> (soft-black <code>alphaBlack3</code> / weight 400) + <code>tableDivider</code> (thin <code>primary300</code>). Per-table padding, font-size and card radius stay local.</>}>
      <Specimen
        details={<DetailTable rows={[
          ["th colour", "alphaBlack3"],
          ["th weight", "400"],
          ["divider", "1px primary300"],
          ["cell pad", "per-table (here 12/16)"],
          ["card", "primary100 · radius 16"],
        ]} />}>
        <div style={{ background: colors.primary100, borderRadius: radii["2xl"], padding: spacing.xl, maxWidth: 460 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontFamily: fonts.family.primary }}>
            <thead><tr>{["#","Patient","Status"].map(h => <th key={h} style={{ ...tableHeadCell, padding: "12px 16px", fontSize: fonts.size.m }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.n} style={{ borderBottom: tableDivider }}>
                  <td style={{ padding: "10px 16px", fontSize: fonts.size.m, color: colors.neutral900 }}>{r.n}</td>
                  <td style={{ padding: "10px 16px", fontSize: fonts.size.m, color: colors.neutral900 }}>{r.name}</td>
                  <td style={{ padding: "10px 16px" }}><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Specimen>
    </Section>
  );
}

// ── 13 · Toast ───────────────────────────────────────────────────────────────────
export function ToastSection() {
  const [open, setOpen] = useState(false);
  return (
    <Section id="toast" title="13 · Toast"
      tldr={<><From>components/Toast</From> — transient confirmation, auto-dismiss, sits at <code>zIndex.toast</code> (above modals).</>}>
      <Button variant="secondary" onClick={() => setOpen(true)}>Show toast</Button>
      <Toast message="Saved successfully" isVisible={open} onClose={() => setOpen(false)} />
    </Section>
  );
}
