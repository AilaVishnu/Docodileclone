import React, { useState } from "react";
import { Card } from "../Card";
import { TextInput } from "../Input/TextInput";
import { styles } from "./AdditionalStaffDetailsCard.styles";

// Icons
import { ReactComponent as RoleIcon } from "../../assets/Mask Happly.svg";
import { ReactComponent as StethoIcon } from "../../assets/Stethoscope.svg";
import { ReactComponent as RegIcon } from "../../assets/Document Medicine.svg";

const ROLES = [
  "Front Desk",
  "Doctor",
  "Nurse",
  "Pharmacy",
  "Other",
];

const SPECIALITIES = [
  "Dermatology",
  "Ophthalmology",
  "Dentistry",
  "General Medicine",
  "Pediatrics",
];

export function AdditionalStaffDetailsCard() {
  const [role, setRole] = useState<string>("Doctor");
  const [speciality, setSpeciality] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");

  return (
    <Card style={styles.card}>
      {/* Role selection */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <RoleIcon />
          <span>Role (select one)</span>
        </div>

        <div style={styles.radioGroup}>
          {ROLES.map((r) => (
            <label key={r} style={styles.radioLabel}>
              <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                style={styles.radioInput}
              />
              {r}
            </label>
          ))}
        </div>
      </div>

      {/* Speciality */}
      <div style={styles.section}>
        <div style={styles.label}>Speciality</div>

        <div style={styles.fieldRow}>
            <StethoIcon />

            <select
            value={speciality}
            onChange={(e) => setSpeciality(e.target.value)}
            style={styles.select}
            >
            <option value="" disabled>
                Choose Speciality
            </option>
            {SPECIALITIES.map((s) => (
                <option key={s} value={s}>
                {s}
                </option>
            ))}
            </select>
        </div>
      </div>


      {/* Registration Number */}
      <div style={styles.section}>
        <div style={styles.label}>Reg. No.</div>

        <TextInput
            value={registrationNo}
            onChange={setRegistrationNo}
            placeholder="ABCDEF"
            iconLeft={<RegIcon />}
        />

        <div style={styles.hint}>
            Enter registration number issued by authority
        </div>
        </div>

    </Card>
  );
}
