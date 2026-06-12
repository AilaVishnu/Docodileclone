// ══════════════════════════════════════════════════════════════════════════════
// Storybook · COMPONENTS — the shared leaf components not covered by Elements.
// Every specimen renders the REAL component with static props (front-end only —
// no hooks / no backend). Each section follows one template: description (TL;DR)
// · variants/states (StateGrid) · props (PropsTable).
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { colors, fonts, spacing, radii, strokes } from "../../styles/theme";
import { Section, Sub, Row, From, StateGrid, PropsTable, Stage } from "./kit";
import { IconButton } from "../../components/IconButton";
import { MeasureField } from "../../components/MeasureField";
import { FillInput } from "../../components/FillInput";
import { DataGrid, GridColumn } from "../../components/DataGrid/DataGrid";
import { UploadModal } from "../../components/UploadModal";
import { PopoverMenu } from "../../components/PopoverMenu/PopoverMenu";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { Button } from "../../components/Button";
import { ReactComponent as PrinterIcon } from "../../assets/icons/printer.svg";

// Small box to give a fixed width to a field specimen.
const W = ({ w = 150, h = 32, children }: { w?: number; h?: number; children: React.ReactNode }) => (
  <div style={{ width: w, ["--input-h" as string]: `${h}px` } as React.CSSProperties}>{children}</div>
);

// ── 20 · IconButton ───────────────────────────────────────────────────────────
export function IconButtonSection() {
  return (
    <Section id="iconbutton" title="15 · IconButton"
      tldr={<><From>components/IconButton</From> — the canonical icon-only button: a 32px circular hit target, neutral700 glyph, subtle hover tint. Defaults to a ✕ close glyph (24px, 1.5 stroke); pass <code>children</code> for any other icon. Replaced ~12 hand-rolled close buttons.</>}>
      <Sub title="States & sizes">
        <StateGrid items={[
          { label: "default (✕)", node: <IconButton ariaLabel="Close" /> },
          { label: "color neutral900", node: <IconButton ariaLabel="Close" color={colors.neutral900} /> },
          { label: "custom icon", node: <IconButton ariaLabel="Print" color={colors.neutral900}><PrinterIcon width={24} height={24} /></IconButton> },
          { label: "size 40", node: <IconButton ariaLabel="Close" size={40} /> },
          { label: "disabled", node: <IconButton ariaLabel="Close" disabled /> },
        ]} />
      </Sub>
      <Sub title="Props">
        <PropsTable rows={[
          { name: "ariaLabel", type: "string", desc: "Required. Accessible label + hover tooltip." },
          { name: "onClick", type: "(e) => void", desc: "Click handler." },
          { name: "children", type: "ReactNode", def: "✕ glyph", desc: "The icon. Defaults to the 24px / 1.5-stroke close ✕." },
          { name: "size", type: "number", def: "32", desc: "Square hit-target size in px." },
          { name: "color", type: "string", def: "neutral700", desc: "Glyph colour." },
          { name: "disabled", type: "boolean", def: "false", desc: "Dims to 0.5 and removes the hover tint." },
        ]} />
      </Sub>
    </Section>
  );
}

// ── 21 · MeasureField ───────────────────────────────────────────────────────────
function MeasureSwitchDemo() {
  const [v, setV] = useState("10");
  const [mode, setMode] = useState<"%" | "₹">("%");
  return <W w={140}><MeasureField box unitFilled value={v} onChange={setV} unit={mode} onToggleUnit={() => setMode(mode === "%" ? "₹" : "%")} inputMode="decimal" /></W>;
}
export function MeasureFieldSection() {
  const [a, setA] = useState("72");
  return (
    <Section id="measurefield" title="16 · MeasureField"
      tldr={<><From>components/MeasureField</From> — a value box + a unit chip. The shared input behind vitals, price (₹) and quantity fields. <b>cream</b> (default, the vitals look) vs <b>box</b> (white, for forms). <code>prefix</code> (₹), <code>unit</code> chip, <code>onToggleUnit</code> for a switchable unit, <code>unitFilled</code> to make that chip a clear button, <code>bp</code> variant (two inputs + “/”).</>}>
      <Sub title="Variants & states">
        <StateGrid minCol={170} items={[
          { label: "cream (default)", node: <W w={150} h={40}><MeasureField value={a} onChange={setA} unit="cm" /></W> },
          { label: "box (form)", node: <W w={150}><MeasureField box value={a} onChange={setA} unit="kg" /></W> },
          { label: "prefix ₹", node: <W w={150}><MeasureField box prefix="₹" value={a} onChange={setA} /></W> },
          { label: "unit %", node: <W w={120}><MeasureField box unit="%" value={a} onChange={setA} /></W> },
          { label: "switchable + unitFilled", node: <MeasureSwitchDemo /> },
          { label: "invalid", node: <W w={150}><MeasureField box value="" onChange={() => {}} unit="kg" invalid /></W> },
          { label: "dense (28px)", node: <W w={150}><MeasureField dense value={a} onChange={setA} unit="cm" /></W> },
          { label: "bp variant", node: <W w={150}><MeasureField value="120" onChange={() => {}} value2="80" onChange2={() => {}} bp unit="mmHg" /></W> },
        ]} />
      </Sub>
      <Sub title="Props">
        <PropsTable rows={[
          { name: "value · onChange", type: "string · (v)=>void", desc: "Controlled string value." },
          { name: "box", type: "boolean", def: "false", desc: "White form field; default is the cream vitals look." },
          { name: "prefix", type: "string", desc: "Leading chip (e.g. ₹)." },
          { name: "unit", type: "string", desc: "Trailing unit chip (cm, %, mins…)." },
          { name: "onToggleUnit", type: "() => void", desc: "If set, the unit chip becomes a switchable button (parent owns conversion)." },
          { name: "unitFilled", type: "boolean", def: "false", desc: "Fills the unit chip primary200 so it clearly reads as a button." },
          { name: "invalid", type: "boolean", def: "false", desc: "Red border / red error tint." },
          { name: "dense", type: "boolean", def: "false", desc: "28px tall (vitals grid); else reads --input-h." },
          { name: "bp", type: "boolean", def: "false", desc: "Two inputs + “/” with auto-advance (blood pressure)." },
        ]} />
      </Sub>
    </Section>
  );
}

