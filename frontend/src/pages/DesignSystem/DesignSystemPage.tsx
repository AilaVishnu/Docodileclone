// ══════════════════════════════════════════════════════════════════════════════
// Design System page — in-app living style guide.
// Reads tokens directly from `theme.ts` so adding a new token makes it appear
// here automatically. Components are listed manually (no registry in React).
// To HIDE from the sidebar later: remove the "Design System" entry from
// SideNav.tsx `NavTab` + menuItems. The page and route keep working.
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { colors, fonts, spacing, radii, strokes, shadows, fluidSpacing } from "../../styles/theme";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Card } from "../../components/Card";
import { HintCard } from "../../components/HintCard";
import { Modal } from "../../components/Modal";
import { Toast } from "../../components/Toast";
import { Tabs } from "../../components/Tabs";
import { Tag } from "../../components/Tag";
import { Switch } from "../../components/Switch";
import { TextInput } from "../../components/Input/TextInput";
import { Field } from "../../components/Field";
import { Select } from "../../components/Input/Select/Select";
import { UnderlineSelect } from "../../components/Input/UnderlineSelect/UnderlineSelect";
import { StatusBadge, PayBadge } from "../../components/AppointmentQueue/StatusBadge";
import { DatePicker } from "../../components/DatePicker/DatePicker";
import { TimePicker } from "../../components/AppointmentQueue/TimePicker";
import { tableHeadCell, tableDivider } from "../../styles/tableStyles";

// ── Layout primitives used inside this page only ───────────────────────────────
const SectionTitle = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <h2 id={id} style={{
    fontSize: fonts.size.h5,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral900,
    margin: `${spacing["2xl"]} 0 ${spacing.m} 0`,
    paddingTop: spacing.l,
    borderTop: `${strokes.xs} solid ${colors.neutral200}`,
    scrollMarginTop: "24px",
  }}>{children}</h2>
);

const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.medium,
    color: colors.neutral700,
    margin: `${spacing.l} 0 ${spacing.s} 0`,
  }}>{children}</h3>
);

const Row = ({ children, wrap = true }: { children: React.ReactNode; wrap?: boolean }) => (
  <div style={{
    display: "flex",
    flexWrap: wrap ? "wrap" : "nowrap",
    gap: spacing.m,
    alignItems: "center",
  }}>{children}</div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: fonts.size.xs, color: colors.neutral500, fontFamily: fonts.family.primary }}>{children}</div>
);

// One-line "when to use / canonical rule" caption shown under a component title.
const Rule = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontSize: fonts.size.xs, color: colors.neutral600, fontFamily: fonts.family.primary,
    lineHeight: 1.5, maxWidth: 760, margin: `0 0 ${spacing.s} 0`,
  }}>{children}</div>
);

// Import-path chip so each component says exactly where it lives (SSOT pointer).
const From = ({ children }: { children: React.ReactNode }) => (
  <code style={{
    fontSize: 11, color: colors.neutral500, fontFamily: "monospace",
    background: colors.neutral150, borderRadius: radii.xs, padding: "1px 6px",
  }}>{children}</code>
);

// ── Sections ──────────────────────────────────────────────────────────────────

