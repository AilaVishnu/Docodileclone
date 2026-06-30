import React from "react";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { Button } from "../Button";
import { Field } from "../Field";
import { Switch } from "../Switch";
import { DateField } from "../DateField";
import { styles } from "./ProcedureCard.styles";

// ─────────────────────────────────────────────────────────────────────────────
// ProcedureCard — the BODY of the "Procedure / Treatment" visit block. When the
// selected service is a procedure (not just a consultation), the doctor needs an
// operative record, not an Rx. This is a body-only block: the chrome (header,
// collapse, remove, surface) comes from <SectionBlock>, so it's "just another
// block". Deliberately generic — the flexible parameter rows (label → value →
// unit) fit any procedure (biopsy, laser, cryo, peel, injection) without a
// bespoke form per type. A visit can hold more than one.
// ─────────────────────────────────────────────────────────────────────────────

export type ProcedureParam = { id: string; label: string; value: string; unit: string };
export type ProcedureImage = { id: string; label: string; src?: string };

export type ProcedureData = {
  /** Procedure name — usually the procedure-type service that was selected. */
  name: string;
  /** Body site / area treated, incl. laterality (e.g. "Left cheek"). */
  site: string;
  /** Free-text operative note — what was done, technique, findings. */
  note: string;
  /** Flexible spec rows — the generic engine (label → value → unit). */
  params: ProcedureParam[];
  /** Before / after photos. */
  images: ProcedureImage[];
  /** Consent recorded for this procedure. */
  consent: boolean;
  /** Post-procedure care given to the patient. */
  aftercare: string;
  /** Review / follow-up date. */
  followUp: Date | null;
};

/** A blank procedure record — the block registry's `makeEmpty`. */
export function emptyProcedure(): ProcedureData {
  return { name: "", site: "", note: "", params: [], images: [], consent: false, aftercare: "", followUp: null };
}

// Conforms to BlockComponentProps<ProcedureData> (value/onChange/mode) so it
// drops straight into the block registry.
type ProcedureCardProps = {
  value: ProcedureData;
  onChange: (next: ProcedureData) => void;
  mode?: "edit" | "print";
};

let _seq = 0;
const nextId = (prefix: string): string => `${prefix}-${(_seq += 1)}`;

export function ProcedureCard({ value, onChange }: ProcedureCardProps) {
  const set = <K extends keyof ProcedureData>(key: K, v: ProcedureData[K]) =>
    onChange({ ...value, [key]: v } as ProcedureData);

  const setParam = (id: string, patch: Partial<ProcedureParam>) =>
    set("params", value.params.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const addParam = () => set("params", [...value.params, { id: nextId("param"), label: "", value: "", unit: "" }]);
  const removeParam = (id: string) => set("params", value.params.filter((p) => p.id !== id));

  const setImage = (id: string, patch: Partial<ProcedureImage>) =>
    set("images", value.images.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const addImage = () => set("images", [...value.images, { id: nextId("img"), label: "" }]);
  const removeImage = (id: string) => set("images", value.images.filter((i) => i.id !== id));

  return (
    <div style={styles.body}>
      {/* Identity */}
      <div style={styles.row2}>
        <label style={styles.fieldWrap}>
          <span style={styles.label}>Procedure</span>
          <Field variant="box" fill="filled" value={value.name} onChange={(v) => set("name", v)} placeholder="e.g. Punch biopsy" />
        </label>
        <label style={styles.fieldWrap}>
          <span style={styles.label}>Site / area</span>
          <Field
            variant="box" fill="filled"
            value={value.site}
            onChange={(v) => set("site", v)}
            placeholder="e.g. Left cheek"
            iconLeft={<Icon name="map-point" tone="inherit" size={16} />}
          />
        </label>
      </div>

      {/* Operative note */}
      <label style={styles.fieldWrap}>
        <span style={styles.label}>Notes</span>
        <Field
          variant="box" fill="filled"
          multiline
          value={value.note}
          onChange={(v) => set("note", v)}
          placeholder="What was done — technique, findings, materials…"
        />
      </label>

      {/* Parameters — the generic spec engine */}
      <div style={styles.group}>
        <div style={styles.groupHead}>
          <span style={styles.label}>Parameters</span>
          <span style={styles.hint}>any setting — fluence, freeze time, units…</span>
        </div>
        {value.params.length === 0 ? <p style={styles.empty}>None added.</p> : null}
        {value.params.map((p) => (
          <div key={p.id} style={styles.paramRow}>
            <Field variant="box" fill="filled" value={p.label} onChange={(v) => setParam(p.id, { label: v })} placeholder="Parameter" style={styles.paramLabel} />
            <Field variant="box" fill="filled" align="right" value={p.value} onChange={(v) => setParam(p.id, { value: v })} placeholder="Value" style={styles.paramValue} />
            <Field variant="box" fill="filled" value={p.unit} onChange={(v) => setParam(p.id, { unit: v })} placeholder="Unit" style={styles.paramUnit} />
            <IconButton ariaLabel="Remove parameter" title="Remove" size={30} onClick={() => removeParam(p.id)}>
              <Icon name="trash" tone="inherit" size={16} />
            </IconButton>
          </div>
        ))}
        <Button variant="light" size="sm" style={styles.addRow} iconLeft={<Icon name="plus" tone="inherit" size={14} />} onClick={addParam}>
          Add parameter
        </Button>
      </div>

      {/* Photos */}
      <div style={styles.group}>
        <div style={styles.groupHead}>
          <span style={styles.label}>Photos</span>
          <span style={styles.hint}>before / after</span>
        </div>
        <div style={styles.photoRow}>
          {value.images.map((img) => (
            <div key={img.id} style={styles.photoTile}>
              <div style={styles.photoBox}>
                {img.src ? (
                  <img src={img.src} alt={img.label || "Procedure photo"} style={styles.photoImg} />
                ) : (
                  <Icon name="plus" tone="muted" size={20} />
                )}
                <span style={styles.photoRemove}>
                  <IconButton ariaLabel="Remove photo" title="Remove" size={24} onClick={() => removeImage(img.id)}>
                    <Icon name="trash" tone="inherit" size={13} />
                  </IconButton>
                </span>
              </div>
              <Field variant="box" fill="filled" value={img.label} onChange={(v) => setImage(img.id, { label: v })} placeholder="Label" />
            </div>
          ))}
          <button type="button" style={styles.photoAdd} onClick={addImage} aria-label="Add photo">
            <Icon name="plus" tone="muted" size={22} />
            <span style={styles.photoAddText}>Add photo</span>
          </button>
        </div>
      </div>

      {/* Consent */}
      <div style={styles.consentRow}>
        <Switch checked={value.consent} onChange={(v) => set("consent", v)} ariaLabel="Consent taken" />
        <span style={styles.consentLabel}>Consent taken for this procedure</span>
      </div>

      {/* Aftercare + follow-up */}
      <div style={styles.row2}>
        <label style={styles.fieldWrap}>
          <span style={styles.label}>Aftercare</span>
          <Field
            variant="box" fill="filled"
            multiline
            value={value.aftercare}
            onChange={(v) => set("aftercare", v)}
            placeholder="Post-procedure care given to the patient…"
          />
        </label>
        <label style={styles.fieldWrap}>
          <span style={styles.label}>Follow-up</span>
          <DateField value={value.followUp} onChange={(d) => set("followUp", d)} placeholder="Review date" />
        </label>
      </div>
    </div>
  );
}
