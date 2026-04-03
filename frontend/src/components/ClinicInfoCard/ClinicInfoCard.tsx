import React, { useState, useEffect, KeyboardEvent } from "react";
import { Card } from "../Card";
import { TextInput } from "../Input/TextInput";
import { DomainInput } from "../Input/DomainInput";
import { Select } from "../Input/Select/Select";
import { Button } from "../Button";
import { styles } from "./ClinicInfoCard.styles";
import { colors } from "../../styles/theme";
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

export function ClinicInfoCard({ clinic, onUpdate, onShowToast }: ClinicInfoCardProps) {
  const [specialtyInput, setSpecialtyInput] = useState("");
  const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
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
      // Basic UUID validation for existing clinics
      const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
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

  return (
    <Card style={styles.outerCard}>
      {/* Clinic display name heading */}
      <h3 style={styles.cardTitle} title={displayName}>{displayName}</h3>

      {/* Domain input - locked after save */}
      <div style={isSaved ? { pointerEvents: "none" as const, opacity: 0.6 } : {}}>
        <DomainInput
          value={domain}
          onChange={(val) => onUpdate({ domain: val })}
          disabled={isSaved || (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clinic.id) && !!domain)}
        />
      </div>

      <Card style={styles.innerCard}>
        {/* Clinic name - locked after save */}
        <div style={isSaved ? { pointerEvents: "none" as const, opacity: 0.6 } : {}}>
          <TextInput
            value={clinicName}
            onChange={(val) => onUpdate({ name: val })}
            placeholder="Clinic Name"
            maxLength={32}
            iconLeft={<BuildingIcon />}
            error={showErrors && !clinicName.trim()}
          />
        </div>

        {/* Phone - always editable when editing */}
        <div style={isSaved && !isEditing ? { pointerEvents: "none" as const, opacity: 0.6 } : {}}>
          <TextInput
            value={phone}
            onChange={(val) => {
              let digits = val.replace(/\D/g, "");
              if (digits.startsWith("91") && val.startsWith("+")) {
                digits = digits.substring(2);
              }
              digits = digits.substring(0, 10);
              if (digits.length === 0) onUpdate({ phone: "" });
              else onUpdate({ phone: "+91 " + digits });
            }}
            onBlur={() => {
              let clean = phone.replace(/\D/g, "");
              if (clean.length === 0) return;
              if (clean.startsWith("91")) clean = clean.substring(2);
              clean = clean.substring(0, 10);
              if (clean.length > 5) {
                onUpdate({ phone: `+91 ${clean.substring(0, 5)} ${clean.substring(5)}` });
              } else if (clean.length > 0) {
                onUpdate({ phone: `+91 ${clean}` });
              }
            }}
            placeholder="+91 XXXXX XXXXX"
            iconLeft={<PhoneIcon />}
            error={!isPhoneValid || (showErrors && !phone.trim())}
          />
        </div>

        {/* Specialty - always editable when editing */}
        <div style={isSaved && !isEditing ? { pointerEvents: "none" as const, opacity: 0.6 } : {}}>
          <div style={{ ...styles.specialtySection, borderBottom: `1px solid ${colors.neutral300}`, paddingBottom: 8 }}>
            <Select
              options={["Dermatology", "Cardiology", "Orthopedics", "Gynecology", "Neurology", "Pediatrics", "Ophthalmology", "ENT", "Urology"]}
              value=""
              onChange={(val: string) => {
                if (val && !specialties.includes(val)) {
                  onUpdate({ specialties: [...specialties, val] });
                }
              }}
              placeholder="Add specialty"
              iconLeft={<SpecialtyIcon />}
            />
            <div style={{ ...styles.tagRow, marginTop: 8, minHeight: 32 }}>
              {specialties.map((s: string, i: number) => (
                <span key={i} style={styles.tag}>
                  {s}
                  <button
                    style={styles.tagRemove}
                    onClick={() => removeSpecialty(i)}
                    aria-label={`Remove ${s}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Address - locked after save */}
        <div style={isSaved ? { pointerEvents: "none" as const, opacity: 0.6 } : {}}>
          <TextInput
            value={address}
            onChange={(val) => onUpdate({ address: val })}
            placeholder="Clinic address"
            iconLeft={<LocationIcon />}
            multiline
            error={showErrors && !address.trim()}
          />
        </div>
      </Card>

      {/* Save / Edit Details button */}
      <div style={styles.saveButton}>
        {isSaved && !isEditing ? (
          <Button size="md" variant="light" onClick={() => setIsEditing(true)}>
            Edit Details
          </Button>
        ) : (
          <Button size="md" variant="dark" onClick={handleSave}>
            Save
          </Button>
        )}
      </div>
    </Card>
  );
}
