import React from "react";
import { Card } from "../Card";
import { TextInput } from "../Input/TextInput";
import { Select } from "../Input/Select/Select";
import { styles } from "./AdditionalStaffDetailsCard.styles";

// Icons
import { ReactComponent as StethoIcon } from "../../assets/Stethoscope.svg";
import { ReactComponent as RegIcon } from "../../assets/Document Medicine.svg";

const SPECIALITIES = [
  "Dermatology",
  "Cardiology",
  "Orthopedics", "Gynecology", "Neurology", "Pediatrics", "Ophthalmology", "ENT", "Urology"
];

// Doctor-specific fields only. The Role selector now lives at the top of the
// staff modal (see AddStaffModal.tsx) since it determines everything else.
type AdditionalStaffDetailsCardProps = {
  speciality: string;
  setSpeciality: (val: string) => void;
  registrationNo: string;
  setRegistrationNo: (val: string) => void;
  errors?: Record<string, boolean>;
};

export function AdditionalStaffDetailsCard({
  speciality,
  setSpeciality,
  registrationNo,
  setRegistrationNo,
  errors = {},
}: AdditionalStaffDetailsCardProps) {
  return (
    <Card style={styles.card}>
      {/* Speciality */}
      <div style={styles.section}>
        <div style={styles.label}>Speciality</div>
        <div style={styles.fieldRow}>
          <Select
            value={speciality}
            onChange={setSpeciality}
            options={SPECIALITIES}
            placeholder="Choose Speciality"
            iconLeft={<StethoIcon />}
            error={errors.speciality}
          />
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
          error={errors.registrationNo}
          errorMessage="Please enter registration number"
        />
        <div style={styles.hint}>
          Enter registration number issued by authority
        </div>
      </div>
    </Card>
  );
}
