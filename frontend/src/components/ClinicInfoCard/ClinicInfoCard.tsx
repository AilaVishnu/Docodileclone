import React, { useState, useEffect, KeyboardEvent } from "react";
import { Button } from "../Button";
import { styles } from "./ClinicInfoCard.styles";
import { ReactComponent as BuildingIcon } from "../../assets/Buildings.svg";
import { ReactComponent as PhoneIcon } from "../../assets/Phone.svg";
import { ReactComponent as SpecialtyIcon } from "../../assets/Stethoscope.svg";
import { ReactComponent as LocationIcon } from "../../assets/Map Point.svg";
import { Clinic } from "../ClinicTabs";
import { API_BASE_URL } from "../../apiConfig";

type ClinicInfoCardProps = {
  clinic: Clinic;
  onUpdate: (updates: Partial<Clinic>) => void;
  onShowToast?: (message: string) => void;
};

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export function ClinicInfoCard({ clinic, onUpdate, onShowToast }: ClinicInfoCardProps) {
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [isSaved, setIsSaved] = useState(isUuid(clinic.id));
  const [showErrors, setShowErrors] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsSaved(isUuid(clinic.id));
    setIsEditing(false);
    setShowErrors(false);
  }, [clinic.id]);

  const { domain, name: clinicName, phone, specialties, address } = clinic;

  const addSpecialty = () => {
    const trimmed = specialtyInput.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      onUpdate({ specialties: [...specialties, trimmed] });
    }
    setSpecialtyInput("");
  };

  const handleSpecialtyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSpecialty();
    }
  };

  const removeSpecialty = (index: number) => {
    onUpdate({ specialties: specialties.filter((_: string, i: number) => i !== index) });
  };

  const displayName = clinicName || domain || "Your Clinic";

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
          speciality: specialties.join(","),
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
      <h3 style={styles.clinicName} title={displayName}>{displayName}</h3>

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

      {/* Specialties — icon + tag list + inline add input */}
      <div style={{ ...styles.specialtyRow, ...(fieldsLocked ? styles.locked : {}) }}>
        <span style={styles.fieldIcon}><SpecialtyIcon width={20} height={20} /></span>
        <div style={styles.tagRow}>
          {specialties.map((s: string, i: number) => (
            <span key={i} style={styles.tag}>
              {s}
              <button
                style={styles.tagRemove}
                onClick={() => removeSpecialty(i)}
                aria-label={`Remove ${s}`}
                type="button"
              >
                ✕
              </button>
            </span>
          ))}
          <input
            style={styles.specialtyAddInput}
            value={specialtyInput}
            onChange={(e) => setSpecialtyInput(e.target.value)}
            onKeyDown={handleSpecialtyKeyDown}
            onBlur={addSpecialty}
            placeholder={specialties.length === 0 ? "Add specialty" : ""}
            disabled={fieldsLocked}
          />
        </div>
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
        <div style={styles.domainBox}>
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
      </div>

      {/* Save / Edit toggle */}
      <div style={styles.buttonWrapper}>
        {isSaved && !isEditing ? (
          <Button size="md" variant="light" onClick={() => setIsEditing(true)} style={{ minWidth: 180 }}>
            Edit Details
          </Button>
        ) : (
          <Button size="md" variant="dark" onClick={handleSave} style={{ minWidth: 180 }}>
            Save
          </Button>
        )}
      </div>
    </div>
  );
}
