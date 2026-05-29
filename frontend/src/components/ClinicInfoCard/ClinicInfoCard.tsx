import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Button } from "../Button";
import { Tag } from "../Tag";
import { styles } from "./ClinicInfoCard.styles";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { ReactComponent as BuildingIcon } from "../../assets/Buildings.svg";
import { ReactComponent as PhoneIcon } from "../../assets/Phone.svg";
import { ReactComponent as LocationIcon } from "../../assets/Map Point.svg";
import { Clinic } from "../ClinicTabs";
import { API_BASE_URL } from "../../apiConfig";

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

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export function ClinicInfoCard({ clinic, onUpdate, onShowToast }: ClinicInfoCardProps) {
  const [deptInput, setDeptInput] = useState("");
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const deptWrapRef = useRef<HTMLDivElement>(null);
  const [isSaved, setIsSaved] = useState(isUuid(clinic.id));
  const [showErrors, setShowErrors] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsSaved(isUuid(clinic.id));
    setIsEditing(false);
    setShowErrors(false);
  }, [clinic.id]);

  const { domain, name: clinicName, phone, departments, address } = clinic;

  const [domainAvailability, setDomainAvailability] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const domainCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const locked = isSaved;
    if (!domain || domain.trim().length < 2 || locked) {
      setDomainAvailability("idle");
      return;
    }
    setDomainAvailability("checking");
    if (domainCheckTimer.current) clearTimeout(domainCheckTimer.current);
    domainCheckTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/tenant/domain/check?domain=${encodeURIComponent(domain.trim())}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setDomainAvailability(data.available ? "available" : "taken");
        } else {
          setDomainAvailability("idle");
        }
      } catch {
        setDomainAvailability("idle");
      }
    }, 500);
    return () => {
      if (domainCheckTimer.current) clearTimeout(domainCheckTimer.current);
    };
  }, [domain, isSaved]);

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

  // Most fields lock after save and unlock when the user clicks Edit Details.
  const fieldsLocked = isSaved && !isEditing;
  // Domain (the subdomain/nick-name) is permanent: once saved it's locked
  // forever, even in Edit Details mode. Front-end enforcement only — the
  // back-end still accepts updates but the UI disallows them.
  const domainLocked = isSaved;

  const handleSave = async () => {
    const missing = [];
    if (!clinicName.trim()) missing.push("clinic name");
    if (!phone.trim()) missing.push("phone number");
    else if (!isPhoneValid) missing.push("valid phone number");
    if (!domain.trim()) missing.push("subdomain");
    if (!address.trim()) missing.push("clinic address");

    if (missing.length > 0) {
      setShowErrors(true);
      onShowToast?.(`Please enter ${missing[0]}`);
      return;
    }
    setShowErrors(false);

    try {
      const clinicId = isUuid(clinic.id) ? clinic.id : null;
      const response = await fetch(`${API_BASE_URL}/api/tenant/clinic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
        },
        body: JSON.stringify({
          id: clinicId,
          name: clinicName,
          address,
          phone,
          domain,
          speciality: departments.join(","),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        onShowToast?.(errorData.error || "Failed to save clinic details");
        return;
      }

      const savedClinicData = await response.json();
      onUpdate({ id: savedClinicData.id });
      setIsSaved(true);
      setIsEditing(false);
      onShowToast?.("Clinic details saved successfully!");
    } catch (error) {
      onShowToast?.("An error occurred while saving clinic details");
    }
  };

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
      {/* Top-right control: pencil to edit when viewing a saved clinic;
          a Save button while creating or editing. Replaces the old heading
          and the bottom Edit/Save button to reclaim vertical space. */}
      <div style={styles.cardHeader}>
        {fieldsLocked ? (
          <button
            type="button"
            style={styles.editIconButton}
            onClick={() => setIsEditing(true)}
            title="Edit details"
            aria-label="Edit details"
          >
            <PencilIcon />
          </button>
        ) : (
          <Button size="sm" variant="dark" onClick={handleSave}>
            Save
          </Button>
        )}
      </div>

      {/* Clinic name */}
      <div
        style={{
          ...styles.fieldRow,
          ...(fieldsLocked ? styles.locked : {}),
          ...(showErrors && !clinicName.trim() ? styles.fieldError : {}),
        }}
      >
        <span style={styles.fieldIcon}><BuildingIcon width={20} height={20} /></span>
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
          ...((!isPhoneValid || (showErrors && !phone.trim())) ? styles.fieldError : {}),
        }}
      >
        <span style={styles.fieldIcon}><PhoneIcon width={20} height={20} /></span>
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
          <span style={styles.fieldIcon}><BuildingIcon width={20} height={20} /></span>
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
          ...(showErrors && !address.trim() ? styles.fieldError : {}),
        }}
      >
        <span style={styles.fieldIcon}><LocationIcon width={20} height={20} /></span>
        <textarea
          style={styles.fieldTextArea}
          value={address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          placeholder="Clinic address"
          rows={4}
          disabled={fieldsLocked}
        />
      </div>

      {/* Domain (nick name) — sits at the bottom. Editable only during the
          initial setup; locked permanently once the clinic is saved. */}
      <div style={{ ...styles.domainSection, ...(domainLocked ? styles.locked : {}) }}>
        <label style={styles.domainLabel}>give a nick name to your clinic</label>
        <div
          style={{
            ...styles.domainBox,
            ...(domainAvailability === "taken"
              ? { borderColor: colors.red200 }
              : domainAvailability === "available"
                ? { borderColor: colors.secondary700 }
                : {}),
          }}
        >
          <input
            style={styles.domainInput}
            value={domain}
            onChange={(e) => onUpdate({ domain: e.target.value })}
            placeholder="your-clinic"
            disabled={domainLocked}
          />
          <span
            style={{
              ...styles.domainSuffix,
              ...(domainLocked ? styles.domainSuffixLocked : {}),
            }}
          >
            .docodile.app
          </span>
        </div>
        {!domainLocked && domainAvailability !== "idle" && (
          <div
            style={{
              fontSize: fonts.size.xs,
              fontFamily: fonts.family.primary,
              color:
                domainAvailability === "available"
                  ? colors.secondary700
                  : domainAvailability === "taken"
                    ? colors.red200
                    : colors.neutral700,
              marginTop: 4,
              marginLeft: 4,
            }}
          >
            {domainAvailability === "checking"
              ? "Checking..."
              : domainAvailability === "available"
                ? "Available"
                : "Already taken"}
          </div>
        )}
      </div>

    </div>
  );
}

// Pencil / edit-details icon for the card's top-right control.
const PencilIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

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
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  zIndex: 1000,
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
