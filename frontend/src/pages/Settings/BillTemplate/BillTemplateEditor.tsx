import React, { useEffect, useMemo, useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../../styles/theme";
import { Button } from "../../../components/Button";
import { Toast } from "../../../components/Toast";
import { resolveToastIcon } from "../../../components/Toast/toastIcon";
import { Field as TextField } from "../../../components/Field";
import { Select } from "../../../components/Input/Select/Select";
import { Switch } from "../../../components/Switch";
import { Tabs, TabItem } from "../../../components/Tabs";
import { Section, Row, Field, SegmentedControl, LengthInput, ImagePicker, PreviewFrame, readImage } from "../editorKit";
import { FONT_FAMILIES } from "../PrintTemplate/types";
import { openPrintWindow } from "../PrintTemplate/buildPrintHtml";
import { BillTemplate, BillFieldKey, PaperMode } from "./types";
import { ensureBillSeed, createBillTemplateRow, updateBillTemplateRow, deleteBillTemplateRow } from "./storage";
import { buildBillHtml } from "../../Bills/printBill";
import type { Bill } from "../../../api/bills";

// ─────────────────────────────────────────────────────────────────────────────
// Bill template editor — the billing counterpart to PrintTemplateEditor. Same
// two-column shell (form left, live preview right) and the same primitives
// (editorKit), but the controls configure the "Bill cum Receipt" and the
// preview renders a sample bill through buildBillHtml with the edited template.
// ─────────────────────────────────────────────────────────────────────────────

const BILL_FIELDS: { key: BillFieldKey; label: string }[] = [
  { key: "discountCol",    label: "Discount column" },
  { key: "gstRow",         label: "GST total" },
  { key: "amountInWords",  label: "Amount in words" },
  { key: "paymentMode",    label: "Payment mode" },
  { key: "referredBy",     label: "Referred by" },
  { key: "patientMobile",  label: "Patient mobile" },
  { key: "patientId",      label: "Patient ID" },
  { key: "patientAddress", label: "Patient address" },
  { key: "receivedRow",    label: "Received amount" },
  { key: "balanceRow",     label: "Balance amount" },
];

// Sample bill rendered in the preview before a real one exists.
const SAMPLE_BILL: Bill & { patientName: string } = {
  id: "",
  invoiceNo: "INV_0007",
  billDate: new Date().toISOString().slice(0, 10),
  billed: 1350,
  paid: 1350,
  due: 0,
  refund: 0,
  depositApplied: null,
  payStatus: "PAID",
  paymentMethod: "Card",
  items: JSON.stringify([
    { name: "Consultation",       qty: 1, unit: 500, gst: 0,  disc: 0, discUnit: "₹", kind: "service" },
    { name: "Dressing",           qty: 1, unit: 350, gst: 0,  disc: 0, discUnit: "₹", kind: "service" },
    { name: "Antibiotics course", qty: 1, unit: 500, gst: 0,  disc: 0, discUnit: "₹", kind: "service" },
  ]),
  note: null,
  appointmentId: null,
  createdAt: "",
  patientName: "Aarav Iyer",
};
const SAMPLE_META = { age: 32, gender: "Male", mobile: "+91 98765 43210", id: "DOC-1042" };

export function BillTemplateEditor() {
  const [templates, setTemplates] = useState<BillTemplate[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await ensureBillSeed();
        if (cancelled) return;
        setTemplates(list);
        setActiveId(list[0]?.id ?? "");
      } catch (e) {
        if (!cancelled) setLoadError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [tabMenu, setTabMenu] = useState<{ tabId: string; x: number; y: number } | null>(null);
  useEffect(() => {
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

  const persist = (next: BillTemplate) => {
    setTemplates((all) => {
      const updated = all.map((t) => (t.id === next.id ? next : t));
      return next.isDefault ? updated.map((t) => (t.id === next.id ? t : { ...t, isDefault: false })) : updated;
    });
    updateBillTemplateRow(next).catch((e: Error) => showToast(`Couldn't save: ${e.message}`));
  };

  const onNew = async () => {
    try {
      const created = await createBillTemplateRow(`Template ${templates.length + 1}`);
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
      const created = await createBillTemplateRow(`${source.name} (copy)`);
      const copy: BillTemplate = { ...source, id: created.id, name: created.name, isDefault: false };
      await updateBillTemplateRow(copy);
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
      const remaining = await deleteBillTemplateRow(active.id);
      setTemplates(remaining);
      setActiveId(remaining[0]?.id ?? "");
    } catch (e) {
      showToast(`Couldn't delete: ${(e as Error).message}`);
    }
  };

  // Async preview — buildBillHtml lazy-loads react-dom/server, so rebuild the
  // sample receipt whenever the active template changes.
  const [previewHtml, setPreviewHtml] = useState("");
  useEffect(() => {
    if (!active) return;
    let alive = true;
    buildBillHtml(SAMPLE_BILL, SAMPLE_META, active)
      .then((h) => { if (alive) setPreviewHtml(h); })
      .catch(() => {});
    return () => { alive = false; };
  }, [active]);

  if (loading) {
    return <div style={{ padding: spacing.l, color: colors.neutral500 }}>Loading templates…</div>;
  }
  if (!active) {
    return (
      <div style={{ padding: spacing.l, color: colors.neutral500, fontSize: fonts.size.s, maxWidth: 520, lineHeight: 1.5 }}>
        {loadError ? (
          <>
            Couldn't load bill templates (<span style={{ color: colors.red200 }}>{loadError}</span>).
            <br />
            Make sure the backend is up to date (rebuild &amp; restart so the bill-template service exists),
            and open this as the clinic <strong>admin</strong> — the first template is created for you on load.
          </>
        ) : (
          "No templates available."
        )}
      </div>
    );
  }

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
      <Tabs
        variant="block"
        items={tabItems}
        activeId={active.id}
        onSelect={setActiveId}
        actions={[{ label: "+ Add template", onClick: () => onNew() }]}
      />

      <div style={S.split}>
        <div style={S.formCol}>
          <EditorForm
            template={active}
            onChange={persist}
            onPrintTest={async () => openPrintWindow(await buildBillHtml(SAMPLE_BILL, SAMPLE_META, active))}
            onDelete={onDelete}
          />
        </div>

        <div style={S.previewCol}>
          <div style={S.previewHeader}>
            <span style={S.previewLabel}>Live preview</span>
            <span style={S.previewSub}>{active.paperMode === "preprinted" ? "Pre-printed letterhead mode" : "Blank A4 mode"}</span>
          </div>
          <PreviewFrame html={previewHtml} title="bill-preview" />
        </div>
      </div>

      {tabMenu && (() => {
        const t = templates.find((x) => x.id === tabMenu.tabId);
        if (!t) return null;
        const W = 200;
        const x = Math.min(tabMenu.x, window.innerWidth - W - 8);
        return (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{ ...S.tabMenu, top: tabMenu.y, left: x, width: W }}
          >
            <button type="button" style={S.tabMenuItem} onClick={() => { onDuplicate(t.id); setTabMenu(null); }}>
              Duplicate "{t.name}"
            </button>
          </div>
        );
      })()}

      <Toast message={toast.message} {...resolveToastIcon(toast.message)} isVisible={toast.visible} onClose={() => setToast({ visible: false, message: "" })} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Editor form — sections of controls, all controlled by `template`. onChange
// fires on every edit and writes through to the backend.
// ─────────────────────────────────────────────────────────────────────────────

function EditorForm({
  template,
  onChange,
  onPrintTest,
  onDelete,
}: {
  template: BillTemplate;
  onChange: (t: BillTemplate) => void;
  onPrintTest: () => void;
  onDelete: () => void;
}) {
  const set = <K extends keyof BillTemplate>(key: K, value: BillTemplate[K]) =>
    onChange({ ...template, [key]: value });
  const setMargin = (side: keyof BillTemplate["margins"], value: number) =>
    onChange({ ...template, margins: { ...template.margins, [side]: value } });
  const setShow = (key: BillFieldKey, value: boolean) =>
    onChange({ ...template, show: { ...template.show, [key]: value } });

  const pickImage = <K extends keyof BillTemplate>(key: K) => async (f: File | null) => {
    if (!f) { set(key, undefined as BillTemplate[K]); return; }
    try { set(key, (await readImage(f)) as BillTemplate[K]); }
    catch { /* silently ignore oversize/unreadable — the picker keeps the old value */ }
  };

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
              hint={template.isDefault ? "Used when printing bills" : "Set as the clinic default"}
            />
          </Field>
        </Row>
      </Section>

      {/* Paper mode */}
      <Section
        title="Paper mode"
        sub="Pre-printed letterhead has the design already on the paper — we print only the receipt body. Blank A4 means we print the clinic letterhead (and any header/footer images) too."
      >
        <SegmentedControl<PaperMode>
          value={template.paperMode}
          options={[
            { value: "preprinted", label: "Pre-printed letterhead", sub: "Body only, wide top/bottom margins" },
            { value: "blank",      label: "Blank A4",                sub: "Prints letterhead + header/footer" },
          ]}
          onChange={(v) => set("paperMode", v)}
        />
      </Section>

      {/* Clinic letterhead */}
      <Section title="Clinic letterhead" sub="Printed at the top of the receipt (Blank A4 mode). Leave blank to fall back to the clinic name.">
        <Row>
          <Field label="Clinic name" wide>
            <TextField variant="underline" value={template.clinicName} onChange={(v) => set("clinicName", v)} />
          </Field>
          <Field label="GSTIN">
            <TextField variant="underline" value={template.gstin ?? ""} onChange={(v) => set("gstin", v)} />
          </Field>
        </Row>
        <Row>
          <Field label="Address" wide>
            <TextField variant="underline" value={template.clinicAddress} onChange={(v) => set("clinicAddress", v)} />
          </Field>
        </Row>
        <Row>
          <Field label="Phone">
            <TextField variant="underline" value={template.clinicPhone ?? ""} onChange={(v) => set("clinicPhone", v)} />
          </Field>
          <Field label="Email">
            <TextField variant="underline" value={template.clinicEmail ?? ""} onChange={(v) => set("clinicEmail", v)} />
          </Field>
        </Row>
        <Row>
          <Field label="Logo" wide hint="Shown beside the clinic name. PNG with transparent background works best. Under 1 MB.">
            <ImagePicker value={template.logoImage} onPick={pickImage("logoImage")} aspect="logo" />
          </Field>
        </Row>
      </Section>

      {/* Header / footer images (blank mode) */}
      {isBlank && (
        <Section title="Header & footer images" sub="Full-width bands printed above/below the receipt in Blank A4 mode. A header image replaces the text letterhead.">
          <Row>
            <Field label="Header image" wide>
              <ImagePicker value={template.headerImage} onPick={pickImage("headerImage")} aspect="header" />
            </Field>
          </Row>
          <Row>
            <Field label="Footer image" wide>
              <ImagePicker value={template.footerImage} onPick={pickImage("footerImage")} aspect="footer" />
            </Field>
          </Row>
        </Section>
      )}

      {/* Margins */}
      <Section title="Margins" sub="Page margins for the printed receipt.">
        <Row>
          <Field label="Top">
            <LengthInput valueMm={template.margins.top} unit={template.marginsUnit} onValueMm={(v) => setMargin("top", v)} onUnitChange={(u) => set("marginsUnit", u)} />
          </Field>
          <Field label="Right">
            <LengthInput valueMm={template.margins.right} unit={template.marginsUnit} onValueMm={(v) => setMargin("right", v)} onUnitChange={(u) => set("marginsUnit", u)} />
          </Field>
          <Field label="Bottom">
            <LengthInput valueMm={template.margins.bottom} unit={template.marginsUnit} onValueMm={(v) => setMargin("bottom", v)} onUnitChange={(u) => set("marginsUnit", u)} />
          </Field>
          <Field label="Left">
            <LengthInput valueMm={template.margins.left} unit={template.marginsUnit} onValueMm={(v) => setMargin("left", v)} onUnitChange={(u) => set("marginsUnit", u)} />
          </Field>
        </Row>
      </Section>

      {/* Typography + heading */}
      <Section title="Typography">
        <Row>
          <Field label="Font family" wide>
            <Select value={template.fontFamily} onChange={(v) => set("fontFamily", v)} options={FONT_FAMILIES} />
          </Field>
          <Field label="Accent colour" hint="Title, rule & final amount.">
            <div style={S.colorRow}>
              <input
                type="color"
                value={template.accentColor || "#8a6d3b"}
                onChange={(e) => set("accentColor", e.target.value)}
                style={S.colorInput}
                aria-label="Accent colour"
              />
              <button type="button" style={S.resetLink} onClick={() => set("accentColor", undefined)}>Default</button>
            </div>
          </Field>
        </Row>
        <Row>
          <Field label="Receipt heading" wide>
            <TextField variant="underline" value={template.title} onChange={(v) => set("title", v)} />
          </Field>
        </Row>
      </Section>

      {/* Receipt field toggles */}
      <Section title="Receipt fields" sub="Which columns and rows appear on the receipt.">
        <div style={S.toggleGrid}>
          {BILL_FIELDS.map((f) => (
            <label key={f.key} style={S.toggleRow}>
              <Switch checked={template.show[f.key]} onChange={(v) => setShow(f.key, v)} />
              <span style={{ fontSize: fonts.size.s, color: colors.neutral900 }}>{f.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Footer & terms */}
      <Section title="Footer & terms" sub="Optional note printed under the totals, e.g. terms & conditions.">
        <textarea
          value={template.termsText ?? ""}
          onChange={(e) => set("termsText", e.target.value)}
          rows={3}
          style={S.textarea}
          placeholder="e.g. Goods once sold will not be taken back."
        />
      </Section>

      {/* Authorised signatory */}
      <Section title="Authorised signatory">
        <Row>
          <Field label="Signature image" wide>
            <ImagePicker value={template.signatureImage} onPick={pickImage("signatureImage")} aspect="signature" />
          </Field>
          <Field label="Seal (optional)" wide>
            <ImagePicker value={template.sealImage} onPick={pickImage("sealImage")} aspect="seal" />
          </Field>
        </Row>
        <Row>
          <Field label="Signature text" wide hint="Printed below the signature, e.g. 'Authorised Signatory'.">
            <TextField variant="underline" value={template.signatureText ?? ""} onChange={(v) => set("signatureText", v)} />
          </Field>
        </Row>
      </Section>

      {/* Footer row */}
      <div style={S.footerRow}>
        <button type="button" onClick={onDelete} style={S.deleteLink}>Delete template</button>
        <Button variant="light" size="md" onClick={onPrintTest}>Print test page</Button>
      </div>
    </div>
  );
}

// ─── Styles (layout glue not covered by editorKit) ────────────────────────────
const S: Record<string, React.CSSProperties> = {
  container: { display: "flex", flexDirection: "column", gap: spacing.l, minWidth: 0 },
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
  previewCol: { position: "sticky", top: 0, display: "flex", flexDirection: "column", gap: spacing.s },
  previewHeader: { display: "flex", alignItems: "baseline", justifyContent: "space-between" },
  previewLabel: { fontSize: fonts.size.s, fontWeight: 600, color: colors.neutral900 },
  previewSub: { fontSize: fonts.size.xs, color: colors.neutral500 },

  form: { display: "flex", flexDirection: "column", gap: spacing.l },
  toggleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: spacing.s },
  toggleRow: { display: "flex", alignItems: "center", gap: spacing.s, cursor: "pointer" },

  colorRow: { display: "flex", alignItems: "center", gap: spacing.s },
  colorInput: { width: 44, height: 32, padding: 0, border: `${strokes.xs} solid ${colors.neutral200}`, borderRadius: radii.s, background: "none", cursor: "pointer" },
  resetLink: { border: "none", background: "transparent", padding: 0, fontFamily: "inherit", fontSize: fonts.size.xs, color: colors.neutral600, textDecoration: "underline", cursor: "pointer" },

  textarea: {
    width: "100%",
    minHeight: 72,
    padding: spacing.s,
    border: `${strokes.xs} solid ${colors.neutral200}`,
    borderRadius: radii.s,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    resize: "vertical",
    boxSizing: "border-box",
    backgroundColor: colors.neutral100,
  },

  footerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.m, paddingTop: spacing.xs },
  deleteLink: { border: "none", background: "transparent", padding: 0, fontFamily: "inherit", fontSize: fonts.size.s, color: colors.red200, textDecoration: "underline", cursor: "pointer" },
};