function ColorsSection() {
  // Group the palette for readability
  const groups: { name: string; tokens: [string, string][] }[] = [
    {
      name: "Neutrals",
      tokens: (["neutral100","neutral150","neutral200","neutral300","neutral400","neutral500","neutral600","neutral700","neutral800","neutral900","neutral1000"] as const)
        .map(k => [k, colors[k]]),
    },
    {
      name: "Primary",
      tokens: (["primary100","primary200","primary300","primary400","primary500","primary600","primary700","primary800"] as const)
        .map(k => [k, colors[k]]),
    },
    {
      name: "Secondary",
      tokens: (["secondary50","secondary100","secondary200","secondary300","secondary400","secondary500","secondary600","secondary700","secondary800"] as const)
        .map(k => [k, colors[k]]),
    },
    {
      name: "Alerts",
      tokens: (["red100","red200","green100","green200","yellow100","yellow200"] as const)
        .map(k => [k, colors[k]]),
    },
    {
      name: "Alphas",
      tokens: (["alphaBlack0","alphaBlack1","alphaBlack2","alphaBlack3","alphaWhite1","redAlpha10","greenAlpha10","yellowAlpha10"] as const)
        .map(k => [k, colors[k]]),
    },
    {
      name: "Active theme (themable via CSS vars)",
      tokens: (Object.entries(colors.active) as [string, string][]).map(([k, v]) => [`active.${k}`, v]),
    },
  ];

  const Swatch = ({ name, value }: { name: string; value: string }) => (
    <div
      title={`Click to copy ${value}`}
      onClick={() => navigator.clipboard?.writeText(value)}
      style={{
        display: "flex", flexDirection: "column", gap: spacing["2xs"],
        cursor: "pointer", minWidth: 120,
      }}
    >
      <div style={{
        height: 72, borderRadius: radii.m,
        border: `${strokes.xs} solid ${colors.neutral200}`,
        backgroundColor: value.startsWith("rgba") || value.startsWith("var") ? value : value,
        backgroundImage: value.includes("rgba") || value.includes("alpha")
          ? "repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 12px 12px"
          : undefined,
      }}>
        <div style={{ width: "100%", height: "100%", borderRadius: radii.m, backgroundColor: value }} />
      </div>
      <Label>{name}</Label>
      <div style={{ fontSize: fonts.size.xs, color: colors.neutral700, fontFamily: "monospace" }}>{value}</div>
    </div>
  );

  return (
    <div>
      <SectionTitle id="colors">Colors</SectionTitle>
      <Label>Click any swatch to copy the value. Checkerboard backing = alpha colors.</Label>
      {groups.map(g => (
        <div key={g.name}>
          <SubTitle>{g.name}</SubTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: spacing.m }}>
            {g.tokens.map(([k, v]) => <Swatch key={k} name={k} value={v} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function TypographySection() {
  const fluidSizes = ["h1","h2","h3","h4","h5","h6","l","m","s","xs","caption"] as const;
  const controlSizes = ["lg","md","sm","xs"] as const;
  const weights = ["regular","medium","semibold","bold"] as const;

  return (
    <div>
      <SectionTitle id="typography">Typography</SectionTitle>

      <SubTitle>Fluid scale — <code>fonts.size.*</code> (body & headings)</SubTitle>
      <Label>Sizes use <code>clamp()</code> — held at min up to 1920px viewport, grow mildly beyond.</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.s, marginTop: spacing.s }}>
        {fluidSizes.map(k => (
          <div key={k} style={{ display: "flex", alignItems: "baseline", gap: spacing.m }}>
            <Label>{k}</Label>
            <div style={{ fontSize: fonts.size[k], fontFamily: fonts.family.primary, color: colors.neutral900, lineHeight: 1.2 }}>
              The quick brown fox jumps over the lazy dog
            </div>
            <div style={{ fontSize: fonts.size.xs, color: colors.neutral500, fontFamily: "monospace", marginLeft: "auto" }}>
              {fonts.size[k]}
            </div>
          </div>
        ))}
      </div>

      <SubTitle>Control scale — <code>fonts.control.*</code> (buttons, inputs, badges — static)</SubTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.s }}>
        {controlSizes.map(k => (
          <div key={k} style={{ display: "flex", alignItems: "baseline", gap: spacing.m }}>
            <Label>control.{k}</Label>
            <div style={{ fontSize: fonts.control[k], fontFamily: fonts.family.primary, color: colors.neutral900 }}>
              Lorem ipsum control label
            </div>
            <div style={{ fontSize: fonts.size.xs, color: colors.neutral500, fontFamily: "monospace", marginLeft: "auto" }}>
              {fonts.control[k]}
            </div>
          </div>
        ))}
      </div>

      <SubTitle>Weights</SubTitle>
      <Row>
        {weights.map(w => (
          <div key={w} style={{ minWidth: 140 }}>
            <div style={{ fontSize: fonts.size.m, fontWeight: fonts.weight[w], fontFamily: fonts.family.primary, color: colors.neutral900 }}>Aa · Weight</div>
            <Label>{w} ({fonts.weight[w]})</Label>
          </div>
        ))}
      </Row>

      <SubTitle>Families</SubTitle>
      <Row>
        <div>
          <div style={{ fontSize: fonts.size.h5, fontFamily: fonts.family.primary, color: colors.neutral900 }}>Docodile — primary</div>
          <Label>{fonts.family.primary}</Label>
        </div>
        <div>
          <div style={{ fontSize: fonts.size.h5, fontFamily: fonts.family.secondary, color: colors.neutral900, fontStyle: "italic" }}>Docodile — secondary</div>
          <Label>{fonts.family.secondary}</Label>
        </div>
      </Row>
    </div>
  );
}

function SpacingSection() {
  const staticKeys = ["3xs","2xs","xs","s","m","l","xl","2xl","3xl","4xl","5xl","6xl","7xl"] as const;
  return (
    <div>
      <SectionTitle id="spacing">Spacing · Radii · Strokes · Shadows</SectionTitle>

      <SubTitle>Static spacing — <code>spacing.*</code></SubTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"] }}>
        {staticKeys.map(k => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: spacing.m }}>
            <Label>{k}</Label>
            <div style={{ width: spacing[k], height: 12, backgroundColor: colors.active.shade500, borderRadius: radii.xs }} />
            <div style={{ fontSize: fonts.size.xs, color: colors.neutral500, fontFamily: "monospace" }}>{spacing[k]}</div>
          </div>
        ))}
      </div>

      <SubTitle>Fluid spacing — <code>fluidSpacing.*</code> (outer shell only)</SubTitle>
      {(["outerY","outerX","sectionGap","cardX"] as const).map(k => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: spacing.m, padding: `${spacing["2xs"]} 0` }}>
          <Label>{k}</Label>
          <div style={{ width: fluidSpacing[k], height: 12, backgroundColor: colors.active.shade700, borderRadius: radii.xs }} />
          <div style={{ fontSize: fonts.size.xs, color: colors.neutral500, fontFamily: "monospace" }}>{fluidSpacing[k]}</div>
        </div>
      ))}

      <SubTitle>Radii — <code>radii.*</code></SubTitle>
      <Row>
        {(["none","2xs","xs","s","m","l","xl","2xl","full"] as const).map(k => (
          <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing["2xs"] }}>
            <div style={{ width: 56, height: 56, backgroundColor: colors.active.shade400, borderRadius: radii[k] }} />
            <Label>{k} · {radii[k]}px</Label>
          </div>
        ))}
      </Row>

      <SubTitle>Strokes — <code>strokes.*</code></SubTitle>
      <Row>
        {(["xs","s","m","l"] as const).map(k => (
          <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing["2xs"] }}>
            <div style={{ width: 80, height: 40, border: `${strokes[k]} solid ${colors.neutral900}`, borderRadius: radii.s }} />
            <Label>{k} · {strokes[k]}</Label>
          </div>
        ))}
      </Row>

      <SubTitle>Shadows — <code>shadows.*</code></SubTitle>
      <Rule>One elevation scale. <code>menu</code> = dropdowns / popovers · <code>modal</code> = dialogs · <code>card</code> = raised cards. Use the token, never an inline shadow string.</Rule>
      <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.xl }}>
        {(["menu","modal","card"] as const).map(k => (
          <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing.xs, padding: spacing.s }}>
            <div style={{ width: 120, height: 64, background: colors.neutral100, borderRadius: radii.m, boxShadow: shadows[k] }} />
            <Label>shadows.{k}</Label>
          </div>
        ))}
      </div>

      <SubTitle>Gradients</SubTitle>
      <Row>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"] }}>
          <div style={{ width: 160, height: 72, background: "var(--sunset)", borderRadius: radii.m, border: `${strokes.xs} solid ${colors.neutral200}` }} />
          <Label>--sunset (body bg)</Label>
        </div>
      </Row>
    </div>
  );
}

