import React, { useEffect, useState } from "react";
import { Card } from "../Card";
import { Field } from "../Field";
import { Select } from "../Input/Select/Select";
import { styles } from "./AdditionalStaffDetailsCard.styles";

// Icons
import { ReactComponent as StethoIcon } from "../../assets/Stethoscope.svg";
import { ReactComponent as BuildingIcon } from "../../assets/Buildings.svg";
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

// Bodies a doctor can be registered with. NMC is the national regulator
// (took over from MCI); the rest are state councils. "Other" reveals a
// free-text input for anything outside this list.
const MEDICAL_COUNCILS = [
  "National Medical Commission (NMC)",
  "Andhra Pradesh Medical Council",
  "Telangana State Medical Council",
  "Karnataka Medical Council",
  "Tamil Nadu Medical Council",
  "Kerala Medical Council",
  "Maharashtra Medical Council",
  "Gujarat Medical Council",
  "Delhi Medical Council",
  "Punjab Medical Council",
  "Haryana Medical Council",
  "Rajasthan Medical Council",
  "Madhya Pradesh Medical Council",
  "Uttar Pradesh Medical Council",
  "Bihar Medical Council",
  "West Bengal Medical Council",
  "Odisha Council of Medical Registration",
  "Assam Medical Council",
  "Chhattisgarh Medical Council",
  "Jharkhand Medical Council",
  "Uttarakhand Medical Council",
  "Himachal Pradesh Medical Council",
  "Jammu & Kashmir Medical Council",
  "Goa Medical Council",
  "Tripura State Medical Council",
];

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
  qualification: string;
  setQualification: (val: string) => void;
  medicalCouncil: string;
  setMedicalCouncil: (val: string) => void;
  // Years of experience. Empty string while unset; integer >= 0 otherwise.
  experienceYears: string;
  setExperienceYears: (val: string) => void;
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
  qualification,
  setQualification,
  medicalCouncil,
  setMedicalCouncil,
  experienceYears,
  setExperienceYears,
  clinicDepartments,
  errors = {},
}: AdditionalStaffDetailsCardProps) {
  const presetSpecs = SPECIALTIES_BY_DEPARTMENT[department] || [];
  // Allow free-text via an "Other" sentinel. When picked, a text input
  // appears and the actual specialty stored is whatever the user types.
  const OTHER = "Other";
  const specOptions = presetSpecs.length > 0 ? [...presetSpecs, OTHER] : [];

  // Council list with Other fallback, mirroring specialty's pattern.
  const councilOptions = [...MEDICAL_COUNCILS, OTHER];
  const [isCouncilOther, setIsCouncilOther] = useState(
    !!medicalCouncil && !MEDICAL_COUNCILS.includes(medicalCouncil)
  );
  const councilSelectValue = isCouncilOther ? OTHER : medicalCouncil;

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
      {/* Department + Specialty row. Doctors get both columns; other clinical
          roles (Nurse) get Department alone — rendered full-width below. */}
      {role === "Doctor" ? (
        <div style={{ ...styles.section, flexDirection: "row", gap: 12 }}>
          <div style={{ ...styles.section, flex: 1, minWidth: 0 }}>
            <div style={styles.label}>Department</div>
            <div style={styles.fieldRow}>
              <Select
                value={department}
                onChange={(val) => {
                  setDepartment(val);
                  setSpecialty("");
                }}
                options={clinicDepartments}
                placeholder={clinicDepartments.length === 0 ? "Add departments in clinic info first" : "Choose Department"}
                iconLeft={<BuildingIcon />}
                error={errors.department}
              />
            </div>
          </div>
          <div style={{ ...styles.section, flex: 1, minWidth: 0 }}>
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
                placeholder={!department ? "Choose department first" : "Choose Specialty"}
                iconLeft={<StethoIcon />}
              />
            </div>
            {isOther && (
              <div style={{ marginTop: 8 }}>
                <Field
                  variant="underline"
                  value={specialty}
                  onChange={setSpecialty}
                  placeholder="Enter specialty"
                  iconLeft={<StethoIcon />}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={styles.section}>
          <div style={styles.label}>Department</div>
          <div style={styles.fieldRow}>
            <Select
              value={department}
              onChange={setDepartment}
              options={clinicDepartments}
              placeholder={clinicDepartments.length === 0 ? "Add departments in clinic info first" : "Choose Department"}
              iconLeft={<BuildingIcon />}
              error={errors.department}
            />
          </div>
        </div>
      )}

      {/* Qualification + Experience side-by-side, doctor-only. Background
          row — what they studied and how long they've practiced. */}
      {role === "Doctor" && (
        <div style={{ ...styles.section, flexDirection: "row", gap: 12 }}>
          <div style={{ ...styles.section, flex: 1, minWidth: 0 }}>
            <div style={styles.label}>Qualification</div>
            <Field
              variant="underline"
              value={qualification}
              onChange={setQualification}
              placeholder="MBBS, MD (Dermatology)"
              iconLeft={<RegIcon />}
            />
          </div>
          <div style={{ ...styles.section, flex: 1, minWidth: 0 }}>
            <div style={styles.label}>Experience (years)</div>
            <Field
              variant="underline"
              value={experienceYears}
              onChange={(val) => setExperienceYears(val.replace(/\D/g, "").slice(0, 2))}
              placeholder="10"
              iconLeft={<RegIcon />}
            />
          </div>
        </div>
      )}

      {/* Medical Council + Reg. No. side-by-side, doctor-only. Naturally
          paired — Reg. No. is the number issued by that council. Council
          takes the wider column since its names are long. */}
      {role === "Doctor" && (
        <div style={{ ...styles.section, flexDirection: "row", gap: 12 }}>
          <div style={{ ...styles.section, flex: 2, minWidth: 0 }}>
            <div style={styles.label}>Medical Council</div>
            <div style={styles.fieldRow}>
              <Select
                value={councilSelectValue}
                onChange={(val) => {
                  if (val === OTHER) {
                    setIsCouncilOther(true);
                    setMedicalCouncil("");
                  } else {
                    setIsCouncilOther(false);
                    setMedicalCouncil(val);
                  }
                }}
                options={councilOptions}
                placeholder="Choose Council"
                iconLeft={<RegIcon />}
              />
            </div>
            {isCouncilOther && (
              <div style={{ marginTop: 8 }}>
                <Field
                  variant="underline"
                  value={medicalCouncil}
                  onChange={setMedicalCouncil}
                  placeholder="Enter council name"
                  iconLeft={<RegIcon />}
                />
              </div>
            )}
          </div>
          <div style={{ ...styles.section, flex: 1, minWidth: 0 }}>
            <div style={styles.label}>Reg. No.</div>
            <Field
              variant="underline"
              value={registrationNo}
              onChange={setRegistrationNo}
              placeholder="ABCDEF"
              iconLeft={<RegIcon />}
              error={errors.registrationNo}
              errorMessage="Please enter registration number"
            />
            <div style={styles.hint}>
              Issued by the selected council
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
