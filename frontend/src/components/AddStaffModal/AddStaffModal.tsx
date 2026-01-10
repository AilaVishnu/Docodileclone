import React from "react";
import { Modal } from "../Modal";
import { StaffDetailsCard } from "../StaffDetailsCard";
import { Button } from "../Button";
import { styles } from "./AddStaffModal.styles";

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
      <StaffDetailsCard />

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
