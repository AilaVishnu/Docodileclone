import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { styles } from "./AddServiceModal.styles";
import { Service, DiscountMode } from "./types";

const NO_SPINNER_CLASS = "no-spinner";

if (typeof document !== "undefined" && !document.getElementById("services-modal-style")) {
  const el = document.createElement("style");
  el.id = "services-modal-style";
  el.textContent = `
    .${NO_SPINNER_CLASS}::-webkit-outer-spin-button,
    .${NO_SPINNER_CLASS}::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .${NO_SPINNER_CLASS} { -moz-appearance: textfield; }
  `;
  document.head.appendChild(el);
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Omit<Service, "id">) => void;
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

  const handleSave = () => {
    setTouched(true);
    if (!canSave) return;
    onSave({
      name: trimmedName,
      code: trimmedCode,
      price: priceNum,
      duration: Number.isFinite(durationNum) ? durationNum : 0,
      discount: parseFloat(form.discount) || 0,
      discountMode: form.discountMode,
      gst: parseFloat(form.gst) || 0,
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{initial ? "Edit Service" : "Add Service"}</h3>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div style={styles.form}>
          <div style={{ ...styles.row, gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}>
            <div style={styles.field}>
              <label style={styles.label}>Name<span style={styles.required}>*</span></label>
              <div style={{ ...styles.inputWrap, ...(touched && nameError ? styles.inputWrapError : {}) }}>
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Consultation"
                  autoFocus
                />
              </div>
              {touched && nameError && <div style={styles.errorText}>Name is required</div>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Short Form<span style={styles.required}>*</span></label>
              <div style={{ ...styles.inputWrap, ...(touched && codeError ? styles.inputWrapError : {}) }}>
                <input
                  style={{ ...styles.input, textTransform: "uppercase", letterSpacing: "0.04em" }}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\s+/g, "").slice(0, 4) })}
                  placeholder="GC"
                  maxLength={4}
                />
              </div>
              {touched && codeError && <div style={styles.errorText}>Short form is required</div>}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Price<span style={styles.required}>*</span></label>
              <div style={{ ...styles.inputWrap, ...(touched && priceError ? styles.inputWrapError : {}) }}>
                <span style={styles.prefix}>₹</span>
                <input
                  style={styles.input}
                  type="number"
                  className={NO_SPINNER_CLASS}
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              {touched && priceError && <div style={styles.errorText}>Enter a valid price</div>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Duration</label>
              <div style={{ ...styles.inputWrap, ...(touched && durationError ? styles.inputWrapError : {}) }}>
                <input
                  style={styles.input}
                  type="number"
                  className={NO_SPINNER_CLASS}
                  min={0}
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="15"
                />
                <span style={styles.suffix}>min</span>
              </div>
              {touched && durationError && <div style={styles.errorText}>Invalid duration</div>}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Discount</label>
              <div style={styles.inputWrap}>
                <input
                  style={styles.input}
                  type="number"
                  className={NO_SPINNER_CLASS}
                  min={0}
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  placeholder="0"
                />
                <div style={styles.modeToggle}>
                  {(["%", "₹"] as DiscountMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      style={{ ...styles.modeBtn, ...(form.discountMode === mode ? styles.modeBtnActive : {}) }}
                      onClick={() => setForm({ ...form, discountMode: mode })}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>GST</label>
              <div style={styles.inputWrap}>
                <input
                  style={styles.input}
                  type="number"
                  className={NO_SPINNER_CLASS}
                  min={0}
                  max={100}
                  value={form.gst}
                  onChange={(e) => setForm({ ...form, gst: e.target.value })}
                  placeholder="0"
                />
                <span style={styles.suffix}>%</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={{ ...styles.saveBtn, ...(canSave ? {} : styles.saveBtnDisabled) }}
            onClick={handleSave}
          >
            {initial ? "Save Changes" : "Add Service"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
