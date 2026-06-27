import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Tag } from "../Tag";
import { styles } from "./ClinicInfoCard.styles";
import { colors, fonts, radii, spacing, strokes, shadows, zIndex } from "../../styles/theme";
import { Icon } from "../Icon";
import { Clinic } from "../ClinicTabs";

const DEPARTMENTS = [
  "Cardiology", "Dermatology", "ENT", "Gynecology", "Neurology",
  "Ophthalmology", "Orthopedics", "Pediatrics", "Urology",
  "General Medicine", "General Surgery", "Psychiatry", "Radiology",
  "Oncology", "Endocrinology", "Nephrology", "Pulmonology",
  "Gastroenterology", "Rheumatology", "Anesthesiology", "Dentistry",
  "Physiotherapy", "Dietetics", "Pathology", "Emergency Medicine",
];

type ClinicInfoCardProps = {
  clinic: Clinic;
  onUpdate: (updates: Partial<Clinic>) => void;
  onShowToast?: (message: string) => void;
};

export function ClinicInfoCard({ clinic, onUpdate }: ClinicInfoCardProps) {
  const [deptInput, setDeptInput] = useState("");
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const deptWrapRef = useRef<HTMLDivElement>(null);

  const { name: clinicName, phone, departments, address } = clinic;

  const deptExists = (name: string) =>
    departments.some((d) => d.toLowerCase() === name.toLowerCase());

  const addDept = (name?: string) => {
    const trimmed = (name ?? deptInput).trim();
    if (trimmed && !deptExists(trimmed)) {
      onUpdate({ departments: [...departments, trimmed] });
    }
    setDeptInput("");
  };

  const removeDept = (index: number) => {
    onUpdate({ departments: departments.filter((_, i) => i !== index) });
  };

  useEffect(() => {
    if (!deptDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (deptWrapRef.current && !deptWrapRef.current.contains(e.target as Node)) {
        setDeptDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [deptDropdownOpen]);

  const filteredDepts = (() => {
    const unselected = DEPARTMENTS.filter((d) => !deptExists(d));
    if (!deptInput.trim()) return unselected.slice(0, 6);
    return unselected.filter((d) => d.toLowerCase().includes(deptInput.toLowerCase()));
  })();

  const validatePhone = (p: string) => {
    if (!p) return true;
    const regex = /^(\+91)?[6-9]\d{9}$/;
    return regex.test(p.replace(/\s/g, ""));
  };

  const isPhoneValid = validatePhone(phone);

  // The form is ALWAYS editable — no view/lock mode, no Save button. Edits
  // live in state via onUpdate; persistence happens at the page level via
  // "Next" (which validates and POSTs every clinic). Kept as a const so the
  // existing field rows stay simple.
  const fieldsLocked = false;

  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, "");
    if (digits.startsWith("91") && val.startsWith("+")) {
      digits = digits.substring(2);
    }
    digits = digits.substring(0, 10);
    if (digits.length === 0) onUpdate({ phone: "" });
    else onUpdate({ phone: "+91 " + digits });
  };

  const handlePhoneBlur = () => {
    let clean = phone.replace(/\D/g, "");
    if (clean.length === 0) return;
    if (clean.startsWith("91")) clean = clean.substring(2);
    clean = clean.substring(0, 10);
    if (clean.length > 5) {
      onUpdate({ phone: `+91 ${clean.substring(0, 5)} ${clean.substring(5)}` });
    } else if (clean.length > 0) {
      onUpdate({ phone: `+91 ${clean}` });
    }
  };

  return (
    <div style={styles.card}>
      {/* Clinic name */}
      <div
        style={{
          ...styles.fieldRow,
          ...(fieldsLocked ? styles.locked : {}),
        }}
      >
        <span style={styles.fieldIcon}><Icon name="buildings" size={20} tone="inherit" /></span>
        <input
          style={styles.fieldInput}
          value={clinicName}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Clinic Name"
          maxLength={32}
          disabled={fieldsLocked}
        />
      </div>

      {/* Phone */}
      <div
        style={{
          ...styles.fieldRow,
          ...(fieldsLocked ? styles.locked : {}),
          ...(!isPhoneValid ? styles.fieldError : {}),
        }}
      >
        <span style={styles.fieldIcon}><Icon name="phone" size={20} tone="inherit" /></span>
        <input
          style={styles.fieldInput}
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          onBlur={handlePhoneBlur}
          placeholder="+91 XXXXX XXXXX"
          disabled={fieldsLocked}
        />
      </div>

      {/* Departments — icon + tag list + autocomplete dropdown */}
      <div ref={deptWrapRef} style={{ position: "relative" }}>
        <div style={{ ...styles.specialtyRow, ...(fieldsLocked ? styles.locked : {}) }}>
          <span style={styles.fieldIcon}><Icon name="buildings" size={20} tone="inherit" /></span>
          <div style={styles.tagRow}>
            {departments.map((s, i) => (
              <Tag
                key={i}
                variant="filled"
                label={s}
                onRemove={() => removeDept(i)}
                removeLabel={`Remove ${s}`}
              />
            ))}
            <input
              style={styles.specialtyAddInput}
              value={deptInput}
              onChange={(e) => { setDeptInput(e.target.value); setDeptDropdownOpen(true); }}
              onFocus={() => setDeptDropdownOpen(true)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addDept(); setDeptDropdownOpen(false); }
              }}
              placeholder={departments.length === 0 ? "Add department" : ""}
              disabled={fieldsLocked}
            />
          </div>
        </div>
        {deptDropdownOpen && !fieldsLocked && deptInput.trim().length > 0 && filteredDepts.length > 0 && (
          <div style={deptMenuStyle}>
            {filteredDepts.map((d) => (
              <button
                key={d}
                type="button"
                style={deptItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.active.shade100)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addDept(d);
                  setDeptDropdownOpen(false);
                }}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Address (multiline) */}
      <div
        style={{
          ...styles.fieldRowMultiline,
          ...(fieldsLocked ? styles.locked : {}),
        }}
      >
        <span style={styles.fieldIcon}><Icon name="map-point" size={20} tone="inherit" /></span>
        <textarea
          style={styles.fieldTextArea}
          value={address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          placeholder="Clinic address"
          rows={4}
          disabled={fieldsLocked}
        />
      </div>

      {/* Subdomain — fixed at provisioning, shown read-only */}
      <div style={styles.domainSection}>
        <label style={styles.domainLabel}>your clinic address</label>
        <div style={{ ...styles.domainBox, ...styles.locked }}>
          <span style={styles.domainInput}>{window.location.hostname}</span>
        </div>
      </div>

    </div>
  );
}

const deptMenuStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  right: 0,
  minWidth: 200,
  backgroundColor: colors.neutral100,
  border: `${strokes.xs} solid ${colors.primary300}`,
  borderRadius: radii.m,
  padding: spacing["2xs"],
  display: "flex",
  flexDirection: "column",
  boxShadow: shadows.menu,
  zIndex: zIndex.popover,
  maxHeight: "min(50vh, 480px)",
  overflowY: "auto",
};

const deptItemStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: `${spacing.xs} ${spacing.s}`,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontFamily: fonts.family.primary,
  fontSize: fonts.size.s,
  lineHeight: fonts.lineHeight.s,
  color: colors.neutral900,
  borderRadius: radii.xs,
};
