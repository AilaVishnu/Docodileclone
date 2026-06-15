import React, { useState } from "react";
import { Card } from "../Card/Card";
import { DatePicker } from "../DatePicker/DatePicker";
import { MeasureField } from "../MeasureField";
import { RadioGroup } from "../Radio";
import { PatientSearchRow } from "../PatientSearchRow/PatientSearchRow";
import { Icon } from "../Icon";
import type { Patient } from "../../hooks/usePatients";
import { colors, fonts, spacing } from "../../styles/theme";
import { styles } from "./PatientDetailsForm.styles";

// ─────────────────────────────────────────────────────────────────────────────
// PatientDetailsForm — the shared patient identity card: name, email, phone,
// DOB (digit-entry + calendar) / age, gender. Presentational + controlled: the
// parent owns the draft (`value`/`onChange`), the raw DOB digits, the patient
// list (for name/phone autocomplete) and the lock/T-number concerns. Lifted
// out of BookAppointment so the same card can serve other patient flows.
// ─────────────────────────────────────────────────────────────────────────────
export type PatientDraft = {
  name: string;
  email: string;
  phone: string;
  dob: string;
  age: string;
  gender: string;
};

type PatientDetailsFormProps = {
  value: PatientDraft;
  onChange: (patch: Partial<PatientDraft>) => void;
  errors?: { name?: boolean; email?: boolean; phone?: boolean; dob?: boolean };
  /** Raw DOB digits (ddmmyyyy) — owned by the parent so prefills survive. */
  dobDigits: string;
  setDobDigits: (digits: string) => void;
  /** Existing patients for name/phone autocomplete (omit to disable). */
  patients?: Patient[];
  onSelectExisting?: (p: Patient) => void;
  /** Lock identity fields (a saved patient is selected). */
  locked?: boolean;
  /** Show the "Clear & enter new patient" link. */
  showClearLink?: boolean;
  onClearLocked?: () => void;
  /** Extra style for the Card (e.g. grid positioning from the parent). */
  style?: React.CSSProperties;
  /** Render flat — no card surface/border/padding — for use inside a modal
      that already supplies its own background and inset. */
  bare?: boolean;
};

const formatDob = (digits: string): string => {
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  if (digits.length <= 2) return dd;
  if (digits.length <= 4) return `${dd}-${mm}`;
  return `${dd}-${mm}-${yyyy}`;
};

