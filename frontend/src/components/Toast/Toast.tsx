import React, { useEffect } from "react";
import { styles } from "./Toast.styles";
import { Icon } from "../Icon";

type ToastProps = {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  /** Optional inline action button (e.g. "Undo"). */
  actionLabel?: string;
  onAction?: () => void;
};

export function Toast({ message, isVisible, onClose, duration = 4000, actionLabel, onAction }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div style={styles.container}>
      <Icon name="buildings" tone="inherit" style={styles.icon} />
      <p style={styles.message}>{message}</p>
      {actionLabel && onAction && (
        <button
          style={styles.actionButton}
          onClick={() => {
            onAction();
            onClose();
          }}
        >
          {actionLabel}
        </button>
      )}
      <button style={styles.closeButton} onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
