import React, { useState, useEffect } from "react";
import { colors } from "../../styles/theme";
import { Modal } from "../Modal";
import { Card } from "../Card";
import { StaffDetailsCard } from "../StaffDetailsCard";
import { Button } from "../Button";
import { Field } from "../Field";
import { RadioGroup } from "../Radio";
import { ModalHeader } from "../ModalHeader";
import { styles } from "./AddStaffModal.styles";
import { ConfirmDialog } from "../ConfirmDialog";
import { AdditionalStaffDetailsCard } from "../AdditionalStaffDetailsCard";
import { styles as roleStyles } from "../AdditionalStaffDetailsCard/AdditionalStaffDetailsCard.styles";
import { StaffIllustration } from "./StaffIllustration";
import { Icon } from "../Icon";

// Standard role options that appear as radios. "Other" is a separate entry
// that reveals a free-text input for custom roles.
const STANDARD_ROLES = ["Front Desk", "Doctor", "Nurse", "Pharmacy", "Lab"];

// Clinical roles tied to a clinical department. Pharmacy/Lab are clinic-wide
// services (no department), Front Desk and custom Other are admin/varied.
const DEPARTMENT_REQUIRED_ROLES = ["Doctor", "Nurse"];


export type StaffData = {
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other" | "";
  role: string;
  department: string;
  specialty: string;
  registrationNo: string;
  qualification: string;
  medicalCouncil: string;
  experienceYears: string;
};

type AddStaffModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StaffData) => void;
  onDelete?: () => void;
  initialData?: StaffData;
  onShowToast?: (message: string) => void;
  // Department names configured on the active clinic. Staff must pick one of
  // these — they can't be assigned to a department the clinic doesn't offer.
  clinicDepartments: string[];
};