export function PatientDetailsForm({
  value,
  onChange,
  errors = {},
  dobDigits,
  setDobDigits,
  patients = [],
  onSelectExisting,
  locked = false,
  showClearLink = false,
  onClearLocked,
  style,
  bare = false,
}: PatientDetailsFormProps) {
  const [showNameSugg, setShowNameSugg] = useState(false);
  const [showPhoneSugg, setShowPhoneSugg] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const hasDob = dobDigits.length > 0;
  const hasManualAge = !hasDob && value.age.replace(/[^0-9]/g, "").length > 0;

  // Age from a full ddmmyyyy; falls back to the current age string if invalid.
  const calcAge = (digits: string): string => {
    if (digits.length !== 8) return value.age;
    const d = Number(digits.slice(0, 2));
    const mIdx = Number(digits.slice(2, 4)) - 1;
    const y = Number(digits.slice(4, 8));
    if (d < 1 || d > 31 || mIdx < 0 || mIdx > 11 || y <= 1900) return value.age;
    const birth = new Date(y, mIdx, d);
    const today = new Date();
    if (birth > today) return value.age;
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    if (months < 0) { years--; months += 12; }
    return `${years} / ${months}`;
  };

  const nameSuggestions = value.name.trim().length >= 1
    ? patients.filter((p) => p.name.toLowerCase().includes(value.name.toLowerCase())).slice(0, 6)
    : [];
  const phoneSuggestions = value.phone.replace(/\D/g, "").length >= 6
    ? patients.filter((p) => (p.phone ?? "").replace(/\D/g, "").includes(value.phone.replace(/\D/g, ""))).slice(0, 6)
    : [];

  const pickExisting = (p: Patient) => {
    onSelectExisting?.(p);
    setShowNameSugg(false);
    setShowPhoneSugg(false);
  };

  const errField = (on: boolean | undefined) =>
    on ? { borderBottomColor: colors.red200, backgroundColor: colors.redAlpha10 } : {};

  return (
    <Card style={{ ...(bare ? styles.cardBare : styles.card), ...style }}>
      {showClearLink && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--book-clearlink-mb, 6px)" }}>
          <button type="button" onClick={onClearLocked} style={styles.clearLink}>
            Clear &amp; enter new patient
          </button>
        </div>
      )}

      {/* Name */}
      <div style={{ position: "relative" }}>
        <div style={{ ...styles.iconField, ...errField(errors.name), ...(locked ? { opacity: 0.65 } : {}) }}>
          <Icon name="user-hands" tone="inherit" style={styles.iconFieldIcon} />
          <input
            style={styles.iconFieldInput}
            placeholder="Name"
            value={value.name}
            onChange={(e) => { onChange({ name: e.target.value }); setShowNameSugg(true); }}
            onFocus={() => setShowNameSugg(true)}
            onBlur={() => setTimeout(() => setShowNameSugg(false), 150)}
            disabled={locked}
          />
        </div>
        {showNameSugg && nameSuggestions.length > 0 && (
          <div style={styles.suggestions}>
            {nameSuggestions.map((p) => (
              <PatientSearchRow key={p.id} patient={p} onSelect={pickExisting} />
            ))}
          </div>
        )}
        {errors.name && <div style={styles.error}>Please enter patient name</div>}
      </div>

      {/* Email + Phone */}
      <div style={styles.row}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...styles.iconField, ...errField(errors.email), ...(locked ? { opacity: 0.65 } : {}) }}>
            <Icon name="mail" tone="inherit" style={styles.iconFieldIcon} />
            <input
              style={styles.iconFieldInput}
              type="text"
              placeholder="hello@example.com"
              value={value.email}
              onChange={(e) => onChange({ email: e.target.value })}
              onBlur={() => onChange({ email: value.email.trim().toLowerCase() })}
              disabled={locked}
            />
          </div>
          {errors.email && <div style={styles.error}>Please enter a valid email</div>}
        </div>
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <div style={{ ...styles.iconField, ...errField(errors.phone), ...(locked ? { opacity: 0.65 } : {}) }}>
            <Icon name="phone" tone="inherit" style={styles.iconFieldIcon} />
            <input
              style={styles.iconFieldInput}
              placeholder="+91 XXXXX XXXXX"
              value={value.phone}
              disabled={locked}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9+ ]/g, "");
                let digits = val.replace(/\D/g, "");
                if (digits.startsWith("91") && digits.length > 10) digits = digits.substring(2);
                if (digits.length > 10) return;
                onChange({ phone: val });
                setShowPhoneSugg(true);
              }}
              onFocus={() => setShowPhoneSugg(true)}
              onBlur={() => {
                setTimeout(() => setShowPhoneSugg(false), 150);
                let clean = value.phone.replace(/\D/g, "");
                if (clean.startsWith("91") && clean.length > 10) clean = clean.substring(2);
                clean = clean.substring(0, 10);
                if (clean.length === 0) { onChange({ phone: "" }); return; }
                if (clean.length > 5) onChange({ phone: `+91 ${clean.substring(0, 5)} ${clean.substring(5)}` });
                else onChange({ phone: `+91 ${clean}` });
              }}
            />
          </div>
          {showPhoneSugg && phoneSuggestions.length > 0 && (
            <div style={styles.suggestions}>
              {phoneSuggestions.map((p) => (
                <PatientSearchRow key={p.id} patient={p} onSelect={pickExisting} />
              ))}
            </div>
          )}
          {errors.phone && <div style={styles.error}>Please enter a valid phone number</div>}
        </div>
      </div>

      {/* DOB + Age */}
      <div style={styles.row}>
        <div style={{ ...styles.iconField, position: "relative", flex: 1, minWidth: 0, ...errField(errors.dob), ...(locked ? { opacity: 0.65, pointerEvents: "none" } : {}) }}>
          <span
            onClick={() => {
              if (locked) return;
              if (hasManualAge) { setDobDigits(""); onChange({ age: "", dob: "" }); }
              setShowDobPicker(true);
            }}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: spacing.xs, opacity: locked ? 1 : hasManualAge ? 0.4 : 1 }}
          >
            <Icon name="calendar" tone="inherit" style={styles.iconFieldIcon} />
            <span style={styles.inlineLabel}>DOB</span>
          </span>
          <input
            style={{ ...styles.iconFieldInput, opacity: locked ? 1 : hasManualAge ? 0.4 : 1 }}
            type="text"
            placeholder="dd-mm-yyyy"
            disabled={locked}
            onFocus={() => { if (hasManualAge) { setDobDigits(""); onChange({ age: "", dob: "" }); } }}
            value={formatDob(dobDigits)}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                e.preventDefault();
                const next = dobDigits.slice(0, -1);
                setDobDigits(next);
                onChange({ dob: formatDob(next), age: next.length === 8 ? calcAge(next) : "" });
              } else if (/^[0-9]$/.test(e.key) && dobDigits.length < 8) {
                e.preventDefault();
                const next = dobDigits + e.key;
                setDobDigits(next);
                onChange({ dob: formatDob(next), age: calcAge(next) });
              }
            }}
            onChange={() => { }}
          />
          {showDobPicker && (
            <DatePicker
              selectedDate={new Date()}
              onSelect={(date: Date) => {
                const dd = String(date.getDate()).padStart(2, "0");
                const mm = String(date.getMonth() + 1).padStart(2, "0");
                const yyyy = String(date.getFullYear());
                const digits = dd + mm + yyyy;
                setDobDigits(digits);
                onChange({ dob: formatDob(digits), age: calcAge(digits) });
                setShowDobPicker(false);
              }}
              onClose={() => setShowDobPicker(false)}
            />
          )}
        </div>
        <div style={styles.inlineLabel}>or</div>
        <div
          style={{
            flex: 1.4,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: spacing.xs,
            opacity: locked ? 0.65 : hasDob ? 0.4 : 1,
            ...(locked ? { pointerEvents: "none" as const } : {}),
          }}
        >
          <span style={styles.inlineLabel}>Age</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MeasureField
              value={value.age.split("/")[0]?.trim() || ""}
              onChange={(y) => {
                const m = value.age.split("/")[1]?.trim() || "";
                setDobDigits("");
                onChange({ age: (y || m) ? `${y || "0"} / ${m || "0"}` : "", dob: "" });
              }}
              onFocus={() => { if (hasDob) { setDobDigits(""); onChange({ age: "", dob: "" }); } }}
              unit="yrs"
              unitWidth={38}
              unitColor={colors.neutral600}
              inputMode="numeric"
              invalid={!!errors.dob}
              ariaLabel="Age in years"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MeasureField
              value={value.age.split("/")[1]?.trim() || ""}
              onChange={(m) => {
                const n = parseInt(m, 10);
                if (m !== "" && (isNaN(n) || n < 0 || n > 11)) return;
                const y = value.age.split("/")[0]?.trim() || "";
                setDobDigits("");
                onChange({ age: (y || m) ? `${y || "0"} / ${m || "0"}` : "", dob: "" });
              }}
              onFocus={() => { if (hasDob) { setDobDigits(""); onChange({ age: "", dob: "" }); } }}
              unit="mos"
              unitWidth={38}
              unitColor={colors.neutral600}
              inputMode="numeric"
              invalid={!!errors.dob}
              ariaLabel="Age in months"
            />
          </div>
        </div>
      </div>
      {errors.dob && <div style={styles.error}>Please enter date of birth or age</div>}

      {/* Gender */}
      <div style={{ marginTop: "8px" }}>
        <RadioGroup
          name="gender"
          value={value.gender}
          onChange={(g) => onChange({ gender: g })}
          disabled={locked}
          options={["Male", "Female", "Other"]}
        />
      </div>
    </Card>
  );
}