function ButtonsSection() {
  const variants = ["primary","primaryLight","secondary","secondaryLight","dark","light"] as const;
  const sizes = ["sm","md"] as const;
  return (
    <div>
      <SectionTitle id="buttons">Buttons</SectionTitle>
      <Rule><From>components/Button</From> — 6 variants × 2 sizes. <b>primary</b> = main action · <b>dark</b> = destructive confirm (filled black, not red) · <b>secondary</b> = themed solid · <b>primaryLight / secondaryLight</b> = themed outline · <b>light</b> = neutral cancel. Disabled is grey for every variant. Hover to see the hover state.</Rule>
      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr 1fr", gap: spacing.m, alignItems: "center", marginTop: spacing.m }}>
        <div />
        {sizes.map(s => <div key={s} style={{ textAlign: "center" }}><Label>size: {s}</Label></div>)}
        <div style={{ textAlign: "center" }}><Label>disabled (md)</Label></div>

        {variants.map(v => (
          <React.Fragment key={v}>
            <div><Label>{v}</Label></div>
            {sizes.map(s => (
              <div key={s} style={{ display: "flex", justifyContent: "center" }}>
                <Button variant={v} size={s}>Button label</Button>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button variant={v} size="md" disabled>Button label</Button>
            </div>
          </React.Fragment>
        ))}
      </div>

      <SubTitle>IconButton</SubTitle>
      <Rule><From>components/IconButton</From> — the canonical icon-only button (32px circle, neutral700, hover tint). Defaults to a ✕ close glyph; pass <code>children</code> for any other icon. Every modal/panel close uses it.</Rule>
      <Row>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing["2xs"] }}>
          <IconButton ariaLabel="Close" onClick={() => {}} />
          <Label>default ✕</Label>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing["2xs"] }}>
          <IconButton ariaLabel="Disabled close" disabled />
          <Label>disabled</Label>
        </div>
      </Row>
    </div>
  );
}

