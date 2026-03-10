import React, { useState, KeyboardEvent } from "react";
import { Card } from "../Card";
import { TextInput } from "../Input/TextInput";
import { DomainInput } from "../Input/DomainInput";
import { Button } from "../Button";
import { styles } from "./ClinicInfoCard.styles";
import { ReactComponent as BuildingIcon } from "../../assets/Buildings.svg";
import { ReactComponent as PhoneIcon } from "../../assets/Phone.svg";
import { ReactComponent as SpecialtyIcon } from "../../assets/Clock Circle.svg";
import { ReactComponent as LocationIcon } from "../../assets/Map Point.svg";
import { Clinic } from "../ClinicTabs";

type ClinicInfoCardProps = {
  clinic: Clinic;
  onUpdate: (updates: Partial<Clinic>) => void;
};

export function ClinicInfoCard({ clinic, onUpdate }: ClinicInfoCardProps) {
  const [specialtyInput, setSpecialtyInput] = useState("");

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

  return (
    <Card style={styles.outerCard}>
      {/* Clinic display name heading */}
      <h3 style={styles.cardTitle}>{displayName}</h3>

      {/* Domain input */}
      <DomainInput value={domain} onChange={(val) => onUpdate({ domain: val })} />

      {/* Inner form card */}
      <Card style={styles.innerCard}>
        <TextInput
          value={clinicName}
          onChange={(val) => onUpdate({ name: val })}
          placeholder="Clinic Name"
          iconLeft={<BuildingIcon />}
        />

        <TextInput
          value={phone}
          onChange={(val) => onUpdate({ phone: val })}
          placeholder="+91 XXXXX XXXXX"
          iconLeft={<PhoneIcon />}
        />

        {/* Specialty tag input */}
        <div style={styles.specialtySection}>
          <div style={styles.rowWithAction}>
            <div style={styles.specialtyInputWrapper}>
              <span style={styles.specialtyIcon}><SpecialtyIcon /></span>
              <div style={styles.tagRow}>
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
                <input
                  style={styles.tagInput}
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyDown={handleSpecialtyKeyDown}
                  onBlur={addSpecialty}
                  placeholder={specialties.length === 0 ? "Add specialty" : ""}
                />
              </div>
            </div>
          </div>
        </div>

        <TextInput
          value={address}
          onChange={(val) => onUpdate({ address: val })}
          placeholder="Clinic address"
          iconLeft={<LocationIcon />}
        />
      </Card>

      {/* Save button */}
      <div style={styles.saveButton}>
        <Button size="md" variant="dark">
          Save
        </Button>
      </div>
    </Card>
  );
}