// ── 22 · FillInput ──────────────────────────────────────────────────────────────
function FillDemo() {
  const [v, setV] = useState("Ear lobe repair");
  return (
    <>
      <datalist id="sb-fill-list"><option value="Ear lobe repair" /><option value="Consultation" /><option value="Dressing" /></datalist>
      <W w={180}><FillInput list="sb-fill-list" value={v} onChange={setV} placeholder="Type here" /></W>
    </>
  );
}
export function FillInputSection() {
  const [n, setN] = useState("1");
  return (
    <Section id="fillinput" title="17 · FillInput"
      tldr={<><From>components/FillInput</From> — a borderless cream “fill block” input: a primary100 fill, rounded, no border, no spinner arrows. Bind a <code>list</code> and the suggestions dropdown opens as you type (no chevron). Used by the Bill modal line items.</>}>
      <Sub title="Variants & states">
        <StateGrid minCol={200} items={[
          { label: "text + datalist", node: <FillDemo /> },
          { label: "numeric, centered", node: <W w={70}><FillInput value={n} onChange={setN} inputMode="numeric" align="center" /></W> },
          { label: "placeholder", node: <W w={180}><FillInput value="" onChange={() => {}} placeholder="Type here" /></W> },
        ]} />
      </Sub>
      <Sub title="Props">
        <PropsTable rows={[
          { name: "value · onChange", type: "string · (v)=>void", desc: "Controlled value." },
          { name: "list", type: "string", desc: "Datalist id — typing shows suggestions (no chevron)." },
          { name: "inputMode", type: "numeric|decimal|text", def: "text", desc: "Mobile keypad hint; numeric hides nothing extra." },
          { name: "align", type: "left|center|right", def: "left", desc: "Text alignment." },
          { name: "placeholder", type: "string", desc: "Placeholder text." },
        ]} />
      </Sub>
    </Section>
  );
}

// ── 23 · DataGrid ────────────────────────────────────────────────────────────────
type GRow = { id: number; name: string; qty: number; price: number };
export function DataGridSection() {
  const cols: GridColumn<GRow>[] = [
    { key: "n", header: "#", width: 36, align: "center", render: (_r, i) => i + 1 },
    { key: "name", header: "Service", align: "left", render: (r) => r.name },
    { key: "qty", header: "Qty", width: 60, render: (r) => r.qty },
    { key: "price", header: "Price", width: 90, render: (r) => `₹ ${r.price}` },
  ];
  const rows: GRow[] = [
    { id: 1, name: "Consultation", qty: 1, price: 500 },
    { id: 2, name: "Dressing", qty: 2, price: 400 },
  ];
  return (
    <Section id="datagrid" title="18 · DataGrid"
      tldr={<><From>components/DataGrid</From> — the shared, Catalog-styled table. Columns are render-prop based, so a cell can be plain text (read-only) OR an editor (inputs / comboboxes). Shared <code>tableHeadCell</code> header; non-name columns centre by default. Powers the Catalog list and the Bill modal line items.</>}>
      <Sub title="Specimen">
        <Stage><DataGrid columns={cols} rows={rows} rowKey={(r) => r.id} size="m" /></Stage>
      </Sub>
      <Sub title="Props">
        <PropsTable rows={[
          { name: "columns", type: "GridColumn<T>[]", desc: "key · header · width · align · render(row,i) · headerPadding · cellPadding." },
          { name: "rows", type: "T[]", desc: "Row data." },
          { name: "rowKey", type: "(row,i)=>Key", desc: "Stable React key per row." },
          { name: "size", type: '"m" | "s"', def: '"m"', desc: "Cell font size — m matches Catalog, s is denser (modals)." },
          { name: "tdPadding · thPadding", type: "string", desc: "Grid-wide cell/header padding overrides (a column's own padding still wins)." },
        ]} />
      </Sub>
    </Section>
  );
}

