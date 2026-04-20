// ══════════════════════════════════════════════════════════════════════════════
// Design System page — in-app living style guide.
// Reads tokens directly from `theme.ts` so adding a new token makes it appear
// here automatically. Components are listed manually (no registry in React).
// To HIDE from the sidebar later: remove the "Design System" entry from
// SideNav.tsx `NavTab` + menuItems. The page and route keep working.
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { colors, fonts, spacing, radii, strokes, gradients, fluidSpacing } from "../../styles/theme";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { HintCard } from "../../components/HintCard";
import { Modal } from "../../components/Modal";
import { Toast } from "../../components/Toast";
import { Tabs } from "../../components/Tabs";
import { TextInput } from "../../components/Input/TextInput";
import { Select } from "../../components/Input/Select/Select";
import { UnderlineSelect } from "../../components/Input/UnderlineSelect/UnderlineSelect";
import { StatusBadge, PayBadge } from "../../components/AppointmentQueue/StatusBadge";
import { DatePicker } from "../../components/AppointmentQueue/DatePicker";
import { TimePicker } from "../../components/AppointmentQueue/TimePicker";

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
    {
      name: "Brand",
      tokens: (["yellowTeeth","skinColor","paleBlue","whiteTeeth"] as const)
        .map(k => [k, colors[k]]),
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
      <SectionTitle id="spacing">Spacing · Radii · Strokes</SectionTitle>

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

      <SubTitle>Gradients — <code>gradients.*</code></SubTitle>
      <Row>
        {(Object.keys(gradients) as (keyof typeof gradients)[]).map(k => (
          <div key={k} style={{ display: "flex", flexDirection: "column", gap: spacing["2xs"] }}>
            <div style={{ width: 160, height: 72, background: gradients[k], borderRadius: radii.m, border: `${strokes.xs} solid ${colors.neutral200}` }} />
            <Label>{k}</Label>
          </div>
        ))}
      </Row>
    </div>
  );
}

function ButtonsSection() {
  const variants = ["primary","primaryLight","secondary","secondaryLight","dark","light","dangerLight"] as const;
  const sizes = ["sm","md"] as const;
  return (
    <div>
      <SectionTitle id="buttons">Buttons</SectionTitle>
      <Label>Each variant × size × state (default, disabled). Hover to see hover state.</Label>
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

  return (
    <div>
      <SectionTitle id="inputs">Inputs</SectionTitle>

      <SubTitle>TextInput — states</SubTitle>
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

function BadgesSection() {
  const statuses = ["BOOKED","WAITING","ARRIVED","IN_PROGRESS","COMPLETED","NO_SHOW","CANCELLED"];
  const payStatuses = ["PAID","DUE","NO PAY"];
  return (
    <div>
      <SectionTitle id="badges">Badges</SectionTitle>

      <SubTitle>StatusBadge</SubTitle>
      <Row>
        {statuses.map(s => <StatusBadge key={s} status={s} />)}
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
  return (
    <div>
      <SectionTitle id="cards">Cards</SectionTitle>
      <Row>
        <Card style={{ width: 320, padding: spacing.l }}>
          <div style={{ fontSize: fonts.size.m, fontWeight: fonts.weight.medium, color: colors.neutral900 }}>Generic Card</div>
          <div style={{ marginTop: spacing.s, color: colors.neutral600, fontSize: fonts.size.s }}>
            Base container used across the app. Accepts custom <code>style</code> overrides.
          </div>
        </Card>

        <HintCard
          title="HintCard"
          description="Dashed-border card used for tips, empty states, and onboarding hints."
        />
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
  const sections = [
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "spacing", label: "Spacing & Radii" },
    { id: "buttons", label: "Buttons" },
    { id: "inputs", label: "Inputs" },
    { id: "badges", label: "Badges" },
    { id: "cards", label: "Cards" },
    { id: "tabs", label: "Tabs" },
    { id: "overlays", label: "Overlays" },
  ];

  return (
    <div style={{ maxWidth: 1080 }}>
      <h1 style={{ fontSize: fonts.size.h4, fontWeight: fonts.weight.semibold, color: colors.neutral900, margin: 0 }}>
        Design System
      </h1>
      <p style={{ color: colors.neutral600, fontSize: fonts.size.s, marginTop: spacing.xs }}>
        Living reference for all tokens and UI primitives used across the app. Auto-generated from <code>theme.ts</code>.
      </p>

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
      <BadgesSection />
      <CardsSection />
      <TabsSection />
      <OverlaysSection />

      <div style={{ marginTop: spacing["3xl"], padding: `${spacing.l} 0`, color: colors.neutral400, fontSize: fonts.size.xs, textAlign: "center" }}>
        End of catalog · {sections.length} sections
      </div>
    </div>
  );
}
