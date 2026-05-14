import React, { useEffect, useState } from "react";
import { Card } from "../Card";
import { TextInput } from "../Input/TextInput";
import { Select } from "../Input/Select/Select";
import { styles } from "./AdditionalStaffDetailsCard.styles";

// Icons
import { ReactComponent as StethoIcon } from "../../assets/Stethoscope.svg";
import { ReactComponent as RegIcon } from "../../assets/Document Medicine.svg";

// Static department list plus the specialties that belong to each. Picking a
// department in the staff modal narrows the Specialty dropdown to just the
// matching entries.
export const SPECIALTIES_BY_DEPARTMENT: Record<string, string[]> = {
  "Cardiology": ["General Cardiology", "Interventional Cardiology", "Electrophysiology", "Heart Failure", "Pediatric Cardiology", "Preventive Cardiology"],
  "Dermatology": ["General Dermatology", "Cosmetic Dermatology", "Pediatric Dermatology", "Dermatopathology", "Trichology"],
  "ENT": ["General ENT", "Otology", "Rhinology", "Laryngology", "Head and Neck Surgery", "Pediatric ENT"],
  "Gynecology": ["General Gynecology", "Obstetrics", "Reproductive Medicine", "Gynecologic Oncology", "Urogynecology", "Maternal-Fetal Medicine"],
  "Neurology": ["General Neurology", "Stroke", "Epilepsy", "Movement Disorders", "Neuromuscular", "Pediatric Neurology"],
  "Ophthalmology": ["General Ophthalmology", "Cataract & Refractive", "Retina", "Glaucoma", "Pediatric Ophthalmology", "Oculoplasty"],
  "Orthopedics": ["General Orthopedics", "Joint Replacement", "Sports Medicine", "Spine", "Pediatric Orthopedics", "Trauma", "Hand Surgery"],
  "Pediatrics": ["General Pediatrics", "Neonatology", "Pediatric Cardiology", "Pediatric Pulmonology", "Pediatric Endocrinology", "Pediatric Neurology"],
  "Urology": ["General Urology", "Andrology", "Uro-Oncology", "Pediatric Urology", "Endourology", "Reconstructive Urology"],
  "General Medicine": ["Internal Medicine", "Geriatrics", "Infectious Disease", "Critical Care"],
  "General Surgery": ["Laparoscopic Surgery", "Bariatric Surgery", "Colorectal Surgery", "Breast Surgery", "Trauma Surgery"],
  "Psychiatry": ["General Psychiatry", "Child Psychiatry", "Geriatric Psychiatry", "Addiction Psychiatry", "Forensic Psychiatry"],
  "Radiology": ["General Radiology", "Diagnostic Radiology", "Interventional Radiology", "Nuclear Medicine", "Pediatric Radiology"],
  "Oncology": ["General Oncology", "Medical Oncology", "Surgical Oncology", "Radiation Oncology", "Hematology-Oncology", "Pediatric Oncology"],
  "Endocrinology": ["General Endocrinology", "Diabetology", "Thyroid Disorders", "Reproductive Endocrinology", "Pediatric Endocrinology"],
  "Nephrology": ["General Nephrology", "Dialysis", "Transplant Nephrology", "Pediatric Nephrology"],
  "Pulmonology": ["General Pulmonology", "Interventional Pulmonology", "Sleep Medicine", "Critical Care", "Pediatric Pulmonology"],
  "Gastroenterology": ["General Gastroenterology", "Hepatology", "Interventional Endoscopy", "Pediatric Gastroenterology"],
  "Rheumatology": ["General Rheumatology", "Inflammatory Arthritis", "Lupus & Connective Tissue", "Pediatric Rheumatology"],
  "Anesthesiology": ["General Anesthesiology", "Cardiac Anesthesia", "Pediatric Anesthesia", "Pain Management", "Critical Care"],
  "Dentistry": ["General Dentistry", "Orthodontics", "Endodontics", "Periodontics", "Oral Surgery", "Prosthodontics", "Pediatric Dentistry"],
  "Physiotherapy": ["General Physiotherapy", "Orthopedic Physiotherapy", "Neurological Physiotherapy", "Sports Physiotherapy", "Pediatric Physiotherapy"],
  "Dietetics": ["General Dietetics", "Clinical Nutrition", "Sports Nutrition", "Pediatric Nutrition"],
  "Pathology": ["General Pathology", "Histopathology", "Hematopathology", "Cytopathology", "Molecular Pathology"],
  "Emergency Medicine": ["General Emergency Medicine", "Trauma", "Pediatric Emergency", "Critical Care", "Toxicology"],
};

