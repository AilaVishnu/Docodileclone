import React, { useEffect, useState } from "react";
import { styles } from "./AddServiceModal.styles";
import { Service, DiscountMode } from "./types";
import { Modal } from "../../components/Modal";
import { IconButton } from "../../components/IconButton";
import { Button } from "../../components/Button";
import { Field } from "../../components/Field";
import { MeasureField } from "../../components/MeasureField";
import { colors, spacing } from "../../styles/theme";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // May return a promise — if it rejects, we show the error inline so the
  // user isn't left wondering why nothing happened.
  onSave: (service: Omit<Service, "id">) => void | Promise<void>;
  initial?: Service | null;
};

const empty = {
  name: "",
  code: "",
  price: "",
  duration: "",
  discount: "",
  discountMode: "%" as DiscountMode,
  gst: "",
};

export function AddServiceModal({ isOpen, onClose, onSave, initial }: Props) {
  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setForm({
        name: initial.name,
        code: initial.code,
        price: String(initial.price),
        duration: String(initial.duration),
        discount: initial.discount ? String(initial.discount) : "",
        discountMode: initial.discountMode,
        gst: initial.gst ? String(initial.gst) : "",
      });
    } else {
      setForm(empty);
    }
    setTouched(false);
    setSaveError(null);
    setSaving(false);
  }, [isOpen, initial]);

  const trimmedName = form.name.trim();
  const trimmedCode = form.code.trim().toUpperCase();
  const priceNum = parseFloat(form.price);
  const durationNum = parseFloat(form.duration);
  const nameError = !trimmedName;
  const codeError = !trimmedCode;
  const priceError = !Number.isFinite(priceNum) || priceNum < 0;
  const durationError = form.duration !== "" && (!Number.isFinite(durationNum) || durationNum < 0);
  const canSave = !nameError && !codeError && !priceError && !durationError;

  const handleSave = async () => {
    setTouched(true);
    if (!canSave) return;
    setSaveError(null);
    setSaving(true);
    try {
      await onSave({
        name: trimmedName,
        code: trimmedCode,
        price: priceNum,
        duration: Number.isFinite(durationNum) ? durationNum : 0,
        discount: parseFloat(form.discount) || 0,
        discountMode: form.discountMode,
        gst: parseFloat(form.gst) || 0,
      });
    } catch (e) {
      setSaveError((e as Error).message || "Couldn't save service");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} surface={colors.neutral100} width={440} padding={spacing.xl}>
      <div style={styles.cardBody}>
        <div style={styles.header}>
          <h3 style={styles.title}>{initial ? "Edit Service" : "Add Service"}</h3>
          <IconButton ariaLabel="Close" onClick={onClose} />
        </div>

        <div style={styles.form}>
          <div style={{ ...styles.row, gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}>
            <div style={styles.field}>
              <label style={styles.label}>Name<span style={styles.required}>*</span></label>
              <Field
                variant="box"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="e.g. Consultation"
                autoFocus
                error={touched && nameError}
                errorMessage="Name is required"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Short Form<span style={styles.required}>*</span></label>
              <Field
                variant="box"
                value={form.code}
                onChange={(v) => setForm({ ...form, code: v.replace(/\s+/g, "").slice(0, 4) })}
                placeholder="GC"
                maxLength={4}
                error={touched && codeError}
                errorMessage="Short form is required"
                inputStyle={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Price<span style={styles.required}>*</span></label>
              <MeasureField box prefix="₹" value={form.price} onChange={(v) => setForm({ ...form, price: v })} inputMode="decimal" placeholder="0" invalid={touched && !!priceError} />
              {touched && priceError && <div style={styles.errorText}>Enter a valid price</div>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Duration</label>
              <MeasureField box unit="min" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} inputMode="decimal" placeholder="15" invalid={touched && durationError} />
              {touched && durationError && <div style={styles.errorText}>Invalid duration</div>}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Discount</label>
              <MeasureField
                box
                value={form.discount}
                onChange={(v) => setForm({ ...form, discount: v })}
                unit={form.discountMode}
                onToggleUnit={() => setForm({ ...form, discountMode: form.discountMode === "%" ? "₹" : "%" })}
                inputMode="decimal"
                placeholder="0"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>GST</label>
              <MeasureField box unit="%" value={form.gst} onChange={(v) => setForm({ ...form, gst: v })} inputMode="decimal" placeholder="0" />
            </div>
          </div>
        </div>

        {saveError && (
          <div style={{ padding: "0 24px", color: colors.red200, fontSize: 13 }}>
            {saveError}
          </div>
        )}

        <div style={styles.footer}>
          <Button variant="light" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : initial ? "Save Changes" : "Add Service"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
