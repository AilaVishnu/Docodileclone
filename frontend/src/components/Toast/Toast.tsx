import React, { useEffect } from "react";
import { styles } from "./Toast.styles";
import { ReactComponent as BuildingIcon } from "../../assets/Buildings.svg";

type ToastProps = {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, isVisible, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div style={styles.container}>
      <BuildingIcon style={styles.icon} />
      <p style={styles.message}>{message}</p>
      <button style={styles.closeButton} onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
