import React, { useEffect, useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { IconButton } from "../../components/IconButton";
import { ModalHeader } from "../../components/ModalHeader";
import { Button } from "../../components/Button";
import { DatePicker } from "../../components/DatePicker/DatePicker";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { pickAvatar } from "../../utils/avatar";
import { API_BASE_URL } from "../../apiConfig";
import type { Patient } from "../../hooks/usePatients";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// DOB is stored as an ISO "yyyy-MM-dd" string. Parse/format with local
// date parts (not `new Date(iso)`, which treats it as UTC and can shift a
// day across time zones).
function parseDob(iso: string): Date | null {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function formatDob(iso: string): string {
  const d = parseDob(iso);
  if (!d || isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms", flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function CalendarGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

type Props = {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSave: (updated: Partial<Patient>) => void;
  onSaved?: () => void;
  onError?: (msg: string) => void;
  // Fired after the patient has been archived successfully. Parent should
  // refresh the patient list (archived ones are filtered server-side).
  onArchived?: () => void;
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

export function EditPatientModal({ isOpen, patient, onClose, onSave, onSaved, onError, onArchived }: Props) {
  const [form, setForm] = useState<FormState>({
    name: "", phone: "", email: "", gender: "", dob: "", ageYears: "",
  });
  const [ageMode, setAgeMode] = useState<AgeMode>("dob");
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; email?: string }>({});
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!patient || !isOpen) return;
    const dob = patient.dob ?? "";
    const ageYears = patient.age != null ? String(Math.floor(patient.age / 12)) : "";
    setAgeMode(dob ? "dob" : "age");
    setErrors({});
    setConfirmArchive(false);
    setForm({ name: patient.name ?? "", phone: patient.phone ?? "", email: patient.email ?? "", gender: patient.gender ?? "", dob, ageYears });
  }, [patient, isOpen]);

  const handleArchive = async () => {
    if (!patient) return;
    setArchiving(true);
    try {
      const token = localStorage.getItem("docodile_token");
      const res = await fetch(`${API_BASE_URL}/api/patients/${patient.id}/archive`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      onArchived?.();
      onClose();
    } catch (err) {
      onError?.((err as Error).message || "Failed to archive patient");
    } finally {
      setArchiving(false);
      setConfirmArchive(false);
    }
  };

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
    if (!form.name.trim()) {
      onError?.("Please enter the patient's name.");
      return;
    }
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
    <Modal isOpen={isOpen} onClose={onClose} surface={colors.neutral100}>
      <div style={styles.container}>
        {/* Header */}
        <ModalHeader title="Edit Patient Info" subtitle="Update personal details for this patient" onClose={onClose} />

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
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowGenderMenu((o) => !o)}
                  style={styles.selectTrigger}
                >
                  <span style={form.gender ? undefined : styles.placeholderText}>
                    {form.gender || "Select gender"}
                  </span>
                  <ChevronDownIcon open={showGenderMenu} />
                </button>
                {showGenderMenu && (
                  <>
                    <div style={styles.popBackdrop} onClick={() => setShowGenderMenu(false)} />
                    <div style={styles.menu}>
                      {GENDER_OPTIONS.map((g) => {
                        const active = form.gender.toLowerCase() === g.toLowerCase();
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              setForm((f) => ({ ...f, gender: g }));
                              setShowGenderMenu(false);
                            }}
                            style={{ ...styles.menuItem, ...(active ? styles.menuItemActive : undefined) }}
                            onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = colors.neutral150; }}
                            onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
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
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(true)}
                    style={styles.selectTrigger}
                  >
                    <span style={form.dob ? undefined : styles.placeholderText}>
                      {formatDob(form.dob) || "Select date"}
                    </span>
                    <CalendarGlyph />
                  </button>
                  {showDatePicker && (
                    <DatePicker
                      selectedDate={parseDob(form.dob) ?? new Date()}
                      onSelect={(date: Date) => {
                        setForm((f) => ({ ...f, dob: toIsoDate(date) }));
                        setShowDatePicker(false);
                      }}
                      onClose={() => setShowDatePicker(false)}
                    />
                  )}
                </div>
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

        {/* Footer — Archive sits on the left as a tertiary destructive
            action so it doesn't crowd Save / Cancel. Click opens a small
            confirmation modal so an accidental tap doesn't pull a patient
            from the active roster. */}
        <footer style={styles.footer}>
          <button
            type="button"
            onClick={() => setConfirmArchive(true)}
            disabled={saving}
            style={styles.btnArchiveGhost}
            title="Hide this patient from the active list; data is preserved"
          >
            Archive Patient
          </button>
          <div style={{ flex: 1 }} />
          <Button variant="light" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </footer>
      </div>

      {/* Confirm archive — uses the same chrome as the main modal
          (serif header + subtitle + × close + footer with top divider)
          so it reads as part of the same design family. */}
      <Modal isOpen={confirmArchive} onClose={() => !archiving && setConfirmArchive(false)}>
        <div style={styles.confirmCard}>
          <header style={styles.header}>
            <div>
              <h2 style={styles.title}>Are you sure?</h2>
              <p style={styles.subtitle}>Archive this patient from the active list</p>
            </div>
            <IconButton ariaLabel="Close" onClick={() => !archiving && setConfirmArchive(false)} />
          </header>

          <div style={styles.identityStrip}>
            <div style={styles.avatarWrap}>
              <img src={avatarSrc} alt="" width={56} height={56} style={styles.avatarImg} />
            </div>
            <div style={styles.identityText}>
              <p style={styles.identityName}>{patient.name}</p>
              <div style={styles.identityMeta}>
                {(form.gender || patient.gender) && (
                  <span style={styles.metaChip}>{form.gender || patient.gender}</span>
                )}
                {ageDisplay && <span style={styles.metaChip}>{ageDisplay}</span>}
              </div>
            </div>
          </div>

          <p style={styles.confirmText}>
            Visits, prescriptions and files are preserved and can be restored
            later from the archived patients list.
          </p>

          <footer style={styles.footer}>
            <Button
              variant="light"
              size="sm"
              onClick={() => setConfirmArchive(false)}
              disabled={archiving}
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleArchive}
              disabled={archiving}
              style={{ ...styles.btnArchive, ...(archiving ? { opacity: 0.45, cursor: "not-allowed" } : undefined) }}
            >
              {archiving ? "Archiving…" : "Archive Patient"}
            </button>
          </footer>
        </div>
      </Modal>
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

  // ── Form fields — sit directly on the white modal surface (no inner box) ────
  formCard: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.m,
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
    height: "var(--input-h, 40px)",
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
  // Dropdown / date trigger — mirrors textInput, but is a button that opens
  // a styled popover (design-system DatePicker or the gender menu) instead of
  // a native control.
  selectTrigger: {
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
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
    textAlign: "left" as const,
  },
  placeholderText: {
    color: colors.neutral400,
  },
  popBackdrop: {
    position: "fixed" as const,
    inset: 0,
    backgroundColor: "transparent",
    zIndex: 1050,
  },
  menu: {
    position: "absolute" as const,
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    backgroundColor: colors.neutral100,
    border: `1px solid ${colors.neutral200}`,
    borderRadius: radii.m,
    boxShadow: "2px 2px 12px 0px rgba(0,0,0,0.08)",
    padding: 4,
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
    maxHeight: 220,
    overflowY: "auto" as const,
    zIndex: 1100,
  },
  menuItem: {
    width: "100%",
    textAlign: "left" as const,
    padding: "8px 10px",
    borderRadius: radii.s,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
    transition: "background-color 120ms",
  },
  menuItemActive: {
    backgroundColor: colors.active.shade100,
    fontWeight: fonts.weight.medium,
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
  },

  // ── Archive button + inline confirm — sits on the left of the footer,
  // visually subdued so it doesn't pull attention away from Save changes.
  btnArchiveGhost: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    fontWeight: fonts.weight.medium,
    color: colors.red100,
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    textDecoration: "underline",
  },
  btnArchive: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral100,
    backgroundColor: colors.red200,
    border: "none",
    borderRadius: radii.full,
    padding: "10px 20px",
    cursor: "pointer",
  },
  btnLinkMuted: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral600,
    background: "transparent",
    border: "none",
    padding: "6px 8px",
    cursor: "pointer",
    textDecoration: "underline",
  },
  archiveConfirm: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
  },
  archiveConfirmText: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral700,
  },

  // ── Confirm archive popup ─────────────────────────────────────────────────
  confirmCard: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    width: 380,
    maxWidth: "100%",
  },
  confirmTitle: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h6,
    lineHeight: fonts.lineHeight.h6,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  confirmText: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral600,
    lineHeight: 1.5,
  },
  confirmActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: spacing.s,
    paddingTop: spacing.xs,
  },
};
