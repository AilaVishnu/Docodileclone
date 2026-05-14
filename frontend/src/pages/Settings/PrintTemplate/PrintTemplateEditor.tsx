import React, { useEffect, useMemo, useRef, useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../../styles/theme";
import { Button } from "../../../components/Button";
import { Toast } from "../../../components/Toast";
import { TextInput } from "../../../components/Input/TextInput/TextInput";
import { Select } from "../../../components/Input/Select/Select";
import { Switch } from "../../../components/Switch";
import { FONT_FAMILIES, PaperMode, PatientFieldKey, PrintTemplate, RxLayout } from "./types";
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
  const [templates, setTemplates] = useState<PrintTemplate[]>(() => ensureSeed());
  const [activeId, setActiveId] = useState<string>(() => templates[0]?.id ?? "");
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });

  const active = useMemo(() => templates.find((t) => t.id === activeId) ?? templates[0], [templates, activeId]);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  };

  // Persist every edit. localStorage writes are cheap; no need to debounce.
  const persist = (next: PrintTemplate) => {
    setTemplates((all) => {
      const updated = all.map((t) => (t.id === next.id ? next : t));
      // Single-default invariant.
      const final = next.isDefault ? updated.map((t) => (t.id === next.id ? t : { ...t, isDefault: false })) : updated;
      try {
        updateTemplate(next);
      } catch (e: any) {
        showToast(e?.name === "QuotaExceededError" ? "Storage full — try a smaller image" : "Couldn't save");
      }
      return final;
    });
  };

  const onNew = () => {
    const created = createTemplate(`Template ${templates.length + 1}`);
    setTemplates([...templates, created]);
    setActiveId(created.id);
  };

  const onDuplicate = () => {
    if (!active) return;
    const copy: PrintTemplate = {
      ...active,
      id: `tpl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      name: `${active.name} (copy)`,
      isDefault: false,
    };
    const next = [...templates, copy];
    setTemplates(next);
    setActiveId(copy.id);
    // Persist via update API by writing the whole list.
    localStorage.setItem(`docodile_print_templates_${localStorage.getItem("docodile_clinic_id") ?? "default"}`, JSON.stringify(next));
  };

  const onDelete = () => {
    if (!active) return;
    if (templates.length === 1) {
      showToast("At least one template must exist");
      return;
    }
    if (!window.confirm(`Delete "${active.name}"?`)) return;
    const remaining = deleteTemplate(active.id);
    setTemplates(remaining);
    setActiveId(remaining[0]?.id ?? "");
  };

  if (!active) {
    return <div style={{ padding: spacing.l, color: colors.neutral500 }}>No templates available.</div>;
  }

  return (
    <div style={S.container}>
      {/* ── Top bar: template list + actions ──────────────────────────── */}
      <div style={S.topBar}>
        <div style={S.tplStrip}>
          {templates.map((t) => {
            const isActive = t.id === active.id;
            return (
              <button
                key={t.id}
                type="button"
                style={{ ...S.tplPill, ...(isActive ? S.tplPillActive : null) }}
                onClick={() => setActiveId(t.id)}
              >
                <span>{t.name}</span>
                {t.isDefault && <span style={S.defaultBadge}>Default</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: spacing.xs }}>
          <Button variant="light" size="sm" onClick={onDuplicate}>Duplicate</Button>
          <Button variant="dangerLight" size="sm" onClick={onDelete}>Delete</Button>
          <Button variant="dark" size="sm" onClick={onNew}>+ New template</Button>
        </div>
      </div>

      <div style={S.split}>
        {/* ── Left: form ───────────────────────────────────────────── */}
        <div style={S.formCol}>
          <EditorForm template={active} onChange={persist} onPrintTest={() => {
            const html = buildPrintHtml(active, SAMPLE);
            openPrintWindow(html);
          }} />
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
}: {
  template: PrintTemplate;
  onChange: (t: PrintTemplate) => void;
  onPrintTest: () => void;
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
            <TextInput value={template.name} onChange={(v) => set("name", v)} />
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
      <Section title="Margins (mm)" sub="Set top & bottom large enough to clear the printed letterhead's design in pre-printed mode.">
        <Row>
          <Field label="Top"><NumberInput value={template.margins.top}    onChange={(v) => setMargin("top", v)} /></Field>
          <Field label="Right"><NumberInput value={template.margins.right} onChange={(v) => setMargin("right", v)} /></Field>
          <Field label="Bottom"><NumberInput value={template.margins.bottom} onChange={(v) => setMargin("bottom", v)} /></Field>
          <Field label="Left"><NumberInput value={template.margins.left}    onChange={(v) => setMargin("left", v)} /></Field>
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
          <Field label="Signature height (mm)">
            <NumberInput value={template.signatureHeightMm} onChange={(v) => set("signatureHeightMm", v)} />
          </Field>
        </Row>
        <Row>
          <Field label="Signature text" wide hint="Printed below the signature image. e.g. doctor's name and credentials.">
            <TextInput
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

      <div style={S.actionsRow}>
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
  const heights: Record<typeof aspect, number> = { header: 70, footer: 70, signature: 60, seal: 60 } as any;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
      <div
        style={{
          ...S.imageDrop,
          height: heights[aspect],
          backgroundColor: colors.neutral100,
          backgroundImage: value ? `url(${value})` : undefined,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          borderStyle: value ? "solid" : "dashed",
        }}
        onClick={() => inputRef.current?.click()}
      >
        {!value && <span style={S.imageDropHint}>Click to upload</span>}
      </div>
      <div style={{ display: "flex", gap: spacing.xs }}>
        <Button variant="light" size="sm" onClick={() => inputRef.current?.click()}>
          {value ? "Replace" : "Upload"}
        </Button>
        {value && (
          <Button variant="dangerLight" size="sm" onClick={() => onPick(null)}>
            Clear
          </Button>
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

  topBar: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    flexWrap: "wrap",
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    padding: spacing.s,
  },
  tplStrip: { display: "flex", gap: spacing.xs, flexWrap: "wrap", flex: 1, minWidth: 0 },
  tplPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
    height: 36,
    padding: `0 ${spacing.m}`,
    borderRadius: radii.full,
    borderWidth: strokes.xs,
    borderStyle: "solid",
    borderColor: colors.neutral200,
    background: "transparent",
    color: colors.neutral700,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: fonts.control.sm,
    fontWeight: 500,
  },
  tplPillActive: {
    backgroundColor: colors.active.shade700,
    color: colors.neutral100,
    borderColor: colors.active.shade700,
  },
  defaultBadge: {
    fontSize: 10,
    fontWeight: 600,
    backgroundColor: colors.neutral100,
    color: colors.active.shade700,
    padding: "2px 6px",
    borderRadius: radii.full,
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
    maxHeight: "78vh",
    overflowY: "auto",
  },
  previewIframe: {
    width: "100%",
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
  },
  segItemActive: {
    borderColor: colors.active.shade600,
    boxShadow: `0 0 0 2px ${colors.active.shade300} inset`,
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

  // Image picker — matches the dropzone style used in AddReportModal so
  // upload affordances feel native across the app.
  imageDrop: {
    width: "100%",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: colors.primary400,
    borderRadius: radii.l,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.neutral500,
    cursor: "pointer",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
  },
  imageDropHint: { fontSize: fonts.control.md, color: colors.neutral700, fontWeight: fonts.weight.medium },

  actionsRow: { display: "flex", gap: spacing.s, justifyContent: "flex-end" },
};
