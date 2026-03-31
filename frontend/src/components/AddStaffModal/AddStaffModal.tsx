import React, { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { StaffDetailsCard } from "../StaffDetailsCard";
import { Button } from "../Button";
import { styles, confirmStyles } from "./AddStaffModal.styles";
import { AdditionalStaffDetailsCard } from "../AdditionalStaffDetailsCard";
import { StaffIllustration } from "./StaffIllustration";


export type StaffData = {
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other" | "";
  role: string;
  speciality: string;
  registrationNo: string;
};

type AddStaffModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StaffData) => void;
  onDelete?: () => void;
  initialData?: StaffData;
  onShowToast?: (message: string) => void;
};

export function AddStaffModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  onShowToast,
}: AddStaffModalProps) {
  // Local state for all fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");

  const [role, setRole] = useState<string>("Doctor");
  const [speciality, setSpeciality] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");

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
        setSpeciality(initialData.speciality);
        setRegistrationNo(initialData.registrationNo);
      } else {
        // Reset form for "Add New"
        setName("Dr. ");
        setEmail("");
        setPhone("");
        setGender("");
        setRole("Doctor");
        setSpeciality("");
        setRegistrationNo("");
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
      // If switching away from Doctor and name starts with Dr., clear it
      if (name.toLowerCase().startsWith("dr. ")) {
        setName("");
      }
    }
  }, [role]);

  const handleSave = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email.trim());

    const newErrors: Record<string, boolean> = {
      name: !name.trim() || name.trim().toLowerCase() === "dr.",
      email: !email.trim() || !isEmailValid,
      phone: !phone.trim() || phone.length < 10,
      gender: !gender,
      role: !role,
    };

    if (role === "Doctor") {
      newErrors.speciality = !speciality;
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
      if (newErrors.speciality) messages.push("speciality");
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
      speciality: role === "Doctor" ? speciality : "",
      registrationNo: role === "Doctor" ? registrationNo : "",
    });
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Add staff member</h3>

        <button style={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>

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

      {/* Bottom section */}
      <AdditionalStaffDetailsCard
        role={role}
        setRole={setRole}
        speciality={speciality}
        setSpeciality={setSpeciality}
        registrationNo={registrationNo}
        setRegistrationNo={setRegistrationNo}
        errors={errors}
      />

      {/* Footer */}
      <div style={styles.footer}>
        {initialData ? (
          <button style={styles.deleteButton} onClick={() => setShowDeleteConfirm(true)}>
            Delete Staff
          </button>
        ) : (
          <div />
        )}

        <div style={styles.footerRight}>
          <Button variant="dangerLight" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="dark" size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>

    {showDeleteConfirm && (
      <div style={confirmStyles.overlay}>
        <div style={confirmStyles.dialog}>
          <h4 style={confirmStyles.title}>Are you sure?</h4>
          <div style={confirmStyles.actions}>
            <Button variant="dangerLight" size="sm" onClick={() => setShowDeleteConfirm(false)}>
              Nope
            </Button>
            <Button variant="dark" size="sm" onClick={() => {
              setShowDeleteConfirm(false);
              onDelete?.();
            }}>
              Yes
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
