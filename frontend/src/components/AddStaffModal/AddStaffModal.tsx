import React, { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { StaffDetailsCard } from "../StaffDetailsCard";
import { Button } from "../Button";
import { styles } from "./AddStaffModal.styles";
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
  initialData?: StaffData;
};

export function AddStaffModal({
  isOpen,
  onClose,
  onSave,
  initialData,
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

  // Populate or reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setErrors({});
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
        setName("");
        setEmail("");
        setPhone("");
        setGender("");
        setRole("Doctor");
        setSpeciality("");
        setRegistrationNo("");
      }
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    const newErrors: Record<string, boolean> = {
      name: !name.trim(),
      email: !email.trim(),
      phone: !phone.trim(),
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
        <Button variant="light" size="sm" onClick={onClose}>
          Cancel
        </Button>

        <Button variant="dark" size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>
    </Modal>

  );
}