export function AddStaffModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  onShowToast,
  clinicDepartments,
}: AddStaffModalProps) {
  // Local state for all fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");

  const [role, setRole] = useState<string>("Doctor");
  // "Other" radio is selected → free text input shown. Role value holds the
  // custom text the user types (or "" while input is empty).
  const [isOtherRole, setIsOtherRole] = useState(false);
  const [department, setDepartment] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [qualification, setQualification] = useState("");
  const [medicalCouncil, setMedicalCouncil] = useState("");
  const [experienceYears, setExperienceYears] = useState("");

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate or reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setShowDeleteConfirm(false);
      if (initialData) {
        setName(initialData.name);
        setEmail(initialData.email);
        setPhone(initialData.phone);
        setGender(initialData.gender);
        setRole(initialData.role);
        // Detect custom (Other) role — if the saved role isn't a standard one
        // and isn't empty, the "Other" radio should be pre-selected with the
        // custom text already in the input.
        setIsOtherRole(!!initialData.role && !STANDARD_ROLES.includes(initialData.role));
        setDepartment(initialData.department);
        setSpecialty(initialData.specialty);
        setRegistrationNo(initialData.registrationNo);
        setQualification(initialData.qualification);
        setMedicalCouncil(initialData.medicalCouncil);
        setExperienceYears(initialData.experienceYears);
      } else {
        // Reset form for "Add New"
        setName("Dr. ");
        setEmail("");
        setPhone("");
        setGender("");
        setRole("Doctor");
        setIsOtherRole(false);
        setDepartment("");
        setSpecialty("");
        setRegistrationNo("");
        setQualification("");
        setMedicalCouncil("");
        setExperienceYears("");
      }
    }
  }, [isOpen, initialData]);

  // Prefix "Dr. " when role is Doctor, clear if switching away
  useEffect(() => {
    if (role === "Doctor") {
      if (name && !name.toLowerCase().startsWith("dr. ")) {
        setName(`Dr. ${name}`);
      } else if (!name) {
        setName("Dr. ");
      }
    } else {
      // If switching away from Doctor, remove the "Dr. " prefix but keep the rest
      if (name.toLowerCase().startsWith("dr. ")) {
        const nameWithoutPrefix = name.substring(4).trim();
        setName(nameWithoutPrefix);
      }
    }
  }, [role]);

  const handleSave = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email.trim());

    // Role is valid if either a standard role is picked, or (Other is picked
    // AND a custom role name has been typed). An "Other" radio selection
    // with empty text is invalid.
    const roleInvalid = isOtherRole ? !role.trim() : !role;

    const newErrors: Record<string, boolean> = {
      name: !name.trim() || name.trim().toLowerCase() === "dr.",
      email: !email.trim() || !isEmailValid,
      phone: !phone.trim() || phone.length < 10,
      gender: !gender,
      role: roleInvalid,
    };

    // Department required for any clinical role; specialty + registration
    // number are doctor-only.
    if (DEPARTMENT_REQUIRED_ROLES.includes(role)) {
      newErrors.department = !department;
    }
    if (role === "Doctor") {
      newErrors.specialty = !specialty.trim();
      newErrors.registrationNo = !registrationNo.trim();
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) {
      const messages: string[] = [];
      if (newErrors.name) messages.push("name");
      if (newErrors.email) messages.push("valid email");
      if (newErrors.phone) messages.push("valid phone number");
      if (newErrors.gender) messages.push("gender");
      if (newErrors.role) messages.push("role");
      if (newErrors.department) messages.push("department");
      if (newErrors.specialty) messages.push("specialty");
      if (newErrors.registrationNo) messages.push("registration number");
      onShowToast?.(`Please enter ${messages[0]}`);
      return;
    }

    onSave({
      name,
      email,
      phone,
      gender,
      role,
      department: DEPARTMENT_REQUIRED_ROLES.includes(role) ? department : "",
      specialty: role === "Doctor" ? specialty : "",
      registrationNo: role === "Doctor" ? registrationNo : "",
      qualification: role === "Doctor" ? qualification : "",
      medicalCouncil: role === "Doctor" ? medicalCouncil : "",
      experienceYears: role === "Doctor" ? experienceYears : "",
    });
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="Add staff member" onClose={onClose} />

      {/* Role section — first after the heading. "Role" + icon on the left,
          options in a 3-col grid on the right. Drives everything else. */}
      <Card style={{ ...roleStyles.card, marginTop: 16, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 40,
            ...(errors.role ? { border: "1px solid red", borderRadius: "8px", padding: "8px" } : {}),
          }}
        >
          <div style={roleStyles.sectionTitle}>
            <Icon name="mask-happy" tone="inherit" />
            <span>Role</span>
          </div>

          <div style={{ flex: 1 }}>
            <RadioGroup
              name="role"
              value={isOtherRole ? "Other" : role}
              onChange={(r) => {
                if (r === "Other") {
                  setIsOtherRole(true);
                  setRole(""); // clear so the user can type their custom role
                } else {
                  setIsOtherRole(false);
                  setRole(r);
                }
              }}
              options={[...STANDARD_ROLES, "Other"]}
              columns={3}
            />
            {isOtherRole && (
              <div style={{ marginTop: 8 }}>
                <Field
                  variant="underline"
                  value={role}
                  onChange={setRole}
                  placeholder="Enter role"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Top section: Illustration + Staff details */}
      <div style={styles.topSection}>
        <StaffIllustration role={role} gender={gender} />

        <StaffDetailsCard
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          gender={gender}
          setGender={setGender}
          errors={errors}
        />
      </div>

      {/* Clinical-role fields. Department shows for Doctor/Nurse/Pharmacy/Lab;
          specialty and Reg. No. are doctor-only (handled inside the card). */}
      {DEPARTMENT_REQUIRED_ROLES.includes(role) && (
        <AdditionalStaffDetailsCard
          role={role}
          department={department}
          setDepartment={setDepartment}
          specialty={specialty}
          setSpecialty={setSpecialty}
          registrationNo={registrationNo}
          setRegistrationNo={setRegistrationNo}
          qualification={qualification}
          setQualification={setQualification}
          medicalCouncil={medicalCouncil}
          setMedicalCouncil={setMedicalCouncil}
          experienceYears={experienceYears}
          setExperienceYears={setExperienceYears}
          clinicDepartments={clinicDepartments}
          errors={errors}
        />
      )}

      {/* Footer */}
      <div style={styles.footer}>
        {initialData ? (
          <button style={styles.deleteButton} onClick={() => setShowDeleteConfirm(true)}>
            Remove Staff
          </button>
        ) : (
          <div />
        )}

        <div style={styles.footerRight}>
          <Button variant="light" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="dark" size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>

    <ConfirmDialog
      isOpen={showDeleteConfirm}
      title="Remove this staff member?"
      message="They'll be removed from this clinic and can no longer log in or be booked. Their past appointments and prescriptions stay on record."
      confirmLabel="Yes"
      cancelLabel="Nope"
      destructive
      onConfirm={() => {
        setShowDeleteConfirm(false);
        onDelete?.();
      }}
      onCancel={() => setShowDeleteConfirm(false)}
    />
    </>
  );
}
