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
  /**
   * Render in normal document flow instead of the default fixed bottom-right
   * overlay (no positioning / z-index / slide-in). For catalogs, docs and
   * stories that show several toasts at once.
   */
  inline?: boolean;
};

export function Toast({ message, isVisible, onClose, duration = 4000, actionLabel, onAction, inline = false }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div style={inline ? styles.containerInline : styles.container}>
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
