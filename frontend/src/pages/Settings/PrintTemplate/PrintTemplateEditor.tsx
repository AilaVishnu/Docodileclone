import React, { useEffect, useMemo, useRef, useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../../styles/theme";
import { Button } from "../../../components/Button";
import { Toast } from "../../../components/Toast";
import { Field as TextField } from "../../../components/Field";
import { Select } from "../../../components/Input/Select/Select";
import { Switch } from "../../../components/Switch";
import { Tabs, TabItem } from "../../../components/Tabs";
import { FONT_FAMILIES, LengthUnit, PaperMode, PatientFieldKey, PrintTemplate, RxLayout } from "./types";
import {
  createTemplate,
  deleteTemplate,
  ensureSeed,
  loadTemplates,
  updateTemplate,
} from "./storage";
import { buildPrintHtml, openPrintWindow, PrintVisitData } from "./buildPrintHtml";

// ─────────────────────────────────────────────────────────────────────────────
// Editor — two-column shell:
//   • Left: form (template list at the top, then sections of controls).
//   • Right: live preview rendered into an iframe via buildPrintHtml so what
//     the user sees is exactly what prints.
//
// All changes save to localStorage as the user edits (debounced light-touch).
// ─────────────────────────────────────────────────────────────────────────────

const PATIENT_FIELDS: { key: PatientFieldKey; label: string }[] = [
  { key: "patientId",   label: "Patient ID" },
  { key: "phone",       label: "Phone number" },
  { key: "address",     label: "Address" },
  { key: "referredBy",  label: "Referred by" },
  { key: "age",         label: "Age" },
  { key: "gender",      label: "Gender" },
  { key: "doctorName",  label: "Doctor name" },
  { key: "visitNumber", label: "Visit number" },
  { key: "visitDate",   label: "Visit date" },
  { key: "visitTime",   label: "Visit time" },
  { key: "validTill",   label: "Valid till" },
];

// ── Preview sample data — what the right pane renders before a real visit ──
const SAMPLE: PrintVisitData = {
  patientName: "Aarav Iyer",
  patientAge: "32y",
  patientGender: "Male",
  patientPhone: "+91 98765 43210",
  patientAddress: "12, MG Road, Bengaluru",
  patientId: "DOC-1042",
  visitNumber: 7,
  visitDate: new Date().toISOString().slice(0, 10),
  visitTime: "11:30 AM",
  referredBy: "Dr. Priya Iyer",
  doctorName: "Dr. Anika Reddy",
  doctorCredentials: "MBBS, MD (Internal Medicine)",
  complaints: "Recurrent headache for 5 days, mostly evening.\nMild nausea, no vomiting.",
  diagnosis: "Tension-type headache, suspected dehydration",
  vitals: [
    { label: "BP",   value: "118/78 mmHg" },
    { label: "Pulse", value: "76 bpm" },
    { label: "SpO₂", value: "98%" },
    { label: "Temp", value: "98.4 °F" },
  ],
  tests: "CBC, RBS",
  notesForPatient: "Maintain hydration: 3 L water / day. Avoid screen time before sleep.",
  rx: [
    { medicine: "Crocin 500mg",  genericName: "Paracetamol", dosage: "1 tab", whenToTake: "After food", frequency: "TID",  duration: "5 days", notes: "Take only if pain >5/10" },
    { medicine: "Cetzine 10mg",  genericName: "Cetirizine",  dosage: "1 tab", whenToTake: "Bedtime",     frequency: "HS",   duration: "7 days", notes: null },
  ],
  reviewDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  reviewNotes: "Return if headache worsens or persists beyond 7 days.",
};

export function PrintTemplateEditor() {
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });
  const [loading, setLoading] = useState(true);

  // Initial fetch — seeds a default template server-side if the clinic has
  // none yet, then loads the list.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await ensureSeed();
        if (cancelled) return;
        setTemplates(list);
        setActiveId(list[0]?.id ?? "");
      } catch (e) {
        if (!cancelled) setToast({ visible: true, message: `Couldn't load templates: ${(e as Error).message}` });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Right-click context menu over a template tab. {tabId, x, y} positioned
  // at the click coordinates. Closed on outside click or Escape.
  const [tabMenu, setTabMenu] = useState<{ tabId: string; x: number; y: number } | null>(null);
  React.useEffect(() => {
    if (!tabMenu) return;
    const close = () => setTabMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [tabMenu]);

  const active = useMemo(() => templates.find((t) => t.id === activeId) ?? templates[0], [templates, activeId]);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  };

  // Persist every edit. Server round-trips on each change — debounce-worthy
  // if it becomes chatty, but template edits are infrequent today.
  const persist = (next: PrintTemplate) => {
    setTemplates((all) => {
      const updated = all.map((t) => (t.id === next.id ? next : t));
      // Single-default invariant (reflected immediately in local state; the
      // server enforces it too via the partial-unique index).
      return next.isDefault ? updated.map((t) => (t.id === next.id ? t : { ...t, isDefault: false })) : updated;
    });
    updateTemplate(next).catch((e: Error) => showToast(`Couldn't save: ${e.message}`));
  };

  const onNew = async () => {
    try {
      const created = await createTemplate(`Template ${templates.length + 1}`);
      setTemplates([...templates, created]);
      setActiveId(created.id);
    } catch (e) {
      showToast(`Couldn't create template: ${(e as Error).message}`);
    }
  };

  const onDuplicate = async (sourceId?: string) => {
    const source = sourceId ? templates.find((t) => t.id === sourceId) : active;
    if (!source) return;
    try {
      // Duplicate = create a fresh row with the same config but a tweaked
      // name. The server assigns the new id; isDefault stays false.
      const created = await createTemplate(`${source.name} (copy)`);
      const copy: PrintTemplate = { ...source, id: created.id, name: created.name, isDefault: false };
      // Push the full config to the new row.
      await updateTemplate(copy);
      setTemplates((all) => [...all, copy]);
      setActiveId(created.id);
    } catch (e) {
      showToast(`Couldn't duplicate: ${(e as Error).message}`);
    }
  };

  const onDelete = async () => {
    if (!active) return;
    if (templates.length === 1) {
      showToast("At least one template must exist");
      return;
    }
    if (!window.confirm(`Delete "${active.name}"?`)) return;
    try {
      const remaining = await deleteTemplate(active.id);
      setTemplates(remaining);
      setActiveId(remaining[0]?.id ?? "");
    } catch (e) {
      showToast(`Couldn't delete: ${(e as Error).message}`);
    }
  };

  if (loading) {
    return <div style={{ padding: spacing.l, color: colors.neutral500 }}>Loading templates…</div>;
  }
  if (!active) {
    return <div style={{ padding: spacing.l, color: colors.neutral500 }}>No templates available.</div>;
  }

  // Build TabItems from the template list. Right-click on a tab opens the
  // tab context menu (currently just "Duplicate"). The "Default" pill is
  // rendered as the tab's rightSlot so it lives inside the tab bubble.
  const tabItems: TabItem[] = templates.map((t) => ({
    id: t.id,
    label: t.name,
    rightSlot: t.isDefault ? <span style={S.defaultBadge}>Default</span> : null,
    onContextMenu: (e) => {
      e.preventDefault();
      setTabMenu({ tabId: t.id, x: e.clientX, y: e.clientY });
    },
  }));

  return (
    <div style={S.container}>
      {/* ── Template tabs — same component as ClinicTabs. The trailing
            action acts as the "+ Add template" pseudo-tab. Right-click on
            any tab opens a context menu with Duplicate. Delete lives at
            the bottom of the editor (destructive, end of flow). ───── */}
      <Tabs
        variant="block"
        items={tabItems}
        activeId={active.id}
        onSelect={setActiveId}
        actions={[{ label: "+ Add template", onClick: () => onNew() }]}
      />

      <div style={S.split}>
        {/* ── Left: form ───────────────────────────────────────────── */}
        <div style={S.formCol}>
          <EditorForm
            template={active}
            onChange={persist}
            onPrintTest={() => {
              // Browser's native print dialog — user picks Save as PDF or a
              // printer themselves. Same flow as the prescription Print
              // button; no extra preview modal in between.
              openPrintWindow(buildPrintHtml(active, SAMPLE));
            }}
            onDelete={onDelete}
          />
        </div>

        {/* ── Right: live preview ─────────────────────────────────── */}
        <div style={S.previewCol}>
          <div style={S.previewHeader}>
            <span style={S.previewLabel}>Live preview</span>
            <span style={S.previewSub}>{active.paperMode === "preprinted" ? "Pre-printed letterhead mode" : "Blank A4 mode"}</span>
          </div>
          <PreviewFrame template={active} data={SAMPLE} />
        </div>
      </div>

      {tabMenu && (() => {
        const t = templates.find((x) => x.id === tabMenu.tabId);
        if (!t) return null;
        const W = 200;
        const x = Math.min(tabMenu.x, window.innerWidth - W - 8);
        return (
          <div
            // Stop propagation so the global mousedown listener doesn't close
            // the menu while the user is still clicking inside it.
            onMouseDown={(e) => e.stopPropagation()}
            style={{ ...S.tabMenu, top: tabMenu.y, left: x, width: W }}
          >
            <button
              type="button"
              style={S.tabMenuItem}
              onClick={() => { onDuplicate(t.id); setTabMenu(null); }}
            >
              Duplicate "{t.name}"
            </button>
          </div>
        );
      })()}

      <Toast message={toast.message} isVisible={toast.visible} onClose={() => setToast({ visible: false, message: "" })} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Editor form — sections of controls. All inputs are controlled by `template`.
// onChange fires for every keystroke / toggle, which writes through to
// localStorage. Editing N templates is light enough to skip debouncing.
// ─────────────────────────────────────────────────────────────────────────────

function EditorForm({
  template,
  onChange,
  onPrintTest,
  onDelete,
}: {
  template: PrintTemplate;
  onChange: (t: PrintTemplate) => void;
  onPrintTest: () => void;
  onDelete: () => void;
}) {
  const set = <K extends keyof PrintTemplate>(key: K, value: PrintTemplate[K]) =>
    onChange({ ...template, [key]: value });

  const setMargin = (side: keyof PrintTemplate["margins"], value: number) =>
    onChange({ ...template, margins: { ...template.margins, [side]: value } });

  const setShow = (key: PatientFieldKey, value: boolean) =>
    onChange({ ...template, show: { ...template.show, [key]: value } });

  // Read an image file and convert to a base64 data URL. ≤ 1 MB enforced.
  const readImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      if (file.size > 1024 * 1024) {
        reject(new Error("Image must be under 1 MB"));
        return;
      }
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => reject(new Error("Couldn't read file"));
      fr.readAsDataURL(file);
    });

  const isBlank = template.paperMode === "blank";

  return (
    <div style={S.form}>
      {/* Template name + default toggle */}
      <Section title="Template">
        <Row>
          <Field label="Template name" wide>
            <TextField variant="underline" value={template.name} onChange={(v) => set("name", v)} />
          </Field>
          <Field label="Make default">
            <Switch
              checked={template.isDefault}
              onChange={(v) => set("isDefault", v)}
              hint={template.isDefault ? "Used when printing prescriptions" : "Set as the clinic default"}
            />
          </Field>
        </Row>
      </Section>

      {/* Paper mode */}
      <Section
        title="Paper mode"
        sub="Pre-printed letterhead has the design already on the paper — we print only text. Blank A4 means we print header and footer too."
      >
        <SegmentedControl<PaperMode>
          value={template.paperMode}
          options={[
            { value: "preprinted", label: "Pre-printed letterhead", sub: "Text only, wide top/bottom margins" },
            { value: "blank",      label: "Blank A4",                sub: "Includes header & footer images" },
          ]}
          onChange={(v) => set("paperMode", v)}
        />
      </Section>

      {/* Margins */}
      <Section title="Margins" sub="Set top & bottom large enough to clear the printed letterhead's design in pre-printed mode.">
        <Row>
          <Field label="Top">
            <LengthInput
              valueMm={template.margins.top}
              unit={template.marginsUnit}
              onValueMm={(v) => setMargin("top", v)}
              onUnitChange={(u) => set("marginsUnit", u)}
            />
          </Field>
          <Field label="Right">
            <LengthInput
              valueMm={template.margins.right}
              unit={template.marginsUnit}
              onValueMm={(v) => setMargin("right", v)}
              onUnitChange={(u) => set("marginsUnit", u)}
            />
          </Field>
          <Field label="Bottom">
            <LengthInput
              valueMm={template.margins.bottom}
              unit={template.marginsUnit}
              onValueMm={(v) => setMargin("bottom", v)}
              onUnitChange={(u) => set("marginsUnit", u)}
            />
          </Field>
          <Field label="Left">
            <LengthInput
              valueMm={template.margins.left}
              unit={template.marginsUnit}
              onValueMm={(v) => setMargin("left", v)}
              onUnitChange={(u) => set("marginsUnit", u)}
            />
          </Field>
        </Row>
      </Section>

      {/* Header / Footer (blank mode only) */}
      {isBlank && (
        <Section title="Header & footer images" sub="Used only in Blank A4 mode. PNG with transparent background works best. Under 1 MB.">
          <Row>
            <Field label="Header image" wide>
              <ImagePicker value={template.headerImage} onPick={async (f) => set("headerImage", f ? await readImage(f) : undefined)} aspect="header" />
            </Field>
          </Row>
          <Row>
            <Field label="Footer image" wide>
              <ImagePicker value={template.footerImage} onPick={async (f) => set("footerImage", f ? await readImage(f) : undefined)} aspect="footer" />
            </Field>
          </Row>
        </Section>
      )}

      {/* Doctor signature & seal */}
      <Section title="Doctor signature">
        <Row>
          <Field label="Signature image" wide>
            <ImagePicker value={template.signatureImage} onPick={async (f) => set("signatureImage", f ? await readImage(f) : undefined)} aspect="signature" />
          </Field>
          <Field label="Signature height">
            <LengthInput
              valueMm={template.signatureHeightMm}
              unit={template.marginsUnit}
              onValueMm={(v) => set("signatureHeightMm", v)}
              onUnitChange={(u) => set("marginsUnit", u)}
            />
          </Field>
        </Row>
        <Row>
          <Field label="Signature text" wide hint="Printed below the signature image. e.g. doctor's name and credentials.">
            <TextField
              variant="underline"
              value={template.signatureText ?? ""}
              onChange={(v) => set("signatureText", v)}
              multiline
              placeholder={"Dr. Anika Reddy\nMBBS, MD"}
            />
          </Field>
        </Row>
        <Row>
          <Field label="Doctor seal (optional)" wide>
            <ImagePicker value={template.sealImage} onPick={async (f) => set("sealImage", f ? await readImage(f) : undefined)} aspect="seal" />
          </Field>
        </Row>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <Row>
          <Field label="Font family" wide>
            <Select
              value={template.fontFamily}
              onChange={(v) => set("fontFamily", v)}
              options={FONT_FAMILIES}
            />
          </Field>
          <Field label="Font size (pt)">
            <NumberInput value={template.fontSizePt} min={8} max={16} onChange={(v) => set("fontSizePt", v)} />
          </Field>
        </Row>
      </Section>

      {/* Rx options */}
      <Section title="Prescription">
        <Row>
          <Field label="Show generic name">
            <Switch checked={template.showGenericName} onChange={(v) => set("showGenericName", v)} />
          </Field>
          <Field label="Layout">
            <SegmentedControl<RxLayout>
              value={template.rxLayout}
              options={[
                { value: "list",    label: "List" },
                { value: "tabular", label: "Table" },
              ]}
              onChange={(v) => set("rxLayout", v)}
              compact
            />
          </Field>
        </Row>
      </Section>

      {/* Patient field toggles */}
      <Section title="Patient details on print" sub="Which patient/visit fields appear in the header row of each printout.">
        <div style={S.toggleGrid}>
          {PATIENT_FIELDS.map((f) => (
            <label key={f.key} style={S.toggleRow}>
              <Switch checked={template.show[f.key]} onChange={(v) => setShow(f.key, v)} />
              <span style={{ fontSize: fonts.size.s, color: colors.neutral900 }}>{f.label}</span>
            </label>
          ))}
        </div>
        <Row>
          <Field label="Capitalize patient name">
            <Switch
              checked={template.capitalizePatientName}
              onChange={(v) => set("capitalizePatientName", v)}
              hint="aarav iyer → Aarav Iyer"
            />
          </Field>
          {template.show.validTill && (
            <Field label="Prescription validity (days)" hint="Printed as 'Valid till' = visit date + this many days.">
              <NumberInput
                value={template.validityDays ?? 7}
                min={1}
                max={365}
                onChange={(v) => set("validityDays", v)}
              />
            </Field>
          )}
        </Row>
      </Section>

      {/* Footer row: destructive text link on the left, primary test-print
          action on the right. Deliberately not a card — keeps the page tail
          quiet and avoids ringing the destructive action with chrome. */}
      <div style={S.footerRow}>
        <button type="button" onClick={onDelete} style={S.deleteLink}>
          Delete template
        </button>
        <Button variant="light" size="md" onClick={onPrintTest}>Print test page</Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Live preview iframe — re-renders whenever the template or sample data
// change. Using an iframe isolates the print styles (especially @page) from
// the host document and gives a true-to-print sandbox.
// ─────────────────────────────────────────────────────────────────────────────

function PreviewFrame({ template, data }: { template: PrintTemplate; data: PrintVisitData }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const f = ref.current;
    if (!f) return;
    const html = buildPrintHtml(template, data);
    // srcdoc gives us a clean reload on every change without touching parent
    // URL/history. About-blank fallback for older Safari.
    f.srcdoc = html;
  }, [template, data]);

  return (
    <div style={S.previewWrap}>
      <iframe ref={ref} title="prescription-preview" style={S.previewIframe} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small primitives — kept local so we don't add to the components folder
// just for the Settings page. If something here grows useful elsewhere
// (Switch is the likely candidate), it should be promoted to /components.
// ─────────────────────────────────────────────────────────────────────────────

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section style={S.section}>
      <header>
        <h3 style={S.sectionTitle}>{title}</h3>
        {sub && <p style={S.sectionSub}>{sub}</p>}
      </header>
      <div style={S.sectionBody}>{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={S.row}>{children}</div>;
}

function Field({
  label,
  hint,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ ...S.field, flex: wide ? 2 : 1 }}>
      <div style={S.fieldLabel}>{label}</div>
      {children}
      {hint && <div style={S.fieldHint}>{hint}</div>}
    </div>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  compact,
}: {
  value: T;
  options: { value: T; label: string; sub?: string }[];
  onChange: (v: T) => void;
  compact?: boolean;
}) {
  return (
    <div style={compact ? S.segCompact : S.seg}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            style={{
              ...(compact ? S.segCompactItem : S.segItem),
              ...(active ? (compact ? S.segCompactItemActive : S.segItemActive) : null),
            }}
            onClick={() => onChange(o.value)}
          >
            {compact ? (
              o.label
            ) : (
              <>
                <span style={S.segItemLabel}>{o.label}</span>
                {o.sub && <span style={S.segItemSub}>{o.sub}</span>}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LengthInput — input + unit pill, mirroring the vitals cell pattern from the
// PrescriptionPage. Internally the value is always millimeters; the pill
// cycles mm → cm → in → mm and converts the displayed number. Changing the
// unit on one input flips it for all margins because callers share the same
// `unit` + `onUnitChange`.
// ─────────────────────────────────────────────────────────────────────────────

const UNIT_CYCLE: LengthUnit[] = ["mm", "cm", "in"];

function mmTo(unit: LengthUnit, mm: number): number {
  if (unit === "cm") return mm / 10;
  if (unit === "in") return mm / 25.4;
  return mm;
}
function toMm(unit: LengthUnit, n: number): number {
  if (unit === "cm") return n * 10;
  if (unit === "in") return n * 25.4;
  return n;
}
// 0–1 decimals so cm/in don't show jittery long fractions.
function fmt(unit: LengthUnit, mm: number): string {
  const v = mmTo(unit, mm);
  if (unit === "mm") return Math.round(v).toString();
  return (Math.round(v * 10) / 10).toString();
}

function LengthInput({
  valueMm,
  unit,
  onValueMm,
  onUnitChange,
}: {
  valueMm: number;
  unit: LengthUnit;
  onValueMm: (mm: number) => void;
  onUnitChange: (u: LengthUnit) => void;
}) {
  const [draft, setDraft] = React.useState<string>(fmt(unit, valueMm));
  // Keep the input in sync when the unit changes externally (e.g. user
  // clicked the pill on a sibling input).
  React.useEffect(() => { setDraft(fmt(unit, valueMm)); }, [unit, valueMm]);
  const cycleUnit = () => {
    const i = UNIT_CYCLE.indexOf(unit);
    onUnitChange(UNIT_CYCLE[(i + 1) % UNIT_CYCLE.length]);
  };
  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isFinite(n)) {
      setDraft(fmt(unit, valueMm));
      return;
    }
    onValueMm(toMm(unit, n));
  };
  return (
    <div style={S.lengthRow}>
      <input
        type="text"
        inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        style={S.lengthValue}
      />
      <button
        type="button"
        onClick={cycleUnit}
        style={S.lengthUnit}
        title="Click to change unit"
      >
        {unit}
      </button>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      min={min}
      max={max}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") {
          onChange(0);
          return;
        }
        let n = Number(raw);
        if (!Number.isFinite(n)) return;
        if (min != null) n = Math.max(min, n);
        if (max != null) n = Math.min(max, n);
        onChange(n);
      }}
      style={S.numberInput}
    />
  );
}