// Doctor-specific fields only. The Role selector now lives at the top of the
// staff modal (see AddStaffModal.tsx) since it determines everything else.
type AdditionalStaffDetailsCardProps = {
  // Drives which fields render: all clinical roles get Department; only
  // Doctor additionally gets Specialty and Reg. No.
  role: string;
  department: string;
  setDepartment: (val: string) => void;
  specialty: string;
  setSpecialty: (val: string) => void;
  registrationNo: string;
  setRegistrationNo: (val: string) => void;
  // Staff can only be assigned to a department the clinic actually offers —
  // the dropdown is scoped to these names (set up in ClinicInfoCard).
  clinicDepartments: string[];
  errors?: Record<string, boolean>;
};

export function AdditionalStaffDetailsCard({
  role,
  department,
  setDepartment,
  specialty,
  setSpecialty,
  registrationNo,
  setRegistrationNo,
  clinicDepartments,
  errors = {},
}: AdditionalStaffDetailsCardProps) {
  const presetSpecs = SPECIALTIES_BY_DEPARTMENT[department] || [];
  // Allow free-text via an "Other" sentinel. When picked, a text input
  // appears and the actual specialty stored is whatever the user types.
  const OTHER = "Other";
  const specOptions = presetSpecs.length > 0 ? [...presetSpecs, OTHER] : [];

  // If the saved specialty isn't in the preset list, treat it as a custom
  // value entered via "Other". Sync this when the department changes.
  const [isOther, setIsOther] = useState(
    !!specialty && !presetSpecs.includes(specialty)
  );
  useEffect(() => {
    setIsOther(!!specialty && !presetSpecs.includes(specialty));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department]);

  const selectValue = isOther ? OTHER : specialty;

  return (
    <Card style={styles.card}>
      {/* Department */}
      <div style={styles.section}>
        <div style={styles.label}>Department</div>
        <div style={styles.fieldRow}>
          <Select
            value={department}
            onChange={(val) => {
              setDepartment(val);
              // Reset specialty when department changes — the previous specialty
              // belongs to a different department's list.
              setSpecialty("");
            }}
            options={clinicDepartments}
            placeholder={clinicDepartments.length === 0 ? "Add departments in clinic info first" : "Choose Department"}
            iconLeft={<StethoIcon />}
            error={errors.department}
          />
        </div>
      </div>

      {/* Specialty — doctors only. Narrowed to the chosen department's list;
          "Other" reveals a free-text input for anything not in the preset list. */}
      {role === "Doctor" && department && specOptions.length > 0 && (
        <div style={styles.section}>
          <div style={styles.label}>Specialty</div>
          <div style={styles.fieldRow}>
            <Select
              value={selectValue}
              onChange={(val) => {
                if (val === OTHER) {
                  setIsOther(true);
                  setSpecialty("");
                } else {
                  setIsOther(false);
                  setSpecialty(val);
                }
              }}
              options={specOptions}
              placeholder="Choose Specialty"
              iconLeft={<StethoIcon />}
            />
          </div>
          {isOther && (
            <div style={{ marginTop: 8 }}>
              <TextInput
                value={specialty}
                onChange={setSpecialty}
                placeholder="Enter specialty"
                iconLeft={<StethoIcon />}
              />
            </div>
          )}
        </div>
      )}

      {/* Registration Number — doctors only. */}
      {role === "Doctor" && (
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
      )}
    </Card>
  );
}