function InputsSection() {
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("Jane Doe");
  const [errText, setErrText] = useState("bad input");
  const [multi, setMulti] = useState("First line\nSecond line");
  const [sel, setSel] = useState("");
  const [sel2, setSel2] = useState("Hydrafacial");
  const [uline, setUline] = useState("");
  const [fUnder, setFUnder] = useState("Jane Doe");
  const [fBox, setFBox] = useState("");
  const [fPill, setFPill] = useState("");
  const [fErr, setFErr] = useState("bad value");

  return (
    <div>
      <SectionTitle id="inputs">Inputs</SectionTitle>
      <Rule><From>components/Field</From> is the canonical text input — ONE component, three looks chosen by context: <b>underline</b> (most forms) · <b>box</b> (boxed forms) · <b>pill</b> (search only). Height is responsive via <code>--input-h</code>. One invalid state: red200 border + redAlpha10 fill. <code>TextInput</code> is now a thin alias of <code>Field variant="underline"</code>.</Rule>

      <SubTitle>Field — variants &amp; error</SubTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.m, maxWidth: 640 }}>
        <div><Label>underline (default)</Label><Field variant="underline" value={fUnder} onChange={setFUnder} placeholder="Patient name" /></div>
        <div><Label>box</Label><Field variant="box" value={fBox} onChange={setFBox} placeholder="Boxed input" /></div>
        <div><Label>pill (search)</Label><Field variant="pill" value={fPill} onChange={setFPill} placeholder="Search…" /></div>
        <div><Label>error</Label><Field variant="box" value={fErr} onChange={setFErr} error errorMessage="Required field" /></div>
      </div>

      <SubTitle>TextInput — states <span style={{ fontWeight: 400, color: colors.neutral500 }}>(alias of Field underline)</span></SubTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.m, maxWidth: 640 }}>
        <div><Label>Empty · placeholder</Label><TextInput value={text} onChange={setText} placeholder="Enter text" /></div>
        <div><Label>Typed</Label><TextInput value={typed} onChange={setTyped} placeholder="Enter text" /></div>
        <div><Label>Error</Label><TextInput value={errText} onChange={setErrText} error errorMessage="Something is off" /></div>
        <div><Label>Multiline</Label><TextInput value={multi} onChange={setMulti} placeholder="Notes" multiline /></div>
      </div>

      <SubTitle>Select</SubTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.m, maxWidth: 640 }}>
        <div>
          <Label>Empty</Label>
          <Select options={["Consultation","Hydrafacial","Laser Hair Removal"]} value={sel} onChange={setSel} placeholder="+ Add Service" />
        </div>
        <div>
          <Label>Selected</Label>
          <Select options={["Consultation","Hydrafacial","Laser Hair Removal"]} value={sel2} onChange={setSel2} />
        </div>
      </div>

      <SubTitle>UnderlineSelect</SubTitle>
      <div style={{ maxWidth: 400 }}>
        <UnderlineSelect options={["Dr. Vinay","Dr. Rahul","Dr. Priya"]} value={uline} onChange={setUline} placeholder="Select doctor" />
      </div>
    </div>
  );
}