// ── 24 · PageHeader ──────────────────────────────────────────────────────────────
export function PageHeaderSection() {
  return (
    <Section id="pageheader" title="19 · PageHeader"
      tldr={<><From>components/PageHeader</From> — the sticky module header: optional back button (left), centred title, right-aligned actions slot. Used by Patients, Catalog, Pharmacy, Stats, Bills.</>}>
      <Sub title="Variants">
        <Stage><PageHeader title="Catalog" /></Stage>
        <div style={{ height: spacing.s }} />
        <Stage><PageHeader title="Pharmacy Stocks" onBack={() => {}} actions={<><Button variant="light" size="sm">Import CSV</Button><Button variant="primary" size="sm">Add Stock</Button></>} /></Stage>
      </Sub>
      <Sub title="Props">
        <PropsTable rows={[
          { name: "title", type: "ReactNode", desc: "Centred heading (or custom markup if wrapTitle=false)." },
          { name: "onBack", type: "() => void", desc: "Renders a back arrow on the left when provided." },
          { name: "actions", type: "ReactNode", desc: "Right-aligned icons / buttons." },
          { name: "wrapTitle", type: "boolean", def: "true", desc: "Wrap title in the default <h2>; false to supply your own." },
        ]} />
      </Sub>
    </Section>
  );
}

// ── 25 · PopoverMenu ─────────────────────────────────────────────────────────────
export function PopoverMenuSection() {
  return (
    <Section id="popovermenu" title="20 · PopoverMenu"
      tldr={<><From>components/PopoverMenu</From> — a click-trigger that opens a list of action items (kebab / “⋯” menus). Items can carry a leading icon and a <code>destructive</code> flag (red). Closes on outside-click or item select.</>}>
      <Sub title="Live">
        <Stage>
          <PopoverMenu ariaLabel="Actions" trigger={<IconButton ariaLabel="Actions">⋯</IconButton>}
            items={[
              { label: "Edit", onClick: () => {} },
              { label: "Duplicate", onClick: () => {} },
              { label: "Delete", onClick: () => {}, destructive: true },
            ]} />
        </Stage>
      </Sub>
      <Sub title="Props">
        <PropsTable rows={[
          { name: "trigger", type: "ReactNode", desc: "The clickable element (icon button, kebab…)." },
          { name: "items", type: "PopoverMenuItem[]", desc: "{ label, onClick, destructive?, icon? }." },
          { name: "align", type: "left | right", def: "right", desc: "Menu alignment relative to the trigger." },
          { name: "ariaLabel", type: "string", desc: "Accessible label for the trigger button." },
        ]} />
      </Sub>
    </Section>
  );
}

// ── 26 · UploadModal ─────────────────────────────────────────────────────────────
export function UploadModalSection() {
  const [open, setOpen] = useState(false);
  return (
    <Section id="uploadmodal" title="21 · UploadModal"
      tldr={<><From>components/UploadModal</From> — the shared “upload anything” modal: centred header + top-right ✕, an arrow drop-zone (click or drag), an optional body slot (per-file metadata, a preview…) and a Cancel + black-confirm footer (equal width). Powers <b>Add file</b> and <b>Import CSV</b>.</>}>
      <Sub title="Live">
        <Row>
          <Button variant="dark" onClick={() => setOpen(true)}>Open UploadModal</Button>
        </Row>
        <UploadModal isOpen={open} onClose={() => setOpen(false)} title="Add file" subtitle="Upload reports, prescriptions, photos, or any patient file"
          dropHint="Any file type · multi-select supported" onFiles={() => {}} confirmLabel="Add" onConfirm={() => setOpen(false)} />
      </Sub>
      <Sub title="Props">
        <PropsTable rows={[
          { name: "isOpen · onClose", type: "boolean · ()=>void", desc: "Open state + dismiss." },
          { name: "title · subtitle", type: "string · ReactNode", desc: "Centred header." },
          { name: "onFiles", type: "(files)=>void", desc: "Called with chosen File[] (click or drag)." },
          { name: "children", type: "ReactNode", desc: "Body between drop-zone and footer (metadata, preview…)." },
          { name: "confirmLabel · onConfirm", type: "string · ()=>void", desc: "Black confirm button (e.g. “Add (3)”, “Import 12”)." },
          { name: "dropTitle · dropHint", type: "string", def: "“Drag files…”", desc: "Drop-zone copy; dropTitleActive swaps once files exist." },
          { name: "accept · multiple", type: "string · boolean", desc: "Native file-input filters." },
          { name: "width · surface", type: "number · string", def: "560", desc: "Modal width and surface colour." },
        ]} />
      </Sub>
    </Section>
  );
}
