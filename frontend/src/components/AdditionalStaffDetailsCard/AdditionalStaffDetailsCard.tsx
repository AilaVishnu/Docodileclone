import React from "react";
import { Card } from "../Card";
import { TextInput } from "../Input/TextInput";
import { Select } from "../Input/Select/Select";
import { styles } from "./AdditionalStaffDetailsCard.styles";

// Icons
import { ReactComponent as StethoIcon } from "../../assets/Stethoscope.svg";
import { ReactComponent as RegIcon } from "../../assets/Document Medicine.svg";

const DEPARTMENTS = [
  "Cardiology", "Dermatology", "ENT", "Gynecology", "Neurology",
  "Ophthalmology", "Orthopedics", "Pediatrics", "Urology",
  "General Medicine", "General Surgery", "Psychiatry", "Radiology",
  "Oncology", "Endocrinology", "Nephrology", "Pulmonology",
  "Gastroenterology", "Rheumatology", "Anesthesiology", "Dentistry",
  "Physiotherapy", "Dietetics", "Pathology", "Emergency Medicine",
];

// Doctor-specific fields only. The Role selector now lives at the top of the
// staff modal (see AddStaffModal.tsx) since it determines everything else.
type AdditionalStaffDetailsCardProps = {
  department: string;
  setDepartment: (val: string) => void;
  registrationNo: string;
  setRegistrationNo: (val: string) => void;
  errors?: Record<string, boolean>;
};

export function AdditionalStaffDetailsCard({
  department,
  setDepartment,
  registrationNo,
  setRegistrationNo,
  errors = {},
}: AdditionalStaffDetailsCardProps) {
  return (
    <Card style={styles.card}>
      {/* Department */}
      <div style={styles.section}>
        <div style={styles.label}>Department</div>
        <div style={styles.fieldRow}>
          <Select
            value={department}
            onChange={setDepartment}
            options={DEPARTMENTS}
            placeholder="Choose Department"
            iconLeft={<StethoIcon />}
            error={errors.department}
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