function ControlsSection() {
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);
  const [sm, setSm] = useState(true);
  return (
    <div>
      <SectionTitle id="controls">Tags &amp; Switch</SectionTitle>

      <SubTitle>Tag</SubTitle>
      <Rule><From>components/Tag</From> — pill chip in two looks: <b>outline</b> (filters, removable selections) and <b>filled</b> (specialty chips). Optional remove ✕.</Rule>
      <Row>
        <Tag label="Outline" />
        <Tag label="Removable" onRemove={() => {}} removeLabel="Remove tag" />
        <Tag label="Filled" variant="filled" />
        <Tag label="Filled · removable" variant="filled" onRemove={() => {}} removeLabel="Remove tag" />
      </Row>

      <SubTitle>Switch</SubTitle>
      <Rule><From>components/Switch</From> — on/off toggle in two sizes. The track turns the active theme colour when on.</Rule>
      <Row>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], alignItems: "flex-start" }}>
          <Switch checked={on} onChange={setOn} size="md" ariaLabel="md on" />
          <Label>md · on</Label>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], alignItems: "flex-start" }}>
          <Switch checked={off} onChange={setOff} size="md" ariaLabel="md off" />
          <Label>md · off</Label>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], alignItems: "flex-start" }}>
          <Switch checked={sm} onChange={setSm} size="sm" ariaLabel="sm" />
          <Label>sm</Label>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"], alignItems: "flex-start" }}>
          <Switch checked disabled onChange={() => {}} ariaLabel="disabled" />
          <Label>disabled</Label>
        </div>
      </Row>
    </div>
  );
}

function BadgesSection() {
  const statuses = ["BOOKED","WAITING","ARRIVED","IN_PROGRESS","COMPLETED","NO_SHOW","CANCELLED"];
  const payStatuses = ["PAID","DUE","NO PAY"];
  return (
    <div>
      <SectionTitle id="badges">Badges</SectionTitle>

      <SubTitle>StatusBadge</SubTitle>
      <Rule><From>components/AppointmentQueue/StatusBadge</From> — ONE badge system for both queues. Pass <code>started</code> so a running prescription visit reads "Ongoing" on sage; the appointment queue passes <code>patientId</code> to swap IN_PROGRESS for a live timer.</Rule>
      <Row>
        {statuses.map(s => <StatusBadge key={s} status={s} />)}
        <StatusBadge status="IN_PROGRESS" started />
      </Row>

      <SubTitle>PayBadge</SubTitle>
      <Row>
        {payStatuses.map(s => <PayBadge key={s} status={s} />)}
      </Row>

      <SubTitle>TypeBadge (star New / arrow Review)</SubTitle>
      <Label>Rendered only inside QueueTable currently — visual reference:</Label>
      <Row>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: fonts.size.s, color: colors.neutral900 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2.6 7.6 8 .3-6.4 4.8 2.4 7.6L12 18l-6.6 4.3 2.4-7.6L1.4 9.9l8-.3z"/></svg>
          New
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: fonts.size.s, color: colors.neutral900 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>
          Review
        </span>
      </Row>
    </div>
  );
}