// Inline upload glyph used inside the empty dropzone — a 22×22 arrow into
// a tray. Kept inline so the picker stays self-contained.
function UploadGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.active.shade700} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ImagePicker — the dropzone IS the affordance. No separate upload button.
//   • Empty: dashed dropzone with an upload icon + "Click to upload" / "or
//     drag & drop". Hover deepens the border + tints the background.
//   • Filled: image is shown as the dropzone's background; a small "Replace"
//     overlay appears on hover and a small Clear pill in the corner removes
//     the image.
// Drag-and-drop is wired so users can drop a file directly into the zone.
// ─────────────────────────────────────────────────────────────────────────────
function ImagePicker({
  value,
  onPick,
  aspect,
}: {
  value: string | undefined;
  onPick: (f: File | null) => void | Promise<void>;
  aspect: "header" | "footer" | "signature" | "seal";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = React.useState(false);
  const [drag, setDrag] = React.useState(false);
  const heights: Record<typeof aspect, number> = { header: 90, footer: 90, signature: 80, seal: 80 } as any;

  const open = () => inputRef.current?.click();
  const handleFiles = (files: FileList | null) => {
    const f = files?.[0] ?? null;
    if (f) onPick(f);
  };

  // Visual state — empty zone tints on hover/drag; filled zone shows the
  // image with a hover overlay.
  const tinted = (hover || drag) && !value;
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        style={{
          ...S.imageDrop,
          height: heights[aspect],
          backgroundColor: tinted ? colors.primary100 : colors.neutral100,
          borderColor: tinted || drag ? colors.primary600 : colors.primary400,
          backgroundImage: value ? `url(${value})` : undefined,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          borderStyle: value ? "solid" : "dashed",
          position: "relative",
        }}
      >
        {!value && (
          <div style={S.imageDropEmpty}>
            <UploadGlyph />
            <span style={S.imageDropHint}>Click to upload</span>
            <span style={S.imageDropSubHint}>or drag &amp; drop</span>
          </div>
        )}
        {value && hover && (
          <div style={S.imageDropOverlay}>
            <span style={S.imageDropOverlayText}>Click to replace</span>
          </div>
        )}
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPick(null); }}
            style={S.imageDropClear}
            aria-label="Remove image"
          >
            ×
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          onPick(f);
          // Reset so re-picking the same file fires onChange.
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  container: { display: "flex", flexDirection: "column", gap: spacing.l, minWidth: 0 },

  // "Default" chip that lives inside the active template tab. Uses a light
  // tint of the active palette so it stays legible on the white background
  // the block-variant tab uses when selected.
  defaultBadge: {
    fontSize: 10,
    fontWeight: 600,
    backgroundColor: colors.active.shade200,
    color: colors.active.shade800,
    padding: "2px 6px",
    borderRadius: radii.full,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },

  // Floating context menu shown on right-click of a template tab.
  tabMenu: {
    position: "fixed",
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    border: `${strokes.xs} solid ${colors.neutral200}`,
    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
    padding: 4,
    zIndex: 4000,
    display: "flex",
    flexDirection: "column",
  },
  tabMenuItem: {
    border: "none",
    background: "transparent",
    padding: "8px 10px",
    borderRadius: radii.s,
    cursor: "pointer",
    color: colors.neutral900,
    fontFamily: "inherit",
    fontSize: fonts.size.s,
    textAlign: "left",
  },

  split: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.05fr)",
    gap: spacing.l,
    alignItems: "start",
  },
  formCol: { minWidth: 0 },
  previewCol: {
    position: "sticky",
    top: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  previewHeader: { display: "flex", alignItems: "baseline", justifyContent: "space-between" },
  previewLabel: { fontSize: fonts.size.s, fontWeight: 600, color: colors.neutral900 },
  previewSub:   { fontSize: fonts.size.xs, color: colors.neutral500 },
  previewWrap: {
    backgroundColor: colors.neutral200,
    borderRadius: radii.m,
    padding: spacing.m,
    border: `${strokes.xs} solid ${colors.neutral200}`,
    display: "flex",
    justifyContent: "center",
  },
  // Cap the iframe so the whole A4 page is always visible at once — no
  // vertical scroll on the preview. We cap width such that the derived
  // height (width * 297/210) stays under ~78vh; if the column is narrower
  // than that, the iframe just fills the column width.
  previewIframe: {
    width: "100%",
    maxWidth: "calc(78vh * 210 / 297)",
    aspectRatio: "210 / 297", // A4
    border: `${strokes.xs} solid ${colors.neutral300}`,
    backgroundColor: colors.neutral100,
    borderRadius: radii.s,
    display: "block",
  },

  form: { display: "flex", flexDirection: "column", gap: spacing.l },
  section: {
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    padding: spacing.m,
    display: "flex",
    flexDirection: "column",
    gap: spacing.s,
  },
  sectionTitle: {
    margin: 0,
    fontSize: fonts.size.m,
    fontWeight: 600,
    color: colors.neutral900,
  },
  sectionSub: {
    margin: 0,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    marginTop: 2,
  },
  sectionBody: { display: "flex", flexDirection: "column", gap: spacing.s },

  row: { display: "flex", gap: spacing.m, flexWrap: "wrap" },
  field: { display: "flex", flexDirection: "column", gap: 6, minWidth: 120 },
  fieldLabel: { fontSize: fonts.size.s, fontWeight: fonts.weight.medium, color: colors.neutral700 },
  fieldHint: { fontSize: fonts.size.xs, color: colors.neutral500 },

  toggleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: spacing.s,
  },
  toggleRow: { display: "flex", alignItems: "center", gap: spacing.s, cursor: "pointer" },

  // Segmented control
  seg: { display: "flex", gap: spacing.s, flexWrap: "wrap" },
  // Large card-style choice. Active state matches the established
  // "selected item" treatment used by the SideNav and the Settings sub-nav
  // (active.shade200 fill, no extra ring). Inactive cards stay white with
  // a neutral border so they read as clickable options.
  segItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    padding: `${spacing.s} ${spacing.m}`,
    borderWidth: strokes.xs,
    borderStyle: "solid",
    borderColor: colors.neutral200,
    borderRadius: radii.m,
    background: colors.neutral100,
    cursor: "pointer",
    minWidth: 200,
    flex: 1,
    fontFamily: "inherit",
    color: colors.neutral900,
    textAlign: "left",
    transition: "background-color 160ms",
  },
  segItemActive: {
    backgroundColor: colors.active.shade200,
  },
  segItemLabel: { fontSize: fonts.control.md, fontWeight: 600 },
  segItemSub: { fontSize: fonts.size.xs, color: colors.neutral500 },

  // Compact pill segmented — mirrors the Stats range-pill styling so it
  // reads as a familiar control across the app.
  segCompact: {
    display: "inline-flex",
    gap: 4,
    backgroundColor: colors.neutral100,
    padding: 4,
    borderRadius: radii.full,
  },
  segCompactItem: {
    border: "none",
    background: "transparent",
    padding: "6px 12px",
    borderRadius: radii.full,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: fonts.size.xs,
    fontWeight: 500,
    color: colors.neutral700,
  },
  segCompactItemActive: {
    backgroundColor: colors.active.shade700,
    color: colors.neutral100,
  },

  // Inputs
  numberInput: {
    height: 40,
    padding: "0 10px",
    border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.s,
    fontFamily: "inherit",
    fontSize: fonts.control.md,
    color: colors.neutral900,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: colors.neutral100,
  },

  // Length input — mirrors the vitals cell from PrescriptionPage: a cream
  // input cell with a bordered unit pill on the right.
  lengthRow: {
    display: "flex",
    alignItems: "center",
    height: 40,
    width: "100%",
  },
  lengthValue: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    padding: `0 ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    backgroundColor: colors.primary100,
    borderTopLeftRadius: radii.s,
    borderBottomLeftRadius: radii.s,
    textAlign: "center",
    minWidth: 0,
  },
  lengthUnit: {
    height: "100%",
    minWidth: 48,
    padding: `0 ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral700,
    backgroundColor: colors.neutral100,
    borderTopWidth: strokes.xs,
    borderBottomWidth: strokes.xs,
    borderRightWidth: strokes.xs,
    borderLeftWidth: strokes.xs,
    borderStyle: "solid",
    borderColor: colors.primary300,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: radii.s,
    borderBottomRightRadius: radii.s,
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  },

  // Image picker — dropzone IS the upload affordance. No separate button.
  // Hover/drag deepens the border + tints the background, mirroring the
  // AddReportModal dropzone for cross-app consistency.
  imageDrop: {
    width: "100%",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: colors.primary400,
    borderRadius: radii.l,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
    outline: "none",
  },
  imageDropEmpty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    color: colors.neutral700,
  },
  imageDropHint: { fontSize: fonts.control.md, color: colors.neutral900, fontWeight: fonts.weight.medium },
  imageDropSubHint: { fontSize: fonts.size.xs, color: colors.neutral500 },
  imageDropOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderRadius: radii.l,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    color: colors.neutral100,
    fontWeight: fonts.weight.semibold,
  },
  imageDropOverlayText: {
    fontSize: fonts.size.s,
    letterSpacing: 0.3,
  },
  imageDropClear: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 999,
    border: "none",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    color: colors.neutral100,
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },

  actionsRow: { display: "flex", gap: spacing.s, justifyContent: "flex-end" },
  footerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.m,
    paddingTop: spacing.xs,
  },
  // Plain underlined text link — destructive variant. Sits in the page
  // chrome rather than in a card so it stays unobtrusive.
  deleteLink: {
    border: "none",
    background: "transparent",
    padding: 0,
    fontFamily: "inherit",
    fontSize: fonts.size.s,
    color: colors.red200,
    textDecoration: "underline",
    cursor: "pointer",
  },
};
