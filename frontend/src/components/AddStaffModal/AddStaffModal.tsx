import React from "react";
import { Modal } from "../Modal";
import { StaffDetailsCard } from "../StaffDetailsCard";
import { Button } from "../Button";
import { styles } from "./AddStaffModal.styles";
import { AdditionalStaffDetailsCard } from "../AdditionalStaffDetailsCard";
import { ReactComponent as StaffIllustration } from "../../assets/Doctor Img.svg";


type AddStaffModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
};

export function AddStaffModal({
  isOpen,
  onClose,
  onSave,
}: AddStaffModalProps) {
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
      <div style={styles.illustrationWrapper}>
        <StaffIllustration />
      </div>

      <StaffDetailsCard />
    </div>

    {/* Bottom section */}
    <AdditionalStaffDetailsCard />

    {/* Footer */}
    <div style={styles.footer}>
      <Button variant="light" size="sm" onClick={onClose}>
        Cancel
      </Button>

      <Button variant="dark" size="sm" onClick={onSave}>
        Save
      </Button>
    </div>
  </Modal>

  );
}
