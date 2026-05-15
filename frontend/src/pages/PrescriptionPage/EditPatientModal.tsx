import React, { useEffect, useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { pickAvatar } from "../../utils/avatar";
import { API_BASE_URL } from "../../apiConfig";
import type { Patient } from "../../hooks/usePatients";

type Props = {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSave: (updated: Partial<Patient>) => void;
  onSaved?: () => void;
  onError?: (msg: string) => void;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  ageYears: string;
};

type AgeMode = "dob" | "age";

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

// Allows +, digits, spaces, dashes, parentheses — strips everything else
function sanitizePhone(raw: string): string {
  return raw.replace(/[^\d+\s\-().]/g, "").slice(0, 15);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ageFromDob(dob: string): string {
  if (!dob) return "";
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return "";
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
  return years >= 0 ? String(years) : "";
}

export function EditPatientModal({ isOpen, patient, onClose, onSave, onSaved, onError }: Props) {
  const [form, setForm] = useState<FormState>({
    name: "", phone: "", email: "", gender: "", dob: "", ageYears: "",
  });
  const [ageMode, setAgeMode] = useState<AgeMode>("dob");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; email?: string }>({});

  useEffect(() => {
    if (!patient || !isOpen) return;
    const dob = patient.dob ?? "";
    const ageYears = patient.age != null ? String(Math.floor(patient.age / 12)) : "";
    setAgeMode(dob ? "dob" : "age");
    setErrors({});
    setForm({ name: patient.name ?? "", phone: patient.phone ?? "", email: patient.email ?? "", gender: patient.gender ?? "", dob, ageYears });
  }, [patient, isOpen]);

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = e.target.value;
      if (key === "phone") value = sanitizePhone(value);
      setForm((prev) => ({ ...prev, [key]: value }));
      if (key === "phone" || key === "email") setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const validate = (): boolean => {
    const errs: { phone?: string; email?: string } = {};
    if (form.phone.trim() && !isValidPhone(form.phone))
      errs.phone = "Enter a valid phone number (7–15 digits)";
    if (form.email.trim() && !isValidEmail(form.email))
      errs.email = "Enter a valid email address";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!patient) return;
    if (!validate()) return;
    const ageMonths = ageMode === "dob" && form.dob
      ? (() => {
          const birth = new Date(form.dob);
          if (isNaN(birth.getTime())) return patient.age ?? null;
          const today = new Date();
          return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
        })()
      : form.ageYears ? parseInt(form.ageYears, 10) * 12 : patient.age ?? null;

    const updated: Partial<Patient> = {
      name: form.name.trim() || patient.name,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      gender: form.gender || null,
      dob: ageMode === "dob" ? (form.dob || null) : null,
      age: ageMonths,
    };

    setSaving(true);
    try {
      const token = localStorage.getItem("docodile_token");
      const res = await fetch(`${API_BASE_URL}/api/patients/${patient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: updated.name,
          phone: updated.phone,
          email: updated.email,
          gender: updated.gender,
          dob: updated.dob,
          age: updated.age,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      onSave(updated);
      onSaved?.();
      onClose();
    } catch (err) {
      onError?.((err as Error).message || "Failed to save patient");
    } finally {
      setSaving(false);
    }
  };

  if (!patient) return null;

  const ageYearsNum = ageMode === "dob" && form.dob
    ? parseInt(ageFromDob(form.dob), 10)
    : parseInt(form.ageYears, 10);
  const avatarSrc = pickAvatar({ gender: form.gender || patient.gender, ageYears: isNaN(ageYearsNum) ? null : ageYearsNum });

  const ageDisplay = ageMode === "dob" && form.dob
    ? `${ageFromDob(form.dob)} yrs`
    : form.ageYears ? `${form.ageYears} yrs` : "";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h2 style={styles.title}>Edit Patient Info</h2>
            <p style={styles.subtitle}>Update personal details for this patient</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={styles.closeBtn}>
            ✕
          </button>
        </header>

        {/* Patient identity strip — cream bg mirrors the prescription patient card */}
        <div style={styles.identityStrip}>
          <div style={styles.avatarWrap}>
            <img src={avatarSrc} alt="" width={64} height={64} style={styles.avatarImg} />
          </div>
          <div style={styles.identityText}>
            <p style={styles.identityName}>{form.name || patient.name}</p>
            <div style={styles.identityMeta}>
              {(form.gender || patient.gender) && (
                <span style={styles.metaChip}>{form.gender || patient.gender}</span>
              )}
              {ageDisplay && (
                <span style={styles.metaChip}>{ageDisplay}</span>
              )}
              {patient.lastVisitDate && (
                <span style={styles.metaSub}>
                  Last visit{" "}
                  {new Date(patient.lastVisitDate).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form card — white interior like prescription form sections */}
        <div style={styles.formCard}>
          <Field label="Full name">
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              style={styles.textInput}
              placeholder="Patient full name"
            />
          </Field>

          <div style={styles.twoCol}>
            <Field label="Phone" error={errors.phone}>
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                maxLength={15}
                style={{ ...styles.textInput, ...(errors.phone ? styles.inputError : undefined) }}
                placeholder="+91 98765 43210"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                style={{ ...styles.textInput, ...(errors.email ? styles.inputError : undefined) }}
                placeholder="patient@email.com"
              />
            </Field>
          </div>

          <div style={styles.twoCol}>
            <Field label="Gender">
              <select value={form.gender} onChange={set("gender")} style={styles.selectInput}>
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>

            {/* DOB / Age — single toggle field */}
            <div style={styles.fieldWrap}>
              <div style={styles.ageLabelRow}>
                <span style={styles.fieldLabel}>
                  {ageMode === "dob" ? "Date of birth" : "Age (years)"}
                </span>
                <div style={styles.togglePill}>
                  <button
                    type="button"
                    onClick={() => setAgeMode("dob")}
                    style={{ ...styles.toggleBtn, ...(ageMode === "dob" ? styles.toggleBtnActive : undefined) }}
                  >
                    DOB
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgeMode("age")}
                    style={{ ...styles.toggleBtn, ...(ageMode === "age" ? styles.toggleBtnActive : undefined) }}
                  >
                    Age
                  </button>
                </div>
              </div>
              {ageMode === "dob" ? (
                <input
                  type="date"
                  value={form.dob}
                  onChange={set("dob")}
                  style={styles.textInput}
                />
              ) : (
                <input
                  type="number"
                  min={0}
                  max={150}
                  value={form.ageYears}
                  onChange={set("ageYears")}
                  style={styles.textInput}
                  placeholder="e.g. 32"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <button type="button" onClick={onClose} style={styles.btnGhost}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            style={{
              ...styles.btnPrimary,
              ...((saving || !form.name.trim()) ? { opacity: 0.45, cursor: "not-allowed" } : undefined),
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </footer>
      </div>
    </Modal>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.fieldLabel}>{label}</label>
      {children}
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
    width: 520,
    maxWidth: "100%",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.m,
  },
  title: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  subtitle: {
    margin: 0,
    marginTop: 4,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral600,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: colors.neutral900,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
  },

  // ── Patient identity strip — cream bg, mirrors prescription patient card ──
  identityStrip: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
    backgroundColor: colors.primary100,
    borderRadius: radii.xl,
    padding: `${spacing.m} ${spacing.l}`,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    overflow: "hidden",
    backgroundColor: colors.primary300,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  identityText: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    minWidth: 0,
  },
  identityName: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h5,
    lineHeight: fonts.lineHeight.h5,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  identityMeta: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap" as const,
  },
  metaChip: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral700,
    backgroundColor: colors.primary200,
    borderRadius: radii.full,
    padding: "2px 10px",
  },
  metaSub: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.neutral500,
  },

  // ── Form card — white interior ─────────────────────────────────────────────
  formCard: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.m,
    backgroundColor: colors.neutral100,
    borderRadius: radii.xl,
    border: `1px solid ${colors.neutral200}`,
    padding: spacing.l,
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: spacing.m,
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  },
  fieldLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500,
    fontWeight: fonts.weight.regular,
  },
  fieldError: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.xs,
    color: colors.red100,
    marginTop: 2,
  },
  inputError: {
    border: `1px solid ${colors.red100}`,
    backgroundColor: colors.redAlpha10,
  },
  textInput: {
    width: "100%",
    height: 40,
    boxSizing: "border-box" as const,
    padding: `0 ${spacing.s}`,
    border: `1px solid ${colors.neutral300}`,
    borderRadius: radii.m,
    backgroundColor: colors.neutral150,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    outline: "none",
  },
  selectInput: {
    width: "100%",
    height: 40,
    boxSizing: "border-box" as const,
    padding: `0 ${spacing.s}`,
    border: `1px solid ${colors.neutral300}`,
    borderRadius: radii.m,
    backgroundColor: colors.neutral150,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    outline: "none",
    appearance: "auto" as const,
  },

  // ── DOB / Age toggle ───────────────────────────────────────────────────────
  ageLabelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  togglePill: {
    display: "flex",
    borderRadius: radii.s,
    border: `1px solid ${colors.neutral300}`,
    overflow: "hidden",
    flexShrink: 0,
  },
  toggleBtn: {
    fontFamily: fonts.family.primary,
    fontSize: 10,
    color: colors.neutral500,
    background: "transparent",
    border: "none",
    padding: "2px 8px",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    lineHeight: 1.4,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary700,
    color: colors.neutral100,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: spacing.s,
    paddingTop: spacing.s,
    borderTop: `1px solid ${colors.neutral200}`,
  },
  btnGhost: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    background: "transparent",
    border: `1px solid ${colors.primary300}`,
    borderRadius: radii.full,
    padding: "10px 20px",
    cursor: "pointer",
  },
  btnPrimary: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral100,
    backgroundColor: colors.primary700,
    border: "none",
    borderRadius: radii.full,
    padding: "10px 20px",
    cursor: "pointer",
  },
};
