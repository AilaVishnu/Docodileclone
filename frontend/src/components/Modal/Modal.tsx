import React from "react";
import { styles } from "./Modal.styles";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={styles.content}
        onClick={(e) => e.stopPropagation()} // prevent close on content click
      >
        {children}
      </div>
    </div>
  );
}