function CardsSection() {
  const body = (title: string, text: string) => (
    <>
      <div style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.m, color: colors.neutral900 }}>{title}</div>
      <div style={{ marginTop: spacing.xs, color: colors.neutral600, fontSize: fonts.size.s }}>{text}</div>
    </>
  );
  return (
    <div>
      <SectionTitle id="cards">Cards</SectionTitle>
      <Rule><From>components/Card</From> — ONE surface from <code>cardSurface(variant, elevation)</code>. Colour by context: <b>surface</b> (white · bills/stats) · <b>sage</b> (clinic) · <b>cream</b> (staff/queue). <code>elevation="raised"</code> adds the single soft card shadow; radius is always 16. The default <code>variant="plain"</code> is the transparent layout shell.</Rule>
      <Row>
        <Card variant="surface" elevation="none" padding="xl" style={{ width: 260 }}>{body("surface · flat", "White card — bills, stat tiles.")}</Card>
        <Card variant="sage" elevation="raised" padding="xl" style={{ width: 260 }}>{body("sage · raised", "Clinic cards — the one surface with a soft shadow.")}</Card>
        <Card variant="cream" elevation="none" padding="xl" style={{ width: 260 }}>{body("cream · flat", "Staff & queue cards.")}</Card>
      </Row>

      <SubTitle>HintCard</SubTitle>
      <Rule><From>components/HintCard</From> — dashed-border card for tips, empty states and onboarding.</Rule>
      <Row>
        <HintCard title="HintCard" description="Dashed-border card used for tips, empty states, and onboarding hints." />
      </Row>
    </div>
  );
}

function TabsSection() {
  const [active, setActive] = useState("today");
  return (
    <div>
      <SectionTitle id="tabs">Tabs</SectionTitle>
      <div style={{ maxWidth: 560 }}>
        <Tabs
          items={[{ id: "today", label: "Today" }, { id: "upcoming", label: "Upcoming" }, { id: "past", label: "Past" }]}
          activeId={active}
          onSelect={setActive}
        />
      </div>
    </div>
  );
}

function TablesSection() {
  const rows = [
    { n: "01", name: "Aisha Rahman", status: "WAITING" },
    { n: "02", name: "Diego Marín", status: "IN_PROGRESS" },
    { n: "03", name: "Mei-Ling Chen", status: "COMPLETED" },
  ];
  return (
    <div>
      <SectionTitle id="tables">Tables</SectionTitle>
      <Rule><From>styles/tableStyles</From> — the shared header look: <code>tableHeadCell</code> (soft-black alphaBlack3 / weight 400) + <code>tableDivider</code> (thin primary300). Per-table padding, font-size and card radius stay local; only the header colour/weight + divider are unified.</Rule>
      <div style={{ background: colors.primary100, borderRadius: radii["2xl"], padding: spacing.xl, maxWidth: 520 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontFamily: fonts.family.primary }}>
          <thead>
            <tr>
              {["#", "Patient", "Status"].map(h => (
                <th key={h} style={{ ...tableHeadCell, padding: "12px 16px", fontSize: fonts.size.m }}>{h}</th>
              ))}
            </tr>
          </thead>
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
    </div>
  );
}

function OverlaysSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");

  return (
    <div>
      <SectionTitle id="overlays">Modal · Toast · Pickers</SectionTitle>
      <Row>
        <Button variant="primary" onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Button variant="secondary" onClick={() => setToastOpen(true)}>Show Toast</Button>
        <Button variant="dark" onClick={() => setDateOpen(v => !v)}>{dateOpen ? "Close" : "Open"} DatePicker</Button>
        <Button variant="dark" onClick={() => setTimeOpen(v => !v)}>{timeOpen ? "Close" : "Open"} TimePicker</Button>
      </Row>

      <div style={{ position: "relative", marginTop: spacing.xl, minHeight: 320 }}>
        {dateOpen && (
          <div style={{ position: "absolute", top: 0, left: 0 }}>
            <DatePicker
              selectedDate={date || new Date()}
              onSelect={(d: Date) => { setDate(d); setDateOpen(false); }}
              onClose={() => setDateOpen(false)}
            />
          </div>
        )}
        {timeOpen && (
          <div style={{ position: "absolute", top: 0, left: 280 }}>
            <TimePicker
              initialTime={time}
              onSelect={(t) => { setTime(t); setTimeOpen(false); }}
              onClose={() => setTimeOpen(false)}
            />
          </div>
        )}
        {date && <Label>Picked date: {date.toLocaleDateString()}</Label>}
        {time && <Label>Picked time: {time}</Label>}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div style={{ padding: spacing.xl, minWidth: 320 }}>
          <h3 style={{ margin: 0, fontSize: fonts.size.h6, color: colors.neutral900 }}>Modal title</h3>
          <p style={{ marginTop: spacing.s, color: colors.neutral700, fontSize: fonts.size.s }}>
            This is a Modal — overlay with backdrop click-to-dismiss.
          </p>
          <div style={{ marginTop: spacing.l, display: "flex", gap: spacing.s, justifyContent: "flex-end" }}>
            <Button variant="light" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>Confirm</Button>
          </div>
        </div>
      </Modal>

      <Toast message="Saved successfully" isVisible={toastOpen} onClose={() => setToastOpen(false)} />
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────
export function DesignSystemPage() {
  const [theme, setTheme] = useState<"primary" | "secondary">("primary");
  const applyTheme = (t: "primary" | "secondary") => {
    setTheme(t);
    if (t === "secondary") document.documentElement.setAttribute("data-theme", "secondary");
    else document.documentElement.removeAttribute("data-theme");
  };
  const sections = [
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "spacing", label: "Spacing & Shadows" },
    { id: "buttons", label: "Buttons" },
    { id: "inputs", label: "Inputs" },
    { id: "controls", label: "Tags & Switch" },
    { id: "badges", label: "Badges" },
    { id: "cards", label: "Cards" },
    { id: "tables", label: "Tables" },
    { id: "tabs", label: "Tabs" },
    { id: "overlays", label: "Overlays" },
  ];

  return (
    <div style={{ maxWidth: 1080 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.m, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: fonts.size.h4, fontWeight: fonts.weight.semibold, color: colors.neutral900, margin: 0 }}>
            Design System
          </h1>
          <p style={{ color: colors.neutral600, fontSize: fonts.size.s, marginTop: spacing.xs, maxWidth: 720, lineHeight: 1.5 }}>
            The single source of truth for the app's tokens and UI components. Every specimen below is the{" "}
            <b>real component, rendered live</b> — so this page can't drift from production. Tokens read straight
            from <code>theme.ts</code>.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, flexShrink: 0 }}>
          <Label>theme:</Label>
          <button onClick={() => applyTheme("primary")} style={{ cursor: "pointer", border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.s, padding: "4px 10px",
            background: theme === "primary" ? colors.neutral900 : colors.neutral100, color: theme === "primary" ? colors.neutral100 : colors.neutral700, fontSize: fonts.size.xs }}>Primary</button>
          <button onClick={() => applyTheme("secondary")} style={{ cursor: "pointer", border: `${strokes.xs} solid ${colors.neutral300}`, borderRadius: radii.s, padding: "4px 10px",
            background: theme === "secondary" ? colors.neutral900 : colors.neutral100, color: theme === "secondary" ? colors.neutral100 : colors.neutral700, fontSize: fonts.size.xs }}>Secondary</button>
        </div>
      </div>

      {/* sticky section nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        backgroundColor: colors.active.shade100,
        padding: `${spacing.s} 0`,
        borderBottom: `${strokes.xs} solid ${colors.neutral200}`,
        marginTop: spacing.m,
      }}>
        <Row>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{
              fontSize: fonts.size.s,
              color: colors.neutral700,
              textDecoration: "none",
              padding: `${spacing["2xs"]} ${spacing.s}`,
              borderRadius: radii.s,
              border: `${strokes.xs} solid ${colors.neutral200}`,
            }}>{s.label}</a>
          ))}
        </Row>
      </div>

      <ColorsSection />
      <TypographySection />
      <SpacingSection />
      <ButtonsSection />
      <InputsSection />
      <ControlsSection />
      <BadgesSection />
      <CardsSection />
      <TablesSection />
      <TabsSection />
      <OverlaysSection />

      <div style={{ marginTop: spacing["3xl"], padding: `${spacing.l} 0`, color: colors.neutral400, fontSize: fonts.size.xs, textAlign: "center" }}>
        End of catalog · {sections.length} sections
      </div>
    </div>
  );
}
