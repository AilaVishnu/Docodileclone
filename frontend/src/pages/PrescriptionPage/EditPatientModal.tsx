import React, { useEffect, useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { IconButton } from "../../components/IconButton";
import { ModalHeader } from "../../components/ModalHeader";
import { Button } from "../../components/Button";
import { PatientDetailsForm, PatientDraft } from "../../components/PatientDetailsForm";
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
  // Fired after the patient has been archived successfully. Parent should
  // refresh the patient list (archived ones are filtered server-side).
  onArchived?: () => void;
};

// Edit Patient reuses the shared PatientDetailsForm (the same identity card
// behind Book Appointment / New Prescription). That form speaks in ddmmyyyy
// DOB digits + a "dd mm yyyy" display string + a "years / months" age string,
// whereas the patient record stores an ISO dob + an age in months — so we map
// between the two on open and on save.

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

const EMPTY_DRAFT: PatientDraft = { name: "", email: "", phone: "", dob: "", age: "", gender: "" };

// ISO "yyyy-MM-dd" ⇄ ddmmyyyy digits (the form's raw DOB representation).
function isoToDigits(iso: string): string {
  const p = iso.split("-");
  return p.length === 3 ? `${p[2]}${p[1]}${p[0]}` : "";
}
function digitsToIso(digits: string): string | null {
  if (digits.length !== 8) return null;
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}
function formatDob(digits: string): string {
  const dd = digits.slice(0, 2), mm = digits.slice(2, 4), yyyy = digits.slice(4, 8);
  if (digits.length <= 2) return dd;
  if (digits.length <= 4) return `${dd} ${mm}`;
  return `${dd} ${mm} ${yyyy}`;
}
// Age "years / months" from ddmmyyyy digits — mirrors BookAppointment.calcAge.
function calcAge(digits: string): string {
  if (digits.length !== 8) return "";
  const d = Number(digits.slice(0, 2));
  const mIdx = Number(digits.slice(2, 4)) - 1;
  const y = Number(digits.slice(4, 8));
  if (d < 1 || d > 31 || mIdx < 0 || mIdx > 11 || y <= 1900) return "";
  const birth = new Date(y, mIdx, d);
  const today = new Date();
  if (birth > today) return "";
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) months--;
  if (months < 0) { years--; months += 12; }
  return `${years} / ${months}`;
}
// "years / months" → total months (the stored representation).
function ageStringToMonths(age: string): number | null {
  const [yRaw, mRaw] = age.split("/").map((s) => s.trim());
  const y = parseInt(yRaw || "", 10);
  const m = parseInt(mRaw || "", 10);
  if (isNaN(y) && isNaN(m)) return null;
  return (isNaN(y) ? 0 : y) * 12 + (isNaN(m) ? 0 : m);
}
function formatPhone(raw: string | null): string {
  const clean = (raw ?? "").replace(/\D/g, "").slice(-10);
  return clean.length === 10 ? `+91 ${clean.slice(0, 5)} ${clean.slice(5)}` : (raw ?? "");
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EditPatientModal({ isOpen, patient, onClose, onSave, onSaved, onError, onArchived }: Props) {
  const [draft, setDraft] = useState<PatientDraft>(EMPTY_DRAFT);
  const [dobDigits, setDobDigits] = useState("");
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [errors, setErrors] = useState<{ name?: boolean; email?: boolean; phone?: boolean }>({});

  useEffect(() => {
    if (!patient || !isOpen) return;
    setErrors({});
    setConfirmArchive(false);
    const digits = patient.dob ? isoToDigits(patient.dob) : "";
    const age = digits
      ? calcAge(digits)
      : patient.age != null
        ? `${Math.floor(patient.age / 12)} / ${patient.age % 12}`
        : "";
    setDobDigits(digits);
    // Normalise stored casing ("male" → "Male") so it matches a radio option;
    // fall back to the raw value if it isn't one of the known options.
    const gender =
      GENDER_OPTIONS.find((o) => o.toLowerCase() === (patient.gender ?? "").toLowerCase()) ??
      (patient.gender ?? "");
    setDraft({
      name: patient.name ?? "",
      email: patient.email ?? "",
      phone: formatPhone(patient.phone),
      dob: digits ? formatDob(digits) : "",
      age,
      gender,
    });
  }, [patient, isOpen]);

  // Apply a field patch from the form and clear that field's error.
  const update = (patch: Partial<PatientDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      if ("name" in patch) next.name = undefined;
      if ("email" in patch) next.email = undefined;
      if ("phone" in patch) next.phone = undefined;
      return next;
    });
  };

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

  const handleSave = async () => {
    if (!patient) return;
    const nextErrors: { name?: boolean; email?: boolean; phone?: boolean } = {};
    if (!draft.name.trim()) nextErrors.name = true;
    if (draft.phone.trim() && !isValidPhone(draft.phone)) nextErrors.phone = true;
    if (draft.email.trim() && !isValidEmail(draft.email)) nextErrors.email = true;
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      if (nextErrors.name) onError?.("Please enter the patient's name.");
      return;
    }

    const iso = digitsToIso(dobDigits);
    const ageMonths = iso
      ? (() => {
          const birth = new Date(iso);
          if (isNaN(birth.getTime())) return patient.age ?? null;
          const today = new Date();
          return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
        })()
      : ageStringToMonths(draft.age) ?? patient.age ?? null;

    const updated: Partial<Patient> = {
      name: draft.name.trim() || patient.name,
      phone: draft.phone.trim() || null,
      email: draft.email.trim() || null,
      gender: draft.gender || null,
      dob: iso,
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

  const ageYearsNum = parseInt(draft.age.split("/")[0]?.trim() || "", 10);
  const avatarSrc = pickAvatar({
    gender: draft.gender || patient.gender,
    ageYears: isNaN(ageYearsNum) ? null : ageYearsNum,
  });

  const ageDisplay = (() => {
    if (!draft.age) return "";
    const [y, m] = draft.age.split("/").map((s) => parseInt(s.trim(), 10));
    if (!isNaN(y) && y > 0) return `${y} yrs`;
    if (!isNaN(m) && m > 0) return `${m} mos`;
    return "";
  })();

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
            <p style={styles.identityName}>{draft.name || patient.name}</p>
            <div style={styles.identityMeta}>
              {(draft.gender || patient.gender) && (
                <span style={styles.metaChip}>{draft.gender || patient.gender}</span>
              )}
              {ageDisplay && <span style={styles.metaChip}>{ageDisplay}</span>}
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

        {/* Shared identity form — flat (no card) so it sits on the white modal */}
        <PatientDetailsForm
          bare
          value={draft}
          onChange={update}
          errors={errors}
          dobDigits={dobDigits}
          setDobDigits={setDobDigits}
          genderOptions={GENDER_OPTIONS}
        />

        {/* Footer — Archive sits on the left as a tertiary destructive action
            so it doesn't crowd Save / Cancel. Click opens a small confirmation
            modal so an accidental tap doesn't pull a patient from the roster. */}
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
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </footer>
      </div>

      {/* Confirm archive — uses the same chrome as the main modal so it reads as
          part of the same design family. */}
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
                {(draft.gender || patient.gender) && (
                  <span style={styles.metaChip}>{draft.gender || patient.gender}</span>
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
            <Button variant="light" size="sm" onClick={() => setConfirmArchive(false)} disabled={archiving}>
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
    width: 520,
    maxWidth: "100%",
  },

  // ── Header (shared by the confirm-archive dialog) ───────────────────────────
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

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: spacing.s,
  },

  // ── Archive button — subdued so it doesn't pull focus from Save changes. ──
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

  // ── Confirm archive popup ─────────────────────────────────────────────────
  confirmCard: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    width: 380,
    maxWidth: "100%",
  },
  confirmText: {
    margin: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral600,
    lineHeight: 1.5,
  },
};
